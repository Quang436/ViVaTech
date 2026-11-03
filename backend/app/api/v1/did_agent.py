import os
import asyncio
import logging
from typing import Dict, Any, Optional
import httpx
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field

from app.core.config import settings

logger = logging.getLogger("viva_arena.api.did_agent")

router = APIRouter(tags=["D-ID Agents WebRTC Streaming"])

DID_BASE_URL = "https://api.d-id.com"

# Bộ nhớ đệm lưu trữ phiên WebRTC đang hoạt động theo stream_id
_active_streams: Dict[str, Dict[str, Any]] = {}
# Bộ nhớ đệm thông tin Agent (idle_video, source_url) để tăng tốc khởi tạo < 1s
_agent_metadata_cache: Dict[str, Dict[str, Any]] = {}
# Lock chống tạo trùng nhiều stream cùng lúc (do React StrictMode mount kép)
_start_lock = asyncio.Lock()


# =========================================================================
# Request / Response Schemas
# =========================================================================
class StartChatStreamRequest(BaseModel):
    agent_id: Optional[str] = Field(None, description="ID của D-ID Agent (nếu dùng Agent)")
    presenter_id: Optional[str] = Field(None, description="ID nhân vật Presenter D-ID")
    source_url: Optional[str] = Field(None, description="URL ảnh chân dung Giám khảo")
    voice_id: Optional[str] = Field("vi-VN-NamMinhNeural", description="Giọng đọc tiếng Việt Microsoft Neural")


class SubmitSdpRequest(BaseModel):
    stream_id: str = Field(..., description="Stream ID nhận được từ /chat/start")
    session_id: str = Field(..., description="Session ID (cookie) nhận được từ /chat/start")
    sdp: Dict[str, Any] = Field(..., description="SDP Answer từ RTCPeerConnection của trình duyệt")
    agent_id: Optional[str] = Field(None, description="Agent ID tương ứng")


class SubmitIceRequest(BaseModel):
    stream_id: str = Field(..., description="Stream ID nhận được từ /chat/start")
    session_id: str = Field(..., description="Session ID nhận được từ /chat/start")
    candidate: Optional[str] = Field(None, description="Chuỗi ICE candidate")
    sdpMid: Optional[str] = Field(None, description="sdpMid của ICE candidate")
    sdpMLineIndex: Optional[int] = Field(None, description="sdpMLineIndex của ICE candidate")
    agent_id: Optional[str] = Field(None, description="Agent ID tương ứng")


class SpeakChatRequest(BaseModel):
    stream_id: str = Field(..., description="Stream ID đang hoạt động")
    session_id: str = Field(..., description="Session ID đang hoạt động")
    text: str = Field(..., description="Nội dung câu hỏi phản biện cần Giám khảo AI phát biểu")
    agent_id: Optional[str] = Field(None, description="Agent ID tương ứng")
    chat_id: Optional[str] = Field(None, description="Chat ID tương ứng")
    voice_id: Optional[str] = Field("vi-VN-NamMinhNeural", description="ID giọng đọc tiếng Việt (vi-VN-NamMinhNeural / vi-VN-HoaiMyNeural)")


class StopStreamRequest(BaseModel):
    stream_id: str
    session_id: Optional[str] = None
    agent_id: Optional[str] = None


# =========================================================================
# Helper Functions (Hot-reload .env & D-ID Integration)
# =========================================================================
def _load_did_config() -> Dict[str, str]:
    """Đọc cấu hình D-ID trực tiếp từ .env (hỗ trợ hot-reload)"""
    did_api_key = settings.DID_API_KEY or os.getenv("DID_API_KEY", "")
    did_agent_id = getattr(settings, "DID_AGENT_ID", "") or os.getenv("DID_AGENT_ID", "")
    did_presenter_id = getattr(settings, "DID_PRESENTER_ID", "") or os.getenv(
        "DID_PRESENTER_ID", "v2_public_alex@qcvo4gupoy"
    )
    did_source_url = (
        settings.DID_SOURCE_URL
        or os.getenv("DID_SOURCE_URL", "")
        or "https://raw.githubusercontent.com/Quang436/ViVaTech/main/frontend/public/professor_avatar.png"
    )
    did_voice_id = getattr(settings, "DID_VOICE_ID", "") or os.getenv(
        "DID_VOICE_ID", "vi-VN-NamMinhNeural"
    )

    env_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
        ".env",
    )
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip()
                    if k == "DID_API_KEY" and v:
                        did_api_key = v
                    elif k == "DID_AGENT_ID" and v:
                        did_agent_id = v
                    elif k == "DID_PRESENTER_ID" and v:
                        did_presenter_id = v
                    elif k == "DID_SOURCE_URL" and v:
                        did_source_url = v
                    elif k == "DID_VOICE_ID" and v:
                        did_voice_id = v
        except Exception as e:
            logger.debug(f"Không thể đọc trực tiếp file .env: {e}")

    return {
        "api_key": did_api_key,
        "agent_id": did_agent_id,
        "presenter_id": did_presenter_id,
        "source_url": did_source_url,
        "voice_id": did_voice_id,
    }


def _get_headers(api_key: str) -> Dict[str, str]:
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="Chưa cấu hình DID_API_KEY trong file backend/.env",
        )
    auth_val = api_key if api_key.startswith("Basic ") else f"Basic {api_key}"
    return {
        "Authorization": auth_val,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


async def _close_all_active_streams(client: httpx.AsyncClient, headers: Dict[str, str]):
    """Đóng các phiên WebRTC cũ còn tồn đọng để tránh lỗi Max user sessions reached trên D-ID"""
    old_ids = list(_active_streams.keys())
    for sid in old_ids:
        meta = _active_streams.pop(sid, {})
        mode = meta.get("mode", "talks")
        agent_id = meta.get("agent_id")
        session_id = meta.get("session_id")
        if mode == "agents" and agent_id:
            url = f"{DID_BASE_URL}/agents/{agent_id}/streams/{sid}"
        elif mode == "clips":
            url = f"{DID_BASE_URL}/clips/streams/{sid}"
        else:
            url = f"{DID_BASE_URL}/talks/streams/{sid}"
        payload = {"session_id": session_id} if session_id else None
        try:
            await client.request("DELETE", url, headers=headers, json=payload)
        except Exception:
            pass


# =========================================================================
# API Endpoints (/api/did-agent/...)
# =========================================================================
@router.post("/chat/start")
async def start_did_agent_chat_stream(req: StartChatStreamRequest = Body(default=StartChatStreamRequest())):
    """
    Khởi tạo phiên WebRTC D-ID (không dùng stream_warmup để tránh màn hình trắng vòng tròn chờ).
    Tự động dọn dẹp phiên cũ để không bị lỗi Max user sessions reached.
    """
    cfg = _load_did_config()
    headers = _get_headers(cfg["api_key"])
    target_voice = req.voice_id or cfg["voice_id"] or "vi-VN-NamMinhNeural"
    target_source_url = req.source_url or cfg["source_url"]
    agent_id = req.agent_id or cfg["agent_id"] or None

    async with _start_lock:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Đóng các stream cũ đang treo trước khi mở stream mới
            await _close_all_active_streams(client, headers)

            chat_id: Optional[str] = None
            stream_data: Optional[Dict[str, Any]] = None
            stream_mode = "talks"
            idle_video_url: Optional[str] = "/agent_idle.mp4"
            agent_source_url: Optional[str] = target_source_url

            # 1. Nếu người dùng cấu hình DID_AGENT_ID cụ thể -> Dùng D-ID Agents Stream
            if agent_id:
                try:
                    # Lấy metadata của Agent (idle_video, source_url, voice) có cache
                    if agent_id not in _agent_metadata_cache:
                        agt_resp = await client.get(
                            f"{DID_BASE_URL}/agents/{agent_id}",
                            headers=headers,
                        )
                        if agt_resp.status_code == 200:
                            agt_json = agt_resp.json()
                            presenter = agt_json.get("presenter", {})
                            _agent_metadata_cache[agent_id] = {
                                "idle_video": presenter.get("idle_video"),
                                "source_url": presenter.get("source_url"),
                                "voice_id": (presenter.get("voice") or {}).get("voice_id"),
                            }
                    cached_agt = _agent_metadata_cache.get(agent_id, {})
                    if cached_agt.get("idle_video"):
                        idle_video_url = cached_agt["idle_video"]
                    if cached_agt.get("source_url"):
                        agent_source_url = cached_agt["source_url"]

                    s_resp = await client.post(
                        f"{DID_BASE_URL}/agents/{agent_id}/streams",
                        headers=headers,
                        json={
                            "fluent": True,
                            "compatibility_mode": "on",
                            "stream_warmup": False,
                        },
                    )
                    if s_resp.status_code in (200, 201):
                        stream_data = s_resp.json()
                        stream_mode = "agents"
                    else:
                        logger.warning(
                            f"Agent {agent_id} stream returned {s_resp.status_code}: {s_resp.text}"
                        )
                except Exception as e:
                    logger.warning(f"Agent stream fallback to Talks stream: {e}")

            # 2. Khởi tạo D-ID Real-Time WebRTC Stream trên ảnh Giáo sư (Full-frame stitch + lively motion)
            # Lưu ý: stream_warmup=False để KHÔNG hiển thị màn hình trắng có vòng tròn xám của D-ID
            if not stream_data:
                talks_resp = await client.post(
                    f"{DID_BASE_URL}/talks/streams",
                    headers=headers,
                    json={
                        "source_url": agent_source_url or target_source_url,
                        "driver_url": "bank://lively/",
                        "stream_warmup": False,
                        "compatibility_mode": "on",
                        "config": {
                            "stitch": True,
                            "fluent": True,
                        },
                    },
                )
                if talks_resp.status_code not in (200, 201):
                    logger.error(f"D-ID Stream creation failed: {talks_resp.text}")
                    raise HTTPException(
                        status_code=talks_resp.status_code,
                        detail=f"D-ID WebRTC Stream Error: {talks_resp.text}",
                    )
                stream_data = talks_resp.json()
                stream_mode = "talks"

            stream_id = stream_data.get("id")
            did_session_id = stream_data.get("session_id")
            offer = stream_data.get("offer") or stream_data.get("jsep")
            ice_servers = stream_data.get("ice_servers", [])

            if stream_id:
                _active_streams[stream_id] = {
                    "mode": stream_mode,
                    "agent_id": agent_id,
                    "chat_id": chat_id,
                    "session_id": did_session_id,
                    "voice_id": target_voice,
                }

            return {
                "agent_id": agent_id,
                "chat_id": chat_id,
                "stream_id": stream_id,
                "session_id": did_session_id,
                "sdp": offer,
                "offer": offer,
                "ice_servers": ice_servers,
                "mode": stream_mode,
                "idle_video_url": idle_video_url,
                "source_url": agent_source_url,
            }


@router.post("/chat/sdp")
async def submit_did_sdp_answer(req: SubmitSdpRequest = Body(...)):
    """Nhận SDP Answer từ Frontend và gửi lên D-ID để hoàn tất bắt tay WebRTC"""
    cfg = _load_did_config()
    headers = _get_headers(cfg["api_key"])

    meta = _active_streams.get(req.stream_id, {})
    mode = meta.get("mode", "talks")
    agent_id = req.agent_id or meta.get("agent_id") or cfg["agent_id"]
    session_id = req.session_id or meta.get("session_id")

    if mode == "agents" and agent_id:
        url = f"{DID_BASE_URL}/agents/{agent_id}/streams/{req.stream_id}/sdp"
    elif mode == "clips":
        url = f"{DID_BASE_URL}/clips/streams/{req.stream_id}/sdp"
    else:
        url = f"{DID_BASE_URL}/talks/streams/{req.stream_id}/sdp"

    payload: Dict[str, Any] = {"answer": req.sdp}
    if session_id:
        payload["session_id"] = session_id

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code not in (200, 201):
            logger.error(f"D-ID SDP Error ({resp.status_code}): {resp.text}")
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.post("/chat/ice")
async def submit_did_ice_candidate(req: SubmitIceRequest = Body(...)):
    """Chuyển tiếp ICE Candidate từ Frontend lên D-ID"""
    cfg = _load_did_config()
    headers = _get_headers(cfg["api_key"])

    meta = _active_streams.get(req.stream_id, {})
    mode = meta.get("mode", "talks")
    agent_id = req.agent_id or meta.get("agent_id") or cfg["agent_id"]
    session_id = req.session_id or meta.get("session_id")

    if mode == "agents" and agent_id:
        url = f"{DID_BASE_URL}/agents/{agent_id}/streams/{req.stream_id}/ice"
    elif mode == "clips":
        url = f"{DID_BASE_URL}/clips/streams/{req.stream_id}/ice"
    else:
        url = f"{DID_BASE_URL}/talks/streams/{req.stream_id}/ice"

    if not req.candidate:
        return {"status": "ignored_empty_candidate"}

    payload: Dict[str, Any] = {
        "candidate": req.candidate,
        "sdpMid": req.sdpMid,
        "sdpMLineIndex": req.sdpMLineIndex,
    }
    if session_id:
        payload["session_id"] = session_id

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        return resp.json() if resp.status_code in (200, 201) else {"status": resp.status_code}


@router.post("/chat/speak")
async def trigger_did_agent_speak(req: SpeakChatRequest = Body(...)):
    """
    Gửi văn bản câu hỏi phản biện tới phiên WebRTC D-ID để Giám khảo AI
    phát biểu trực tiếp với cử động môi (lip-sync), mắt và đầu theo thời gian thực.
    """
    cfg = _load_did_config()
    headers = _get_headers(cfg["api_key"])

    meta = _active_streams.get(req.stream_id, {})
    mode = meta.get("mode", "talks")
    agent_id = req.agent_id or meta.get("agent_id") or cfg["agent_id"]
    session_id = req.session_id or meta.get("session_id")
    voice_id = req.voice_id or meta.get("voice_id") or cfg["voice_id"] or "vi-VN-NamMinhNeural"

    if mode == "agents" and agent_id:
        url = f"{DID_BASE_URL}/agents/{agent_id}/streams/{req.stream_id}"
    elif mode == "clips":
        url = f"{DID_BASE_URL}/clips/streams/{req.stream_id}"
    else:
        url = f"{DID_BASE_URL}/talks/streams/{req.stream_id}"

    payload: Dict[str, Any] = {
        "script": {
            "type": "text",
            "input": req.text,
            "provider": {
                "type": "microsoft",
                "voice_id": voice_id,
            },
        },
        "config": {
            "stitch": True,
            "fluent": True,
        },
    }
    if mode == "talks":
        payload["driver_url"] = "bank://lively/"
    if session_id:
        payload["session_id"] = session_id

    async with httpx.AsyncClient(timeout=25.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code not in (200, 201):
            logger.error(f"D-ID Speak Error ({resp.status_code}): {resp.text}")
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.post("/chat/stop")
async def stop_did_agent_stream(req: StopStreamRequest = Body(...)):
    """Đóng phiên WebRTC stream với D-ID khi kết thúc hoặc unmount"""
    cfg = _load_did_config()
    headers = _get_headers(cfg["api_key"])

    meta = _active_streams.pop(req.stream_id, {})
    mode = meta.get("mode", "talks")
    agent_id = req.agent_id or meta.get("agent_id") or cfg["agent_id"]
    session_id = req.session_id or meta.get("session_id")

    if mode == "agents" and agent_id:
        url = f"{DID_BASE_URL}/agents/{agent_id}/streams/{req.stream_id}"
    elif mode == "clips":
        url = f"{DID_BASE_URL}/clips/streams/{req.stream_id}"
    else:
        url = f"{DID_BASE_URL}/talks/streams/{req.stream_id}"

    payload = {"session_id": session_id} if session_id else None

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.request("DELETE", url, headers=headers, json=payload)
            return resp.json() if resp.status_code in (200, 201) else {"status": "closed"}
        except Exception:
            return {"status": "closed"}

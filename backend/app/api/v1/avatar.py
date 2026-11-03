from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
import logging

from app.services.streaming_avatar import streaming_avatar_service

logger = logging.getLogger("viva_arena.api.avatar")

router = APIRouter(prefix="/avatar", tags=["Streaming Digital Human"])


# =========================================================================
# Schemas
# =========================================================================
class NewSessionRequest(BaseModel):
    provider: Optional[str] = Field("heygen", description="Nhà cung cấp: 'heygen' hoặc 'did'")
    avatar_name: Optional[str] = Field(None, description="Tên hoặc Avatar ID")
    voice_id: Optional[str] = Field(None, description="ID giọng đọc (ví dụ vi-VN-NamMinhNeural)")
    quality: Optional[str] = Field("high", description="Chất lượng video: 'low', 'medium', 'high'")


class StartSessionRequest(BaseModel):
    provider: Optional[str] = "heygen"
    session_id: str
    sdp_answer: Dict[str, Any]
    token: Optional[str] = None


class IceCandidateRequest(BaseModel):
    provider: Optional[str] = "heygen"
    session_id: str
    candidate: Dict[str, Any]
    token: Optional[str] = None


class SpeakRequest(BaseModel):
    provider: Optional[str] = "heygen"
    session_id: str
    text: str
    token: Optional[str] = None
    voice_id: Optional[str] = None


class StopSessionRequest(BaseModel):
    provider: Optional[str] = "heygen"
    session_id: str
    token: Optional[str] = None


# =========================================================================
# Endpoints
# =========================================================================
@router.get("/status")
async def get_avatar_service_status():
    """Kiểm tra cấu hình và tình trạng của Digital Human Streaming Service"""
    return streaming_avatar_service.get_provider_status()


@router.post("/session/new")
async def create_new_avatar_session(req: NewSessionRequest = Body(...)):
    """
    Tạo phiên làm việc WebRTC mới.
    Trả về SDP Offer và danh sách ICE Servers để client thiết lập RTCPeerConnection.
    Nếu chưa cấu hình API Key, trả về chế độ mô phỏng fallback mượt mà (simulated).
    """
    provider = req.provider or "heygen"
    try:
        if provider == "did":
            if not streaming_avatar_service.did_api_key:
                return {
                    "provider": "simulated",
                    "status": "missing_api_key",
                    "message": "Chưa cấu hình DID_API_KEY trong backend/.env. Đang chạy chế độ video mô phỏng độ trễ thấp.",
                }
            return await streaming_avatar_service.create_did_session()
        else:
            if not streaming_avatar_service.heygen_api_key:
                return {
                    "provider": "simulated",
                    "status": "missing_api_key",
                    "message": "Chưa cấu hình HEYGEN_API_KEY trong backend/.env. Đang chạy chế độ video mô phỏng độ trễ thấp.",
                }
            return await streaming_avatar_service.create_heygen_session(
                avatar_name=req.avatar_name,
                voice_id=req.voice_id,
                quality=req.quality or "high",
            )
    except Exception as e:
        logger.warning(f"Không thể khởi tạo session với nhà cung cấp {provider}: {e}")
        # Trả về fallback simulated mode kèm thông báo lỗi thay vì crash 500
        return {
            "provider": "simulated",
            "status": "error_fallback",
            "message": f"Không thể kết nối Live WebRTC ({str(e)}). Chuyển sang chế độ video mô phỏng an toàn.",
        }


@router.post("/session/start")
async def start_avatar_stream(req: StartSessionRequest = Body(...)):
    """Hoàn tất bắt tay SDP Answer với máy chủ WebRTC của Avatar"""
    if req.provider == "simulated":
        return {"status": "ok", "mode": "simulated"}

    try:
        if req.provider == "did":
            return await streaming_avatar_service.start_did_session(
                stream_id=req.session_id, sdp_answer=req.sdp_answer
            )
        else:
            return await streaming_avatar_service.start_heygen_session(
                session_id=req.session_id, sdp_answer=req.sdp_answer, token=req.token
            )
    except Exception as e:
        logger.error(f"Lỗi bắt tay SDP start: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/session/ice")
async def send_ice_candidate(req: IceCandidateRequest = Body(...)):
    """Gửi ICE Candidate phát hiện từ client tới WebRTC server"""
    if req.provider == "simulated":
        return {"status": "ok"}

    try:
        if req.provider == "did":
            return await streaming_avatar_service.send_did_ice(
                stream_id=req.session_id, candidate=req.candidate
            )
        else:
            return await streaming_avatar_service.send_heygen_ice(
                session_id=req.session_id, candidate=req.candidate, token=req.token
            )
    except Exception as e:
        logger.warning(f"Lỗi gửi ICE candidate: {e}")
        return {"status": "error", "detail": str(e)}


@router.post("/speak")
async def avatar_speak(req: SpeakRequest = Body(...)):
    """Gửi lệnh yêu cầu Avatar phát biểu câu hỏi/phản biện theo thời gian thực"""
    if req.provider == "simulated":
        return {"status": "simulated_speak", "text": req.text}

    try:
        if req.provider == "did":
            return await streaming_avatar_service.speak_did(
                stream_id=req.session_id, text=req.text, voice_id=req.voice_id
            )
        else:
            return await streaming_avatar_service.speak_heygen(
                session_id=req.session_id, text=req.text, token=req.token
            )
    except Exception as e:
        logger.error(f"Lỗi gửi lệnh speak tới Avatar: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/session/stop")
async def stop_avatar_session(req: StopSessionRequest = Body(...)):
    """Đóng phiên streaming WebRTC"""
    if req.provider == "simulated":
        return {"status": "closed"}

    try:
        if req.provider == "did":
            return await streaming_avatar_service.stop_did_session(stream_id=req.session_id)
        else:
            return await streaming_avatar_service.stop_heygen_session(
                session_id=req.session_id, token=req.token
            )
    except Exception as e:
        logger.warning(f"Lỗi đóng session avatar: {e}")
        return {"status": "error", "detail": str(e)}

import os
import logging
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("viva_arena.streaming_avatar")

HEYGEN_BASE_URL = "https://api.heygen.com/v1"
DID_BASE_URL = "https://api.d-id.com"


class StreamingAvatarService:
    """
    Dịch vụ điều phối kết nối WebRTC thời gian thực với HeyGen Streaming Avatar SDK
    hoặc D-ID Real-Time Streams API.
    """

    def __init__(self):
        self._did_sessions: Dict[str, str] = {}

    def _get_active_keys(self):
        """
        Đọc trực tiếp và nóng (hot-reload) các biến môi trường từ backend/.env
        để khi user cập nhật key thì hệ thống nhận ngay mà không cần restart server.
        """
        heygen_key = settings.HEYGEN_API_KEY or os.getenv("HEYGEN_API_KEY", "")
        did_key = settings.DID_API_KEY or os.getenv("DID_API_KEY", "")
        avatar_id = settings.HEYGEN_AVATAR_ID or os.getenv("HEYGEN_AVATAR_ID", "") or "Wayne_20240711"
        voice_id = settings.HEYGEN_VOICE_ID or os.getenv("HEYGEN_VOICE_ID", "") or "vi-VN-NamMinhNeural"

        # Đọc trực tiếp từ file .env nếu có
        env_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"
        )
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("#") or "=" not in line:
                            continue
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip()
                        if k == "HEYGEN_API_KEY" and v:
                            heygen_key = v
                        elif k == "DID_API_KEY" and v:
                            did_key = v
                        elif k == "HEYGEN_AVATAR_ID" and v:
                            avatar_id = v
                        elif k == "HEYGEN_VOICE_ID" and v:
                            voice_id = v
            except Exception as e:
                logger.debug(f"Error reading .env directly: {e}")

        return heygen_key, did_key, avatar_id, voice_id

    @property
    def heygen_api_key(self) -> str:
        k, _, _, _ = self._get_active_keys()
        return k

    @property
    def did_api_key(self) -> str:
        _, k, _, _ = self._get_active_keys()
        return k

    @property
    def default_avatar_id(self) -> str:
        _, _, a, _ = self._get_active_keys()
        return a

    @property
    def default_voice_id(self) -> str:
        _, _, _, v = self._get_active_keys()
        return v

    def get_provider_status(self) -> Dict[str, Any]:
        """Kiểm tra nhà cung cấp WebRTC đang được cấu hình"""
        heygen_key, did_key, avatar_id, voice_id = self._get_active_keys()
        has_heygen = bool(heygen_key and heygen_key.strip())
        has_did = bool(did_key and did_key.strip())

        active_provider = "did" if has_did else ("heygen" if has_heygen else "simulated")
        return {
            "active_provider": active_provider,
            "has_heygen": has_heygen,
            "has_did": has_did,
            "default_avatar_id": avatar_id,
            "default_voice_id": voice_id,
        }

    # =========================================================================
    # 1. HEYGEN STREAMING AVATAR API (WebRTC)
    # =========================================================================
    async def create_heygen_token(self) -> str:
        """Tạo access token phiên làm việc từ HeyGen API"""
        heygen_key, _, _, _ = self._get_active_keys()
        if not heygen_key:
            raise ValueError("Chưa cấu hình HEYGEN_API_KEY trong file .env")

        headers = {
            "X-Api-Key": heygen_key,
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(f"{HEYGEN_BASE_URL}/streaming.create_token", headers=headers)
            if resp.status_code != 200:
                logger.error(f"HeyGen create_token error: {resp.text}")
                raise RuntimeError(f"HeyGen Token Error ({resp.status_code}): {resp.text}")

            data = resp.json().get("data", {})
            token = data.get("token")
            if not token:
                raise RuntimeError("Không nhận được streaming token từ HeyGen")
            return token

    async def create_heygen_session(
        self,
        avatar_name: Optional[str] = None,
        voice_id: Optional[str] = None,
        quality: str = "high",
    ) -> Dict[str, Any]:
        """
        Khởi tạo phiên WebRTC mới với HeyGen.
        Trả về session_id, SDP offer và danh sách ice_servers.
        """
        token = await self.create_heygen_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        payload: Dict[str, Any] = {
            "quality": quality or "high",
            "version": "v2",
        }
        target_avatar = avatar_name or self.default_avatar_id
        if target_avatar:
            payload["avatar_name"] = target_avatar
        
        target_voice = voice_id or self.default_voice_id
        if target_voice:
            payload["voice"] = {"voice_id": target_voice, "rate": 1.0}

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(
                f"{HEYGEN_BASE_URL}/streaming.new", headers=headers, json=payload
            )
            # Nếu avatar_name chỉ định không tồn tại trong tài khoản, thử lại với avatar mặc định
            if resp.status_code != 200 and "avatar" in resp.text.lower():
                logger.info("Thử lại streaming.new với avatar mặc định của HeyGen...")
                payload.pop("avatar_name", None)
                resp = await client.post(
                    f"{HEYGEN_BASE_URL}/streaming.new", headers=headers, json=payload
                )

            if resp.status_code != 200:
                logger.error(f"HeyGen streaming.new error: {resp.text}")
                raise RuntimeError(f"HeyGen Session Error ({resp.status_code}): {resp.text}")

            res_json = resp.json()
            session_data = res_json.get("data", {})
            return {
                "provider": "heygen",
                "session_id": session_data.get("session_id"),
                "sdp": session_data.get("sdp"),
                "ice_servers": session_data.get("ice_servers", []),
                "token": token,
            }

    async def start_heygen_session(
        self, session_id: str, sdp_answer: Dict[str, Any], token: Optional[str] = None
    ) -> Dict[str, Any]:
        """Gửi SDP answer từ client để hoàn tất bắt tay WebRTC"""
        headers = {
            "Authorization": f"Bearer {token}" if token else f"Bearer {await self.create_heygen_token()}",
            "Content-Type": "application/json",
        }
        payload = {"session_id": session_id, "sdp": sdp_answer}

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                f"{HEYGEN_BASE_URL}/streaming.start", headers=headers, json=payload
            )
            if resp.status_code != 200:
                logger.error(f"HeyGen streaming.start error: {resp.text}")
                raise RuntimeError(f"HeyGen Start Error ({resp.status_code}): {resp.text}")
            return resp.json()

    async def send_heygen_ice(
        self, session_id: str, candidate: Dict[str, Any], token: Optional[str] = None
    ) -> Dict[str, Any]:
        """Chuyển tiếp ICE candidate tới HeyGen server"""
        headers = {
            "Authorization": f"Bearer {token}" if token else f"Bearer {await self.create_heygen_token()}",
            "Content-Type": "application/json",
        }
        payload = {"session_id": session_id, "candidate": candidate}

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{HEYGEN_BASE_URL}/streaming.ice", headers=headers, json=payload
            )
            return resp.json()

    async def speak_heygen(
        self, session_id: str, text: str, token: Optional[str] = None
    ) -> Dict[str, Any]:
        """Gửi văn bản chất vấn để Avatar nói theo thời gian thực (real-time lip sync)"""
        headers = {
            "Authorization": f"Bearer {token}" if token else f"Bearer {await self.create_heygen_token()}",
            "Content-Type": "application/json",
        }
        payload = {
            "session_id": session_id,
            "text": text,
            "task_type": "repeat",
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                f"{HEYGEN_BASE_URL}/streaming.task", headers=headers, json=payload
            )
            if resp.status_code != 200:
                logger.error(f"HeyGen speak error: {resp.text}")
                raise RuntimeError(f"HeyGen Speak Error ({resp.status_code}): {resp.text}")
            return resp.json()

    async def stop_heygen_session(
        self, session_id: str, token: Optional[str] = None
    ) -> Dict[str, Any]:
        """Đóng phiên streaming WebRTC và giải phóng tài nguyên"""
        headers = {
            "Authorization": f"Bearer {token}" if token else f"Bearer {await self.create_heygen_token()}",
            "Content-Type": "application/json",
        }
        payload = {"session_id": session_id}

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{HEYGEN_BASE_URL}/streaming.stop", headers=headers, json=payload
            )
            return resp.json()

    # =========================================================================
    # 2. D-ID REAL-TIME STREAMS API (Lựa chọn thay thế)
    # =========================================================================
    async def create_did_session(self, source_url: Optional[str] = None) -> Dict[str, Any]:
        """Khởi tạo phiên WebRTC với D-ID"""
        _, did_key, _, _ = self._get_active_keys()
        if not did_key:
            raise ValueError("Chưa cấu hình DID_API_KEY trong file .env")

        headers = {
            "Authorization": f"Basic {did_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "source_url": source_url or settings.DID_SOURCE_URL or "https://raw.githubusercontent.com/Quang436/ViVaTech/main/frontend/public/professor_avatar.png"
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(f"{DID_BASE_URL}/talks/streams", headers=headers, json=payload)
            if resp.status_code not in (200, 201):
                logger.error(f"D-ID create stream error: {resp.text}")
                raise RuntimeError(f"D-ID Stream Error ({resp.status_code}): {resp.text}")

            data = resp.json()
            stream_id = data.get("id")
            did_session_id = data.get("session_id")
            if stream_id and did_session_id:
                self._did_sessions[stream_id] = did_session_id

            return {
                "provider": "did",
                "session_id": stream_id,
                "sdp": data.get("offer"),
                "ice_servers": data.get("ice_servers", []),
                "session_data": data.get("session_data"),
            }

    async def start_did_session(
        self, stream_id: str, sdp_answer: Dict[str, Any], session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Gửi SDP answer tới D-ID"""
        headers = {
            "Authorization": f"Basic {self.did_api_key}",
            "Content-Type": "application/json",
        }
        sess = session_id or self._did_sessions.get(stream_id)
        payload: Dict[str, Any] = {"answer": sdp_answer}
        if sess:
            payload["session_id"] = sess

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                f"{DID_BASE_URL}/talks/streams/{stream_id}/sdp", headers=headers, json=payload
            )
            return resp.json()

    async def send_did_ice(
        self, stream_id: str, candidate: Dict[str, Any], session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Gửi ICE candidate tới D-ID"""
        headers = {
            "Authorization": f"Basic {self.did_api_key}",
            "Content-Type": "application/json",
        }
        sess = session_id or self._did_sessions.get(stream_id)
        cand_val = candidate.get("candidate", candidate) if isinstance(candidate, dict) else candidate
        mid_val = candidate.get("sdpMid") if isinstance(candidate, dict) else None
        mline_val = candidate.get("sdpMLineIndex") if isinstance(candidate, dict) else None

        payload: Dict[str, Any] = {
            "candidate": cand_val,
            "sdpMid": mid_val,
            "sdpMLineIndex": mline_val,
        }
        if sess:
            payload["session_id"] = sess

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{DID_BASE_URL}/talks/streams/{stream_id}/ice", headers=headers, json=payload
            )
            return resp.json()

    async def speak_did(
        self, stream_id: str, text: str, voice_id: Optional[str] = None, session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Yêu cầu D-ID phát biểu theo thời gian thực"""
        headers = {
            "Authorization": f"Basic {self.did_api_key}",
            "Content-Type": "application/json",
        }
        sess = session_id or self._did_sessions.get(stream_id)
        payload: Dict[str, Any] = {
            "script": {
                "type": "text",
                "input": text,
                "provider": {
                    "type": "microsoft",
                    "voice_id": voice_id or self.default_voice_id,
                },
            },
        }
        if sess:
            payload["session_id"] = sess

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                f"{DID_BASE_URL}/talks/streams/{stream_id}", headers=headers, json=payload
            )
            return resp.json()

    async def stop_did_session(self, stream_id: str) -> Dict[str, Any]:
        """Dừng stream D-ID"""
        headers = {
            "Authorization": f"Basic {self.did_api_key}",
            "Content-Type": "application/json",
        }
        sess = self._did_sessions.pop(stream_id, None)
        payload = {"session_id": sess} if sess else None

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.request(
                "DELETE",
                f"{DID_BASE_URL}/talks/streams/{stream_id}",
                headers=headers,
                json=payload if payload else None,
            )
            return resp.json()


streaming_avatar_service = StreamingAvatarService()

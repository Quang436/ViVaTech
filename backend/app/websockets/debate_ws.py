import json
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
from app.services.debate_manager import debate_manager
from app.core.database import SessionLocal
from app.core.security import resolve_user_from_token
from app.models.session import DebateSession


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast_to_session(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                await connection.send_text(json.dumps(message, ensure_ascii=False))


ws_manager = ConnectionManager()


async def handle_debate_websocket(websocket: WebSocket, session_id: str):
    token = websocket.query_params.get("token", "")
    db = SessionLocal()
    user_id = None
    try:
        user = resolve_user_from_token(db, token)
        if not user:
            await websocket.close(code=4401, reason="Unauthorized")
            return
        session = (
            db.query(DebateSession)
            .filter(DebateSession.id == session_id, DebateSession.user_id == user.id)
            .first()
        )
        if not session:
            await websocket.close(code=4404, reason="Session not found")
            return
        user_id = user.id
    finally:
        db.close()

    await ws_manager.connect(session_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            action = payload.get("action")

            if action == "student_speaking_start":
                await ws_manager.broadcast_to_session(
                    session_id,
                    {"event": "student_status", "status": "speaking"},
                )

            elif action == "student_turn_submit":
                student_response = payload.get("response", "")
                response_mode = payload.get("mode", "voice")
                duration = payload.get("duration", 0)

                await ws_manager.broadcast_to_session(
                    session_id,
                    {
                        "event": "council_status",
                        "status": "thinking",
                        "message": "Hội đồng đang đối chiếu tài liệu và phân tích logic...",
                    },
                )

                db = SessionLocal()
                try:
                    result = debate_manager.process_student_response(
                        db=db,
                        session_id=session_id,
                        student_response=student_response,
                        response_mode=response_mode,
                        duration_seconds=duration,
                        user_id=user_id,
                    )
                    await ws_manager.broadcast_to_session(
                        session_id,
                        {"event": "turn_result", "data": result},
                    )
                except Exception as e:
                    await ws_manager.broadcast_to_session(
                        session_id,
                        {"event": "error", "message": str(e)},
                    )
                finally:
                    db.close()

    except WebSocketDisconnect:
        ws_manager.disconnect(session_id, websocket)

import json
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
from app.services.debate_manager import debate_manager
from app.core.database import SessionLocal

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
    await ws_manager.connect(session_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            action = payload.get("action")

            if action == "student_speaking_start":
                await ws_manager.broadcast_to_session(session_id, {
                    "event": "student_status",
                    "status": "speaking"
                })

            elif action == "student_turn_submit":
                student_response = payload.get("response", "")
                response_mode = payload.get("mode", "voice")
                duration = payload.get("duration", 0)

                # Broadcast that AI Council is deliberating
                await ws_manager.broadcast_to_session(session_id, {
                    "event": "council_status",
                    "status": "thinking",
                    "message": "Hội đồng đang đối chiếu tài liệu và phân tích logic..."
                })

                # Process turn
                db = SessionLocal()
                try:
                    result = debate_manager.process_student_response(
                        db=db,
                        session_id=session_id,
                        student_response=student_response,
                        response_mode=response_mode,
                        duration_seconds=duration
                    )
                    await ws_manager.broadcast_to_session(session_id, {
                        "event": "turn_result",
                        "data": result
                    })
                except Exception as e:
                    await ws_manager.broadcast_to_session(session_id, {
                        "event": "error",
                        "message": str(e)
                    })
                finally:
                    db.close()

    except WebSocketDisconnect:
        ws_manager.disconnect(session_id, websocket)

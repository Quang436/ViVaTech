from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import re
from app.core.database import get_db
from app.models.session import DebateSession
from app.schemas.debate import (
    CreateSessionRequest,
    SessionDetailResponse,
    SubmitTurnRequest,
    RebuttalResponse,
)
from app.services.debate_manager import debate_manager

router = APIRouter(prefix="/debate", tags=["Debate Sessions"])


@router.get("/tts")
async def generate_speech(
    text: str = Query(..., description="Văn bản cần đọc"),
    voice: Optional[str] = Query(None, description="Tên voice: vi-VN-NamMinhNeural, vi-VN-HoaiMyNeural, en-US-GuyNeural"),
    lang: Optional[str] = Query("vi", description="Ngôn ngữ: vi, en"),
    rate: Optional[str] = Query("+0%", description="Tốc độ đọc"),
    pitch: Optional[str] = Query("+0Hz", description="Cao độ"),
):
    clean_text = text.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Văn bản rỗng")

    if len(clean_text) > 1200:
        clean_text = clean_text[:1200]

    target_voice = voice
    if not target_voice:
        has_vietnamese = bool(
            re.search(
                r"[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]",
                clean_text,
                re.IGNORECASE,
            )
        )
        if lang.startswith("vi") or has_vietnamese:
            target_voice = "vi-VN-NamMinhNeural"
        else:
            target_voice = "en-US-GuyNeural"

    try:
        import edge_tts
        communicate = edge_tts.Communicate(clean_text, target_voice, rate=rate, pitch=pitch)
        mp3_buffer = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                mp3_buffer.write(chunk["data"])

        audio_data = mp3_buffer.getvalue()
        if audio_data:
            return Response(
                content=audio_data,
                media_type="audio/mpeg",
                headers={
                    "Cache-Control": "public, max-age=86400",
                    "Content-Disposition": "inline; filename=speech.mp3",
                },
            )
    except Exception as e:
        print(f"[TTS] edge-tts error, falling back to gTTS: {e}")

    try:
        from gtts import gTTS
        target_lang = "vi" if ("vi" in target_voice or "vi" in lang) else "en"
        tts = gTTS(text=clean_text, lang=target_lang)
        fallback_buffer = io.BytesIO()
        tts.write_to_fp(fallback_buffer)
        return Response(
            content=fallback_buffer.getvalue(),
            media_type="audio/mpeg",
            headers={
                "Cache-Control": "public, max-age=86400",
                "Content-Disposition": "inline; filename=speech.mp3",
            },
        )
    except Exception as e2:
        raise HTTPException(status_code=500, detail=f"Lỗi khởi tạo giọng nói: {str(e2)}")


@router.post("/sessions", response_model=SessionDetailResponse)
def create_debate_session(
    payload: CreateSessionRequest,
    db: Session = Depends(get_db),
):
    try:
        session = debate_manager.create_session(
            db=db,
            title=payload.title,
            persona=payload.persona,
            document_id=payload.document_id,
            document_name=payload.document_name,
            topic_summary=payload.topic_summary,
            max_turns=payload.max_turns,
        )
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Không thể khởi tạo phiên tranh biện: {str(e)}")


@router.get("/sessions", response_model=List[SessionDetailResponse])
def list_debate_sessions(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(DebateSession)
        .order_by(DebateSession.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return sessions


@router.get("/sessions/{session_id}", response_model=SessionDetailResponse)
def get_debate_session(
    session_id: str,
    db: Session = Depends(get_db),
):
    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên tranh biện.")
    return session


@router.delete("/sessions/{session_id}")
def delete_debate_session(
    session_id: str,
    db: Session = Depends(get_db),
):
    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên tranh biện.")
    db.delete(session)
    db.commit()
    return {"status": "deleted", "session_id": session_id}


@router.post("/sessions/{session_id}/turns", response_model=RebuttalResponse)
def submit_turn_response(
    session_id: str,
    payload: SubmitTurnRequest,
    db: Session = Depends(get_db),
):
    try:
        result = debate_manager.process_student_response(
            db=db,
            session_id=session_id,
            student_response=payload.student_response,
            response_mode=payload.response_mode,
            duration_seconds=payload.duration_seconds,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý phản hồi: {str(e)}")

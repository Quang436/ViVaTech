from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.session import DebateSession
from app.schemas.debate import (
    CreateSessionRequest,
    SessionDetailResponse,
    SubmitTurnRequest,
    RebuttalResponse
)
from app.services.debate_manager import debate_manager

router = APIRouter(prefix="/debate", tags=["Debate Sessions"])

@router.post("/sessions", response_model=SessionDetailResponse)
def create_debate_session(
    payload: CreateSessionRequest,
    db: Session = Depends(get_db)
):
    """
    Bước 1: Khởi tạo phòng bảo vệ / phiên tranh biện:
    - Chọn cấp độ hội đồng (Feynman, Giảng viên phản biện, Hội đồng gắt gao)
    - Tự động sinh câu hỏi mở màn (Opening Question) sắc bén
    """
    try:
        session = debate_manager.create_session(
            db=db,
            title=payload.title,
            persona=payload.persona,
            document_id=payload.document_id,
            topic_summary=payload.topic_summary,
            max_turns=payload.max_turns
        )
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Không thể khởi tạo phiên tranh biện: {str(e)}")

@router.get("/sessions", response_model=List[SessionDetailResponse])
def list_debate_sessions(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách các phiên bảo vệ đã và đang diễn ra
    """
    sessions = db.query(DebateSession).order_by(DebateSession.created_at.desc()).offset(skip).limit(limit).all()
    return sessions

@router.get("/sessions/{session_id}", response_model=SessionDetailResponse)
def get_debate_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Xem chi tiết phiên tranh biện và toàn bộ các lượt đối đáp
    """
    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên tranh biện.")
    return session

@router.post("/sessions/{session_id}/turns", response_model=RebuttalResponse)
def submit_turn_response(
    session_id: str,
    payload: SubmitTurnRequest,
    db: Session = Depends(get_db)
):
    """
    Bước 2: Tranh biện thời gian thực (Live Debate Turn):
    - Sinh viên gửi câu trả lời (qua gõ hoặc speech-to-text)
    - AI chạy Chain-of-Thought (CoT):
      1. Kiểm tra tính đúng đắn đối chiếu Ground Truth
      2. Phát hiện lỗ hổng logic & mâu thuẫn
      3. Đưa ra phản bác đanh thép và câu hỏi tiếp theo
    - Tự động tổng kết bảng điểm khi đạt số lượt tối đa
    """
    try:
        result = debate_manager.process_student_response(
            db=db,
            session_id=session_id,
            student_response=payload.student_response,
            response_mode=payload.response_mode,
            duration_seconds=payload.duration_seconds
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý phản hồi: {str(e)}")

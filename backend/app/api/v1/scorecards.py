from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.scorecard import Scorecard
from app.schemas.scorecard import ScorecardResponse
from app.services.debate_manager import debate_manager

router = APIRouter(prefix="/scorecards", tags=["Scorecards & Analytics"])

@router.get("/{session_id}", response_model=ScorecardResponse)
def get_scorecard_by_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Bước 3: Lấy Bảng điểm & Nhận xét chi tiết (Scorecard & Feedback):
    - Điểm Logic & Độ chính xác kiến thức
    - Điểm Kỹ năng lập luận & Khả năng chịu áp lực
    - Danh sách các lỗi logic / ngụy biện bắt bài
    - Gợi ý câu trả lời chuẩn (Optimal Answers) cho từng câu chất vấn của hội đồng
    """
    scorecard = db.query(Scorecard).filter(Scorecard.session_id == session_id).first()
    if not scorecard:
        # Check if session is completed or can be finalized
        try:
            scorecard = debate_manager.finalize_scorecard(db, session_id)
        except Exception:
            raise HTTPException(status_code=404, detail="Bảng điểm chưa sẵn sàng hoặc phiên tranh biện chưa kết thúc.")
    return scorecard

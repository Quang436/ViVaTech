from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.scorecard import Scorecard
from app.schemas.scorecard import ScorecardResponse
from app.services.debate_manager import debate_manager

router = APIRouter(prefix="/scorecards", tags=["Scorecards & Analytics"])


@router.get("", response_model=List[ScorecardResponse])
def list_scorecards(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Lấy danh sách toàn bộ bảng điểm thật đã được chấm từ cơ sở dữ liệu."""
    cards = (
        db.query(Scorecard)
        .order_by(Scorecard.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return cards


@router.get("/{session_id}", response_model=ScorecardResponse)
def get_scorecard_by_session(
    session_id: str,
    db: Session = Depends(get_db),
):
    """Lấy hoặc chấm bảng điểm thật của một phiên tranh biện."""
    scorecard = db.query(Scorecard).filter(Scorecard.session_id == session_id).first()
    if not scorecard:
        try:
            scorecard = debate_manager.finalize_scorecard(db, session_id)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Không thể tạo bảng điểm cho phiên này: {str(e)}",
            )
    return scorecard

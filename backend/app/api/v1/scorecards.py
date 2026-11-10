from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.scorecard import Scorecard
from app.models.session import DebateSession
from app.models.user import User
from app.schemas.scorecard import ScorecardResponse
from app.services.debate_manager import debate_manager

router = APIRouter(prefix="/scorecards", tags=["Scorecards & Analytics"])


@router.get("", response_model=List[ScorecardResponse])
def list_scorecards(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lấy danh sách bảng điểm thật thuộc tài khoản hiện tại."""
    cards = (
        db.query(Scorecard)
        .join(DebateSession, Scorecard.session_id == DebateSession.id)
        .filter(DebateSession.user_id == current_user.id)
        .order_by(Scorecard.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return cards


@router.get("/{session_id}", response_model=ScorecardResponse)
def get_scorecard_by_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lấy hoặc chấm bảng điểm thật của một phiên tranh biện thuộc tài khoản hiện tại."""
    session = (
        db.query(DebateSession)
        .filter(
            DebateSession.id == session_id,
            DebateSession.user_id == current_user.id,
        )
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy phiên tranh biện hoặc bạn không có quyền truy cập.",
        )

    scorecard = db.query(Scorecard).filter(Scorecard.session_id == session_id).first()
    if not scorecard:
        try:
            scorecard = debate_manager.finalize_scorecard(db, session_id, user_id=current_user.id)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Không thể tạo bảng điểm cho phiên này: {str(e)}",
            )
    return scorecard

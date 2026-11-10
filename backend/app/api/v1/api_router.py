from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.v1 import auth, avatar, debate, did_agent, documents, scorecards
from app.core.database import get_db
from app.models.debate_turn import DebateTurn
from app.models.scorecard import Scorecard
from app.models.session import DebateSession, SessionStatus
from app.models.user import User
from app.services.rag_engine import rag_engine

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(documents.router)
api_router.include_router(debate.router)
api_router.include_router(scorecards.router)
api_router.include_router(avatar.router)
api_router.include_router(did_agent.router, prefix="/did-agent")


@api_router.get("/stats", tags=["System Metrics"])
def get_real_platform_stats(db: Session = Depends(get_db)):
    """Trả về số liệu thống kê thực tế từ cơ sở dữ liệu SQLite và chỉ mục Vector RAG."""
    total_users = db.query(User).count()
    total_sessions = db.query(DebateSession).count()
    completed_sessions = (
        db.query(DebateSession)
        .filter(DebateSession.status == SessionStatus.COMPLETED.value)
        .count()
    )
    total_answered_turns = (
        db.query(DebateTurn)
        .filter(DebateTurn.student_response.isnot(None))
        .count()
    )
    total_scorecards = db.query(Scorecard).count()
    avg_score_raw = db.query(func.avg(Scorecard.overall_score)).scalar()
    average_overall_score = round(float(avg_score_raw), 1) if avg_score_raw is not None else None

    docs = rag_engine._docs_store.values()
    total_documents = len(rag_engine._docs_store)
    total_chunks = sum(int(d.get("total_chunks", len(d.get("chunks", [])))) for d in docs)

    return {
        "total_users": total_users,
        "total_documents": total_documents,
        "total_chunks": total_chunks,
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "total_answered_turns": total_answered_turns,
        "total_scorecards": total_scorecards,
        "average_overall_score": average_overall_score,
    }

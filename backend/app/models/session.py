from sqlalchemy import Column, String, Integer, DateTime, Text, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
import uuid
from app.core.database import Base

class CouncilPersona(str, enum.Enum):
    FEYNMAN = "feynman"                     # Dễ: Ngô nghê, súc tích, thực tế
    ACADEMIC_REVIEWER = "academic_reviewer" # Vừa: Học thuật, công thức, định nghĩa
    STRICT_COUNCIL = "strict_council"       # Khó: Hội đồng gắt gao, stress-test logic

class SessionStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class DebateSession(Base):
    __tablename__ = "debate_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    topic_summary = Column(Text, nullable=True)
    persona = Column(String(50), default=CouncilPersona.ACADEMIC_REVIEWER.value)
    document_name = Column(String(255), nullable=True)
    document_id = Column(String(255), nullable=True) # Vector DB collection/filter ID
    status = Column(String(50), default=SessionStatus.IN_PROGRESS.value)
    max_turns = Column(Integer, default=5)
    current_turn = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    turns = relationship("DebateTurn", back_populates="session", cascade="all, delete-orphan", order_by="DebateTurn.turn_number")
    scorecard = relationship("Scorecard", back_populates="session", uselist=False, cascade="all, delete-orphan")

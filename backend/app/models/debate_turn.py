from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class DebateTurn(Base):
    __tablename__ = "debate_turns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False)
    turn_number = Column(Integer, nullable=False)
    
    # Council AI side
    council_speaker = Column(String(100), default="Giáo sư Phản biện")
    ai_question = Column(Text, nullable=False)
    ai_thought_process = Column(JSON, nullable=True) # Chain of Thought steps
    
    # Student side
    student_response = Column(Text, nullable=True)
    response_mode = Column(String(20), default="text") # 'voice' or 'text'
    duration_seconds = Column(Integer, default=0)
    
    # AI critique of this turn
    ground_truth_accuracy = Column(Integer, default=0) # 0-100%
    logic_flaws = Column(JSON, default=list) # List of detected fallacies / circular reasoning
    critique_comment = Column(Text, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("DebateSession", back_populates="turns")

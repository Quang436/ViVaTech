from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class Scorecard(Base):
    __tablename__ = "scorecards"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    # Quantitative Scores (0-100)
    overall_score = Column(Float, nullable=False, default=0.0)
    logic_accuracy_score = Column(Float, nullable=False, default=0.0)
    argumentation_score = Column(Float, nullable=False, default=0.0)
    composure_score = Column(Float, nullable=False, default=0.0)
    clarity_score = Column(Float, nullable=False, default=0.0)
    
    # Qualitative Feedback
    strengths = Column(JSON, default=list) # List of strengths
    weaknesses = Column(JSON, default=list) # List of areas to improve
    fallacies_summary = Column(JSON, default=list) # Fallacies identified during the session
    optimal_answers = Column(JSON, default=list) # Gợi ý câu trả lời chuẩn cho từng câu chất vấn
    overall_verdict = Column(Text, nullable=True) # Nhận xét tổng quan của hội đồng
    
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("DebateSession", back_populates="scorecard")

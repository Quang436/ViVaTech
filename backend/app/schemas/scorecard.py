from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OptimalAnswerItem(BaseModel):
    turn_number: int
    question: str
    student_answer_summary: str
    optimal_answer: str
    key_takeaway: str

class ScorecardResponse(BaseModel):
    id: str
    session_id: str
    overall_score: float
    logic_accuracy_score: float
    argumentation_score: float
    composure_score: float
    clarity_score: float
    strengths: List[str]
    weaknesses: List[str]
    fallacies_summary: List[str]
    optimal_answers: List[OptimalAnswerItem]
    overall_verdict: str
    created_at: datetime

    class Config:
        from_attributes = True

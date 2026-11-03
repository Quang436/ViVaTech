from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class CreateSessionRequest(BaseModel):
    title: str = Field(..., description="Tên đề tài / đồ án / chủ đề phản biện")
    persona: str = Field("academic_reviewer", description="feynman | academic_reviewer | strict_council")
    document_id: Optional[str] = Field(None, description="ID của tài liệu đã upload hoặc vector collection")
    document_name: Optional[str] = Field(None, description="Tên file tài liệu")
    topic_summary: Optional[str] = Field(None, description="Mô tả tóm tắt nếu không dùng file")
    max_turns: int = Field(5, ge=3, le=10, description="Số lượt phản biện (3-10 lượt)")


class TurnResponse(BaseModel):
    id: str
    turn_number: int
    council_speaker: str
    ai_question: str
    student_response: Optional[str] = None
    response_mode: Optional[str] = "text"
    duration_seconds: Optional[int] = 0
    ground_truth_accuracy: Optional[int] = None
    logic_flaws: Optional[List[str]] = []
    critique_comment: Optional[str] = None
    ai_thought_process: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class SessionDetailResponse(BaseModel):
    id: str
    title: str
    persona: str
    topic_summary: Optional[str] = None
    document_id: Optional[str] = None
    document_name: Optional[str] = None
    status: str
    max_turns: int
    current_turn: int
    created_at: datetime
    turns: List[TurnResponse] = []

    class Config:
        from_attributes = True


class SubmitTurnRequest(BaseModel):
    student_response: str = Field(..., min_length=2, description="Câu trả lời của sinh viên (qua gõ hoặc speech-to-text)")
    response_mode: str = Field("text", description="'voice' hoặc 'text'")
    duration_seconds: Optional[int] = Field(0, description="Thời gian sinh viên suy nghĩ/trả lời")


class RebuttalResponse(BaseModel):
    session_id: str
    turn_number: int
    is_completed: bool
    critique_previous_answer: Optional[str] = None
    detected_flaws: List[str] = []
    ground_truth_accuracy: int
    next_question: Optional[str] = None
    council_speaker: str
    cot_reasoning: Optional[Dict[str, Any]] = None

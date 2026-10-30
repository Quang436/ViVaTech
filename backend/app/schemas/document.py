from pydantic import BaseModel
from typing import Optional

class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    total_chunks: int
    summary: str
    message: str

class TopicInputRequest(BaseModel):
    title: str
    content: str

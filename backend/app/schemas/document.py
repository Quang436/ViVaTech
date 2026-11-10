from pydantic import BaseModel
from typing import List, Optional


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    total_chunks: int
    pages: int = 1
    file_size_bytes: int = 0
    word_count: int = 0
    summary: str
    created_at: Optional[str] = None
    message: Optional[str] = None


class DocumentDetailResponse(DocumentUploadResponse):
    chunks: List[str] = []


class TopicInputRequest(BaseModel):
    title: str
    content: str

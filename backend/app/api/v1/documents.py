from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import os
import uuid
import shutil
from app.core.config import settings
from app.schemas.document import DocumentUploadResponse, TopicInputRequest
from app.services.rag_engine import rag_engine

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Nạp tài liệu đề tài, báo cáo, khóa luận (PDF, DOCX, TXT)
    Hệ thống sẽ trích xuất văn bản, chunking và nạp vào Vector DB làm Ground Truth.
    """
    allowed_extensions = [".pdf", ".txt", ".docx"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Định dạng tệp không được hỗ trợ ({file_ext}). Vui lòng tải lên .pdf, .docx hoặc .txt"
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    doc_id = str(uuid.uuid4())
    saved_filename = f"{doc_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract text
        if file_ext == ".pdf":
            text_content = rag_engine.extract_text_from_pdf(file_path)
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text_content = f.read()

        if not text_content.strip():
            text_content = f"Tài liệu đề tài: {file.filename}. Nội dung rỗng hoặc không quét được ký tự."

        # Index in RAG Engine
        indexed_data = rag_engine.index_document(
            doc_id=doc_id,
            filename=file.filename,
            content=text_content
        )

        return DocumentUploadResponse(
            document_id=doc_id,
            filename=file.filename,
            total_chunks=indexed_data["total_chunks"],
            summary=indexed_data["summary"],
            message="Tài liệu đã được phân tích và lập chỉ mục thành công vào Vector DB."
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý tài liệu: {str(e)}")

@router.post("/topic", response_model=DocumentUploadResponse)
async def ingest_topic_text(payload: TopicInputRequest):
    """
    Nạp chủ đề hoặc đề cương bằng văn bản trực tiếp
    """
    doc_id = str(uuid.uuid4())
    indexed_data = rag_engine.index_document(
        doc_id=doc_id,
        filename=payload.title,
        content=payload.content
    )
    return DocumentUploadResponse(
        document_id=doc_id,
        filename=payload.title,
        total_chunks=indexed_data["total_chunks"],
        summary=indexed_data["summary"],
        message="Chủ đề đã được nạp thành công."
    )

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from typing import List
import os
import shutil
import uuid

from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.document import (
    DocumentDetailResponse,
    DocumentUploadResponse,
    TopicInputRequest,
)
from app.services.rag_engine import rag_engine

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.get("", response_model=List[DocumentUploadResponse])
async def list_documents(current_user: User = Depends(get_current_user)):
    """Lấy danh sách tài liệu thật thuộc tài khoản hiện tại."""
    docs = rag_engine.list_documents(user_id=current_user.id)
    return [
        DocumentUploadResponse(
            document_id=d["document_id"],
            filename=d["filename"],
            total_chunks=d["total_chunks"],
            pages=d.get("pages", 1),
            file_size_bytes=d.get("file_size_bytes", 0),
            word_count=d.get("word_count", 0),
            summary=d.get("summary", ""),
            created_at=d.get("created_at"),
            message="Sẵn sàng",
        )
        for d in docs
    ]


@router.get("/{doc_id}", response_model=DocumentDetailResponse)
async def get_document_detail(
    doc_id: str,
    current_user: User = Depends(get_current_user),
):
    """Lấy chi tiết và toàn bộ phân đoạn (chunks) thật đã trích xuất trong Vector DB."""
    doc = rag_engine.get_document(doc_id=doc_id, user_id=current_user.id)
    if not doc:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy tài liệu hoặc tài liệu không thuộc tài khoản của bạn.",
        )
    return DocumentDetailResponse(
        document_id=doc["document_id"],
        filename=doc["filename"],
        total_chunks=doc["total_chunks"],
        pages=doc.get("pages", 1),
        file_size_bytes=doc.get("file_size_bytes", 0),
        word_count=doc.get("word_count", 0),
        summary=doc.get("summary", ""),
        chunks=doc.get("chunks", []),
        created_at=doc.get("created_at"),
        message="Sẵn sàng",
    )


@router.delete("/{doc_id}")
async def delete_document(
    doc_id: str,
    current_user: User = Depends(get_current_user),
):
    """Xóa tài liệu thuộc quyền sở hữu khỏi hệ thống và Vector DB."""
    removed = rag_engine.delete_document(doc_id=doc_id, user_id=current_user.id)
    if not removed:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy tài liệu hoặc bạn không có quyền xóa tài liệu này.",
        )
    return {"status": "deleted", "document_id": doc_id}


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Nạp tài liệu đề tài, báo cáo, khóa luận (PDF, DOCX, TXT) cho người dùng hiện tại.
    Trích xuất văn bản thật, đếm số trang/từ, chunking và lưu vào Vector DB làm Ground Truth.
    """
    allowed_extensions = [".pdf", ".txt", ".docx"]
    safe_name = os.path.basename(file.filename or "document.txt")
    file_ext = os.path.splitext(safe_name)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Định dạng tệp không được hỗ trợ ({file_ext}). Vui lòng tải lên .pdf, .docx hoặc .txt",
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    doc_id = str(uuid.uuid4())
    saved_filename = f"{doc_id}_{safe_name}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size_bytes = os.path.getsize(file_path)

        if file_ext == ".pdf":
            text_content, page_count = rag_engine.extract_text_from_pdf(file_path)
        elif file_ext == ".docx":
            text_content, page_count = rag_engine.extract_text_from_docx(file_path)
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text_content = f.read()
            page_count = max(1, round(len(text_content.split()) / 300))

        if not text_content.strip():
            raise HTTPException(
                status_code=422,
                detail=f"Không thể trích xuất văn bản từ tệp '{safe_name}' (tệp trống hoặc là bản scan ảnh chưa OCR).",
            )

        indexed_data = rag_engine.index_document(
            doc_id=doc_id,
            filename=safe_name,
            content=text_content,
            user_id=current_user.id,
            pages=page_count,
            file_size_bytes=file_size_bytes,
            file_path=file_path,
        )

        return DocumentUploadResponse(
            document_id=doc_id,
            filename=safe_name,
            total_chunks=indexed_data["total_chunks"],
            pages=indexed_data["pages"],
            file_size_bytes=indexed_data["file_size_bytes"],
            word_count=indexed_data["word_count"],
            summary=indexed_data["summary"],
            created_at=indexed_data["created_at"],
            message="Tài liệu đã được phân tích và lập chỉ mục thành công vào Vector DB.",
        )

    except HTTPException:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        raise
    except Exception as e:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý tài liệu: {str(e)}")


@router.post("/topic", response_model=DocumentUploadResponse)
async def ingest_topic_text(
    payload: TopicInputRequest,
    current_user: User = Depends(get_current_user),
):
    """Nạp chủ đề hoặc đề cương bằng văn bản trực tiếp cho tài khoản hiện tại."""
    doc_id = str(uuid.uuid4())
    content_bytes = len(payload.content.encode("utf-8"))
    pages = max(1, round(len(payload.content.split()) / 300))
    indexed_data = rag_engine.index_document(
        doc_id=doc_id,
        filename=payload.title,
        content=payload.content,
        user_id=current_user.id,
        pages=pages,
        file_size_bytes=content_bytes,
    )
    return DocumentUploadResponse(
        document_id=doc_id,
        filename=payload.title,
        total_chunks=indexed_data["total_chunks"],
        pages=indexed_data["pages"],
        file_size_bytes=indexed_data["file_size_bytes"],
        word_count=indexed_data["word_count"],
        summary=indexed_data["summary"],
        created_at=indexed_data["created_at"],
        message="Chủ đề đã được nạp thành công.",
    )

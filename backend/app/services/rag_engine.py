import os
import json
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Dict, Any, Optional
import pypdf
from app.core.config import settings


class RAGEngine:
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.persist_directory = persist_directory
        self._docs_store: Dict[str, Dict[str, Any]] = {}
        self.meta_file = os.path.join(settings.UPLOAD_DIR, "documents_meta.json")
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

        self.chroma_client = None
        try:
            import chromadb
            os.makedirs(self.persist_directory, exist_ok=True)
            self.chroma_client = chromadb.PersistentClient(path=self.persist_directory)
        except Exception as e:
            print(f"[RAG] ChromaDB fallback to persistent JSON store: {e}")

        self._load_persisted_docs()

    def _load_persisted_docs(self):
        if os.path.exists(self.meta_file):
            try:
                with open(self.meta_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        self._docs_store = data
            except Exception as e:
                print(f"[RAG] Failed to load documents_meta.json: {e}")

    def _save_persisted_docs(self):
        try:
            os.makedirs(os.path.dirname(self.meta_file), exist_ok=True)
            with open(self.meta_file, "w", encoding="utf-8") as f:
                json.dump(self._docs_store, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"[RAG] Failed to save documents_meta.json: {e}")

    def extract_text_from_pdf(self, file_path: str) -> tuple[str, int]:
        text = ""
        page_count = 0
        try:
            reader = pypdf.PdfReader(file_path)
            page_count = len(reader.pages)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            print(f"Error reading PDF {file_path}: {e}")
        return text.strip(), max(1, page_count)

    def extract_text_from_docx(self, file_path: str) -> tuple[str, int]:
        text_parts: List[str] = []
        try:
            with zipfile.ZipFile(file_path) as zf:
                if "word/document.xml" in zf.namelist():
                    xml_content = zf.read("word/document.xml")
                    tree = ET.fromstring(xml_content)
                    for elem in tree.iter():
                        if elem.tag.endswith("}t") and elem.text:
                            text_parts.append(elem.text)
                        elif elem.tag.endswith("}p"):
                            text_parts.append("\n")
        except Exception as e:
            print(f"Error reading DOCX {file_path}: {e}")
        full_text = "".join(text_parts).strip()
        estimated_pages = max(1, round(len(full_text.split()) / 300))
        return full_text, estimated_pages

    def chunk_text(self, text: str, chunk_size: int = 350, overlap: int = 60) -> List[str]:
        if not text:
            return []
        words = text.split()
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i : i + chunk_size])
            chunks.append(chunk)
            i += max(1, chunk_size - overlap)
        return chunks

    def index_document(
        self,
        doc_id: str,
        filename: str,
        content: str,
        user_id: str,
        pages: int = 1,
        file_size_bytes: int = 0,
        file_path: Optional[str] = None,
    ) -> Dict[str, Any]:
        chunks = self.chunk_text(content)
        if not chunks:
            chunks = [content.strip() or f"Tài liệu {filename}"]

        word_count = len(content.split())
        clean_summary = chunks[0][:350].strip()
        if len(chunks[0]) > 350:
            clean_summary += "..."

        now_iso = datetime.utcnow().isoformat()
        doc_record = {
            "document_id": doc_id,
            "user_id": user_id,
            "filename": filename,
            "raw_text": content,
            "chunks": chunks,
            "total_chunks": len(chunks),
            "pages": max(1, pages),
            "file_size_bytes": file_size_bytes,
            "word_count": word_count,
            "file_path": file_path,
            "summary": clean_summary,
            "created_at": now_iso,
        }
        self._docs_store[doc_id] = doc_record
        self._save_persisted_docs()

        if self.chroma_client:
            try:
                collection = self.chroma_client.get_or_create_collection(
                    name=f"doc_{doc_id.replace('-', '_')}"
                )
                ids = [f"{doc_id}_{idx}" for idx in range(len(chunks))]
                collection.add(
                    documents=chunks,
                    ids=ids,
                    metadatas=[{"source": filename, "chunk_idx": idx, "user_id": user_id} for idx in range(len(chunks))],
                )
            except Exception as e:
                print(f"[RAG] Error adding to ChromaDB: {e}")

        return {
            "document_id": doc_id,
            "filename": filename,
            "total_chunks": len(chunks),
            "pages": doc_record["pages"],
            "file_size_bytes": file_size_bytes,
            "word_count": word_count,
            "summary": clean_summary,
            "created_at": now_iso,
        }

    def list_documents(self, user_id: str) -> List[Dict[str, Any]]:
        docs = []
        for doc_id, info in self._docs_store.items():
            if info.get("user_id") != user_id:
                continue
            raw_text = info.get("raw_text", "")
            docs.append(
                {
                    "document_id": doc_id,
                    "filename": info.get("filename", "Untitled"),
                    "total_chunks": info.get("total_chunks", len(info.get("chunks", []))),
                    "pages": info.get("pages", 1),
                    "file_size_bytes": info.get("file_size_bytes", 0),
                    "word_count": info.get("word_count", len(raw_text.split()) if raw_text else 0),
                    "summary": info.get("summary", ""),
                    "created_at": info.get("created_at", datetime.utcnow().isoformat()),
                }
            )
        docs.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return docs

    def get_document(self, doc_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        info = self._docs_store.get(doc_id)
        if not info or info.get("user_id") != user_id:
            return None
        raw_text = info.get("raw_text", "")
        return {
            "document_id": doc_id,
            "filename": info.get("filename", "Untitled"),
            "total_chunks": info.get("total_chunks", len(info.get("chunks", []))),
            "pages": info.get("pages", 1),
            "file_size_bytes": info.get("file_size_bytes", 0),
            "word_count": info.get("word_count", len(raw_text.split()) if raw_text else 0),
            "summary": info.get("summary", ""),
            "chunks": info.get("chunks", []),
            "created_at": info.get("created_at", datetime.utcnow().isoformat()),
        }

    def delete_document(self, doc_id: str, user_id: str) -> bool:
        info = self._docs_store.get(doc_id)
        if not info or info.get("user_id") != user_id:
            return False
        self._docs_store.pop(doc_id, None)
        self._save_persisted_docs()
        file_path = info.get("file_path")
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        if self.chroma_client:
            try:
                self.chroma_client.delete_collection(name=f"doc_{doc_id.replace('-', '_')}")
            except Exception:
                pass
        return True

    def retrieve_ground_truth(self, doc_id: Optional[str], query: str, top_k: int = 3) -> str:
        if not doc_id or doc_id not in self._docs_store:
            return ""

        if self.chroma_client:
            try:
                col_name = f"doc_{doc_id.replace('-', '_')}"
                collection = self.chroma_client.get_collection(name=col_name)
                results = collection.query(query_texts=[query], n_results=min(top_k, 5))
                if results and "documents" in results and results["documents"]:
                    matched_docs = results["documents"][0]
                    return "\n---\n".join(matched_docs)
            except Exception as e:
                print(f"[RAG] ChromaDB query error, fallback to memory: {e}")

        doc_data = self._docs_store.get(doc_id)
        if not doc_data:
            return ""

        query_words = set(query.lower().split())
        scored_chunks = []
        for chunk in doc_data.get("chunks", []):
            chunk_words = set(chunk.lower().split())
            score = len(query_words.intersection(chunk_words))
            scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_chunks = [c[1] for c in scored_chunks[:top_k]]
        return "\n---\n".join(top_chunks)


rag_engine = RAGEngine()

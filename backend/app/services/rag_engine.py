import os
import uuid
from typing import List, Dict, Any, Optional
import pypdf

class RAGEngine:
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.persist_directory = persist_directory
        self._docs_store: Dict[str, Dict[str, Any]] = {}
        # Try to initialize chromadb if available, else in-memory fallback
        self.chroma_client = None
        try:
            import chromadb
            os.makedirs(self.persist_directory, exist_ok=True)
            self.chroma_client = chromadb.PersistentClient(path=self.persist_directory)
        except Exception as e:
            print(f"[RAG] ChromaDB fallback to in-memory store: {e}")

    def extract_text_from_pdf(self, file_path: str) -> str:
        text = ""
        try:
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            print(f"Error reading PDF {file_path}: {e}")
        return text.strip()

    def chunk_text(self, text: str, chunk_size: int = 600, overlap: int = 100) -> List[str]:
        if not text:
            return []
        words = text.split()
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i:i + chunk_size])
            chunks.append(chunk)
            i += (chunk_size - overlap)
        return chunks

    def index_document(self, doc_id: str, filename: str, content: str) -> Dict[str, Any]:
        chunks = self.chunk_text(content)
        if not chunks:
            chunks = ["Tài liệu không có nội dung văn bản cụ thể."]
        
        self._docs_store[doc_id] = {
            "filename": filename,
            "raw_text": content,
            "chunks": chunks,
            "summary": chunks[0][:300] + "..." if len(chunks[0]) > 300 else chunks[0]
        }

        # Store in ChromaDB if enabled
        if self.chroma_client:
            try:
                collection = self.chroma_client.get_or_create_collection(name=f"doc_{doc_id.replace('-', '_')}")
                ids = [f"{doc_id}_{idx}" for idx in range(len(chunks))]
                collection.add(
                    documents=chunks,
                    ids=ids,
                    metadatas=[{"source": filename, "chunk_idx": idx} for idx in range(len(chunks))]
                )
            except Exception as e:
                print(f"[RAG] Error adding to ChromaDB: {e}")

        return {
            "document_id": doc_id,
            "filename": filename,
            "total_chunks": len(chunks),
            "summary": self._docs_store[doc_id]["summary"]
        }

    def retrieve_ground_truth(self, doc_id: Optional[str], query: str, top_k: int = 3) -> str:
        if not doc_id or doc_id not in self._docs_store:
            return ""
        
        # If ChromaDB collection exists
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

        # Fallback to in-memory search
        doc_data = self._docs_store.get(doc_id)
        if not doc_data:
            return ""
        
        # Simple keyword overlap match
        query_words = set(query.lower().split())
        scored_chunks = []
        for chunk in doc_data["chunks"]:
            chunk_words = set(chunk.lower().split())
            score = len(query_words.intersection(chunk_words))
            scored_chunks.append((score, chunk))
        
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_chunks = [c[1] for c in scored_chunks[:top_k]]
        return "\n---\n".join(top_chunks)

rag_engine = RAGEngine()

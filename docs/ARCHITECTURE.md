# KIẾN TRÚC HỆ THỐNG VIVAARENA (EDUTECH)
## Mô hình "Tranh biện cùng Phản biện AI theo Phong cách Hội đồng"

---

## 1. Tổng quan Kiến trúc (System Architecture)

VivaArena là nền tảng luyện tranh biện và mô phỏng bảo vệ đồ án học thuật ứng dụng Trí tuệ Nhân tạo thế hệ mới (Generative AI). Hệ thống chuyển đổi phương pháp học truyền thống từ **học thụ động (Passive Learning)** sang **học chủ động và truy vấn ngược (Active Learning & Retrieval Practice)** thông qua cơ chế phản biện thời gian thực.

```mermaid
graph TD
    subgraph "Client Layer (Frontend)"
        UI[Next.js / React UI]
        STT[Web Speech API / Whisper STT]
        TTS[Web Speech Synthesis / TTS Engine]
        WS_Client[WebSocket Client]
    end

    subgraph "API Gateway & Backend (FastAPI)"
        Router[FastAPI API Router]
        WS_Server[WebSocket Manager]
        DebateMgr[Debate Orchestrator]
    end

    subgraph "Knowledge & RAG Layer"
        DocParser[PDF / Word Doc Parser]
        Chunker[Semantic Text Chunker]
        Chroma[ChromaDB Vector Store]
    end

    subgraph "AI Brain (Google Gemini 3.8 Flash)"
        CoT[Chain-of-Thought Engine]
        Personas[Council Personas Manager]
        ScoreEngine[Scorecard & Feedback Evaluator]
    end

    subgraph "Persistence Layer"
        DB[(SQLite / PostgreSQL)]
    end

    UI --> Router
    WS_Client <--> WS_Server
    Router --> DebateMgr
    WS_Server --> DebateMgr

    DocParser --> Chunker --> Chroma
    DebateMgr --> Chroma
    DebateMgr --> CoT
    CoT --> Personas
    DebateMgr --> ScoreEngine
    DebateMgr --> DB
```

---

## 2. Quy trình Xử lý Dữ liệu Chi tiết (Data & Interaction Flow)

### Bước 1: Nạp tài liệu & Kiến tạo Ground Truth (Document Ingestion & Indexing)
1. Giảng viên hoặc sinh viên tải lên tệp đề tài (PDF, DOCX, TXT) hoặc nhập tóm tắt đề cương.
2. `DocParser` trích xuất toàn bộ văn bản thô, làm sạch ký tự lạ và cấu trúc hóa tài liệu.
3. `Semantic Chunker` chia tài liệu thành các khối văn bản (chunks) từ 400 - 600 từ với độ gối đầu (overlap) 100 từ.
4. `ChromaDB` tạo embedding vectors và lưu trữ vào collection theo `document_id`. Đây là **Ground Truth** (kiến thức chuẩn mực) phục vụ việc đối chiếu khi tranh biện.

### Bước 2: Quá trình Tranh biện Thời gian thực & Kỹ thuật Chain-of-Thought (CoT)
Mỗi lượt đối đáp của sinh viên được AI xử lý qua 3 bước suy luận ngầm (Chain-of-Thought) trước khi phát ngôn:

```mermaid
sequenceDiagram
    autonumber
    actor SV as Sinh viên
    participant FE as VivaArena Frontend
    participant BE as FastAPI Backend
    participant RAG as ChromaDB (Ground Truth)
    participant AI as Gemini 3.8 Flash (CoT)

    SV->>FE: Phát biểu bằng micro (Voice) hoặc nhập văn bản
    FE->>BE: Gửi Student Response + Audio Duration
    BE->>RAG: Semantic Search tìm chunks liên quan trong tài liệu
    RAG-->>BE: Trả về tài liệu đối chiếu (Ground Truth Chunks)
    
    rect rgb(240, 245, 255)
        Note over BE,AI: Chain-of-Thought (3 Bước ngầm)
        BE->>AI: Gửi Dialogue History + Student Answer + Ground Truth
        AI->>AI: Bước 1: Kiểm tra tính đúng đắn (0-100%)
        AI->>AI: Bước 2: Bắt bài lỗi logic / ngụy biện / vòng vo / mâu thuẫn
        AI->>AI: Bước 3: Tổng hợp phản bác & Câu hỏi chất vấn tiếp theo
    end
    
    AI-->>BE: Trả về JSON (accuracy, flaws, critique, next_question)
    BE->>FE: Trả kết quả + Phát giọng đọc hội đồng (TTS)
    FE-->>SV: Hiển thị avatar cử động, phản hồi đanh thép & timer mới
```

### Bước 3: Đánh giá Toàn diện & Sinh Bảng điểm (Scorecard Generation)
Sau khi kết thúc phiên tranh biện (3 - 5 lượt), hệ thống thu thập toàn bộ lịch sử tranh biện và tạo Bảng điểm với 4 trục đánh giá:
- **Logic & Knowledge Accuracy (Độ chính xác kiến thức):** So sánh câu trả lời với tài liệu chuẩn.
- **Argumentation Skills (Kỹ năng lập luận):** Đo lường tính chặt chẽ, phát hiện ngụy biện.
- **Composure & Pressure Resilience (Bản lĩnh phản biện):** Khả năng ứng phó câu hỏi hóc búa.
- **Communication Clarity (Độ mạch lạc, rõ ràng):** Mức độ súc tích, tránh lan man.
- **Optimal Answers (Câu trả lời kiểu mẫu):** Cung cấp lời giải mẫu chuẩn học thuật cho từng câu hỏi.

---

## 3. Kiến trúc Cơ sở Dữ liệu (Database Schema)

```mermaid
erDiagram
    DEBATE_SESSIONS ||--o{ DEBATE_TURNS : contains
    DEBATE_SESSIONS ||--o| SCORECARDS : generates

    DEBATE_SESSIONS {
        string id PK
        string title
        string persona
        string document_id
        string document_name
        string status
        int max_turns
        int current_turn
        datetime created_at
    }

    DEBATE_TURNS {
        string id PK
        string session_id FK
        int turn_number
        string council_speaker
        text ai_question
        text student_response
        string response_mode
        int ground_truth_accuracy
        json logic_flaws
        text critique_comment
        json ai_thought_process
        datetime timestamp
    }

    SCORECARDS {
        string id PK
        string session_id FK
        float overall_score
        float logic_accuracy_score
        float argumentation_score
        float composure_score
        float clarity_score
        json strengths
        json weaknesses
        json fallacies_summary
        json optimal_answers
        text overall_verdict
        datetime created_at
    }
```

---

## 4. Công nghệ & Thư viện sử dụng
- **Backend Framework:** FastAPI (Python 3.11+)
- **Large Language Model:** Google Gemini API (`gemini-3.8-flash` qua SDK chính thức `google-genai`)
- **Vector Database:** ChromaDB (Persistent Embedding Storage)
- **Document Processing:** PyPDF, python-multipart
- **Relational Database:** SQLite (Development) / PostgreSQL (Production)
- **Frontend Framework:** React 19 + TypeScript + Vite
- **Iconography & Styling:** Lucide React, Modern CSS Design System (Glassmorphism, Dark Mode)
- **Speech Technologies:** Web Speech Recognition API (Speech-to-Text tiếng Việt) & Web Speech Synthesis API.

# EDUTECH – VivaArena (ViVaTech)
### Nền tảng Mô phỏng Hội đồng Phản biện và Đánh giá Tư duy Logic cho Sinh viên bằng Trí tuệ Nhân tạo
> *Dự án Đổi mới Sáng tạo Giáo dục (Active Learning & Critical Thinking Mock-Defense Platform)*

---

## 🌟 Giới thiệu Dự án

**VivaArena** giải quyết nỗi sợ hãi lớn nhất của sinh viên khi bước ra hội đồng bảo vệ đồ án/khóa luận tốt nghiệp hoặc phỏng vấn học thuật: **thiếu kỹ năng phản biện thực chiến và dễ bị "đơ" trước các câu hỏi xoáy**.

Thay vì "học thụ động" (đọc slide, xem bài giảng), sinh viên tham gia vào một **Phòng bảo vệ hội đồng ảo thời gian thực**. AI đóng vai các giám khảo với nhiều cấp độ khác nhau, áp dụng kỹ thuật **Chain-of-Thought (CoT) 3 bước ngầm** để bóc tách lỗ hổng logic, bắt bài trả lời vòng vo và ép sinh viên phải bảo vệ luận điểm của mình.

---

## 🏛️ 3 Cấp độ Hội đồng Phản biện (Council Personas)

1. **Cấp độ 1: Phương pháp Feynman (Dễ):**
   AI đóng vai một bạn học ngô nghê, liên tục hỏi *"Tại sao lại như vậy?"*, *"Giải thích cho học sinh lớp 5 thế nào?"*, *"Ứng dụng thực tế ra sao?"*, buộc người học phải diễn giải bằng trực giác đơn giản nhất.
2. **Cấp độ 2: Thầy Phản biện Học thuật (Vừa):**
   AI đóng vai giảng viên phản biện chuẩn mực, xoáy sâu vào tính chính xác của định nghĩa, công thức toán học, thuật toán, ưu/nhược điểm so với giải pháp hiện có (State-of-the-Art).
3. **Cấp độ 3: Hội đồng Bảo vệ Gắt gao (Khó - Stress Test):**
   AI đóng vai hội đồng chấm tốt nghiệp khó tính, chỉ ra các lỗ hổng logic, mâu thuẫn giữa các câu trả lời và ép sinh viên vào các kịch bản ngoại lệ cực đoan (edge-cases).

---

## 🚀 Cấu trúc Thư mục Dự án

```
ViVaTech/
├── backend/                         # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py                  # Entrypoint chính (CORS, Lifespan, WebSocket)
│   │   ├── core/                    # Cấu hình & Database Connection
│   │   │   ├── config.py            # Cấu hình Pydantic Settings
│   │   │   └── database.py          # SQLAlchemy Engine & Session
│   │   ├── models/                  # Bảng CSDL (SQLAlchemy)
│   │   │   ├── session.py           # Phiên tranh biện
│   │   │   ├── debate_turn.py       # Lượt đối đáp & CoT
│   │   │   └── scorecard.py         # Bảng điểm & Nhận xét
│   │   ├── schemas/                 # Data validation (Pydantic schemas)
│   │   ├── services/                # Các dịch vụ nghiệp vụ AI & RAG
│   │   │   ├── gemini_council.py    # Google Gemini 3.8 CoT & Personas
│   │   │   ├── rag_engine.py        # PDF Parser, Chunker & ChromaDB
│   │   │   └── debate_manager.py    # Điều phối luồng tranh biện & Bảng điểm
│   │   ├── api/v1/                  # RESTful API Endpoints
│   │   │   ├── documents.py         # Nạp tài liệu đồ án
│   │   │   ├── debate.py            # Khởi tạo phiên & Nộp câu trả lời
│   │   │   └── scorecards.py        # Xem bảng điểm & Câu trả lời chuẩn
│   │   └── websockets/
│   │       └── debate_ws.py         # Real-time WebSocket cho phòng tranh biện
│   ├── requirements.txt             # Danh sách thư viện Python
│   ├── .env.example                 # Mẫu biến môi trường
│   └── run.py                       # Script khởi chạy nhanh
│
├── frontend/                        # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # Thanh điều hướng & Cài đặt giọng đọc
│   │   │   ├── PersonaSelector.tsx  # Bộ chọn 3 cấp độ hội đồng
│   │   │   ├── DocumentUploader.tsx # Nạp tài liệu PDF & Đề tài mẫu
│   │   │   ├── ArenaChamber.tsx     # Phòng tranh biện trực tiếp
│   │   │   ├── CouncilAvatar.tsx    # Avatar hội đồng & visualizer giọng nói
│   │   │   ├── TimerCountdown.tsx   # Đồng hồ đếm ngược áp lực thời gian
│   │   │   ├── DebateTranscript.tsx # Transcript hội thoại & thẻ "Bắt bài"
│   │   │   └── ScorecardModal.tsx   # Bảng điểm 4 trục & Lời giải mẫu
│   │   ├── hooks/
│   │   │   ├── useSpeechRecognition.ts # Nhận diện giọng nói tiếng Việt (STT)
│   │   │   └── useSpeechSynthesis.ts   # Phát âm giọng đọc hội đồng (TTS)
│   │   ├── services/api.ts          # API Client kết nối Backend (hỗ trợ offline/mock)
│   │   ├── types/index.ts           # TypeScript interfaces
│   │   ├── App.tsx                  # Điều phối luồng 3 bước
│   │   └── index.css                # Hệ thống giao diện Dark Mode & Glassmorphism
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                            # Tài liệu Báo cáo Đề án & Kỹ thuật
│   ├── ARCHITECTURE.md              # Sơ đồ kiến trúc & RAG pipeline
│   ├── PROMPTS_AND_COT.md           # Thiết kế prompt Chain-of-Thought
│   ├── LEAN_CANVAS_AND_PITCH.md     # Mô hình kinh doanh Lean Canvas & B2C/B2B
│   └── API_SPECIFICATION.md         # Đặc tả chi tiết RESTful & WebSocket
│
├── docker-compose.yml               # Triển khai đa container
└── README.md
```

---

## 🛠️ Hướng dẫn Khởi chạy Nhanh (Quickstart)

### Cách 1: Chạy trực tiếp trên máy cục bộ (Local Development)

#### 1. Khởi chạy Backend (FastAPI):
```bash
cd backend

# 1. Cài đặt thư viện:
pip install -r requirements.txt

# 2. Cấu hình file .env (thêm GEMINI_API_KEY nếu có, hoặc để trống để chạy chế độ mô phỏng):
copy .env.example .env

# 3. Khởi chạy server:
python run.py
```
> Server Backend hoạt động tại: `http://localhost:8000`  
> Tài liệu Swagger UI: `http://localhost:8000/docs`

#### 2. Khởi chạy Frontend (React + Vite):
```bash
cd frontend

# 1. Cài đặt dependencies:
npm install

# 2. Khởi chạy dev server:
npm run dev
```
> Giao diện người dùng hoạt động tại: `http://localhost:5173`

---

### Cách 2: Triển khai bằng Docker Compose

```bash
docker compose up --build
```
Hệ thống sẽ tự động khởi tạo đồng thời Backend tại cổng `8000` và Frontend tại cổng `5173`.

---

## 🏆 Điểm Sáng Tạo & Đổi Mới Cốt Lõi (Dành cho Báo cáo Đề tài)

1. **Phương pháp Học sâu qua Truy vấn ngược (Retrieval Practice):** Não bộ sinh viên được rèn luyện để kích hoạt kiến thức chủ động khi bị chất vấn, xóa bỏ hoàn toàn tình trạng học vẹt.
2. **Chain-of-Thought (CoT) 3 Bước Ngầm:** Đảm bảo AI không nịnh hót xã giao mà phân tích chặt chẽ:
   * **Bước 1:** Kiểm tra tính đúng đắn dựa trên tài liệu đã nạp (Ground Truth).
   * **Bước 2:** Bắt bài ngụy biện, mâu thuẫn câu trước, nói vòng vo.
   * **Bước 3:** Ra đòn phản bác và đặt câu hỏi sắc bén theo đúng phong cách giám khảo đã chọn.
3. **Mô hình Kinh doanh Tiềm năng (Lean Canvas):**
   * **B2C (Sinh viên):** Freemium (1 phiên 10 phút/ngày miễn phí; gói Pro mở rộng trước mùa đồ án).
   * **B2B (Trường Đại học / Viện đào tạo):** Bán bản quyền cho giảng viên tổ chức phòng thi vấn đáp thử nghiệm cho cả lớp.

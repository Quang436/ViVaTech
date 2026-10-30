# TÀI LIỆU ĐẶC TẢ API (VIVAARENA BACKEND)
## Base URL: `http://localhost:8000/api/v1`
## WebSocket URL: `ws://localhost:8000/ws/debate/{session_id}`

---

## 1. Module Tài liệu & Ground Truth (`/documents`)

### 1.1 Tải lên tài liệu đồ án (PDF, DOCX, TXT)
- **Endpoint:** `POST /documents/upload`
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `file`: File nhị phân (PDF/DOCX/TXT)
- **Response (200 OK):**
```json
{
  "document_id": "f8a91b2c-...",
  "filename": "Do_An_Tot_Nghiep_AI.pdf",
  "total_chunks": 18,
  "summary": "Tóm tắt nội dung tài liệu trích xuất...",
  "message": "Tài liệu đã được phân tích và lập chỉ mục thành công vào Vector DB."
}
```

### 1.2 Nạp đề cương bằng văn bản trực tiếp
- **Endpoint:** `POST /documents/topic`
- **Content-Type:** `application/json`
- **Request Body:**
```json
{
  "title": "Hệ thống RAG cho Chăm sóc Khách hàng",
  "content": "Mô tả kiến trúc và các kết quả đo lường thử nghiệm..."
}
```

---

## 2. Module Phiên Tranh Biện (`/debate`)

### 2.1 Khởi tạo phiên tranh biện mới
- **Endpoint:** `POST /debate/sessions`
- **Content-Type:** `application/json`
- **Request Body:**
```json
{
  "title": "Mô hình Phát hiện Tin giả bằng Graph Neural Networks",
  "persona": "academic_reviewer",
  "document_id": "f8a91b2c-...",
  "topic_summary": "Tóm tắt ngắn (tùy chọn)",
  "max_turns": 5
}
```
- **Response (200 OK):** Trả về chi tiết phiên cùng **Câu hỏi mở màn (Turn 1)** từ Hội đồng AI.

### 2.2 Gửi phản hồi của sinh viên (Turn Submission)
- **Endpoint:** `POST /debate/sessions/{session_id}/turns`
- **Content-Type:** `application/json`
- **Request Body:**
```json
{
  "student_response": "Thưa hội đồng, phương pháp của em kết hợp mô hình BERT để trích xuất ngữ nghĩa và GNN để mô hình hóa đồ thị lan truyền...",
  "response_mode": "voice",
  "duration_seconds": 45
}
```
- **Response (200 OK):**
```json
{
  "session_id": "...",
  "turn_number": 1,
  "is_completed": false,
  "critique_previous_answer": "Bạn đã nêu được 2 thành phần, nhưng chưa giải thích cách dung hợp đặc trưng (feature fusion).",
  "detected_flaws": ["Chưa giải thích cơ chế dung hợp"],
  "ground_truth_accuracy": 82,
  "next_question": "Cụ thể ma trận kề trong GNN được khởi tạo dựa trên cơ chế nào và xử lý ra sao khi đồ thị có hàng triệu node?",
  "council_speaker": "Giáo sư Phản biện Học thuật",
  "cot_reasoning": {
    "step1_fact_check": "Khái niệm BERT + GNN đúng chuẩn tài liệu nạp...",
    "step2_logic_flaws": ["Thiếu chi tiết cơ chế"],
    "step3_rebuttal_strategy": "Chất vấn vào độ phức tạp thuật toán"
  }
}
```

---

## 3. Module Bảng Điểm & Đánh Giá (`/scorecards`)

### 3.1 Lấy bảng điểm chi tiết
- **Endpoint:** `GET /scorecards/{session_id}`
- **Response (200 OK):**
```json
{
  "id": "sc-1234",
  "session_id": "...",
  "overall_score": 83.5,
  "logic_accuracy_score": 86.0,
  "argumentation_score": 80.0,
  "composure_score": 82.0,
  "clarity_score": 86.0,
  "strengths": [
    "Nắm chắc lý thuyết nền tảng...",
    "Phản xạ nhanh trước câu hỏi hóc búa..."
  ],
  "weaknesses": [
    "Có xu hướng giải thích vòng vo khi gặp edge-cases..."
  ],
  "fallacies_summary": [
    "Ngụy biện lảng tránh trọng tâm ở lượt 2..."
  ],
  "optimal_answers": [
    {
      "turn_number": 1,
      "question": "Câu hỏi của hội đồng...",
      "student_answer_summary": "Ý sinh viên đã nói...",
      "optimal_answer": "Câu trả lời chuẩn mực đề xuất...",
      "key_takeaway": "Bài học rút ra..."
    }
  ],
  "overall_verdict": "Sinh viên thể hiện tiềm năng nghiên cứu tốt..."
}
```

---

## 4. Giao thức WebSocket Thời gian thực (`/ws/debate/{session_id}`)

### Định dạng Tin nhắn Gửi lên (Client -> Server):
```json
{
  "action": "student_turn_submit",
  "response": "Nội dung câu trả lời",
  "mode": "voice",
  "duration": 35
}
```

### Định dạng Sự kiện Nhận về (Server -> Client):
- `council_status`: Báo hiệu Hội đồng đang đối chiếu Ground Truth và suy luận CoT.
- `turn_result`: Trả về kết quả đánh giá lượt và câu hỏi tiếp theo.
- `error`: Thông báo lỗi ngoại lệ.

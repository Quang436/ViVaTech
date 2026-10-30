# THIẾT KẾ PROMPT & KỸ THUẬT CHAIN-OF-THOUGHT (CoT)
## Hệ thống Phản biện AI Học thuật VivaArena (EDUTECH)

---

## 1. Bản chất Kỹ thuật Chain-of-Thought (CoT) 3 Bước Ngầm

Mô hình VivaArena không phản hồi trực tiếp như các chatbot thông thường (vốn dễ khen ngợi xã giao hoặc bỏ qua lỗi logic của người học). Để đóng vai một **Hội đồng Phản biện Học thuật thực thụ**, hệ thống bắt buộc mô hình ngôn ngữ lớn (LLM - Google Gemini 3.8 Flash) phải đi qua **3 bước suy luận ngầm (Internal Chain-of-Thought)** trước khi phát ngôn phản biện:

```
[Câu trả lời của Sinh viên] + [Tài liệu Ground Truth RAG]
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│ BƯỚC 1: KIỂM TRA TÍNH ĐÚNG ĐẮN (Fact Checking)         │
│ • Đối chiếu với văn bản tài liệu đã nạp (Ground Truth) │
│ • Chấm điểm độ chuẩn xác kiến thức (0 - 100%)          │
└────────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│ BƯỚC 2: RÀ SOÁT LỖ HỔNG LOGIC & NGỤY BIỆN              │
│ • Bắt bài các lỗi: Vòng vo, né tránh, nói nước đôi     │
│ • Kiểm tra mâu thuẫn với câu trả lời ở các lượt trước  │
│ • Phát hiện các ngụy biện (Strawman, Ad Hominem,...)   │
└────────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│ BƯỚC 3: XÂY DỰNG CHIẾN THUẬT PHẢN BÁC & CÂU HỎI MỚI    │
│ • Áp dụng phong cách và độ gắt của Hội đồng đã chọn    │
│ • Đẩy sinh viên vào tình huống kiểm chứng/ngoại lệ     │
└────────────────────────────────────────────────────────┘
                    │
                    ▼
[Phát ngôn Phản biện Đanh thép + "Bắt bài" của Hội đồng]
```

---

## 2. Đặc tả 3 Cấp độ Hội đồng Phản biện (Council Personas)

### Cấp độ 1: Phương pháp Feynman (Dễ)
- **Đối tượng phù hợp:** Sinh viên năm 1, 2 hoặc người mới bắt đầu tiếp cận đề tài.
- **Mục tiêu giáo dục:** Kiểm tra khả năng hiểu bản chất cốt lõi (Intuitive Understanding) và loại bỏ thói quen học vẹt, nói thuật ngữ rỗng.
- **Phong cách:** Một bạn học tò mò, ngây thơ nhưng hỏi rất trúng:
  - *"Tại sao lại cần làm cái này thay vì cách truyền thống?"*
  - *"Nếu giải thích cho một học sinh lớp 5 thì bạn sẽ ví von với cái gì ngoài đời?"*
  - *"Ứng dụng thực tế nhất mà người bình thường thấy được là gì?"*

### Cấp độ 2: Thầy Phản biện Học thuật (Vừa)
- **Đối tượng phù hợp:** Sinh viên bảo vệ đồ án môn học, khóa luận tốt nghiệp, nghiên cứu khoa học.
- **Mục tiêu giáo dục:** Đòi hỏi tính học thuật, độ chính xác của định nghĩa, công thức toán và phương pháp nghiên cứu.
- **Phong cách:** Một giáo sư phản biện nghiêm túc, sâu sát:
  - *"Cơ sở lý thuyết nào chứng minh giải pháp này vượt trội hơn các nghiên cứu State-of-the-Art?"*
  - *"Phương pháp đánh giá thực nghiệm của bạn có nguy cơ gặp sai số (bias) gì?"*
  - *"Đâu là các giả định tiên quyết (prerequisites) để thuật toán này hội tụ?"*

### Cấp độ 3: Hội đồng Bảo vệ Gắt gao - Stress-Test (Khó)
- **Đối tượng phù hợp:** Luyện tập trước buổi bảo vệ khóa luận xuất sắc hoặc gọi vốn khởi nghiệp (pitching).
- **Mục tiêu giáo dục:** Rèn luyện bản lĩnh tâm lý, khả năng xử lý áp lực, bảo vệ quan điểm trước chất vấn dồn dập.
- **Phong cách:** Chủ tịch hội đồng khó tính, sắc bén:
  - *"Bạn đang trả lời né tránh trọng tâm! Tôi hỏi về kịch bản sập nguồn 90% dữ liệu, bạn lại nói về giao diện đẹp?"*
  - *"Luận điểm vừa rồi mâu thuẫn hoàn toàn với câu bạn phát biểu ở lượt 1. Bạn giải thích thế nào?"*
  - *"Chi phí triển khai thực tế gấp 100 lần ngân sách dự kiến thì giải pháp này có còn giá trị không?"*

---

## 3. Khung Đánh giá Bảng điểm (Scorecard Rubrics)

Khi kết thúc phiên phản biện, Evaluator tính điểm dựa trên ma trận chuẩn:

| Tiêu chí | Trọng số | Chỉ số đo lường |
| :--- | :---: | :--- |
| **Logic & Accuracy** | 35% | Mức độ trùng khớp với Ground Truth tài liệu, không phát ngôn sai khoa học |
| **Argumentation Skills** | 30% | Cấu trúc luận điểm (PREP: Point - Reason - Example - Point), không ngụy biện |
| **Pressure Resilience** | 20% | Phản ứng trước câu hỏi bẫy/stress-test, không mất bình tĩnh hay nhượng bộ vô căn cứ |
| **Communication Clarity** | 15% | Súc tích, mạch lạc, phát âm/văn phong rõ ràng, không vòng vo |

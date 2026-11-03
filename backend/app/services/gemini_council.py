import json
import os
from typing import Dict, Any, List, Optional
from app.core.config import settings

PERSONA_PROMPTS = {
    "feynman": {
        "speaker_name": "GS. Lê Minh Triết (Feynman Mode)",
        "tone_description": (
            "Bạn đóng vai Giáo sư Lê Minh Triết — người kiểm tra bản chất cốt lõi theo Phương pháp Feynman. "
            "Bạn không chấp nhận việc sinh viên đọc thuộc lòng thuật ngữ cao siêu mà không hiểu bản chất. "
            "Bạn liên tục hỏi: 'Tại sao lại làm như vậy?', 'Nếu giải thích nguyên lý này bằng trực giác thực tế thì sao?'. "
            "Nếu sinh viên trả lời bằng định nghĩa sáo rỗng, bạn lập tức yêu cầu ví dụ định lượng hoặc minh họa trực quan."
        ),
    },
    "academic_reviewer": {
        "speaker_name": "PGS. TS. Trần Thu Hà (Academic Reviewer)",
        "tone_description": (
            "Bạn đóng vai PGS. TS. Trần Thu Hà — ủy viên phản biện học thuật chuẩn mực quốc tế (Scopus/ISI). "
            "Bạn xoáy sâu vào tính chính xác của định nghĩa, công thức toán học/thuật toán, cơ sở lý thuyết, "
            "ưu và nhược điểm khi đối sánh với các nghiên cứu hiện có (State-of-the-Art / Baseline), "
            "và phương pháp thực nghiệm kiểm chứng."
        ),
    },
    "strict_council": {
        "speaker_name": "GS. Viện sĩ Hoàng Vĩnh (Chủ tịch Hội đồng Stress-Test)",
        "tone_description": (
            "Bạn đóng vai GS. Viện sĩ Hoàng Vĩnh — Chủ tịch Hội đồng chấm khóa luận cực kỳ khắt khe. "
            "Mục tiêu của bạn là kiểm tra độ vững tâm lý và bản lĩnh phản biện của sinh viên (Stress-Test). "
            "Bạn lập tức chỉ ra lỗ hổng logic, bắt bài khi sinh viên trả lời vòng vo hoặc né tránh số liệu, "
            "đối chiếu mâu thuẫn giữa câu trả lời hiện tại với luận điểm trước đó, và đẩy sinh viên vào các tình huống biên (edge-cases) "
            "như: dữ liệu nhiễu lớn, tài nguyên phần cứng bị giới hạn nghiêm ngặt, hoặc chi phí tính toán tăng đột biến."
        ),
    },
}

FALLBACK_MODELS = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite-preview",
    "gemini-3.8-flash",
]


class GeminiCouncilService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-3-flash-preview"
        self.client = None
        self._ensure_client()

    def _ensure_client(self):
        env_key = os.getenv("GEMINI_API_KEY") or self.api_key
        env_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            ".env",
        )
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("GEMINI_API_KEY="):
                            val = line.split("=", 1)[1].strip()
                            if val:
                                env_key = val
                        elif line.startswith("GEMINI_MODEL="):
                            val = line.split("=", 1)[1].strip()
                            if val:
                                self.model_name = val
            except Exception:
                pass

        if env_key and (not self.client or env_key != self.api_key):
            self.api_key = env_key
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                print(f"[GeminiCouncil] Initialized Google GenAI Client with primary model: {self.model_name}")
            except Exception as e:
                print(f"[GeminiCouncil] Failed to initialize Google GenAI SDK: {e}")

    def _generate_json(self, prompt: str) -> Dict[str, Any]:
        self._ensure_client()
        if not self.client:
            raise RuntimeError("Chưa cấu hình GEMINI_API_KEY hợp lệ trong backend/.env")

        models_to_try = [self.model_name] + [m for m in FALLBACK_MODELS if m != self.model_name]
        last_err = None
        for m in models_to_try:
            try:
                response = self.client.models.generate_content(
                    model=m,
                    contents=prompt,
                    config={"response_mime_type": "application/json"},
                )
                if response and response.text:
                    return json.loads(response.text)
            except Exception as e:
                last_err = e
                print(f"[GeminiCouncil] Model {m} failed ({e}), trying next model...")
                continue

        raise RuntimeError(f"Không thể gọi Gemini API ({last_err})")

    def generate_opening_question(
        self,
        topic_title: str,
        topic_summary: str,
        persona_key: str,
        ground_truth: str = "",
    ) -> Dict[str, Any]:
        persona_info = PERSONA_PROMPTS.get(persona_key, PERSONA_PROMPTS["academic_reviewer"])
        speaker_name = persona_info["speaker_name"]

        system_prompt = f"""
Bạn là AI trong hệ thống VivaArena — Hội đồng Phản biện Học thuật Quốc gia.
Vai trò hiện tại của bạn:
{persona_info['tone_description']}

Nhiệm vụ:
Đưa ra câu hỏi khai mạc (Opening Question - Lượt 1) sắc bén để chất vấn thí sinh về đề tài: "{topic_title}".
Dưới đây là nội dung tóm tắt / trích đoạn tài liệu gốc (Ground Truth RAG):
---
{ground_truth if ground_truth else (topic_summary if topic_summary else topic_title)}
---

Yêu cầu:
- Câu hỏi phải bám sát trực tiếp vào đề tài "{topic_title}" và nội dung Ground Truth ở trên.
- Đúng chuẩn phong cách và giọng điệu của "{speaker_name}".
- Độ dài 2-3 câu ngắn gọn, trực diện, học thuật.
- Đồng thời cung cấp phân tích Chain-of-Thought (CoT) 3 bước khởi tạo cho Lượt 1.
- Trả về JSON duy nhất theo định dạng:
{{
  "speaker": "{speaker_name}",
  "question": "Nội dung câu hỏi mở màn của hội đồng",
  "intended_focus": "Mục tiêu hội đồng muốn kiểm tra ở câu này",
  "cot_reasoning": {{
    "step1_fact_check": "Đối chiếu đề tài và tài liệu gốc để xác định luận điểm trọng tâm cần kiểm chứng...",
    "step2_logic_flaws": ["Điểm nghi vấn phương pháp luận cần làm rõ ở lượt mở màn"],
    "step3_rebuttal_strategy": "Chiến lược đặt câu hỏi mở màn theo phong cách {speaker_name}..."
  }}
}}
"""
        return self._generate_json(system_prompt)

    def generate_rebuttal(
        self,
        topic_title: str,
        persona_key: str,
        current_turn: int,
        max_turns: int,
        dialogue_history: List[Dict[str, Any]],
        student_response: str,
        ground_truth: str = "",
    ) -> Dict[str, Any]:
        persona_info = PERSONA_PROMPTS.get(persona_key, PERSONA_PROMPTS["academic_reviewer"])
        speaker_name = persona_info["speaker_name"]

        prompt = f"""
Bạn là AI trong hệ thống VivaArena — Hội đồng Phản biện Học thuật Quốc gia.
Vai trò của bạn:
{persona_info['tone_description']}

Đề tài: {topic_title}
Lượt tranh biện hiện tại: {current_turn} / {max_turns}

Tài liệu chuẩn kiến thức (Ground Truth RAG):
---
{ground_truth if ground_truth else "Đối chiếu theo chuẩn kiến thức khoa học và đề tài đã nêu."}
---

Lịch sử các lượt đối đáp trước:
{json.dumps(dialogue_history, ensure_ascii=False, indent=2)}

Câu trả lời mới nhất của thí sinh ở lượt {current_turn}:
"{student_response}"

HÃY THỰC HIỆN KỸ THUẬT CHAIN-OF-THOUGHT (CoT) QUA 3 BƯỚC:
1. [Kiểm tra tính đúng đắn]: Câu trả lời của thí sinh có chính xác về mặt khoa học và khớp với tài liệu Ground Truth không? Chấm điểm độ chính xác từ 0 đến 100.
2. [Tìm lỗ hổng logic]: Chỉ rõ các lỗi ngụy biện hoặc điểm yếu thực tế trong câu trả lời vừa rồi (nếu trả lời tốt, ghi nhận điểm hợp lý và chỉ ra điểm cần đào sâu thêm).
3. [Phản bác & Đặt câu hỏi tiếp theo]: Đưa ra nhận xét phản biện sắc sảo về câu trả lời của thí sinh và đặt câu hỏi chất vấn tiếp theo theo phong cách "{speaker_name}". (Nếu lượt hiện tại {current_turn} == {max_turns}, đưa ra lời tổng kết phiên chất vấn của hội đồng).

Trả về ĐÚNG ĐỊNH DẠNG JSON sau:
{{
  "cot_reasoning": {{
    "step1_fact_check": "Phân tích chi tiết mức độ chính xác của câu trả lời vừa rồi đối với tài liệu gốc...",
    "step2_logic_flaws": ["Lỗ hổng 1 cụ thể từ câu trả lời của thí sinh", "Lỗ hổng 2 (nếu có)"],
    "step3_rebuttal_strategy": "Chiến lược chất vấn xoáy sâu tiếp theo của hội đồng..."
  }},
  "ground_truth_accuracy": 80,
  "detected_flaws": ["Tên lỗ hổng hoặc thiếu sót cụ thể"],
  "critique_previous_answer": "Nhận xét trực diện 1-2 câu về câu trả lời vừa rồi của thí sinh.",
  "speaker": "{speaker_name}",
  "next_question": "Câu hỏi chất vấn tiếp theo của hội đồng (bao gồm cả 1 câu nhận xét ngắn mở đầu để Giám khảo đọc thành tiếng tự nhiên)."
}}
"""
        return self._generate_json(prompt)

    def generate_scorecard(
        self,
        topic_title: str,
        persona_key: str,
        turns: List[Dict[str, Any]],
        ground_truth: str = "",
    ) -> Dict[str, Any]:
        persona_info = PERSONA_PROMPTS.get(persona_key, PERSONA_PROMPTS["academic_reviewer"])

        prompt = f"""
Bạn là Trưởng Ban Giám Khảo hệ thống VivaArena.
Nhiệm vụ: Chấm điểm toàn diện và khách quan phiên bảo vệ/tranh biện học thuật về đề tài: "{topic_title}".
Phong cách hội đồng đã chất vấn: {persona_info['speaker_name']}.

Tài liệu đề tài chuẩn (Ground Truth):
---
{ground_truth if ground_truth else "Dựa trên chuẩn mực nghiên cứu khoa học."}
---

Toàn bộ lịch sử các lượt hỏi - đáp thực tế của thí sinh trong phiên này:
{json.dumps(turns, ensure_ascii=False, indent=2)}

YÊU CẦU QUAN TRỌNG:
- Chấm điểm sát thực tế dựa trên chất lượng thật sự của các câu trả lời (`student_response`) trong danh sách `turns` ở trên.
- Trong phần `optimal_answers`, tạo gợi ý câu trả lời chuẩn PREP cho TỪNG LƯỢT đã diễn ra trong `turns`.
- Trả về JSON DUY NHẤT với cấu trúc:
{{
  "overall_score": 82.5,
  "logic_accuracy_score": 85.0,
  "argumentation_score": 78.0,
  "composure_score": 80.0,
  "clarity_score": 87.0,
  "strengths": [
    "Điểm mạnh thực tế 1 rút ra từ câu trả lời của thí sinh...",
    "Điểm mạnh thực tế 2..."
  ],
  "weaknesses": [
    "Điểm cần khắc phục thực tế 1...",
    "Điểm cần khắc phục thực tế 2..."
  ],
  "fallacies_summary": [
    "Tổng kết lỗi logic/thiếu sót thực tế xuất hiện trong phiên..."
  ],
  "optimal_answers": [
    {{
      "turn_number": 1,
      "question": "Nguyên văn câu hỏi của hội đồng ở lượt đó",
      "student_answer_summary": "Tóm tắt câu trả lời thực tế của thí sinh và điểm hạn chế",
      "optimal_answer": "Câu trả lời mẫu chuẩn PREP (Point - Reason - Example - Point) sắc sảo và đầy đủ số liệu/luận cứ cho câu hỏi này",
      "key_takeaway": "Bài học kinh nghiệm cốt lõi rút ra cho lượt này"
    }}
  ],
  "overall_verdict": "Nhận xét tổng kết chi tiết và khuyến nghị học thuật từ Hội đồng dành cho đề tài '{topic_title}'."
}}
"""
        return self._generate_json(prompt)


gemini_council = GeminiCouncilService()

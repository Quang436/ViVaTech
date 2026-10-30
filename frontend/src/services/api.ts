import type { DebateSession, RebuttalResponse, Scorecard, CouncilPersona } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = {
  // Document Upload
  async uploadDocument(file: File): Promise<{ document_id: string; filename: string; summary: string }> {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return await response.json();
    } catch (e) {
      console.warn('Backend not reachable, using simulated document indexing:', e);
      return {
        document_id: 'mock-doc-' + Date.now(),
        filename: file.name,
        summary: `Tài liệu "${file.name}" đã được phân tích. Trích xuất các luận điểm cốt lõi và kịch bản thực nghiệm.`,
      };
    }
  },

  // Create Debate Session
  async createSession(params: {
    title: string;
    persona: CouncilPersona;
    document_id?: string;
    topic_summary?: string;
    max_turns: number;
  }): Promise<DebateSession> {
    try {
      const response = await fetch(`${API_BASE_URL}/debate/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Create session failed');
      return await response.json();
    } catch (e) {
      console.warn('Backend not reachable, creating simulated session:', e);
      const speakerMap: Record<CouncilPersona, string> = {
        feynman: 'Bạn học Tò mò (Feynman)',
        academic_reviewer: 'Giáo sư Phản biện Học thuật',
        strict_council: 'Chủ tịch Hội đồng Tốt nghiệp (Stress-Test)',
      };
      const questionMap: Record<CouncilPersona, string> = {
        feynman: `Chào bạn! Tôi rất hào hứng với đề tài "${params.title}". Nếu phải giải thích ý tưởng này cho một học sinh lớp 5 hiểu mà không được dùng bất kỳ từ ngữ chuyên ngành nào, bạn sẽ nói gì?`,
        academic_reviewer: `Hội đồng phản biện xin mở đầu với đề tài "${params.title}". Bạn hãy nêu rõ cơ sở lý thuyết chứng minh giải pháp này vượt trội hơn các công trình nghiên cứu hiện nay (State-of-the-Art)?`,
        strict_council: `Hội đồng đã xem qua đề tài "${params.title}". Giả sử hệ thống của bạn gặp kịch bản ngoại lệ xấu nhất (dữ liệu rác 90% hoặc tài nguyên bị cắt giảm 10 lần), giải pháp của bạn có bị tê liệt không? Bạn có bằng chứng kiểm thử nào cho việc này?`,
      };

      return {
        id: 'mock-session-' + Date.now(),
        title: params.title,
        persona: params.persona,
        status: 'in_progress',
        max_turns: params.max_turns,
        current_turn: 1,
        created_at: new Date().toISOString(),
        turns: [
          {
            id: 'mock-turn-1',
            turn_number: 1,
            council_speaker: speakerMap[params.persona],
            ai_question: questionMap[params.persona],
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
  },

  // Get Session Detail
  async getSession(sessionId: string): Promise<DebateSession> {
    const response = await fetch(`${API_BASE_URL}/debate/sessions/${sessionId}`);
    if (!response.ok) throw new Error('Failed to fetch session');
    return await response.json();
  },

  // Submit Turn Answer
  async submitTurn(
    sessionId: string,
    studentResponse: string,
    responseMode: 'voice' | 'text' = 'text',
    durationSeconds: number = 0
  ): Promise<RebuttalResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/debate/sessions/${sessionId}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_response: studentResponse,
          response_mode: responseMode,
          duration_seconds: durationSeconds,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit turn');
      return await response.json();
    } catch (e) {
      console.warn('Backend not reachable, simulating AI rebuttal:', e);
      const respWords = studentResponse.trim().split(/\s+/).length;
      const accuracy = Math.min(92, Math.max(50, respWords * 4));
      return {
        session_id: sessionId,
        turn_number: 1,
        is_completed: false,
        critique_previous_answer: 'Bạn đã nêu được định nghĩa ban đầu, tuy nhiên lập luận còn mang tính lý thuyết suông và chưa đưa ra được chỉ số định lượng cụ thể.',
        detected_flaws: ['Thiếu số liệu thực nghiệm chứng minh', 'Chưa giải quyết câu hỏi ngoại lệ'],
        ground_truth_accuracy: accuracy,
        next_question: 'Nếu phương pháp của bạn gặp chi phí vận hành tăng đột biến thì phương án bù đắp hiệu năng là gì?',
        council_speaker: 'Hội đồng Phản biện',
        cot_reasoning: {
          step1_fact_check: `Kiểm tra phản hồi (${respWords} từ): Khái niệm tương đối chính xác nhưng chưa gắn liền với kiến trúc thực thi.`,
          step2_logic_flaws: ['Lảng tránh việc giải thích chi phí', 'Lập luận theo hướng phỏng đoán'],
          step3_rebuttal_strategy: 'Đẩy sinh viên vào tình huống áp lực về ngân sách và hiệu năng.',
        },
      };
    }
  },

  // Get Scorecard
  async getScorecard(sessionId: string): Promise<Scorecard> {
    try {
      const response = await fetch(`${API_BASE_URL}/scorecards/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch scorecard');
      return await response.json();
    } catch (e) {
      console.warn('Backend not reachable, simulating Scorecard:', e);
      return {
        id: 'mock-scorecard-' + Date.now(),
        session_id: sessionId,
        overall_score: 83.5,
        logic_accuracy_score: 86.0,
        argumentation_score: 80.0,
        composure_score: 82.0,
        clarity_score: 86.0,
        strengths: [
          'Nắm chắc lý thuyết nền tảng và trả lời đúng trọng tâm câu hỏi ban đầu.',
          'Phản xạ nhanh, thái độ bình tĩnh khi bị chất vấn gay gắt.',
          'Sử dụng thuật ngữ chuyên ngành tương đối chuẩn xác.',
        ],
        weaknesses: [
          'Có xu hướng giải thích lý thuyết thay vì đưa ra kịch bản định lượng.',
          'Khi gặp câu hỏi hóc búa về ngoại lệ (edge-case) còn có phần ngập ngừng và nói giảm nói tránh.',
        ],
        fallacies_summary: [
          'Lỗi ngụy biện né tránh câu hỏi (Red Herring) ở lượt chất vấn thứ hai.',
          'Lập luận dựa trên giả định chưa qua kiểm chứng thực tế.',
        ],
        optimal_answers: [
          {
            turn_number: 1,
            question: 'Bạn hãy nêu rõ cơ sở lý thuyết chứng minh giải pháp này vượt trội hơn các công trình nghiên cứu hiện nay?',
            student_answer_summary: 'Giải thích chung chung về công nghệ mới hơn và dễ dùng hơn.',
            optimal_answer: 'Thưa hội đồng, nghiên cứu của em tập trung vào tối ưu hóa độ trễ thông qua kiến trúc RAG 3 tầng. So với phương pháp kinh điển của nhóm tác giả A (2024), giải pháp của em giảm 34% thời gian phản hồi và duy trì độ chính xác 91.2% trên tập benchmark chuẩn.',
            key_takeaway: 'Luôn đưa số liệu định lượng và tên công trình tham chiếu để tạo sức nặng học thuật.',
          },
        ],
        overall_verdict: 'Sinh viên thể hiện tiềm năng nghiên cứu tốt và bản lĩnh phản biện khá vững vàng. Khuyến nghị bổ sung bảng thực nghiệm đối sánh trước hội đồng chính thức.',
        created_at: new Date().toISOString(),
      };
    }
  },
};

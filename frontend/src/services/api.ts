import type {
  DebateSession,
  RebuttalResponse,
  Scorecard,
  CouncilPersona,
  UploadedDocument,
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const DID_AGENT_BASE_URL = 'http://localhost:8000/api/did-agent';

export const api = {
  // ==========================================
  // Documents & RAG Knowledge Base (Real Data)
  // ==========================================
  async listDocuments(): Promise<UploadedDocument[]> {
    const response = await fetch(`${API_BASE_URL}/documents`);
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Không thể tải danh sách tài liệu (${response.status}): ${err}`);
    }
    return await response.json();
  },

  async uploadDocument(file: File): Promise<UploadedDocument> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Tải tài liệu thất bại (${response.status}): ${err}`);
    }
    return await response.json();
  },

  async deleteDocument(docId: string): Promise<{ status: string; document_id: string }> {
    const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Xóa tài liệu thất bại (${response.status}): ${err}`);
    }
    return await response.json();
  },

  // ==========================================
  // Debate Sessions & Turns (Real Data)
  // ==========================================
  async listSessions(): Promise<DebateSession[]> {
    const response = await fetch(`${API_BASE_URL}/debate/sessions`);
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Không thể tải danh sách phiên (${response.status}): ${err}`);
    }
    return await response.json();
  },

  async createSession(params: {
    title: string;
    persona: CouncilPersona;
    document_id?: string;
    document_name?: string;
    topic_summary?: string;
    max_turns: number;
  }): Promise<DebateSession> {
    const response = await fetch(`${API_BASE_URL}/debate/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Khởi tạo phiên thất bại (${response.status}): ${err}`);
    }
    return await response.json();
  },

  async getSession(sessionId: string): Promise<DebateSession> {
    const response = await fetch(`${API_BASE_URL}/debate/sessions/${sessionId}`);
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Không tìm thấy phiên (${response.status}): ${err}`);
    }
    return await response.json();
  },

  async deleteSession(sessionId: string): Promise<{ status: string; session_id: string }> {
    const response = await fetch(`${API_BASE_URL}/debate/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Xóa phiên thất bại (${response.status}): ${err}`);
    }
    return await response.json();
  },

  async submitTurn(
    sessionId: string,
    studentResponse: string,
    responseMode: 'voice' | 'text' = 'text',
    durationSeconds: number = 0
  ): Promise<RebuttalResponse> {
    const response = await fetch(`${API_BASE_URL}/debate/sessions/${sessionId}/turns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_response: studentResponse,
        response_mode: responseMode,
        duration_seconds: durationSeconds,
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gửi phản hồi thất bại (${response.status}): ${err}`);
    }
    return await response.json();
  },

  // ==========================================
  // Scorecards & Analytics (Real Data)
  // ==========================================
  async listScorecards(): Promise<Scorecard[]> {
    const response = await fetch(`${API_BASE_URL}/scorecards`);
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Không thể tải danh sách bảng điểm (${response.status}): ${err}`);
    }
    return await response.json();
  },

  async getScorecard(sessionId: string): Promise<Scorecard> {
    const response = await fetch(`${API_BASE_URL}/scorecards/${sessionId}`);
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Không thể lấy bảng điểm (${response.status}): ${err}`);
    }
    return await response.json();
  },

  // ==========================================
  // TTS Streaming Audio URL
  // ==========================================
  getTtsAudioUrl(text: string, voice?: string, lang?: string): string {
    const params = new URLSearchParams({
      text,
      ...(voice ? { voice } : {}),
      ...(lang ? { lang } : {}),
    });
    return `${API_BASE_URL}/debate/tts?${params.toString()}`;
  },

  // ==========================================
  // Interactive WebRTC Streaming Digital Human
  // ==========================================
  async getAvatarStatus(): Promise<{
    active_provider: string;
    has_heygen: boolean;
    has_did: boolean;
    default_avatar_id: string;
    default_voice_id: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/avatar/status`);
    if (!res.ok) throw new Error('Không thể kiểm tra trạng thái Avatar');
    return await res.json();
  },

  async createAvatarSession(params?: {
    provider?: string;
    avatar_name?: string;
    voice_id?: string;
    quality?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/avatar/session/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {}),
    });
    return await res.json();
  },

  async startAvatarStream(params: {
    provider?: string;
    session_id: string;
    sdp_answer: any;
    token?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/avatar/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  },

  async sendAvatarIce(params: {
    provider?: string;
    session_id: string;
    candidate: any;
    token?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/avatar/session/ice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  },

  async avatarSpeak(params: {
    provider?: string;
    session_id: string;
    text: string;
    token?: string;
    voice_id?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/avatar/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  },

  async stopAvatarSession(params: {
    provider?: string;
    session_id: string;
    token?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/avatar/session/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  },

  // ==========================================
  // D-ID Agents Real-Time WebRTC API (/api/did-agent)
  // ==========================================
  async startDidAgentChat(params?: {
    agent_id?: string;
    presenter_id?: string;
    source_url?: string;
    voice_id?: string;
  }): Promise<{
    agent_id?: string | null;
    chat_id?: string | null;
    stream_id: string;
    session_id: string;
    sdp: RTCSessionDescriptionInit;
    offer: RTCSessionDescriptionInit;
    ice_servers: RTCIceServer[];
    mode?: string;
    idle_video_url?: string | null;
    source_url?: string | null;
  }> {
    const res = await fetch(`${DID_AGENT_BASE_URL}/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {}),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`D-ID /chat/start failed (${res.status}): ${errText}`);
    }
    return await res.json();
  },

  async submitDidAgentSdp(params: {
    stream_id: string;
    session_id: string;
    sdp: RTCSessionDescriptionInit;
    agent_id?: string | null;
  }): Promise<any> {
    const res = await fetch(`${DID_AGENT_BASE_URL}/chat/sdp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`D-ID /chat/sdp failed (${res.status}): ${errText}`);
    }
    return await res.json();
  },

  async submitDidAgentIce(params: {
    stream_id: string;
    session_id: string;
    candidate: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
    agent_id?: string | null;
  }): Promise<any> {
    const res = await fetch(`${DID_AGENT_BASE_URL}/chat/ice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  },

  async speakDidAgent(params: {
    stream_id: string;
    session_id: string;
    text: string;
    agent_id?: string | null;
    chat_id?: string | null;
    voice_id?: string;
  }): Promise<any> {
    const res = await fetch(`${DID_AGENT_BASE_URL}/chat/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`D-ID /chat/speak failed (${res.status}): ${errText}`);
    }
    return await res.json();
  },

  async stopDidAgentStream(params: {
    stream_id: string;
    session_id?: string | null;
    agent_id?: string | null;
  }): Promise<any> {
    const res = await fetch(`${DID_AGENT_BASE_URL}/chat/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  },
};

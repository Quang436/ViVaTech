import type {
  AcademicRoleKey,
  AuthResponse,
  AuthUser,
  CouncilPersona,
  DebateSession,
  PlatformStats,
  RebuttalResponse,
  Scorecard,
  UploadedDocument,
} from '../types';

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_ORIGIN}/api/v1`;
const DID_AGENT_BASE_URL = `${API_ORIGIN}/api/did-agent`;
const ACCESS_TOKEN_KEY = 'viva_arena_access_token';

type UnauthorizedCallback = () => void;
let unauthorizedHandler: UnauthorizedCallback | null = null;

function extractErrorMessage(rawText: string, status: number): string {
  try {
    const parsed = JSON.parse(rawText) as { detail?: unknown; message?: unknown };
    if (typeof parsed.detail === 'string' && parsed.detail.trim()) {
      return parsed.detail;
    }
    if (Array.isArray(parsed.detail) && parsed.detail.length > 0) {
      const first = parsed.detail[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
    if (typeof parsed.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // Plain text fallback below
  }
  return rawText.trim() || `Yêu cầu thất bại (${status})`;
}

export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string, rememberMe: boolean): void {
    try {
      if (rememberMe) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      } else {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    } catch {
      // ignore storage quota errors
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};

async function apiFetch(
  url: string,
  options: RequestInit = {},
  { requireAuth = true }: { requireAuth?: boolean } = {}
): Promise<Response> {
  const headers = new Headers(options.headers || {});
  const token = tokenStorage.get();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else if (requireAuth) {
    if (unauthorizedHandler) unauthorizedHandler();
    throw new Error('Phiên đăng nhập chưa tồn tại. Vui lòng đăng nhập.');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && requireAuth) {
    tokenStorage.clear();
    if (unauthorizedHandler) unauthorizedHandler();
  }

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(extractErrorMessage(raw, response.status));
  }

  return response;
}

export const api = {
  setUnauthorizedHandler(cb: UnauthorizedCallback | null) {
    unauthorizedHandler = cb;
  },

  getToken(): string | null {
    return tokenStorage.get();
  },

  clearToken(): void {
    tokenStorage.clear();
  },

  // ==========================================
  // Real Authentication & User Profile
  // ==========================================
  async register(params: {
    full_name: string;
    email: string;
    password: string;
    role: AcademicRoleKey;
    remember_me: boolean;
  }): Promise<AuthResponse> {
    const response = await apiFetch(
      `${API_BASE_URL}/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      },
      { requireAuth: false }
    );
    const data = (await response.json()) as AuthResponse;
    tokenStorage.set(data.access_token, params.remember_me);
    return data;
  },

  async login(params: {
    email: string;
    password: string;
    remember_me: boolean;
  }): Promise<AuthResponse> {
    const response = await apiFetch(
      `${API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      },
      { requireAuth: false }
    );
    const data = (await response.json()) as AuthResponse;
    tokenStorage.set(data.access_token, params.remember_me);
    return data;
  },

  async getMe(): Promise<AuthUser> {
    const response = await apiFetch(`${API_BASE_URL}/auth/me`, { method: 'GET' });
    return await response.json();
  },

  async logout(): Promise<void> {
    try {
      if (tokenStorage.get()) {
        await apiFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' }, { requireAuth: false });
      }
    } finally {
      tokenStorage.clear();
    }
  },

  // ==========================================
  // Public Real System Stats
  // ==========================================
  async getPlatformStats(): Promise<PlatformStats> {
    const response = await apiFetch(`${API_BASE_URL}/stats`, { method: 'GET' }, { requireAuth: false });
    return await response.json();
  },

  // ==========================================
  // Documents & RAG Knowledge Base (Real Data)
  // ==========================================
  async listDocuments(): Promise<UploadedDocument[]> {
    const response = await apiFetch(`${API_BASE_URL}/documents`);
    return await response.json();
  },

  async getDocumentDetail(docId: string): Promise<UploadedDocument> {
    const response = await apiFetch(`${API_BASE_URL}/documents/${docId}`);
    return await response.json();
  },

  async uploadDocument(file: File): Promise<UploadedDocument> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiFetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  },

  async deleteDocument(docId: string): Promise<{ status: string; document_id: string }> {
    const response = await apiFetch(`${API_BASE_URL}/documents/${docId}`, {
      method: 'DELETE',
    });
    return await response.json();
  },

  // ==========================================
  // Debate Sessions & Turns (Real Data)
  // ==========================================
  async listSessions(): Promise<DebateSession[]> {
    const response = await apiFetch(`${API_BASE_URL}/debate/sessions`);
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
    const response = await apiFetch(`${API_BASE_URL}/debate/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await response.json();
  },

  async getSession(sessionId: string): Promise<DebateSession> {
    const response = await apiFetch(`${API_BASE_URL}/debate/sessions/${sessionId}`);
    return await response.json();
  },

  async deleteSession(sessionId: string): Promise<{ status: string; session_id: string }> {
    const response = await apiFetch(`${API_BASE_URL}/debate/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    return await response.json();
  },

  async submitTurn(
    sessionId: string,
    studentResponse: string,
    responseMode: 'voice' | 'text' = 'text',
    durationSeconds: number = 0
  ): Promise<RebuttalResponse> {
    const response = await apiFetch(`${API_BASE_URL}/debate/sessions/${sessionId}/turns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_response: studentResponse,
        response_mode: responseMode,
        duration_seconds: durationSeconds,
      }),
    });
    return await response.json();
  },

  // ==========================================
  // Scorecards & Analytics (Real Data)
  // ==========================================
  async listScorecards(): Promise<Scorecard[]> {
    const response = await apiFetch(`${API_BASE_URL}/scorecards`);
    return await response.json();
  },

  async getScorecard(sessionId: string): Promise<Scorecard> {
    const response = await apiFetch(`${API_BASE_URL}/scorecards/${sessionId}`);
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
    const res = await apiFetch(`${API_BASE_URL}/avatar/status`, {}, { requireAuth: false });
    return await res.json();
  },

  async createAvatarSession(params?: {
    provider?: string;
    avatar_name?: string;
    voice_id?: string;
    quality?: string;
  }): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/avatar/session/new`, {
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
    const res = await apiFetch(`${API_BASE_URL}/avatar/session/start`, {
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
    const res = await apiFetch(`${API_BASE_URL}/avatar/session/ice`, {
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
    const res = await apiFetch(`${API_BASE_URL}/avatar/speak`, {
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
    const res = await apiFetch(`${API_BASE_URL}/avatar/session/stop`, {
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
    const res = await apiFetch(`${DID_AGENT_BASE_URL}/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {}),
    });
    return await res.json();
  },

  async submitDidAgentSdp(params: {
    stream_id: string;
    session_id: string;
    sdp: RTCSessionDescriptionInit;
    agent_id?: string | null;
  }): Promise<any> {
    const res = await apiFetch(`${DID_AGENT_BASE_URL}/chat/sdp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
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
    const res = await apiFetch(`${DID_AGENT_BASE_URL}/chat/ice`, {
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
    const res = await apiFetch(`${DID_AGENT_BASE_URL}/chat/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  },

  async stopDidAgentStream(params: {
    stream_id: string;
    session_id?: string | null;
    agent_id?: string | null;
  }): Promise<any> {
    const res = await apiFetch(`${DID_AGENT_BASE_URL}/chat/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  },
};

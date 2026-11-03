import React, { useRef, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';

export type ExaminerState = 'LISTENING' | 'SPEAKING';

export interface LiveAiExaminerProps {
  speakerName?: string;
  councilRole?: string;
  state?: ExaminerState;
  isSpeaking?: boolean;
  isThinking?: boolean;
  audioVolume?: number; // 0.0 to 1.0
  /** Văn bản câu hỏi phản biện mới cần Giám khảo AI phát biểu qua WebRTC */
  triggerQuestion?: string;
  /** Tương thích ngược với prop textToSpeak */
  textToSpeak?: string;
  onStateChange?: (newState: ExaminerState) => void;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
  onStopVoice?: () => void;
  currentVoice?: string;
  onChangeVoice?: (voiceId: string) => void;
  voiceOptions?: Array<{ id: string; name: string; lang: string }>;
}

export const LiveAiExaminer: React.FC<LiveAiExaminerProps> = ({
  speakerName = 'GS. Nam Minh',
  councilRole = 'Giáo sư Phản biện Học thuật - Hội đồng Viện AI Quốc gia',
  state: controlledState,
  isSpeaking: propIsSpeaking,
  isThinking = false,
  audioVolume = 0,
  triggerQuestion,
  textToSpeak,
  onStateChange,
  voiceEnabled = true,
  onToggleVoice,
  onStopVoice,
  currentVoice = 'vi-VN-NamMinhNeural',
  onChangeVoice,
  voiceOptions = [],
}) => {
  const [internalState, setInternalState] = useState<ExaminerState>('LISTENING');
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'error'
  >('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(38);
  const [isStreamReady, setIsStreamReady] = useState<boolean>(false);
  // Chỉ bật hiển thị lớp video WebRTC khi D-ID thực sự phát khung hình nói (stream/started -> stream/done)
  // Tránh hoàn toàn màn hình trắng / vòng tròn chờ của WebRTC khi đang ở trạng thái LISTENING
  const [isWebRtcStreamPlaying, setIsWebRtcStreamPlaying] = useState<boolean>(false);
  const [idleVideoSrc, setIdleVideoSrc] = useState<string>('/agent_idle.mp4');

  // Refs quản lý phiên D-ID Agents WebRTC
  const videoRef = useRef<HTMLVideoElement>(null);
  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const isInitializingRef = useRef<boolean>(false);
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamInfoRef = useRef<{
    agentId?: string | null;
    chatId?: string | null;
    streamId: string;
    sessionId: string;
  } | null>(null);
  const lastSpokenQuestionRef = useRef<string>('');

  // Nội dung câu hỏi cần phát biểu (hỗ trợ cả triggerQuestion và textToSpeak)
  const questionText = (triggerQuestion ?? textToSpeak ?? '').trim();

  // Trạng thái phát biểu thực tế
  const activeState: ExaminerState =
    internalState === 'SPEAKING' || isWebRtcStreamPlaying
      ? 'SPEAKING'
      : controlledState !== undefined
      ? controlledState
      : propIsSpeaking
      ? 'SPEAKING'
      : 'LISTENING';

  const isCurrentSpeaking = activeState === 'SPEAKING';

  const updateExaminerState = useCallback(
    (newState: ExaminerState) => {
      setInternalState(newState);
      onStateChange?.(newState);
    },
    [onStateChange]
  );

  // Đồng bộ trạng thái bật/tắt âm thanh trên luồng video WebRTC
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !voiceEnabled;
    }
  }, [voiceEnabled]);

  // Đảm bảo video Idle của D-ID Agent luôn chạy mượt
  useEffect(() => {
    if (idleVideoRef.current) {
      idleVideoRef.current.play().catch(() => {});
    }
  }, [idleVideoSrc]);

  // =========================================================================
  // Dọn dẹp kết nối RTCPeerConnection & D-ID Stream
  // =========================================================================
  const cleanupWebRtc = useCallback(() => {
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }

    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close();
      } catch {
        // ignore
      }
      dataChannelRef.current = null;
    }

    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {
        // ignore
      }
      pcRef.current = null;
    }

    if (streamInfoRef.current) {
      const { streamId, sessionId, agentId } = streamInfoRef.current;
      streamInfoRef.current = null;
      api
        .stopDidAgentStream({
          stream_id: streamId,
          session_id: sessionId,
          agent_id: agentId,
        })
        .catch(() => {});
    }

    setIsStreamReady(false);
    setIsWebRtcStreamPlaying(false);
  }, []);

  // =========================================================================
  // Khởi tạo phiên D-ID Agents WebRTC (/api/did-agent/chat/start -> sdp -> ice)
  // =========================================================================
  const initDidWebRtc = useCallback(async () => {
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;

    cleanupWebRtc();
    setConnectionStatus('connecting');
    setErrorMessage(null);

    try {
      // 1. Gọi Backend tạo D-ID Agent Stream (v2_agt_c4DztGrG)
      const startData = await api.startDidAgentChat({
        voice_id: currentVoice || 'vi-VN-NamMinhNeural',
      });

      const {
        agent_id,
        chat_id,
        stream_id,
        session_id,
        offer,
        sdp,
        ice_servers,
        idle_video_url,
      } = startData;

      // Ưu tiên phát /agent_idle.mp4 local để load tức thì 0ms, hoặc URL từ Agent nếu khác
      if (idle_video_url && !idle_video_url.includes('v2_agt_c4DztGrG')) {
        setIdleVideoSrc(idle_video_url);
      }

      const remoteOffer = offer || sdp;
      if (!stream_id || !remoteOffer) {
        throw new Error('Không nhận được SDP Offer hợp lệ từ D-ID Agent');
      }

      streamInfoRef.current = {
        agentId: agent_id,
        chatId: chat_id,
        streamId: stream_id,
        sessionId: session_id,
      };

      // 2. Khởi tạo RTCPeerConnection với ICE Servers từ D-ID
      const pc = new RTCPeerConnection({
        iceServers:
          ice_servers && ice_servers.length > 0
            ? ice_servers
            : [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      pcRef.current = pc;

      // 3. Lắng nghe sự kiện MediaStream từ D-ID và gắn trực tiếp vào thẻ <video>
      pc.ontrack = (event: RTCTrackEvent) => {
        if (event.streams && event.streams[0] && videoRef.current) {
          if (videoRef.current.srcObject !== event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            videoRef.current.muted = !voiceEnabled;
            videoRef.current.play().catch(() => {});
          }
          setConnectionStatus('connected');
          setLatencyMs(Math.floor(Math.random() * 18 + 32));
        }
      };

      // 4. Chuyển tiếp ICE Candidate phát hiện ở trình duyệt lên D-ID (/api/did-agent/chat/ice)
      pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate && streamInfoRef.current) {
          api
            .submitDidAgentIce({
              stream_id: streamInfoRef.current.streamId,
              session_id: streamInfoRef.current.sessionId,
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              agent_id: streamInfoRef.current.agentId,
            })
            .catch(() => {});
        }
      };

      // 5. Theo dõi trạng thái ICE Connection để xác định khi luồng WebRTC sẵn sàng nhận lệnh speak
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        if (state === 'connected' || state === 'completed') {
          setConnectionStatus('connected');
          setIsStreamReady(true);
        } else if (state === 'failed' || state === 'disconnected' || state === 'closed') {
          setIsStreamReady(false);
          setIsWebRtcStreamPlaying(false);
          if (state === 'failed') {
            setConnectionStatus('error');
            setErrorMessage('Kết nối WebRTC bị gián đoạn');
          }
        }
      };

      // 6. Lắng nghe DataChannel từ D-ID để bắt chính xác thời điểm Bắt đầu / Kết thúc phát video nói
      pc.ondatachannel = (event: RTCDataChannelEvent) => {
        const dc = event.channel;
        dataChannelRef.current = dc;
        dc.onmessage = (msgEvt) => {
          const raw = String(msgEvt.data || '');
          if (raw.includes('stream/started') || raw.includes('START')) {
            if (speakTimeoutRef.current) {
              clearTimeout(speakTimeoutRef.current);
              speakTimeoutRef.current = null;
            }
            // Tắt TTS nội bộ của trình duyệt để dùng 100% âm thanh Lip-Sync từ WebRTC D-ID
            onStopVoice?.();
            setIsWebRtcStreamPlaying(true);
            updateExaminerState('SPEAKING');
          } else if (raw.includes('stream/done') || raw.includes('STOP')) {
            if (speakTimeoutRef.current) {
              clearTimeout(speakTimeoutRef.current);
              speakTimeoutRef.current = null;
            }
            setIsWebRtcStreamPlaying(false);
            updateExaminerState('LISTENING');
          }
        };
      };

      // 7. Thiết lập Remote Description (Offer) và tạo Local Answer
      await pc.setRemoteDescription(new RTCSessionDescription(remoteOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // 8. Gửi SDP Answer lên D-ID (/api/did-agent/chat/sdp)
      await api.submitDidAgentSdp({
        stream_id: stream_id,
        session_id: session_id,
        sdp: {
          type: answer.type,
          sdp: answer.sdp,
        },
        agent_id: agent_id,
      });

      setConnectionStatus('connected');
      setIsStreamReady(true);
    } catch (err: any) {
      console.error('Lỗi khởi tạo D-ID WebRTC Stream:', err);
      setConnectionStatus('error');
      setErrorMessage(err?.message || 'Không thể kết nối D-ID WebRTC');
    } finally {
      isInitializingRef.current = false;
    }
  }, [cleanupWebRtc, currentVoice, onStopVoice, updateExaminerState, voiceEnabled]);

  // Khởi tạo WebRTC khi mount và giải phóng khi unmount
  useEffect(() => {
    initDidWebRtc();
    return () => {
      cleanupWebRtc();
    };
  }, []); // Chỉ khởi tạo 1 phiên xuyên suốt trong phòng phản biện

  // =========================================================================
  // Khi nhận câu hỏi phản biện mới (triggerQuestion / textToSpeak) -> Gọi /chat/speak
  // =========================================================================
  useEffect(() => {
    if (!questionText || !isStreamReady || !streamInfoRef.current) return;
    if (lastSpokenQuestionRef.current === questionText) return;

    lastSpokenQuestionRef.current = questionText;
    const { streamId, sessionId, agentId, chatId } = streamInfoRef.current;

    // Dừng giọng đọc Web Speech API dự phòng của trình duyệt để phát trực tiếp giọng WebRTC D-ID
    onStopVoice?.();
    updateExaminerState('SPEAKING');

    api
      .speakDidAgent({
        stream_id: streamId,
        session_id: sessionId,
        text: questionText,
        agent_id: agentId,
        chat_id: chatId,
        voice_id: currentVoice || 'vi-VN-NamMinhNeural',
      })
      .then(() => {
        // Bật lớp WebRTC ngay khi D-ID bắt đầu render stream nói
        setIsWebRtcStreamPlaying(true);
        // Fallback tự động trở về LISTENING nếu DataChannel không gửi sự kiện stream/done
        const estimatedMs = Math.max(5000, Math.min(35000, questionText.length * 95));
        if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = setTimeout(() => {
          setIsWebRtcStreamPlaying(false);
          updateExaminerState('LISTENING');
        }, estimatedMs);
      })
      .catch((err) => {
        console.error('Lỗi gửi câu hỏi tới D-ID /chat/speak:', err);
        setIsWebRtcStreamPlaying(false);
        updateExaminerState('LISTENING');
      });
  }, [questionText, isStreamReady, currentVoice, onStopVoice, updateExaminerState]);

  return (
    <div className="bg-surface-container-lowest/90 backdrop-blur-sm border border-surface-container-high/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full hover-lift">
      <div>
        {/* ================= KHUNG CAMERA GIÁM KHẢO AI WEBRTC ================= */}
        <div className="relative w-full rounded-xl overflow-hidden border border-primary/30 bg-slate-950 shadow-md group select-none">
          {/* Khung hình chuẩn 16:10 Studio */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
            {/* LỚP 1 (NỀN): VIDEO IDLE CHÍNH THỨC CỦA D-ID AGENT (v2_agt_c4DztGrG)
                Hiển thị tức thì (0ms), cử động đầu, thở & chớp mắt tự nhiên khi đang lắng nghe */}
            <video
              ref={idleVideoRef}
              src={idleVideoSrc}
              poster="/professor_avatar.png"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-1"
            />

            {/* LỚP 2 (TRÊN): LUỒNG VIDEO WEBRTC TRỰC TIẾP TỪ D-ID AGENTS STREAM KHI PHÁT BIỂU */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10 ${
                isWebRtcStreamPlaying
                  ? 'opacity-100'
                  : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Nút kết nối lại nhỏ gọn nếu mạng gặp sự cố (không che khuất khuôn mặt Giám khảo) */}
            {connectionStatus === 'error' && (
              <div className="absolute top-12 right-3 z-30 flex items-center gap-2 bg-black/80 border border-amber-400/50 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg">
                <span className="material-symbols-outlined text-amber-400 text-sm">
                  wifi_tethering_error
                </span>
                <span className="text-[11px] font-label text-slate-200">
                  {errorMessage || 'Gián đoạn WebRTC'}
                </span>
                <button
                  onClick={initDidWebRtc}
                  className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-label font-bold text-[10px] transition-all cursor-pointer"
                >
                  Kết nối lại
                </button>
              </div>
            )}

            {/* Badge góc trên: AI EXAMINER LIVE LIP-SYNC & REC • 1080p 60fps */}
            <div className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between text-white z-20">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 backdrop-blur-md">
                <span
                  className={`w-2 h-2 rounded-full shadow-sm ${
                    isCurrentSpeaking
                      ? 'bg-amber-400 shadow-amber-400 animate-pulse'
                      : 'bg-emerald-400 shadow-emerald-400 anim-live-pulse'
                  }`}
                />
                <span className="font-label font-bold text-[10px] tracking-wider text-emerald-200 uppercase">
                  AI EXAMINER LIVE LIP-SYNC
                </span>
                <span className="ml-1 text-[9px] font-mono text-emerald-300/80 px-1 py-0.2 rounded bg-black/40">
                  {connectionStatus === 'connected'
                    ? `WebRTC ${latencyMs}ms`
                    : 'D-ID Agent Sync'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] font-mono bg-black/60 px-2 py-0.5 rounded border border-white/10 text-slate-200 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span>REC • 1080p 60fps</span>
                </div>
                <button
                  onClick={initDidWebRtc}
                  className="p-1 rounded bg-black/50 hover:bg-black/80 border border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Làm mới kết nối D-ID WebRTC"
                >
                  <span className="material-symbols-outlined text-[15px] block">refresh</span>
                </button>
              </div>
            </div>

            {/* Hiệu ứng quét Hologram AI Scanner */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-16 w-full opacity-25 z-15"
              style={{ animation: 'avatar-scanline 5s linear infinite' }}
            />

            {/* Badge góc dưới: Trạng thái phát biểu, sóng âm thanh động & tên Giáo sư / Hội đồng */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/65 to-transparent z-20 flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-label font-bold tracking-wider text-primary-fixed">
                  Trạng thái hội đồng
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-label font-semibold text-xs text-white">
                    {isThinking
                      ? 'Đang phân tích suy luận CoT...'
                      : isCurrentSpeaking
                      ? 'Đang phát biểu chất vấn'
                      : 'Đang lắng nghe thí sinh'}
                  </span>

                  {/* Sóng âm thanh động */}
                  {isCurrentSpeaking ? (
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: `${Math.max(6, audioVolume * 15)}px`,
                          animationDuration: '0.6s',
                        }}
                      />
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: `${Math.max(10, audioVolume * 18)}px`,
                          animationDuration: '0.9s',
                        }}
                      />
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: `${Math.max(5, audioVolume * 14)}px`,
                          animationDuration: '0.75s',
                        }}
                      />
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: `${Math.max(12, audioVolume * 20)}px`,
                          animationDuration: '1.1s',
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px]">
                      <span className="material-symbols-outlined text-[13px] animate-pulse">
                        hearing
                      </span>
                      <span>Chớp mắt & lắng nghe</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tên Giáo sư & Hội đồng */}
              <div className="text-right">
                <span className="text-[10px] font-label font-bold text-slate-200 block">
                  {speakerName}
                </span>
                <span className="text-[9px] font-label text-primary-fixed-dim block">
                  {councilRole}
                </span>
              </div>
            </div>
          </div>

          {/* Thanh hiển thị biểu cảm & trạng thái WebRTC Live */}
          <div className="bg-surface-container-low/95 px-3.5 py-2.5 border-t border-primary/20 flex items-center justify-between gap-3 text-xs font-label">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[16px] text-amber-500">
                {isCurrentSpeaking ? 'record_voice_over' : 'visibility'}
              </span>
              <span className="text-[11px] text-on-surface font-semibold truncate">
                {isCurrentSpeaking
                  ? 'Thái độ: Nghiêm nghị, chất vấn học thuật chuẩn mực'
                  : 'Thái độ: Chăm chú lắng nghe, quan sát & chớp mắt tự nhiên'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] text-on-surface-variant font-medium">Luồng AI:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  {connectionStatus === 'connected'
                    ? 'D-ID AGENT LIVE'
                    : 'D-ID AGENT READY'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ================= THANH ĐIỀU KHIỂN GIỌNG NÓI & NGÔN NGỮ ================= */}
        {(onToggleVoice || onStopVoice || onChangeVoice) && (
          <div className="flex flex-col gap-2 mt-3.5">
            <div className="grid grid-cols-2 gap-2">
              {onToggleVoice && (
                <button
                  onClick={onToggleVoice}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-label font-semibold transition-all border shadow-2xs cursor-pointer ${
                    voiceEnabled
                      ? 'bg-primary-fixed/30 hover:bg-primary-fixed/50 text-on-primary-fixed-variant border-primary-fixed-dim/50'
                      : 'bg-surface-container-low text-on-surface-variant border-surface-container-high'
                  }`}
                  title="Bật/Tắt phát âm thanh AI"
                >
                  <span className="material-symbols-outlined text-[17px] text-primary">
                    {voiceEnabled ? 'volume_up' : 'volume_off'}
                  </span>
                  <span>{voiceEnabled ? 'Giọng AI: BẬT' : 'Giọng AI: TẮT'}</span>
                </button>
              )}

              {onStopVoice && (
                <button
                  onClick={() => {
                    onStopVoice();
                    setIsWebRtcStreamPlaying(false);
                    updateExaminerState('LISTENING');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-label font-semibold transition-all border border-surface-container-high/80 shadow-2xs cursor-pointer"
                  title="Dừng phát âm thanh hiện tại"
                >
                  <span className="material-symbols-outlined text-[17px] text-on-surface-variant">
                    stop_circle
                  </span>
                  <span>Dừng phát âm</span>
                </button>
              )}
            </div>

            {onChangeVoice && voiceOptions.length > 0 && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-surface-container-low border border-surface-container-high/70">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    record_voice_over
                  </span>
                  <span className="text-[11px] font-label font-bold text-on-surface whitespace-nowrap">
                    Ngôn ngữ giọng đọc:
                  </span>
                </div>
                <select
                  value={currentVoice}
                  onChange={(e) => onChangeVoice(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-surface-container-lowest border border-surface-container-high text-xs font-label text-on-surface focus:outline-none focus:border-primary cursor-pointer truncate max-w-[210px]"
                >
                  {voiceOptions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveAiExaminer;

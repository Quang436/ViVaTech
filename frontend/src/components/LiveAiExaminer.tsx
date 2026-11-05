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
  triggerQuestion?: string;
  textToSpeak?: string;
  onStateChange?: (newState: ExaminerState) => void;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
  onStopVoice?: () => void;
  currentVoice?: string;
  onChangeVoice?: (voiceId: string) => void;
  voiceOptions?: Array<{ id: string; name: string; lang: string }>;
}

const DEFAULT_PORTRAIT =
  'https://lh3.googleusercontent.com/aida/AEtjO1WNc-QSq92P90XqXpXf0p-2Qfbozh7HivO8RvhyyXng_l-4j1yV26_Vp_CvKNPpTKWLMs3iKySCjiQuv10M9FNpwAVCHkMt_Jyhmi0wP_-QbHXqCVJh3NYDKkdAcUPgkMsngqbQAAvduhSNF0Jn9V77V-lv1AoEYBOjh0Au7v_dMQ2qN2WzEUKdRjqcdlVy03jP5870fi_wVL6aEjL0tBNxj2zFBTD41jat3hwQgDPX';

export const LiveAiExaminer: React.FC<LiveAiExaminerProps> = ({
  speakerName = 'PGS. TS. Trần Thu Hà',
  councilRole = 'Giáo sư Phản biện Học thuật',
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
}) => {
  const [internalState, setInternalState] = useState<ExaminerState>('LISTENING');
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'error'
  >('connecting');
  const [isWebRtcStreamPlaying, setIsWebRtcStreamPlaying] = useState<boolean>(false);
  const [idleVideoSrc, setIdleVideoSrc] = useState<string>('/agent_idle.mp4');
  const [isSavedQuestion, setIsSavedQuestion] = useState(false);

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

  const questionText = (triggerQuestion ?? textToSpeak ?? '').trim();

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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !voiceEnabled;
    }
  }, [voiceEnabled]);

  useEffect(() => {
    if (idleVideoRef.current) {
      idleVideoRef.current.play().catch(() => {});
    }
  }, [idleVideoSrc]);

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
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebRtcStreamPlaying(false);
  }, []);

  const initDidWebRtc = useCallback(async () => {
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;

    cleanupWebRtc();
    setConnectionStatus('connecting');

    try {
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

      if (idle_video_url && !idle_video_url.includes('v2_agt_c4DztGrG')) {
        setIdleVideoSrc(idle_video_url);
      }

      const remoteOffer = offer || sdp;
      if (!stream_id || !remoteOffer) {
        throw new Error('Không nhận được SDP Offer từ D-ID');
      }

      streamInfoRef.current = {
        agentId: agent_id,
        chatId: chat_id,
        streamId: stream_id,
        sessionId: session_id,
      };

      const pc = new RTCPeerConnection({
        iceServers:
          ice_servers && ice_servers.length > 0
            ? ice_servers
            : [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      pcRef.current = pc;

      pc.ontrack = (event: RTCTrackEvent) => {
        if (event.streams && event.streams[0] && videoRef.current) {
          if (videoRef.current.srcObject !== event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            videoRef.current.muted = !voiceEnabled;
            videoRef.current.play().catch(() => {});
          }
          setConnectionStatus('connected');
        }
      };

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

      pc.ondatachannel = (event: RTCDataChannelEvent) => {
        const dc = event.channel;
        dataChannelRef.current = dc;
        dc.onmessage = (msgEvt) => {
          const raw = String(msgEvt.data || '');
          if (raw.includes('stream/started') || raw.includes('START')) {
            onStopVoice?.();
            setIsWebRtcStreamPlaying(true);
            updateExaminerState('SPEAKING');
          } else if (raw.includes('stream/done') || raw.includes('STOP')) {
            setIsWebRtcStreamPlaying(false);
            updateExaminerState('LISTENING');
          }
        };
      };

      await pc.setRemoteDescription(new RTCSessionDescription(remoteOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

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
    } catch (err: any) {
      console.warn('D-ID WebRTC fallback:', err?.message);
      setConnectionStatus('error');
    } finally {
      isInitializingRef.current = false;
    }
  }, [cleanupWebRtc, currentVoice, onStopVoice, updateExaminerState, voiceEnabled]);

  useEffect(() => {
    initDidWebRtc();
    return () => {
      cleanupWebRtc();
    };
  }, [initDidWebRtc, cleanupWebRtc]);

  // Kích hoạt phát âm thanh D-ID WebRTC khi có câu hỏi mới
  useEffect(() => {
    if (!questionText || questionText === lastSpokenQuestionRef.current) return;
    if (!streamInfoRef.current) return;

    lastSpokenQuestionRef.current = questionText;

    api
      .speakDidAgent({
        stream_id: streamInfoRef.current.streamId,
        session_id: streamInfoRef.current.sessionId,
        text: questionText,
        agent_id: streamInfoRef.current.agentId,
        chat_id: streamInfoRef.current.chatId,
        voice_id: currentVoice || 'vi-VN-NamMinhNeural',
      })
      .then(() => {
        setIsWebRtcStreamPlaying(true);
        updateExaminerState('SPEAKING');
        const estimatedMs = Math.min(18000, Math.max(3500, questionText.length * 85));
        speakTimeoutRef.current = setTimeout(() => {
          setIsWebRtcStreamPlaying(false);
          updateExaminerState('LISTENING');
        }, estimatedMs);
      })
      .catch(() => {
        setIsWebRtcStreamPlaying(false);
        updateExaminerState('LISTENING');
      });
  }, [questionText, currentVoice, updateExaminerState]);

  return (
    <div className="bg-surface-container-lowest/90 backdrop-blur-sm border border-surface-container-high/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full hover-lift">
      <div>
        {/* ================= KHUNG CAMERA GIÁM KHẢO AI WEBRTC ================= */}
        <div className="relative w-full rounded-xl overflow-hidden border border-primary/20 bg-slate-900 shadow-sm group select-none">
          <div className="relative aspect-[16/10] w-full overflow-hidden flex items-center justify-center">
            {/* LỚP 1: Chân dung Giám khảo Giáo sư xuất hiện ngay lập tức 0ms */}
            <img
              src={DEFAULT_PORTRAIT}
              alt={speakerName}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 z-1"
            />

            {/* LỚP 2: Video cử động tự nhiên khi lắng nghe */}
            <video
              ref={idleVideoRef}
              src={idleVideoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-2 opacity-90 transition-opacity duration-300"
            />

            {/* LỚP 3: Luồng WebRTC khi phát biểu */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`absolute inset-0 w-full h-full object-cover z-3 transition-opacity duration-300 ${
                isWebRtcStreamPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Overlay thông tin chân dung phía dưới */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 text-xs font-label">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCurrentSpeaking
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-400 animate-pulse'
                  }`}
                ></span>
                <span className="font-medium">
                  {speakerName} • {isCurrentSpeaking ? 'Đang chất vấn' : 'Trực tiếp'}
                </span>
                {councilRole && (
                  <span className="hidden sm:inline text-[10px] text-white/70">
                    ({councilRole})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {onToggleVoice && (
                  <button
                    onClick={onToggleVoice}
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/10 cursor-pointer"
                    title={voiceEnabled ? 'Tắt giọng nói AI' : 'Bật giọng nói AI'}
                  >
                    <span className="material-symbols-outlined text-base">
                      {voiceEnabled ? 'volume_up' : 'volume_off'}
                    </span>
                  </button>
                )}
                <button
                  onClick={initDidWebRtc}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/10 cursor-pointer"
                  title={`Làm mới luồng video AI (${connectionStatus})`}
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Khung Câu Hỏi Chất Vấn */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-label uppercase tracking-wider text-on-surface-variant font-bold block">
              Câu hỏi chất vấn
            </span>
            {isCurrentSpeaking && audioVolume > 0 && (
              <span className="text-[10px] font-mono text-primary font-bold">
                Level: {(audioVolume * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <div className="bg-surface-container-low/70 border-l-4 border-primary rounded-r-xl rounded-bl-xl p-4 shadow-xs">
            <blockquote className="font-headline text-on-surface text-base sm:text-lg italic leading-relaxed">
              {questionText ? (
                `“${questionText}”`
              ) : (
                <span className="text-on-surface-variant">
                  “Hội đồng đang chuẩn bị câu hỏi phản biện đối ứng từ tài liệu đề án của bạn...”
                </span>
              )}
            </blockquote>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary">
            {isCurrentSpeaking ? 'record_voice_over' : 'hearing'}
          </span>
          <span>
            {isThinking
              ? 'Hội đồng đang suy luận CoT...'
              : isCurrentSpeaking
              ? 'Hội đồng đang phát biểu...'
              : 'Hội đồng đang chờ phần trả lời'}
          </span>
        </span>
        <button
          onClick={() => setIsSavedQuestion(!isSavedQuestion)}
          className="p-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors cursor-pointer border-none bg-transparent"
          title={isSavedQuestion ? 'Đã lưu câu hỏi' : 'Lưu câu hỏi'}
        >
          <span
            className={`material-symbols-outlined text-base ${
              isSavedQuestion ? 'text-primary' : ''
            }`}
          >
            {isSavedQuestion ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default LiveAiExaminer;

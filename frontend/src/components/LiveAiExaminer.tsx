import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bookmark,
  Ear,
  Radio,
  RefreshCw,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
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
  onFallbackSpeak?: (text: string) => void;
  currentVoice?: string;
  onChangeVoice?: (voiceId: string) => void;
  voiceOptions?: Array<{ id: string; name: string; lang: string }>;
}

const DEFAULT_PORTRAIT = '/professor_avatar.png';

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
  onFallbackSpeak,
  currentVoice = 'vi-VN-NamMinhNeural',
}) => {
  const [internalState, setInternalState] = useState<ExaminerState>('LISTENING');
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'error'
  >('connecting');
  const [isStreamReady, setIsStreamReady] = useState<boolean>(false);
  const [isWebRtcStreamPlaying, setIsWebRtcStreamPlaying] = useState<boolean>(false);
  const [idleVideoSrc, setIdleVideoSrc] = useState<string>('/agent_idle.mp4');
  const [isSavedQuestion, setIsSavedQuestion] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initSeqRef = useRef<number>(0);

  // Refs for latest callback/prop values without recreating WebRTC callbacks
  const voiceEnabledRef = useRef(voiceEnabled);
  const currentVoiceRef = useRef(currentVoice);
  const onStopVoiceRef = useRef(onStopVoice);
  const onStateChangeRef = useRef(onStateChange);
  const onFallbackSpeakRef = useRef(onFallbackSpeak);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  useEffect(() => {
    currentVoiceRef.current = currentVoice;
  }, [currentVoice]);

  useEffect(() => {
    onStopVoiceRef.current = onStopVoice;
  }, [onStopVoice]);

  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    onFallbackSpeakRef.current = onFallbackSpeak;
  }, [onFallbackSpeak]);

  const streamInfoRef = useRef<{
    agentId?: string | null;
    chatId?: string | null;
    streamId: string;
    sessionId: string;
  } | null>(null);
  const lastSpokenQuestionRef = useRef<string>('');

  const questionText = (triggerQuestion ?? textToSpeak ?? '').trim();

  const activeState: ExaminerState =
    internalState === 'SPEAKING' || isWebRtcStreamPlaying || propIsSpeaking
      ? 'SPEAKING'
      : controlledState !== undefined
      ? controlledState
      : 'LISTENING';

  const isCurrentSpeaking = activeState === 'SPEAKING';

  const updateExaminerState = useCallback((newState: ExaminerState) => {
    setInternalState(newState);
    onStateChangeRef.current?.(newState);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !voiceEnabled;
    }
    if (!voiceEnabled) {
      onStopVoiceRef.current?.();
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
    streamInfoRef.current = null;
    setIsStreamReady(false);
    setIsWebRtcStreamPlaying(false);
  }, []);

  const initDidWebRtc = useCallback(async () => {
    const mySeq = ++initSeqRef.current;

    cleanupWebRtc();
    setConnectionStatus('connecting');

    try {
      const startData = await api.startDidAgentChat({
        voice_id: currentVoiceRef.current || 'vi-VN-NamMinhNeural',
      });

      if (mySeq !== initSeqRef.current) {
        return;
      }

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
            videoRef.current.muted = !voiceEnabledRef.current;
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
            onStopVoiceRef.current?.();
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

      if (mySeq !== initSeqRef.current) {
        return;
      }

      setConnectionStatus('connected');
      setIsStreamReady(true);
    } catch (err: unknown) {
      if (mySeq !== initSeqRef.current) {
        return;
      }
      console.warn('D-ID WebRTC fallback:', err instanceof Error ? err.message : err);
      setIsStreamReady(false);
      setConnectionStatus('error');
    }
  }, [cleanupWebRtc, updateExaminerState]);

  // Schedule single init after tiny delay to avoid StrictMode duplicate network requests on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      initDidWebRtc();
    }, 80);

    return () => {
      clearTimeout(timer);
      initSeqRef.current += 1;
      cleanupWebRtc();
    };
  }, [initDidWebRtc, cleanupWebRtc]);

  // Speak question via D-ID WebRTC once ready, or via TTS fallback when D-ID errors
  useEffect(() => {
    if (!questionText || questionText === lastSpokenQuestionRef.current) return;

    if (connectionStatus === 'error') {
      lastSpokenQuestionRef.current = questionText;
      if (voiceEnabledRef.current) {
        onFallbackSpeakRef.current?.(questionText);
      }
      return;
    }

    if (!isStreamReady || !streamInfoRef.current) return;

    lastSpokenQuestionRef.current = questionText;
    const activeStream = streamInfoRef.current;

    api
      .speakDidAgent({
        stream_id: activeStream.streamId,
        session_id: activeStream.sessionId,
        text: questionText,
        agent_id: activeStream.agentId,
        chat_id: activeStream.chatId,
        voice_id: currentVoiceRef.current || 'vi-VN-NamMinhNeural',
      })
      .then(() => {
        setIsWebRtcStreamPlaying(true);
        updateExaminerState('SPEAKING');
        if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current);
        const estimatedMs = Math.min(18000, Math.max(3500, questionText.length * 85));
        speakTimeoutRef.current = setTimeout(() => {
          setIsWebRtcStreamPlaying(false);
          updateExaminerState('LISTENING');
        }, estimatedMs);
      })
      .catch(() => {
        setIsWebRtcStreamPlaying(false);
        updateExaminerState('LISTENING');
        if (voiceEnabledRef.current) {
          onFallbackSpeakRef.current?.(questionText);
        }
      });
  }, [questionText, isStreamReady, connectionStatus, updateExaminerState]);

  const handleReplayVoice = () => {
    if (!questionText) return;
    lastSpokenQuestionRef.current = '';
    if (isStreamReady && streamInfoRef.current) {
      const activeStream = streamInfoRef.current;
      api
        .speakDidAgent({
          stream_id: activeStream.streamId,
          session_id: activeStream.sessionId,
          text: questionText,
          agent_id: activeStream.agentId,
          chat_id: activeStream.chatId,
          voice_id: currentVoiceRef.current || 'vi-VN-NamMinhNeural',
        })
        .catch(() => {
          onFallbackSpeakRef.current?.(questionText);
        });
    } else {
      onFallbackSpeakRef.current?.(questionText);
    }
  };

  return (
    <div className="mint-card mint-card-hover p-6 flex flex-col justify-between h-full">
      <div>
        {/* ================= KHUNG CAMERA GIÁM KHẢO AI WEBRTC ================= */}
        <div className="relative w-full rounded-2xl overflow-hidden border border-[rgba(11,110,94,0.22)] bg-[#0f1c1a] shadow-xs group">
          <div className="relative aspect-[16/10] w-full overflow-hidden flex items-center justify-center">
            {/* Layer 1: High-res Local Examiner Portrait */}
            <img
              src={DEFAULT_PORTRAIT}
              alt={speakerName}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/avatars/examiner-id.jpg')) {
                  target.src = '/avatars/examiner-id.jpg';
                }
              }}
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 z-[1]"
            />

            {/* Layer 2: Natural Idle Looping Video */}
            <video
              ref={idleVideoRef}
              src={idleVideoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-[2] opacity-90 transition-opacity duration-300"
            />

            {/* Layer 3: WebRTC Talking Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`absolute inset-0 w-full h-full object-cover z-[3] transition-opacity duration-300 ${
                isWebRtcStreamPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Bottom Portrait HUD Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#0a1413]/90 via-[#0a1413]/50 to-transparent flex items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0a1413]/75 backdrop-blur-md text-white border border-white/15 text-xs font-sans min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isCurrentSpeaking
                      ? 'bg-[#f59e0b] anim-live-pulse'
                      : 'bg-[#6ee7c8] anim-live-pulse'
                  }`}
                  aria-hidden="true"
                />
                <span className="font-medium truncate">
                  {speakerName} · {isCurrentSpeaking ? 'Đang chất vấn' : 'Trực tiếp'}
                </span>
                {councilRole && (
                  <span className="hidden sm:inline text-[10px] text-white/75 truncate">
                    ({councilRole})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {questionText && (
                  <button
                    type="button"
                    onClick={handleReplayVoice}
                    aria-label="Đọc lại câu hỏi chất vấn"
                    className="w-8 h-8 rounded-full bg-[#0a1413]/75 hover:bg-[#0a1413] text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/15 cursor-pointer"
                    title="Đọc lại câu hỏi"
                  >
                    <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                  </button>
                )}

                {onToggleVoice && (
                  <button
                    type="button"
                    aria-label="Âm thanh giám khảo AI"
                    aria-pressed={voiceEnabled}
                    onClick={onToggleVoice}
                    className="w-8 h-8 rounded-full bg-[#0a1413]/75 hover:bg-[#0a1413] text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/15 cursor-pointer"
                    title={voiceEnabled ? 'Đang bật giọng nói AI (nhấn để tắt)' : 'Đang tắt giọng nói AI (nhấn để bật)'}
                  >
                    {voiceEnabled ? (
                      <Volume2 className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                    )}
                  </button>
                )}

                <button
                  type="button"
                  aria-label="Kết nối lại luồng video giám khảo AI"
                  onClick={() => initDidWebRtc()}
                  className="w-8 h-8 rounded-full bg-[#0a1413]/75 hover:bg-[#0a1413] text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/15 cursor-pointer"
                  title={`Làm mới luồng video AI (${connectionStatus})`}
                >
                  <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Câu hỏi chất vấn */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="mint-eyebrow block">Câu hỏi chất vấn</span>
            {isCurrentSpeaking && audioVolume > 0 && (
              <span className="text-[10px] font-mono text-[#0b6e5e] font-semibold">
                Mức âm: {(audioVolume * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <div className="bg-[#eff5f3] border-l-4 border-[#0b6e5e] rounded-r-2xl rounded-bl-2xl p-4">
            <blockquote className="font-serif text-[#0a1413] text-base sm:text-lg italic leading-relaxed m-0">
              {questionText ? (
                `“${questionText}”`
              ) : (
                <span className="text-[#465754]">
                  “Hội đồng đang chuẩn bị câu hỏi phản biện đối ứng từ tài liệu đề án của bạn...”
                </span>
              )}
            </blockquote>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-[rgba(10,20,19,0.08)] flex items-center justify-between text-xs font-sans text-[#465754]">
        <span className="inline-flex items-center gap-1.5">
          {isCurrentSpeaking ? (
            <Radio className="w-4 h-4 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
          ) : (
            <Ear className="w-4 h-4 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
          )}
          <span>
            {isThinking
              ? 'Hội đồng đang suy luận CoT...'
              : isCurrentSpeaking
              ? 'Hội đồng đang phát biểu...'
              : 'Hội đồng đang chờ phần trả lời'}
          </span>
        </span>
        <button
          type="button"
          aria-pressed={isSavedQuestion}
          aria-label="Lưu câu hỏi này"
          onClick={() => setIsSavedQuestion(!isSavedQuestion)}
          className="p-1.5 rounded-full hover:bg-[#eff5f3] text-[#465754] transition-colors cursor-pointer border-none bg-transparent"
          title={isSavedQuestion ? 'Đã lưu câu hỏi' : 'Lưu câu hỏi'}
        >
          <Bookmark
            className={`w-4 h-4 ${isSavedQuestion ? 'text-[#0b6e5e] fill-[#6ee7c8]' : ''}`}
            strokeWidth={2}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
};

export default LiveAiExaminer;

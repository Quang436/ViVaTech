import React, { useRef, useEffect, useState, useCallback } from 'react';

export type ExaminerState = 'LISTENING' | 'SPEAKING';

export interface AiExaminerProps {
  /** Tên giám khảo (mặc định: GS. Nam Minh) */
  speakerName?: string;
  /** Chức danh hội đồng */
  councilRole?: string;
  /** Trạng thái hiện tại nếu được điều khiển từ bên ngoài ('LISTENING' | 'SPEAKING') */
  state?: ExaminerState;
  /** Cờ trạng thái nói (tương thích boolean isSpeaking) */
  isSpeaking?: boolean;
  /** Đang phân tích suy luận Chain-of-Thought */
  isThinking?: boolean;
  /** Biên độ âm thanh (0.0 đến 1.0) từ bộ phân tích AudioContext */
  audioVolume?: number;
  /** URL file âm thanh phát song song khi ở trạng thái SPEAKING */
  audioUrl?: string;
  /** Callback khi trạng thái chuyển đổi giữa LISTENING và SPEAKING */
  onStateChange?: (newState: ExaminerState) => void;
  /** Callback khi âm thanh phát xong */
  onAudioEnded?: () => void;
  /** Bật/tắt giọng đọc AI */
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
  onStopVoice?: () => void;
  currentVoice?: string;
  onChangeVoice?: (voiceId: string) => void;
  voiceOptions?: Array<{ id: string; name: string; lang: string }>;
  /** Tùy chọn đường dẫn video (mặc định trỏ tới /idle_listening.mp4 và /speaking_action.mp4) */
  idleVideoSrc?: string;
  speakingVideoSrc?: string;
}

export const AiExaminer: React.FC<AiExaminerProps> = ({
  speakerName = 'GS. Nam Minh',
  councilRole = 'Giáo sư Phản biện Học thuật - Hội đồng Viện AI Quốc gia',
  state: controlledState,
  isSpeaking: propIsSpeaking,
  isThinking = false,
  audioVolume = 0,
  audioUrl,
  onStateChange,
  onAudioEnded,
  voiceEnabled = true,
  onToggleVoice,
  onStopVoice,
  currentVoice = 'vi-VN-NamMinhNeural',
  onChangeVoice,
  voiceOptions = [],
  idleVideoSrc = '/idle_listening.mp4',
  speakingVideoSrc = '/speaking_action.mp4',
}) => {
  // Trạng thái nội bộ nếu component tự quản lý state
  const [internalState, setInternalState] = useState<ExaminerState>('LISTENING');

  // Xác định trạng thái hoạt động thực tế
  const activeState: ExaminerState =
    controlledState !== undefined
      ? controlledState
      : propIsSpeaking !== undefined
      ? propIsSpeaking
        ? 'SPEAKING'
        : 'LISTENING'
      : internalState;

  const isCurrentSpeaking = activeState === 'SPEAKING';

  // Refs quản lý các thẻ Video và Audio HTML5
  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const speakingVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Đổi trạng thái và kích hoạt callback
  const changeState = useCallback(
    (newState: ExaminerState) => {
      setInternalState(newState);
      onStateChange?.(newState);
    },
    [onStateChange]
  );

  // Khởi tạo và đảm bảo cả 2 video loop luôn chạy mượt mà dưới nền
  useEffect(() => {
    const playVideo = (videoEl: HTMLVideoElement | null) => {
      if (videoEl) {
        videoEl.play().catch(() => {
          // Xử lý chính sách autoplay của trình duyệt
        });
      }
    };

    playVideo(idleVideoRef.current);
    playVideo(speakingVideoRef.current);
  }, []);

  // Xử lý đồng bộ Audio khi có audioUrl truyền trực tiếp
  useEffect(() => {
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = audioUrl;

    const handleEnded = () => {
      changeState('LISTENING');
      onAudioEnded?.();
    };

    const handleError = () => {
      changeState('LISTENING');
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    if (isCurrentSpeaking && voiceEnabled) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [audioUrl, isCurrentSpeaking, voiceEnabled, changeState, onAudioEnded]);

  return (
    <div className="bg-surface-container-lowest/90 backdrop-blur-sm border border-surface-container-high/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full hover-lift">
      <div>
        {/* ================= KHUNG CAMERA GIÁM KHẢO AI (AI EXAMINER LIVE FEED) ================= */}
        <div className="relative w-full rounded-xl overflow-hidden border border-primary/30 bg-slate-950 shadow-md group select-none">
          {/* Tỷ lệ khung hình video 16:10 / HD chuẩn Studio */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
            {/* 1. Video Trạng thái 1: LISTENING (Người thật chăm chú nghe, chớp mắt, gật đầu nhẹ) */}
            <video
              ref={idleVideoRef}
              src={idleVideoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out pointer-events-none ${
                activeState === 'LISTENING' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />

            {/* 2. Video Trạng thái 2: SPEAKING (Người thật phát biểu chất vấn, biểu cảm nghiêm nghị) */}
            <video
              ref={speakingVideoRef}
              src={speakingVideoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out pointer-events-none ${
                activeState === 'SPEAKING' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />

            {/* Badge phía trên: AI EXAMINER LIVE & REC • 1080p 60fps */}
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
                  AI EXAMINER LIVE
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono bg-black/60 px-2 py-0.5 rounded border border-white/10 text-slate-200 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>REC • 1080p 60fps</span>
              </div>
            </div>

            {/* Hiệu ứng quét Hologram AI Scanner */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-16 w-full opacity-25 z-10"
              style={{ animation: 'avatar-scanline 5s linear infinite' }}
            />

            {/* HUD phía dưới: Trạng thái hội đồng & Sound Wave Visualizer */}
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
                      ? 'Giáo sư đang phát biểu chất vấn (AI Speaking)'
                      : 'Đang chăm chú lắng nghe thí sinh (Listening)'}
                  </span>

                  {/* Thanh Wave âm thanh trạng thái */}
                  {isCurrentSpeaking ? (
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: `${Math.max(4, audioVolume * 15)}px`,
                          animationDuration: '0.6s',
                        }}
                      />
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: `${Math.max(6, audioVolume * 18)}px`,
                          animationDuration: '0.9s',
                        }}
                      />
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: `${Math.max(4, audioVolume * 14)}px`,
                          animationDuration: '0.75s',
                        }}
                      />
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: `${Math.max(7, audioVolume * 20)}px`,
                          animationDuration: '1.1s',
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px]">
                      <span className="material-symbols-outlined text-[13px] animate-pulse">hearing</span>
                      <span>Chớp mắt & lắng nghe</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin Giám khảo học thuật */}
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

          {/* Thanh hiển thị biểu cảm & chế độ Video AI */}
          <div className="bg-surface-container-low/95 px-3.5 py-2.5 border-t border-primary/20 flex items-center justify-between gap-3 text-xs font-label">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[16px] text-amber-500">
                {isCurrentSpeaking ? 'record_voice_over' : 'visibility'}
              </span>
              <span className="text-[11px] text-on-surface font-semibold truncate">
                {isCurrentSpeaking
                  ? 'Thái độ: Nghiêm nghị, chất vấn luận điểm học thuật'
                  : 'Thái độ: Chăm chú lắng nghe, quan sát & chớp mắt tự nhiên'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] text-on-surface-variant font-medium">Chế độ AI:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                  isCurrentSpeaking
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isCurrentSpeaking ? 'SPEAKING VIDEO' : 'LISTENING VIDEO'}
              </span>
            </div>
          </div>
        </div>

        {/* ================= THANH ĐIỀU KHIỂN GIỌNG NÓI & NGÔN NGỮ (TÙY CHỌN) ================= */}
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
                  onClick={onStopVoice}
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

export default AiExaminer;

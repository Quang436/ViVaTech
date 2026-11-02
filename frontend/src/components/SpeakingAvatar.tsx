import React, { useRef, useEffect } from 'react';

interface SpeakingAvatarProps {
  speakerName: string;
  councilRole: string;
  isSpeaking: boolean;
  isThinking: boolean;
  audioVolume: number; // 0.0 to 1.0 from audio analyser
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onStopVoice: () => void;
  currentVoice: string;
  onChangeVoice: (voiceId: string) => void;
  voiceOptions: Array<{ id: string; name: string; lang: string }>;
}

export const SpeakingAvatar: React.FC<SpeakingAvatarProps> = ({
  speakerName,
  councilRole,
  isSpeaking,
  isThinking,
  audioVolume,
  voiceEnabled,
  onToggleVoice,
  onStopVoice,
  currentVoice,
  onChangeVoice,
  voiceOptions,
}) => {
  const speakingVideoRef = useRef<HTMLVideoElement>(null);
  const listeningVideoRef = useRef<HTMLVideoElement>(null);

  // Ensure both videos continuously play seamlessly without interruption
  useEffect(() => {
    const playVideo = (v: HTMLVideoElement | null) => {
      if (v) {
        v.play().catch(() => {
          // Autoplay policy fallback
        });
      }
    };
    playVideo(speakingVideoRef.current);
    playVideo(listeningVideoRef.current);
  }, []);

  return (
    <div className="bg-surface-container-lowest/90 backdrop-blur-sm border border-surface-container-high/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full hover-lift">
      <div>
        {/* ================= LIVE DIGITAL HUMAN AI STREAM BOX ================= */}
        <div className="relative w-full rounded-xl overflow-hidden border border-primary/30 bg-slate-950 shadow-md group select-none">
          {/* Main Video Stream Frame (16:10 aspect ratio matching 1376x768 / HD) */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
            {/* 1. Photorealistic AI Speaking Video */}
            <video
              ref={speakingVideoRef}
              src="/professor_speaking.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out pointer-events-none ${
                isSpeaking ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />

            {/* 2. Photorealistic AI Attentive Listening & Blinking Video */}
            <video
              ref={listeningVideoRef}
              src="/professor_listening.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out pointer-events-none ${
                !isSpeaking ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />

            {/* Top Stream HUD Overlay */}
            <div className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between text-white z-20">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 anim-live-pulse shadow-sm shadow-emerald-400"></span>
                <span className="font-label font-bold text-[10px] tracking-wider text-emerald-200 uppercase">
                  {isSpeaking ? 'AI Examiner Speaking' : 'AI Examiner Listening'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono bg-black/60 px-2 py-0.5 rounded border border-white/10 text-slate-200 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>REC • 1080p 60fps</span>
              </div>
            </div>

            {/* Subtle Scanning Hologram Ambient Lines */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-16 w-full opacity-30 z-10"
              style={{ animation: 'avatar-scanline 5s linear infinite' }}
            ></div>

            {/* Bottom HUD: Live Status & Speech Waveform */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/65 to-transparent z-20 flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-label font-bold tracking-wider text-primary-fixed">
                  Trạng thái hội đồng
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-label font-semibold text-xs text-white">
                    {isThinking
                      ? 'Đang phân tích suy luận CoT...'
                      : isSpeaking
                      ? 'Giáo sư đang phát biểu chất vấn (Speaking)'
                      : 'Đang chăm chú lắng nghe thí sinh (Listening)'}
                  </span>
                  {isSpeaking ? (
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: `${Math.max(4, audioVolume * 15)}px`,
                          animationDuration: '0.6s',
                        }}
                      ></span>
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: `${Math.max(6, audioVolume * 18)}px`,
                          animationDuration: '0.9s',
                        }}
                      ></span>
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: `${Math.max(4, audioVolume * 14)}px`,
                          animationDuration: '0.75s',
                        }}
                      ></span>
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: `${Math.max(7, audioVolume * 20)}px`,
                          animationDuration: '1.1s',
                        }}
                      ></span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px]">
                      <span className="material-symbols-outlined text-[13px] animate-pulse">hearing</span>
                      <span>Chớp mắt & lắng nghe</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Socratic Council Identity Badge */}
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

          {/* AI Sentiment & Examiner Cognitive HUD Bar */}
          <div className="bg-surface-container-low/95 px-3.5 py-2.5 border-t border-primary/20 flex items-center justify-between gap-3 text-xs font-label">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[16px] text-amber-500">
                {isSpeaking ? 'record_voice_over' : 'visibility'}
              </span>
              <span className="text-[11px] text-on-surface font-semibold truncate">
                {isSpeaking
                  ? 'Thái độ: Nghiêm nghị, chất vấn học thuật chuẩn mực'
                  : 'Thái độ: Tập trung lắng nghe, quan sát & chớp mắt tự nhiên'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] text-on-surface-variant font-medium">Chế độ AI:</span>
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed/40 text-primary text-[10px] font-bold">
                {isSpeaking ? 'Video phát âm' : 'Video lắng nghe'}
              </span>
            </div>
          </div>
        </div>

        {/* ================= VOICE & LANGUAGE SELECTOR CONTROLS ================= */}
        <div className="flex flex-col gap-2 mt-3.5">
          {/* Top Control Buttons */}
          <div className="grid grid-cols-2 gap-2">
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
          </div>

          {/* Voice Language Picker */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-surface-container-low border border-surface-container-high/70">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[16px] text-secondary">record_voice_over</span>
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
        </div>
      </div>
    </div>
  );
};

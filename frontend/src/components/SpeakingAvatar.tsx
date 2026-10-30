import React, { useState, useEffect } from 'react';

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
  const [isBlinking, setIsBlinking] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);

  // Natural eye-blink cycle every 3.5 - 5 seconds
  useEffect(() => {
    let blinkTimeout: number;
    let openTimeout: number;

    const triggerBlink = () => {
      setIsBlinking(true);
      openTimeout = window.setTimeout(() => {
        setIsBlinking(false);
        const nextBlink = Math.random() * 2500 + 2500; // 2.5s - 5s
        blinkTimeout = window.setTimeout(triggerBlink, nextBlink);
      }, 130);
    };

    const initialBlink = window.setTimeout(triggerBlink, 2000);

    return () => {
      clearTimeout(initialBlink);
      clearTimeout(blinkTimeout);
      clearTimeout(openTimeout);
    };
  }, []);

  // Subtle natural head sway while speaking
  useEffect(() => {
    if (!isSpeaking) {
      setHeadTilt(0);
      return;
    }
    const interval = setInterval(() => {
      setHeadTilt((Math.random() - 0.5) * 1.8);
    }, 400);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Map audio volume to mouth opening parameters
  // Volume is normalized between 0 and 1
  const effectiveVolume = isSpeaking ? Math.max(audioVolume, 0.08) : 0;
  const mouthOpenHeight = Math.min(18, Math.round(effectiveVolume * 18));
  const mouthStretch = 1 + effectiveVolume * 0.18;
  const jawDrop = Math.min(6, Math.round(effectiveVolume * 6));

  return (
    <div className="bg-surface-container-lowest/90 backdrop-blur-sm border border-surface-container-high/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full hover-lift">
      <div>
        {/* ================= LIVE DIGITAL HUMAN STREAM BOX ================= */}
        <div className="relative w-full rounded-xl overflow-hidden border border-primary/30 bg-slate-950 shadow-md group select-none">
          {/* Main Video Stream Frame */}
          <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
            {/* Animated Face Container with Head Tilt and Breathing */}
            <div
              className={`relative w-full h-full transition-transform duration-300 ease-out ${
                isSpeaking ? '' : 'anim-avatar-breathe'
              }`}
              style={{
                transform: `rotate(${headTilt}deg) scale(${isSpeaking ? 1.02 : 1.0})`,
                transformOrigin: '50% 60%',
              }}
            >
              {/* Base Professor Image */}
              <img
                alt={speakerName}
                src="/professor_avatar.png"
                className="w-full h-full object-cover object-center pointer-events-none"
              />

              {/* Natural Eye Blinking Overlay */}
              {isBlinking && (
                <div
                  className="absolute pointer-events-none transition-opacity duration-75"
                  style={{
                    top: '37.8%',
                    left: '42.5%',
                    width: '15.5%',
                    height: '3.8%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '14%',
                  }}
                >
                  {/* Left eyelid */}
                  <div
                    className="w-1/2 h-full rounded-full bg-[#3d2b24]/90 backdrop-blur-[1px] shadow-inner"
                    style={{
                      borderBottom: '1.5px solid #231611',
                    }}
                  />
                  {/* Right eyelid */}
                  <div
                    className="w-1/2 h-full rounded-full bg-[#3d2b24]/90 backdrop-blur-[1px] shadow-inner"
                    style={{
                      borderBottom: '1.5px solid #231611',
                    }}
                  />
                </div>
              )}

              {/* Dynamic Lip-Sync Mouth Rig */}
              <div
                className="absolute pointer-events-none flex items-center justify-center transition-all duration-75 ease-out"
                style={{
                  top: '55.2%',
                  left: '46.8%',
                  width: '6.6%',
                  height: '4.8%',
                  transform: `translateY(${jawDrop}px) scaleX(${mouthStretch})`,
                  transformOrigin: '50% 10%',
                }}
              >
                {effectiveVolume > 0.05 ? (
                  /* Speaking state: Animated open mouth with teeth and oral cavity */
                  <div
                    className="relative rounded-full overflow-hidden flex flex-col items-center justify-between shadow-inner transition-all duration-75"
                    style={{
                      width: '100%',
                      height: `${Math.max(6, mouthOpenHeight)}px`,
                      backgroundColor: '#1d0c0e',
                      borderTop: '1.5px solid #7c3b3f',
                      borderBottom: '2px solid #6b2e32',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.85)',
                    }}
                  >
                    {/* Upper teeth enamel */}
                    <div
                      className="w-[78%] rounded-b-sm bg-gradient-to-b from-[#f2efe9] to-[#d6cfc5] shadow-2xs"
                      style={{ height: `${Math.min(3.5, mouthOpenHeight * 0.35)}px` }}
                    />

                    {/* Tongue articulation */}
                    <div
                      className="w-[70%] rounded-t-full bg-gradient-to-t from-[#9e464c] to-[#b85b62]"
                      style={{ height: `${Math.min(4, mouthOpenHeight * 0.45)}px` }}
                    />
                  </div>
                ) : (
                  /* Idle / closed mouth: Natural lip line */
                  <div
                    className="w-full h-1.5 rounded-full bg-[#5f2b2e]/90 shadow-2xs transition-all duration-150"
                    style={{
                      borderTop: '1px solid #7a3539',
                      borderBottom: '1px solid #4a1d20',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Top Stream HUD Overlay */}
            <div className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 anim-live-pulse shadow-sm shadow-emerald-400"></span>
                <span className="font-label font-bold text-[10px] tracking-wider text-emerald-200 uppercase">
                  AI Examiner Live Lip-Sync
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono bg-black/60 px-2 py-0.5 rounded border border-white/10 text-slate-200 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>REC • 1080p 60fps</span>
              </div>
            </div>

            {/* Hologram Scanning Lines Effect */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-16 w-full opacity-35"
              style={{ animation: 'avatar-scanline 4.5s linear infinite' }}
            ></div>

            {/* Bottom HUD: Active Speech State & Audio Visualizer Bars */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10 flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-label font-bold tracking-wider text-primary-fixed">
                  Trạng thái phát biểu
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-label font-semibold text-xs text-white">
                    {isThinking
                      ? 'Đang phân tích suy luận CoT...'
                      : isSpeaking
                      ? 'Đang phát biểu chất vấn (AI Speaking)'
                      : 'Đang lắng nghe thí sinh (Listening)'}
                  </span>
                  {(isSpeaking || isThinking) && (
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: isSpeaking ? `${Math.max(4, audioVolume * 14)}px` : '8px',
                          animationDuration: '0.6s',
                        }}
                      ></span>
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: isSpeaking ? `${Math.max(5, audioVolume * 16)}px` : '12px',
                          animationDuration: '0.9s',
                        }}
                      ></span>
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: isSpeaking ? `${Math.max(3, audioVolume * 13)}px` : '6px',
                          animationDuration: '0.75s',
                        }}
                      ></span>
                      <span
                        className="w-1 bg-primary-fixed rounded-full wave-bar"
                        style={{
                          height: isSpeaking ? `${Math.max(6, audioVolume * 18)}px` : '14px',
                          animationDuration: '1.1s',
                        }}
                      ></span>
                    </div>
                  )}
                </div>
              </div>
              {/* Socratic Council Badge */}
              <div className="text-right">
                <span className="text-[10px] font-label font-bold text-slate-300 block">
                  {speakerName}
                </span>
                <span className="text-[9px] font-label text-primary-fixed-dim/90 block">
                  {councilRole}
                </span>
              </div>
            </div>
          </div>

          {/* AI Sentiment & Examiner Cognitive HUD Bar */}
          <div className="bg-surface-container-low/90 px-3.5 py-2.5 border-t border-primary/20 flex items-center justify-between gap-3 text-xs font-label">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[16px] text-amber-600">psychology_alt</span>
              <span className="text-[11px] text-on-surface font-semibold truncate">
                Thái độ: Nghiêm nghị, chú ý cao độ (Attentive & Critical)
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] text-on-surface-variant font-medium">Khẩu hình:</span>
              <span className="px-1.5 py-0.5 rounded bg-primary-fixed/40 text-primary text-[10px] font-bold">
                {isSpeaking ? 'Mở miệng phát âm' : 'Khép miệng'}
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

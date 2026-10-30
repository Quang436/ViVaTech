import React, { useState, useEffect } from 'react';
import type { DebateSession, CouncilPersona } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface ArenaChamberProps {
  session: DebateSession;
  persona: CouncilPersona;
  onSubmitTurn: (response: string, mode: 'voice' | 'text', duration: number) => Promise<void>;
  isCouncilThinking: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export const ArenaChamber: React.FC<ArenaChamberProps> = ({
  session,
  persona,
  onSubmitTurn,
  isCouncilThinking,
  voiceEnabled,
  onToggleVoice,
}) => {
  const [inputText, setInputText] = useState('');
  const [modeUsed, setModeUsed] = useState<'voice' | 'text'>('text');
  const [turnStartTime, setTurnStartTime] = useState<number>(Date.now());
  const [countdownSeconds, setCountdownSeconds] = useState<number>(45);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [isCamActive, setIsCamActive] = useState<boolean>(false);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { speak, isSpeaking, stop: stopSpeaking } = useSpeechSynthesis();

  // Reset state when turn changes
  useEffect(() => {
    setTurnStartTime(Date.now());
    setInputText('');
    setCountdownSeconds(45);
    setIsTimerPaused(false);
    resetTranscript();
  }, [session.current_turn, resetTranscript]);

  // Sync speech transcript into input box
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
      setModeUsed('voice');
    }
  }, [transcript]);

  // Countdown timer effect
  useEffect(() => {
    if (isTimerPaused || isCouncilThinking) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused, isCouncilThinking]);

  // Speak question when turn changes
  useEffect(() => {
    const currentTurn = session.turns.find((t) => t.turn_number === session.current_turn);
    if (currentTurn && voiceEnabled) {
      speak(currentTurn.ai_question);
    }
    return () => {
      stopSpeaking();
    };
  }, [session.current_turn, session.turns, voiceEnabled, speak, stopSpeaking]);

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      startListening();
      setModeUsed('voice');
    }
  };

  const handleSubmit = async () => {
    const finalContent = inputText.trim();
    if (!finalContent || isCouncilThinking) return;

    if (isListening) {
      stopListening();
    }

    const duration = Math.round((Date.now() - turnStartTime) / 1000);
    await onSubmitTurn(finalContent, modeUsed, duration);
  };

  const currentTurnObj = session.turns.find((t) => t.turn_number === session.current_turn);
  const aiQuestion =
    currentTurnObj?.ai_question ||
    '“Bạn đã nêu được 2 thành phần mô hình, nhưng chưa giải thích được cơ chế dung hợp đặc trưng (Feature Fusion). Cụ thể ma trận kề trong GNN được khởi tạo ra sao khi đồ thị có hàng triệu node? Bạn đang né tránh phần đánh giá độ phức tạp tính toán!”';

  // Dynamic persona info for the chamber
  const personaSpeakerName =
    currentTurnObj?.council_speaker ||
    (persona === 'feynman'
      ? 'GS. Lê Minh Triết'
      : persona === 'strict_council'
      ? 'GS. Viện sĩ Hoàng Vĩnh'
      : 'PGS. TS. Trần Thu Hà');

  const personaCouncilRole =
    persona === 'feynman'
      ? 'Hội đồng Khoa học Trực quan'
      : persona === 'strict_council'
      ? 'Chủ tịch Hội đồng Stress-Test'
      : 'Hội đồng Viện AI Quốc gia';

  // CoT Thought Process from current turn or previous turn critique
  const prevTurnObj = session.turns.find((t) => t.turn_number === session.current_turn - 1);
  const cotReasoning = prevTurnObj?.ai_thought_process || {
    step1_fact_check:
      'Khái niệm BERT + GNN khớp với luận văn. Tuy nhiên cơ chế Attention-based Fusion tại chương thực nghiệm chưa được thí sinh trình bày định lượng.',
    step2_logic_flaws: [
      'Né tránh con số chi phí tính toán GPU',
      'Chưa giải thích kịch bản tràn bộ nhớ VRAM khi mở rộng đồ thị',
    ],
    step3_rebuttal_strategy:
      'Hội đồng chuyển trọng tâm kiểm tra kỹ thuật lấy mẫu Neighbor Sampling (GraphSAGE) hoặc Cluster-GCN trong môi trường phân tán.',
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}s`;
  };

  return (
    <main className="w-full flex-1 relative z-10 pt-16">
      {/* SESSION STATUS & TIMER BAR */}
      <div className="bg-surface-container-lowest/85 backdrop-blur-md border-b border-surface-container-high/60 py-3.5 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="px-3 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant font-label text-xs font-bold uppercase tracking-wider border border-primary-fixed-dim/50 shadow-xs">
              Lượt {session.current_turn} / {session.max_turns}
            </span>
            <div>
              <h1 className="font-headline font-semibold text-lg sm:text-xl text-on-surface leading-tight">
                Chủ đề: {session.title}
              </h1>
              <p className="text-xs text-on-surface-variant font-body">
                Hội đồng đang kiểm chứng tính hợp lý của phương pháp luận khoa học
              </p>
            </div>
          </div>

          {/* Timer & Session Actions */}
          <div className="flex items-center gap-3 self-end md:self-center">
            {/* Animated Timer Badge */}
            <div className="flex items-center gap-2 bg-surface-container-low border border-primary/20 px-4 py-1.5 rounded-full text-xs font-label text-on-surface shadow-xs anim-timer-tick">
              <span className="material-symbols-outlined text-[17px] text-primary">timer</span>
              <span className="text-on-surface-variant">Thời gian phản xạ:</span>
              <span className="font-bold text-primary font-mono text-sm tracking-wide">
                {formatTimer(countdownSeconds)}
              </span>
            </div>
            <button
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-container-high bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-on-surface-variant">
                {isTimerPaused ? 'play_arrow' : 'pause'}
              </span>
              <span>{isTimerPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-COLUMN LIVE DEBATE ROOM */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ================= CỘT 1: HUMANOID AI EXAMINER LIVE FEED ================= */}
          <section className="lg:col-span-4 flex flex-col">
            <div className="bg-surface-container-lowest/90 backdrop-blur-sm border border-surface-container-high/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full hover-lift">
              <div>
                {/* Live Digital Human Avatar Box */}
                <div className="relative w-full rounded-xl overflow-hidden border border-primary/30 bg-surface-container-highest shadow-sm group">
                  {/* Video Stream Frame */}
                  <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-900">
                    <img
                      alt="AI Examiner Live Avatar"
                      className="w-full h-full object-cover object-center anim-avatar-breathe transition-transform duration-700 group-hover:scale-105"
                      src="/professor_avatar.png"
                    />

                    {/* Top Stream HUD Overlay */}
                    <div className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white z-10">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 anim-live-pulse shadow-sm shadow-emerald-400"></span>
                        <span className="font-label font-bold text-[10px] tracking-wider text-emerald-200 uppercase">
                          AI Examiner Live
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
                            {isCouncilThinking
                              ? 'Đang phân tích suy luận CoT...'
                              : isSpeaking
                              ? 'Đang phát biểu chất vấn'
                              : 'Đang lắng nghe thí sinh'}
                          </span>
                          {(isSpeaking || isCouncilThinking) && (
                            <div className="flex items-end gap-0.5 h-3.5">
                              <span className="w-1 bg-primary-fixed rounded-full wave-bar" style={{ animationDuration: '0.7s' }}></span>
                              <span className="w-1 bg-primary-fixed rounded-full wave-bar" style={{ animationDuration: '1.1s' }}></span>
                              <span className="w-1 bg-primary-fixed rounded-full wave-bar" style={{ animationDuration: '0.85s' }}></span>
                              <span className="w-1 bg-primary-fixed rounded-full wave-bar" style={{ animationDuration: '1.3s' }}></span>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Socratic Council Badge */}
                      <div className="text-right">
                        <span className="text-[10px] font-label font-bold text-slate-300 block">
                          {personaSpeakerName}
                        </span>
                        <span className="text-[9px] font-label text-primary-fixed-dim/90 block">
                          {personaCouncilRole}
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
                      <span className="text-[10px] text-on-surface-variant font-medium">Hoài nghi logic:</span>
                      <span className="px-1.5 py-0.5 rounded bg-error-container/70 text-error text-[10px] font-bold">
                        65%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Voice & Examiner Controls */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <button
                    onClick={onToggleVoice}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-label font-semibold transition-all border shadow-2xs cursor-pointer ${
                      voiceEnabled
                        ? 'bg-primary-fixed/30 hover:bg-primary-fixed/50 text-on-primary-fixed-variant border-primary-fixed-dim/50'
                        : 'bg-surface-container-low text-on-surface-variant border-surface-container-high'
                    }`}
                    title="Bật/Tắt giọng đọc AI"
                  >
                    <span className="material-symbols-outlined text-[15px] text-primary">
                      {voiceEnabled ? 'volume_up' : 'volume_off'}
                    </span>
                    <span>{voiceEnabled ? 'Giọng AI (Bật)' : 'Giọng AI (Tắt)'}</span>
                  </button>

                  <button
                    onClick={() => stopSpeaking()}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-[11px] font-label font-semibold transition-all border border-surface-container-high/80 shadow-2xs cursor-pointer"
                    title="Tạm dừng giọng nói AI"
                  >
                    <span className="material-symbols-outlined text-[15px] text-on-surface-variant">
                      pause_circle
                    </span>
                    <span>Dừng giọng</span>
                  </button>

                  <button
                    onClick={() => setIsCamActive(!isCamActive)}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-label font-semibold transition-all border shadow-2xs cursor-pointer ${
                      isCamActive
                        ? 'bg-secondary-fixed/50 text-secondary border-secondary/40'
                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-surface-container-high/80'
                    }`}
                    title="Bật camera sinh viên đối ứng"
                  >
                    <span className="material-symbols-outlined text-[15px] text-secondary">videocam</span>
                    <span>{isCamActive ? 'Cam Đang Bật' : 'Cam SV đối ứng'}</span>
                  </button>
                </div>

                {/* Live Subtitles & Question Speech Bubble */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-label mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-secondary">
                      <span className="material-symbols-outlined text-base">closed_caption</span>
                      <span className="tracking-wide uppercase text-[11px]">
                        Phụ đề chất vấn trực tiếp (Live Captions)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Sync: 12ms
                    </span>
                  </div>
                  <div className="relative bg-surface-container-low/80 border-l-4 border-primary rounded-r-2xl rounded-bl-2xl p-4 shadow-xs border-y border-r border-surface-container-high/50">
                    <blockquote className="font-headline text-on-surface text-base italic leading-relaxed">
                      {aiQuestion}
                    </blockquote>
                  </div>
                </div>
              </div>

              {/* Bottom Examiner Status */}
              <div className="mt-4 pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span>
                    AI Vision Tracking: <strong>Đang quan sát sinh viên</strong>
                  </span>
                </div>
                <button
                  onClick={() => speak(aiQuestion)}
                  className="p-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent"
                  title="Nghe lại câu hỏi"
                >
                  <span className="material-symbols-outlined text-base">replay</span>
                </button>
              </div>
            </div>
          </section>

          {/* ================= CỘT 2: TIẾN TRÌNH PHÂN TÍCH AI CoT 3 BƯỚC ================= */}
          <section className="lg:col-span-4 flex flex-col">
            <div className="bg-surface-container-lowest/90 backdrop-blur-sm border border-surface-container-high/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full hover-lift">
              <div>
                {/* Column Header with AI CoT Active Pill */}
                <div className="flex items-center justify-between pb-4 border-b border-surface-container-high/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-lg">psychology</span>
                    </div>
                    <div>
                      <h2 className="font-headline font-semibold text-lg text-on-surface leading-none">
                        Tiến trình Phân tích AI
                      </h2>
                      <span className="font-label text-[10px] text-on-surface-variant font-medium">
                        Chain-of-Thought Suy luận sâu ngầm
                      </span>
                    </div>
                  </div>
                  <span className="font-label text-[11px] font-bold text-primary bg-primary-fixed/40 px-2.5 py-1 rounded-full border border-primary-fixed-dim/50 flex items-center gap-1.5 anim-pulse-ring">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    <span>CoT Thời gian thực</span>
                  </span>
                </div>

                {/* 3-Step Reasoning Pipeline */}
                <div className="mt-4 flex flex-col gap-3.5">
                  {/* BƯỚC 1: FACT CHECK */}
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary-fixed/15 hover:border-primary/40 transition-all relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-label text-xs font-bold text-primary flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-[10px] font-bold shadow-2xs">
                          1
                        </span>
                        Kiểm chứng dữ liệu gốc
                      </span>
                      <span className="font-label text-[11px] text-primary font-bold px-2 py-0.5 rounded-full bg-surface-container-lowest shadow-2xs border border-primary/15">
                        Khớp 82%
                      </span>
                    </div>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      {cotReasoning.step1_fact_check ||
                        'Khái niệm BERT + GNN khớp với luận văn. Thí sinh cần giải trình rõ cơ chế Attention-based Fusion.'}
                    </p>
                  </div>

                  {/* BƯỚC 2: LOGIC CHECK */}
                  <div className="p-4 rounded-xl border border-secondary/30 bg-secondary-fixed/20 hover:border-secondary/50 transition-all relative ring-1 ring-secondary/20 anim-timer-tick">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-label text-xs font-bold text-secondary flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                          2
                        </span>
                        Bắt bài ngụy biện / Lỗ hổng
                      </span>
                      <span className="font-label text-[11px] text-error font-bold px-2 py-0.5 rounded-full bg-error-container/80 shadow-2xs border border-error/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                        Né tránh câu hỏi
                      </span>
                    </div>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      {Array.isArray(cotReasoning.step2_logic_flaws)
                        ? cotReasoning.step2_logic_flaws.join('; ')
                        : cotReasoning.step2_logic_flaws ||
                          'Thí sinh chưa nêu giải pháp cho vấn đề tràn VRAM khi mở rộng kích thước đồ thị (Độ phức tạp O(V+E) so với O(V²)).'}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-secondary/20 flex items-center justify-between text-[11px] font-label text-secondary">
                      <span className="flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                        Đang xử lý phân tích logic phản hồi
                      </span>
                      <span className="text-[10px] text-on-surface-variant">Trọng số: Cao</span>
                    </div>
                  </div>

                  {/* BƯỚC 3: CHIẾN THUẬT VẤN ĐÁP SOCRATIC */}
                  <div className="p-4 rounded-xl border border-tertiary/20 bg-tertiary-fixed/20 hover:border-tertiary/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-label text-xs font-bold text-tertiary flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-tertiary text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                          3
                        </span>
                        Chiến thuật vấn đáp Socratic
                      </span>
                      <span className="font-label text-[11px] text-tertiary font-bold px-2 py-0.5 rounded-full bg-surface-container-lowest shadow-2xs border border-tertiary/15">
                        Mục tiêu xoáy sâu
                      </span>
                    </div>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      {cotReasoning.step3_rebuttal_strategy ||
                        'Hội đồng chuyển trọng tâm kiểm tra kỹ thuật lấy mẫu GraphSAGE hoặc Cluster-GCN trong môi trường phân tán.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Note */}
              <div className="mt-4 pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-primary">hub</span>
                  Mô hình suy luận: Gemini 3.8 CoT
                </span>
                <span className="text-primary font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Đã đồng bộ thời gian thực
                </span>
              </div>
            </div>
          </section>

          {/* ================= CỘT 3: PHÁT BIỂU CỦA THÍ SINH ================= */}
          <section className="lg:col-span-4 flex flex-col">
            <div className="bg-surface-container-lowest/90 backdrop-blur-sm border border-surface-container-high/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full hover-lift">
              <div>
                {/* Header with Live Recording Status */}
                <div className="flex items-center justify-between pb-3.5 border-b border-surface-container-high/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                    <h3 className="font-headline font-semibold text-lg text-on-surface">Phát biểu của bạn</h3>
                  </div>
                  <button
                    onClick={handleMicToggle}
                    className={`px-2.5 py-1 rounded-full font-label font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer border ${
                      isListening
                        ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse'
                        : 'bg-surface-container-low text-on-surface-variant border-surface-container-high hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">mic</span>
                    <span>{isListening ? 'Đang thu âm trực tiếp' : 'Bật Micro thu âm'}</span>
                  </button>
                </div>

                {/* Dynamic Animated Soundwave Waveform */}
                <div className="my-3.5 p-3 rounded-xl bg-surface-container-low/70 border border-surface-container-high/60 flex items-center justify-center gap-1.5 h-14 relative overflow-hidden">
                  <div className="w-1.5 bg-primary/40 rounded-full wave-bar"></div>
                  <div className="w-1.5 bg-primary rounded-full wave-bar"></div>
                  <div className="w-1.5 bg-primary rounded-full wave-bar"></div>
                  <div className="w-1.5 bg-secondary rounded-full wave-bar"></div>
                  <div className="w-1.5 bg-primary rounded-full wave-bar"></div>
                  <div className="w-1.5 bg-secondary rounded-full wave-bar"></div>
                  <div className="w-1.5 bg-primary rounded-full wave-bar"></div>
                  <div className="w-1.5 bg-primary/50 rounded-full wave-bar"></div>
                </div>

                {/* Real-time Latency & Speaking Pace Telemetry */}
                <div className="mb-3 p-2.5 rounded-xl bg-surface-container-low/50 border border-surface-container-high/50 grid grid-cols-2 gap-2 text-xs font-label">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary">speed</span>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Nhịp độ nói:</span>
                      <span className="font-bold text-on-surface">
                        128 từ/phút <span className="text-emerald-700 font-normal text-[10px]">(Ổn định)</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-l border-surface-container-high pl-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Độ trễ phản xạ:</span>
                      <span className="font-bold text-on-surface">
                        0.42s <span className="text-primary font-normal text-[10px]">(Xuất sắc)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transcription & Direct Response Area */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-label">
                    <label className="font-semibold text-on-surface" htmlFor="responseInput">
                      Nội dung phản biện trực tiếp (Giọng nói hoặc Gõ tay)
                    </label>
                    <span className="text-[11px] text-on-surface-variant font-medium">Tự động nhận dạng</span>
                  </div>
                  <div className="relative rounded-xl border border-surface-container-high bg-surface-container-lowest p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-fixed/50 transition-all shadow-xs">
                    <textarea
                      id="responseInput"
                      rows={4}
                      value={inputText}
                      onChange={(e) => {
                        setInputText(e.target.value);
                        setModeUsed('text');
                      }}
                      className="w-full bg-transparent text-on-surface text-sm focus:outline-none resize-none leading-relaxed border-none p-0 font-body placeholder:text-on-surface-variant/60"
                      placeholder="Nói vào micro hoặc nhập câu trả lời của bạn tại đây... (Ví dụ: Thưa hội đồng, đối với đồ thị quy mô lớn, nhóm chúng em áp dụng Neighbor Sampling...)"
                    />
                  </div>
                </div>

                {/* PREP Structure Recommendation Box */}
                <div className="mt-3.5 p-3 rounded-xl bg-surface-container-low/60 border border-surface-container-high/60">
                  <div className="flex items-center gap-1.5 mb-1 text-primary">
                    <span className="material-symbols-outlined text-[16px]">tips_and_updates</span>
                    <span className="font-label text-[11px] font-bold uppercase tracking-wider">
                      Mẹo trả lời theo cấu trúc PREP
                    </span>
                  </div>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">P</strong>oint (Luận điểm) →{' '}
                    <strong className="text-on-surface">R</strong>eason (Lý do kỹ thuật) →{' '}
                    <strong className="text-on-surface">E</strong>xample (Dẫn chứng thực nghiệm) →{' '}
                    <strong className="text-on-surface">P</strong>oint (Chốt kết luận).
                  </p>
                </div>
              </div>

              {/* Submit Response CTA Button */}
              <div className="mt-5 pt-3 border-t border-surface-container-high/60">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!inputText.trim() || isCouncilThinking}
                  className="w-full py-3.5 px-5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all hover:shadow-lg active:scale-[0.99] cursor-pointer border-none disabled:opacity-50"
                >
                  {isCouncilThinking ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                      <span>Hội đồng đang bóc tách luận điểm...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">send</span>
                      <span>Gửi phát biểu cho Hội đồng</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

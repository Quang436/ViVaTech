import React, { useState, useEffect } from 'react';
import type { DebateSession, CouncilPersona } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { LiveAiExaminer } from './LiveAiExaminer';

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
  const [firstInputTime, setFirstInputTime] = useState<number | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(60);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [isCamActive, setIsCamActive] = useState<boolean>(false);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const {
    speak,
    isSpeaking,
    audioVolume,
    stop: stopSpeaking,
    currentVoice,
    setCurrentVoice,
    voiceOptions,
  } = useSpeechSynthesis();

  useEffect(() => {
    if (persona === 'academic_reviewer') {
      setCurrentVoice('vi-VN-HoaiMyNeural');
    } else {
      setCurrentVoice('vi-VN-NamMinhNeural');
    }
  }, [persona, setCurrentVoice]);

  // Reset state when turn changes
  useEffect(() => {
    setTurnStartTime(Date.now());
    setFirstInputTime(null);
    setInputText('');
    setCountdownSeconds(60);
    setIsTimerPaused(false);
    resetTranscript();
  }, [session.current_turn, resetTranscript]);

  // Sync speech transcript into input box
  useEffect(() => {
    if (transcript) {
      if (!firstInputTime) setFirstInputTime(Date.now());
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

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      if (!firstInputTime) setFirstInputTime(Date.now());
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

    const duration = Math.max(1, Math.round((Date.now() - turnStartTime) / 1000));
    await onSubmitTurn(finalContent, modeUsed, duration);
  };

  const currentTurnObj = session.turns.find((t) => t.turn_number === session.current_turn);
  const prevTurnObj = session.turns.find((t) => t.turn_number === session.current_turn - 1);

  const aiQuestion = currentTurnObj?.ai_question || '';

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

  // Lấy CoT thực tế từ lượt hiện tại hoặc lượt trước (từ Gemini AI)
  const cotReasoning = currentTurnObj?.ai_thought_process || prevTurnObj?.ai_thought_process;
  const latestAccuracy = prevTurnObj?.ground_truth_accuracy ?? currentTurnObj?.ground_truth_accuracy;
  const latestFlaws =
    (prevTurnObj?.logic_flaws && prevTurnObj.logic_flaws.length > 0
      ? prevTurnObj.logic_flaws
      : currentTurnObj?.logic_flaws) || [];

  // Tính toán thông số phản xạ & tốc độ phát biểu thật theo thời gian thực
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const activeSeconds = firstInputTime
    ? Math.max(1, (Date.now() - firstInputTime) / 1000)
    : 0;
  const realWpm = wordCount > 0 && activeSeconds > 0 ? Math.round((wordCount / activeSeconds) * 60) : 0;
  const reactionDelaySec = firstInputTime
    ? ((firstInputTime - turnStartTime) / 1000).toFixed(2)
    : null;

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
                {session.document_name
                  ? `Đối soát RAG trên tài liệu: ${session.document_name}`
                  : 'Phiên chất vấn trực tiếp với Hội đồng Gemini AI'}
              </p>
            </div>
          </div>

          {/* Timer & Session Actions */}
          <div className="flex items-center gap-3 self-end md:self-center">
            <div className="flex items-center gap-2 bg-surface-container-low border border-primary/20 px-4 py-1.5 rounded-full text-xs font-label text-on-surface shadow-xs anim-timer-tick">
              <span className="material-symbols-outlined text-[17px] text-primary">timer</span>
              <span className="text-on-surface-variant">Thời gian lượt:</span>
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
          <section className="lg:col-span-4 flex flex-col gap-4">
            <LiveAiExaminer
              speakerName={personaSpeakerName}
              councilRole={personaCouncilRole}
              isSpeaking={isSpeaking}
              isThinking={isCouncilThinking}
              audioVolume={audioVolume}
              triggerQuestion={aiQuestion}
              textToSpeak={aiQuestion}
              voiceEnabled={voiceEnabled}
              onToggleVoice={onToggleVoice}
              onStopVoice={stopSpeaking}
              currentVoice={currentVoice}
              onChangeVoice={(v) => {
                setCurrentVoice(v);
              }}
              voiceOptions={voiceOptions}
            />

            {/* Live Subtitles & Question Speech Bubble */}
            <div className="bg-surface-container-lowest/90 backdrop-blur-sm border border-surface-container-high/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-label mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-secondary">
                    <span className="material-symbols-outlined text-base">closed_caption</span>
                    <span className="tracking-wide uppercase text-[11px]">
                      Câu hỏi chất vấn từ Hội đồng (Lượt {session.current_turn})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => speak(aiQuestion)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-fixed/30 hover:bg-primary-fixed/50 text-primary text-[11px] font-label font-bold transition-all border border-primary/20 cursor-pointer"
                      title="Nghe lại câu hỏi bằng giọng đọc AI"
                    >
                      <span className="material-symbols-outlined text-[13px]">volume_up</span>
                      <span>Nghe lại</span>
                    </button>
                  </div>
                </div>

                {prevTurnObj?.critique_comment && (
                  <div className="mb-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs font-body text-amber-900">
                    <strong className="font-label">Nhận xét lượt {prevTurnObj.turn_number}: </strong>
                    {prevTurnObj.critique_comment}
                  </div>
                )}

                <div className="relative bg-surface-container-low/80 border-l-4 border-primary rounded-r-2xl rounded-bl-2xl p-4 shadow-xs border-y border-r border-surface-container-high/50">
                  <blockquote className="font-headline text-on-surface text-base italic leading-relaxed">
                    {aiQuestion}
                  </blockquote>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>
                    Giám khảo: <strong>{personaSpeakerName}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setIsCamActive(!isCamActive)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-label font-semibold border transition-all cursor-pointer ${
                    isCamActive
                      ? 'bg-secondary-fixed/50 text-secondary border-secondary/40'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant border-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">videocam</span>
                  <span>{isCamActive ? 'Cam Bật' : 'Cam SV'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* ================= CỘT 2: TIẾN TRÌNH PHÂN TÍCH AI CoT 3 BƯỚC THẬT ================= */}
          <section className="lg:col-span-4 flex flex-col">
            <div className="bg-surface-container-lowest/90 backdrop-blur-sm border border-surface-container-high/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full hover-lift">
              <div>
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
                        Chain-of-Thought thực tế từ Gemini AI
                      </span>
                    </div>
                  </div>
                  <span className="font-label text-[11px] font-bold text-primary bg-primary-fixed/40 px-2.5 py-1 rounded-full border border-primary-fixed-dim/50 flex items-center gap-1.5 anim-pulse-ring">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    <span>{isCouncilThinking ? 'Đang suy luận...' : 'CoT Thực tế'}</span>
                  </span>
                </div>

                {/* 3-Step Real Reasoning Pipeline */}
                <div className="mt-4 flex flex-col gap-3.5">
                  {/* BƯỚC 1: FACT CHECK */}
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary-fixed/15 hover:border-primary/40 transition-all relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-label text-xs font-bold text-primary flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-[10px] font-bold shadow-2xs">
                          1
                        </span>
                        Đối chiếu Ground Truth
                      </span>
                      <span className="font-label text-[11px] text-primary font-bold px-2 py-0.5 rounded-full bg-surface-container-lowest shadow-2xs border border-primary/15">
                        {typeof latestAccuracy === 'number' && latestAccuracy > 0
                          ? `Độ chính xác: ${latestAccuracy}%`
                          : 'Lượt mở màn'}
                      </span>
                    </div>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      {cotReasoning?.step1_fact_check ||
                        `Đang đối chiếu đề tài "${session.title}" với cơ sở tri thức để kiểm chứng câu trả lời của thí sinh.`}
                    </p>
                  </div>

                  {/* BƯỚC 2: LOGIC CHECK */}
                  <div className="p-4 rounded-xl border border-secondary/30 bg-secondary-fixed/20 hover:border-secondary/50 transition-all relative ring-1 ring-secondary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-label text-xs font-bold text-secondary flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                          2
                        </span>
                        Phát hiện lỗ hổng / Trọng tâm
                      </span>
                      <span className="font-label text-[11px] text-secondary font-bold px-2 py-0.5 rounded-full bg-surface-container-lowest shadow-2xs border border-secondary/20">
                        {latestFlaws.length > 0
                          ? `${latestFlaws.length} điểm lưu ý`
                          : 'Phân tích logic'}
                      </span>
                    </div>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      {Array.isArray(cotReasoning?.step2_logic_flaws) &&
                      cotReasoning.step2_logic_flaws.length > 0
                        ? cotReasoning.step2_logic_flaws.join(' • ')
                        : latestFlaws.length > 0
                        ? latestFlaws.join(' • ')
                        : 'Chờ thí sinh gửi phản hồi để phân tích các lỗ hổng lập luận hoặc ngụy biện.'}
                    </p>
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
                        Lượt {session.current_turn}/{session.max_turns}
                      </span>
                    </div>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      {cotReasoning?.step3_rebuttal_strategy ||
                        `Tập trung kiểm tra chiều sâu học thuật và tính khả thi thực nghiệm của đề tài "${session.title}".`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-primary">hub</span>
                  Phiên: #{session.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-primary font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Dữ liệu CoT thời gian thực
                </span>
              </div>
            </div>
          </section>

          {/* ================= CỘT 3: PHÁT BIỂU CỦA THÍ SINH ================= */}
          <section className="lg:col-span-4 flex flex-col">
            <div className="bg-surface-container-lowest/90 backdrop-blur-sm border border-surface-container-high/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full hover-lift">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-surface-container-high/60">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isListening ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                      }`}
                    ></span>
                    <h3 className="font-headline font-semibold text-lg text-on-surface">
                      Phát biểu của bạn
                    </h3>
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

                {/* Dynamic Soundwave */}
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

                {/* Real-time Telemetry */}
                <div className="mb-3 p-2.5 rounded-xl bg-surface-container-low/50 border border-surface-container-high/50 grid grid-cols-2 gap-2 text-xs font-label">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      speed
                    </span>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">
                        Số từ & tốc độ:
                      </span>
                      <span className="font-bold text-on-surface">
                        {wordCount} từ{' '}
                        <span className="text-emerald-700 font-normal text-[10px]">
                          ({realWpm > 0 ? `${realWpm} từ/phút` : 'Đang chờ'})
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-l border-surface-container-high pl-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">
                        Phản xạ lượt này:
                      </span>
                      <span className="font-bold text-on-surface">
                        {reactionDelaySec ? `${reactionDelaySec}s` : 'Chưa nhập'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transcription & Direct Response Area */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-label">
                    <label className="font-semibold text-on-surface" htmlFor="responseInput">
                      Nội dung trả lời (Giọng nói hoặc Gõ văn bản)
                    </label>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      Chế độ: {modeUsed === 'voice' ? 'Giọng nói (STT)' : 'Văn bản'}
                    </span>
                  </div>
                  <div className="relative rounded-xl border border-surface-container-high bg-surface-container-lowest p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-fixed/50 transition-all shadow-xs">
                    <textarea
                      id="responseInput"
                      rows={4}
                      value={inputText}
                      onChange={(e) => {
                        if (!firstInputTime) setFirstInputTime(Date.now());
                        setInputText(e.target.value);
                        setModeUsed('text');
                      }}
                      className="w-full bg-transparent text-on-surface text-sm focus:outline-none resize-none leading-relaxed border-none p-0 font-body placeholder:text-on-surface-variant/60"
                      placeholder="Nói vào micro hoặc nhập câu trả lời thực tế của bạn cho câu hỏi trên..."
                    />
                  </div>
                </div>

                {/* PREP Structure Recommendation Box */}
                <div className="mt-3.5 p-3 rounded-xl bg-surface-container-low/60 border border-surface-container-high/60">
                  <div className="flex items-center gap-1.5 mb-1 text-primary">
                    <span className="material-symbols-outlined text-[16px]">tips_and_updates</span>
                    <span className="font-label text-[11px] font-bold uppercase tracking-wider">
                      Cấu trúc trả lời khuyến nghị (PREP)
                    </span>
                  </div>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">P</strong>oint (Luận điểm) →{' '}
                    <strong className="text-on-surface">R</strong>eason (Cơ sở lý thuyết) →{' '}
                    <strong className="text-on-surface">E</strong>xample (Số liệu thực nghiệm) →{' '}
                    <strong className="text-on-surface">P</strong>oint (Kết luận).
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
                      <span>Gemini AI đang chấm & sinh câu hỏi tiếp...</span>
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

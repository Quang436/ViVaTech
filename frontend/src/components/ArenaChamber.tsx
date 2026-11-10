import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  Gauge,
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  Pause,
  Play,
  Send,
  Timer,
  Zap,
} from 'lucide-react';
import type { DebateSession, CouncilPersona } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { LiveAiExaminer } from './LiveAiExaminer';

interface ArenaChamberProps {
  session: DebateSession;
  persona: CouncilPersona;
  onSubmitTurn: (response: string, mode: 'voice' | 'text', duration: number) => Promise<void>;
  onFinishEarly?: () => Promise<void> | void;
  isCouncilThinking: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export const ArenaChamber: React.FC<ArenaChamberProps> = ({
  session,
  persona,
  onSubmitTurn,
  onFinishEarly,
  isCouncilThinking,
  voiceEnabled,
  onToggleVoice,
}) => {
  const [inputText, setInputText] = useState('');
  const [modeUsed, setModeUsed] = useState<'voice' | 'text'>('text');
  const [elapsedTurnSeconds, setElapsedTurnSeconds] = useState<number>(1);
  const [firstInputOffsetSec, setFirstInputOffsetSec] = useState<number | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(60);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const turnStartTimeRef = useRef<number>(0);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition();

  const {
    isSpeaking: isFallbackSpeaking,
    audioVolume,
    speak: speakFallback,
    stop: stopSpeaking,
    currentVoice,
    setCurrentVoice,
  } = useSpeechSynthesis();

  useEffect(() => {
    if (persona === 'academic_reviewer') {
      setCurrentVoice('vi-VN-HoaiMyNeural');
    } else {
      setCurrentVoice('vi-VN-NamMinhNeural');
    }
  }, [persona, setCurrentVoice]);

  // Reset per debate turn
  useEffect(() => {
    turnStartTimeRef.current = Date.now();
    setElapsedTurnSeconds(1);
    setFirstInputOffsetSec(null);
    setInputText('');
    setCountdownSeconds(60);
    setIsTimerPaused(false);
    resetTranscript();
  }, [session.current_turn, resetTranscript]);

  // Sync voice transcript to response input
  useEffect(() => {
    if (transcript) {
      const startMs = turnStartTimeRef.current || Date.now();
      setFirstInputOffsetSec((prev) => prev ?? Math.max(0.1, (Date.now() - startMs) / 1000));
      setInputText(transcript);
      setModeUsed('voice');
    }
  }, [transcript]);

  // Reaction timer countdown
  useEffect(() => {
    if (isTimerPaused || isCouncilThinking) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      setElapsedTurnSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused, isCouncilThinking]);

  const handleMicToggle = () => {
    if (!isSpeechSupported) {
      setMicNotice(
        'Trình duyệt hiện tại không hỗ trợ nhận diện giọng nói trực tiếp (Web Speech API). Vui lòng nhập nội dung phản biện vào ô bên dưới.'
      );
      return;
    }
    setMicNotice(null);
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      const startMs = turnStartTimeRef.current || Date.now();
      setFirstInputOffsetSec((prev) => prev ?? Math.max(0.1, (Date.now() - startMs) / 1000));
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
    stopSpeaking();

    const startMs = turnStartTimeRef.current || Date.now();
    const duration = Math.max(1, Math.round((Date.now() - startMs) / 1000));
    await onSubmitTurn(finalContent, modeUsed, duration);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void handleSubmit();
  };

  // IME-safe Enter-to-submit handler (keeps Shift+Enter for multiline typing)
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (e.nativeEvent.isComposing || e.keyCode === 229) {
        return;
      }
      e.currentTarget.form?.requestSubmit();
    }
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

  // Live CoT data from current or previous answered turn (never invented)
  const activeCot = currentTurnObj?.ai_thought_process ?? prevTurnObj?.ai_thought_process;
  const latestAccuracy =
    currentTurnObj?.student_response?.trim() &&
    typeof currentTurnObj.ground_truth_accuracy === 'number'
      ? currentTurnObj.ground_truth_accuracy
      : prevTurnObj?.student_response?.trim() &&
        typeof prevTurnObj.ground_truth_accuracy === 'number'
      ? prevTurnObj.ground_truth_accuracy
      : null;
  const latestFlaws =
    (currentTurnObj?.logic_flaws && currentTurnObj.logic_flaws.length > 0
      ? currentTurnObj.logic_flaws
      : prevTurnObj?.logic_flaws) || [];

  const hasAnsweredTurn = (session.turns || []).some((t) => Boolean(t.student_response?.trim()));

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const activeSeconds =
    firstInputOffsetSec !== null
      ? Math.max(1, elapsedTurnSeconds - firstInputOffsetSec)
      : Math.max(1, elapsedTurnSeconds);
  const wordsPerMinute = wordCount > 0 ? Math.round((wordCount / activeSeconds) * 60) : 0;
  const latencySec = firstInputOffsetSec !== null ? `${firstInputOffsetSec.toFixed(2)}s` : '--';

  const isLowTime = countdownSeconds <= 15;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="w-full flex-1 flex flex-col relative z-10 outline-none"
    >
      {/* ================= SESSION STATUS & TIMER BAR ================= */}
      <div className="bg-white/90 backdrop-blur-md border-b border-[rgba(10,20,19,0.08)] py-4">
        <div className="mint-wrap flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="mint-tag mint shrink-0">
              Lượt {session.current_turn} / {session.max_turns}
            </span>
            <div className="min-w-0">
              <h1 className="font-sans font-semibold text-base sm:text-lg text-[#0a1413] leading-tight truncate">
                Chủ đề: {session.title}
              </h1>
              <p className="text-xs text-[#465754] font-sans mt-0.5">
                Hội đồng đang kiểm chứng tính hợp lý của phương pháp luận khoa học
              </p>
            </div>
          </div>

          {/* Timer & Session Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center shrink-0">
            <div
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-sans border ${
                isLowTime
                  ? 'bg-[#ffe4e6] border-[#be123c]/30 text-[#881337]'
                  : 'bg-[#eff5f3] border-[rgba(11,110,94,0.22)] text-[#0a1413]'
              }`}
            >
              <Timer
                className={`w-4 h-4 ${isLowTime ? 'text-[#be123c]' : 'text-[#0b6e5e]'}`}
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="text-[#465754]">Phản xạ:</span>
              <span
                className={`font-bold font-mono text-sm tracking-wide ${
                  isLowTime ? 'text-[#be123c]' : 'text-[#0b6e5e]'
                }`}
              >
                00:{countdownSeconds < 10 ? `0${countdownSeconds}` : countdownSeconds}s
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border font-sans text-xs font-medium transition-all cursor-pointer ${
                isTimerPaused
                  ? 'border-[rgba(11,110,94,0.3)] bg-[rgba(110,231,200,0.24)] text-[#064037]'
                  : 'border-[rgba(10,20,19,0.14)] bg-white hover:bg-[#eff5f3] text-[#0a1413]'
              }`}
            >
              {isTimerPaused ? (
                <Play className="w-3.5 h-3.5" strokeWidth={2.1} aria-hidden="true" />
              ) : (
                <Pause className="w-3.5 h-3.5" strokeWidth={2.1} aria-hidden="true" />
              )}
              <span>{isTimerPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
            </button>
            {onFinishEarly && hasAnsweredTurn && (
              <button
                type="button"
                disabled={isCouncilThinking}
                onClick={() => void onFinishEarly()}
                className="btn-mint-ghost h-8 px-3.5 text-xs cursor-pointer disabled:opacity-50"
              >
                <span>Kết thúc &amp; Chấm điểm</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= 3-COLUMN LIVE DEBATE ROOM ================= */}
      <div className="mint-wrap py-7 sm:py-9 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* CỘT 1: HUMANOID AI EXAMINER (WEBRTC STREAMING + TTS FALLBACK) */}
          <section className="lg:col-span-4 flex flex-col" aria-label="Giám khảo AI trực tiếp">
            <LiveAiExaminer
              speakerName={personaSpeakerName}
              councilRole={personaCouncilRole}
              triggerQuestion={aiQuestion}
              isSpeaking={isFallbackSpeaking}
              isThinking={isCouncilThinking}
              audioVolume={audioVolume}
              voiceEnabled={voiceEnabled}
              onToggleVoice={onToggleVoice}
              onStopVoice={stopSpeaking}
              onFallbackSpeak={(text) => {
                void speakFallback(text);
              }}
              currentVoice={currentVoice}
            />
          </section>

          {/* CỘT 2: TIẾN TRÌNH PHÂN TÍCH AI CoT 3 BƯỚC */}
          <section className="lg:col-span-4 flex flex-col">
            <div className="mint-card mint-card-hover p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[rgba(10,20,19,0.08)] gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[rgba(110,231,200,0.22)] border border-[rgba(11,110,94,0.2)] flex items-center justify-center text-[#085448]">
                      <BrainCircuit className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-sans font-semibold text-base sm:text-lg text-[#0a1413] leading-none">
                        Tiến trình Phân tích AI
                      </h2>
                      <span className="font-mono text-[11px] text-[#556361] mt-1 block">
                        Suy luận CoT thời gian thực
                      </span>
                    </div>
                  </div>
                  <span className="mint-tag mint shrink-0">CoT Active</span>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  {/* BƯỚC 1: ĐỐI CHIẾU TÀI LIỆU */}
                  <div className="p-3.5 rounded-2xl border border-[rgba(11,110,94,0.22)] bg-[rgba(110,231,200,0.12)]">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className="font-sans text-xs font-semibold text-[#085448] flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#085448] text-white font-mono flex items-center justify-center text-[10px]">
                          1
                        </span>
                        Đối chiếu tài liệu
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-[#085448] bg-white px-2.5 py-0.5 rounded-full border border-[rgba(11,110,94,0.2)]">
                        {latestAccuracy !== null ? `Khớp ${latestAccuracy}%` : 'Chờ phản hồi'}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#465754] leading-relaxed">
                      {activeCot?.step1_fact_check
                        ? activeCot.step1_fact_check
                        : 'Đang đối chiếu câu hỏi và lập luận của bạn với các phân đoạn RAG trong tài liệu đề án.'}
                    </p>
                  </div>

                  {/* BƯỚC 2: ĐIỂM CẦN LÀM RÕ */}
                  <div className="p-3.5 rounded-2xl border border-[rgba(3,105,161,0.2)] bg-[#e0f2fe]/55">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className="font-sans text-xs font-semibold text-[#0369a1] flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#0369a1] text-white font-mono flex items-center justify-center text-[10px]">
                          2
                        </span>
                        Điểm cần làm rõ
                      </span>
                      <span
                        className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${
                          latestFlaws.length > 0
                            ? 'text-[#be123c] bg-[#ffe4e6] border-[#be123c]/25'
                            : 'text-[#0369a1] bg-white border-[rgba(3,105,161,0.2)]'
                        }`}
                      >
                        {latestFlaws.length > 0 ? 'Phát hiện lỗ hổng' : 'Điểm xoáy sâu'}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#465754] leading-relaxed">
                      {latestFlaws.length > 0
                        ? latestFlaws[0]
                        : 'Cần làm rõ cơ chế phương pháp luận, bằng chứng thực nghiệm và giới hạn triển khai thực tế.'}
                    </p>
                  </div>

                  {/* BƯỚC 3: HƯỚNG TRUY VẤN TIẾP THEO */}
                  <div className="p-3.5 rounded-2xl border border-[rgba(10,20,19,0.1)] bg-[#eff5f3]">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className="font-sans text-xs font-semibold text-[#0a1413] flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#0a1413] text-white font-mono flex items-center justify-center text-[10px]">
                          3
                        </span>
                        Hướng truy vấn tiếp theo
                      </span>
                      <span className="text-[11px] font-mono font-medium text-[#334155] bg-white px-2.5 py-0.5 rounded-full border border-[rgba(10,20,19,0.1)]">
                        Socratic
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#465754] leading-relaxed">
                      {activeCot?.step3_rebuttal_strategy
                        ? activeCot.step3_rebuttal_strategy
                        : 'Kiểm tra khả năng chịu áp lực với trường hợp biên (Edge Cases) và bảo vệ luận điểm dưới góc nhìn phản biện.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[rgba(10,20,19,0.08)] flex items-center justify-between text-xs font-sans text-[#465754]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6ee7c8] border border-[#0b6e5e]" aria-hidden="true" />
                  Đồng bộ dữ liệu phiên bảo vệ
                </span>
                <span className="text-[#0b6e5e] font-mono text-[11px] font-medium">Tự động cập nhật</span>
              </div>
            </div>
          </section>

          {/* CỘT 3: PHÁT BIỂU CỦA THÍ SINH */}
          <section className="lg:col-span-4 flex flex-col">
            <form
              onSubmit={handleFormSubmit}
              className="mint-card mint-card-hover p-6 flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(10,20,19,0.08)] gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isListening
                          ? 'bg-[#be123c] anim-live-pulse'
                          : 'bg-[#6ee7c8] border border-[#0b6e5e]'
                      }`}
                      aria-hidden="true"
                    />
                    <h2 className="font-sans font-semibold text-base sm:text-lg text-[#0a1413]">
                      Phát biểu của bạn
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleMicToggle}
                    className={`px-3 py-1.5 rounded-full border font-sans font-medium text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                      isListening
                        ? 'bg-[#ffe4e6] text-[#be123c] border-[#be123c]/30'
                        : 'bg-[#eff5f3] text-[#0a1413] hover:bg-[#e8f0ed] border-[rgba(10,20,19,0.12)]'
                    }`}
                  >
                    {isListening ? (
                      <Mic className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                    ) : (
                      <MicOff className="w-3.5 h-3.5 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
                    )}
                    <span>{isListening ? 'Dừng thu âm' : 'Bật Micro'}</span>
                  </button>
                </div>

                <div className="my-4 flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#eff5f3] border border-[rgba(10,20,19,0.08)] text-xs font-sans text-[#465754]">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-[#0369a1]" strokeWidth={2} aria-hidden="true" />
                    <span>
                      Tốc độ:{' '}
                      <strong className="text-[#0a1413] font-mono font-semibold">
                        {wordCount > 0 ? `${wordsPerMinute} từ/phút` : '--'}
                      </strong>
                    </span>
                  </div>
                  <div className="h-3.5 w-px bg-[rgba(10,20,19,0.12)]" aria-hidden="true" />
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
                    <span>
                      Độ trễ:{' '}
                      <strong className="text-[#0a1413] font-mono font-semibold">{latencySec}</strong>
                    </span>
                  </div>
                </div>

                {micNotice && (
                  <div
                    role="status"
                    className="mb-3 p-2.5 rounded-xl bg-[#fef3c7] border border-[rgba(180,83,9,0.24)] text-[11px] font-sans text-[#78350f]"
                  >
                    {micNotice}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-sans gap-2 flex-wrap">
                    <label className="font-semibold text-[#0a1413]" htmlFor="responseInput">
                      Nội dung phản biện trực tiếp
                    </label>
                    <span className="font-mono text-[10px] text-[#556361]">
                      Enter gửi · Shift+Enter xuống dòng
                    </span>
                  </div>
                  <div className="relative rounded-2xl border border-[rgba(10,20,19,0.14)] bg-[#f7faf9] p-3.5 focus-within:bg-white focus-within:border-[#0b6e5e] input-focus-glow transition-all">
                    <textarea
                      id="responseInput"
                      rows={5}
                      value={inputText}
                      onKeyDown={handleTextareaKeyDown}
                      onChange={(e) => {
                        const startMs = turnStartTimeRef.current || Date.now();
                        setFirstInputOffsetSec(
                          (prev) => prev ?? Math.max(0.1, (Date.now() - startMs) / 1000)
                        );
                        setInputText(e.target.value);
                        setModeUsed('text');
                      }}
                      placeholder="Nói vào micro hoặc nhập câu trả lời của bạn tại đây để gửi cho Hội đồng..."
                      className="w-full bg-transparent text-[#0a1413] text-sm leading-relaxed border-none p-0 font-sans placeholder:text-[#556361]/70 resize-y min-h-[120px] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3.5 p-3 rounded-xl bg-[#eff5f3] border border-[rgba(10,20,19,0.08)] text-xs font-sans text-[#465754] flex items-start gap-2">
                  <Lightbulb
                    className="w-4 h-4 text-[#0b6e5e] flex-shrink-0 mt-0.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span className="leading-relaxed">
                    <strong className="text-[#0a1413]">Mẹo PREP:</strong> Luận điểm (Point)
                    <ArrowRight className="w-3 h-3 inline mx-1 text-[#0b6e5e]" strokeWidth={2.2} aria-hidden="true" />
                    Lý do (Reason)
                    <ArrowRight className="w-3 h-3 inline mx-1 text-[#0b6e5e]" strokeWidth={2.2} aria-hidden="true" />
                    Dẫn chứng (Example)
                    <ArrowRight className="w-3 h-3 inline mx-1 text-[#0b6e5e]" strokeWidth={2.2} aria-hidden="true" />
                    Kết luận (Point).
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[rgba(10,20,19,0.08)]">
                <button
                  id="submitResponseBtn"
                  type="submit"
                  disabled={!inputText.trim() || isCouncilThinking}
                  className="btn-mint-primary w-full py-3.5 px-5 text-sm cursor-pointer disabled:opacity-50"
                >
                  {isCouncilThinking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#6ee7c8]" strokeWidth={2} aria-hidden="true" />
                      <span>Hội đồng đang chất vấn...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#6ee7c8]" strokeWidth={2} aria-hidden="true" />
                      <span>Gửi phát biểu cho Hội đồng</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};

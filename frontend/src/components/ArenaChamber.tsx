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
  } = useSpeechSynthesis();

  useEffect(() => {
    if (persona === 'academic_reviewer') {
      setCurrentVoice('vi-VN-HoaiMyNeural');
    } else {
      setCurrentVoice('vi-VN-NamMinhNeural');
    }
  }, [persona, setCurrentVoice]);

  // Reset khi sang lượt mới
  useEffect(() => {
    setTurnStartTime(Date.now());
    setFirstInputTime(null);
    setInputText('');
    setCountdownSeconds(60);
    setIsTimerPaused(false);
    resetTranscript();
  }, [session.current_turn, resetTranscript]);

  // Đồng bộ giọng nói vào ô nhập văn bản
  useEffect(() => {
    if (transcript) {
      if (!firstInputTime) setFirstInputTime(Date.now());
      setInputText(transcript);
      setModeUsed('voice');
    }
  }, [transcript, firstInputTime]);

  // Bộ đếm thời gian phản xạ
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

  // Dữ liệu CoT thực tế từ lượt chất vấn hiện tại
  const latestAccuracy =
    currentTurnObj?.ground_truth_accuracy ?? prevTurnObj?.ground_truth_accuracy ?? 82;
  const latestFlaws =
    (currentTurnObj?.logic_flaws && currentTurnObj.logic_flaws.length > 0
      ? currentTurnObj.logic_flaws
      : prevTurnObj?.logic_flaws) || [];

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const activeSeconds = firstInputTime
    ? Math.max(1, (Date.now() - firstInputTime) / 1000)
    : Math.max(1, (Date.now() - turnStartTime) / 1000);
  const wordsPerMinute = wordCount > 0 ? Math.round((wordCount / activeSeconds) * 60) : 128;
  const latencySec = firstInputTime
    ? ((firstInputTime - turnStartTime) / 1000).toFixed(2)
    : '0.42';

  return (
    <div className="w-full flex-1 flex flex-col pt-16 relative z-10">
      {/* ================= SESSION STATUS & TIMER BAR ================= */}
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
            <div className="flex items-center gap-2 bg-surface-container-low border border-primary/20 px-4 py-1.5 rounded-full text-xs font-label text-on-surface shadow-xs anim-timer-tick">
              <span className="material-symbols-outlined text-[17px] text-primary">timer</span>
              <span className="text-on-surface-variant">Thời gian phản xạ:</span>
              <span className="font-bold text-primary font-mono text-sm tracking-wide">
                00:{countdownSeconds < 10 ? `0${countdownSeconds}` : countdownSeconds}s
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

      {/* ================= 3-COLUMN LIVE DEBATE ROOM ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* CỘT 1: HUMANOID AI EXAMINER (DIGITAL HUMAN AVATAR LIVE FEED) */}
          <section className="lg:col-span-4 flex flex-col">
            <LiveAiExaminer
              speakerName={personaSpeakerName}
              councilRole={personaCouncilRole}
              triggerQuestion={aiQuestion}
              isThinking={isCouncilThinking}
              voiceEnabled={voiceEnabled}
              onToggleVoice={onToggleVoice}
              onStopVoice={stopSpeaking}
              currentVoice={currentVoice}
            />
          </section>

          {/* CỘT 2: TIẾN TRÌNH PHÂN TÍCH AI CoT 3 BƯỚC */}
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
                      <span className="font-label text-xs text-on-surface-variant font-medium">
                        Suy luận ngữ cảnh thời gian thực
                      </span>
                    </div>
                  </div>
                  <span className="font-label text-xs font-semibold text-primary bg-primary-fixed/30 px-2.5 py-1 rounded-full border border-primary-fixed-dim/40">
                    CoT Active
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  {/* BƯỚC 1: ĐỐI CHIẾU TÀI LIỆU */}
                  <div className="p-3.5 rounded-xl border border-primary/20 bg-primary-fixed/15">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-label text-xs font-bold text-primary flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                          1
                        </span>
                        Đối chiếu tài liệu
                      </span>
                      <span className="text-[11px] font-label font-bold text-primary bg-surface-container-lowest px-2 py-0.5 rounded-full shadow-2xs border border-primary/15">
                        Khớp {latestAccuracy}%
                      </span>
                    </div>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      {currentTurnObj?.ground_truth_coverage
                        ? `Trích xuất phân đoạn: ${currentTurnObj.ground_truth_coverage.slice(0, 110)}...`
                        : `Khái niệm đối chiếu với văn bản đề án đã nạp, đối soát định lượng các chỉ số.`}
                    </p>
                  </div>

                  {/* BƯỚC 2: ĐIỂM CẦN LÀM RÕ */}
                  <div className="p-3.5 rounded-xl border border-secondary/25 bg-secondary-fixed/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-label text-xs font-bold text-secondary flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-secondary text-white flex items-center justify-center text-[10px]">
                          2
                        </span>
                        Điểm cần làm rõ
                      </span>
                      <span className="text-[11px] font-label font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/80">
                        {latestFlaws.length > 0 ? 'Phát hiện lỗ hổng' : 'Khoảng trống logic'}
                      </span>
                    </div>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      {latestFlaws.length > 0
                        ? latestFlaws[0]
                        : 'Cần làm rõ cơ chế hội tụ toán học, giải pháp phần cứng khi triển khai thực tế.'}
                    </p>
                  </div>

                  {/* BƯỚC 3: HƯỚNG TRUY VẤN TIẾP THEO */}
                  <div className="p-3.5 rounded-xl border border-tertiary/20 bg-tertiary-fixed/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-label text-xs font-bold text-tertiary flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-tertiary text-white flex items-center justify-center text-[10px]">
                          3
                        </span>
                        Hướng truy vấn tiếp theo
                      </span>
                      <span className="text-[11px] font-label font-medium text-tertiary bg-surface-container-lowest px-2 py-0.5 rounded-full border border-tertiary/15">
                        Socratic
                      </span>
                    </div>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      Kiểm tra khả năng chịu áp lực với trường hợp biên (Edge Cases) và đánh giá độ phức
                      tạp tính toán O(V+E).
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-xs font-label text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Đồng bộ dữ liệu phiên bảo vệ
                </span>
                <span className="text-primary font-medium text-[11px]">Tự động cập nhật</span>
              </div>
            </div>
          </section>

          {/* CỘT 3: PHÁT BIỂU CỦA THÍ SINH */}
          <section className="lg:col-span-4 flex flex-col">
            <div className="bg-surface-container-lowest/90 backdrop-blur-sm border border-surface-container-high/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full hover-lift">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-surface-container-high/60">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isListening ? 'bg-rose-500 animate-ping' : 'bg-primary'
                      }`}
                    ></span>
                    <h3 className="font-headline font-semibold text-lg text-on-surface">
                      Phát biểu của bạn
                    </h3>
                  </div>
                  <button
                    onClick={handleMicToggle}
                    className={`px-2.5 py-1 rounded-full border font-label font-semibold text-xs flex items-center gap-1 cursor-pointer transition-all ${
                      isListening
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface border-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">
                      {isListening ? 'mic' : 'mic_none'}
                    </span>
                    <span>{isListening ? 'Đang thu âm...' : 'Bật Micro'}</span>
                  </button>
                </div>

                <div className="my-4 flex items-center justify-between px-3 py-2 rounded-xl bg-surface-container-low/60 border border-surface-container-high/50 text-xs font-label text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-secondary">speed</span>
                    <span>
                      Tốc độ: <strong className="text-on-surface font-semibold">{wordsPerMinute} từ/phút</strong>
                    </span>
                  </div>
                  <div className="h-3 w-px bg-surface-container-high"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-primary">bolt</span>
                    <span>
                      Độ trễ: <strong className="text-on-surface font-semibold">{latencySec}s</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-label">
                    <label className="font-semibold text-on-surface" htmlFor="responseInput">
                      Nội dung phản biện trực tiếp
                    </label>
                    <span className="text-[11px] text-on-surface-variant">Giọng nói &amp; Gõ phím</span>
                  </div>
                  <div className="relative rounded-xl border border-surface-container-high bg-surface-container-lowest p-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-fixed/50 transition-all shadow-xs">
                    <textarea
                      id="responseInput"
                      rows={5}
                      value={inputText}
                      onChange={(e) => {
                        if (!firstInputTime) setFirstInputTime(Date.now());
                        setInputText(e.target.value);
                        setModeUsed('text');
                      }}
                      placeholder="Nói vào micro hoặc nhập câu trả lời của bạn tại đây để gửi cho Hội đồng..."
                      className="w-full bg-transparent text-on-surface text-sm focus:outline-none resize-none leading-relaxed border-none p-0 font-body placeholder:text-on-surface-variant/60"
                    />
                  </div>
                </div>

                <div className="mt-3.5 p-2.5 rounded-xl bg-surface-container-low/50 border border-surface-container-high/40 text-xs font-body text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0">
                    tips_and_updates
                  </span>
                  <span>
                    <strong>Mẹo PREP:</strong> Luận điểm (Point) → Lý do (Reason) → Dẫn chứng (Example) → Kết luận (Point).
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-surface-container-high/60">
                <button
                  id="submitResponseBtn"
                  onClick={handleSubmit}
                  disabled={!inputText.trim() || isCouncilThinking}
                  className="w-full py-3.5 px-5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md active:scale-[0.99] cursor-pointer border-none disabled:opacity-50"
                >
                  {isCouncilThinking ? (
                    <>
                      <span className="material-symbols-outlined text-lg animate-spin">
                        progress_activity
                      </span>
                      <span>Hội đồng đang chất vấn...</span>
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

      {/* ================= MINIMAL CLEAN FOOTER ================= */}
      <footer className="bg-surface-container-lowest/90 backdrop-blur-sm border-t border-surface-container-high/60 py-4 px-4 sm:px-6 lg:px-8 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-label text-on-surface-variant">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-bold text-on-surface">VivaArena</span>
            <span>•</span>
            <span>Nền tảng Giả lập Bảo vệ Luận án AI © 2025</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-primary transition-colors cursor-pointer">
              Quy chuẩn Luận án
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Ma trận Đánh giá
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Hướng dẫn Tranh biện
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

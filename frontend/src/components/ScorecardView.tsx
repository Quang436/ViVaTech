import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Lightbulb,
  RotateCcw,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';
import type { Scorecard, CouncilPersona } from '../types';

interface ScorecardViewProps {
  scorecard: Scorecard | null;
  persona: CouncilPersona;
  topicTitle: string;
  onRestart: () => void;
  onGoToArchive?: () => void;
}

const getAcademicGrade = (score: number): { rank: string; passed: boolean; label: string } => {
  if (score >= 90)
    return { rank: 'Hạng A+ · Xuất sắc', passed: true, label: 'ĐẠT YÊU CẦU BẢO VỆ XUẤT SẮC' };
  if (score >= 85) return { rank: 'Hạng A · Giỏi', passed: true, label: 'ĐẠT YÊU CẦU BẢO VỆ' };
  if (score >= 80) return { rank: 'Hạng B+ · Khá Giỏi', passed: true, label: 'ĐẠT YÊU CẦU BẢO VỆ' };
  if (score >= 70)
    return { rank: 'Hạng B · Khá', passed: true, label: 'ĐẠT YÊU CẦU (CẦN BỔ SUNG)' };
  if (score >= 55)
    return { rank: 'Hạng C · Trung bình', passed: true, label: 'THÔNG QUA CÓ ĐIỀU KIỆN' };
  return { rank: 'Hạng D · Chưa đạt', passed: false, label: 'CẦN BẢO VỆ LẠI' };
};

export const ScorecardView: React.FC<ScorecardViewProps> = ({
  scorecard,
  topicTitle,
  onRestart,
  onGoToArchive,
}) => {
  const [showExportToast, setShowExportToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleExportPDF = () => {
    setShowExportToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setShowExportToast(false);
    }, 3500);
    window.print();
  };

  if (!scorecard) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="py-20 relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center justify-center gap-4 flex-1 outline-none"
      >
        <div className="w-16 h-16 rounded-2xl bg-[rgba(110,231,200,0.2)] border border-[rgba(11,110,94,0.22)] text-[#085448] flex items-center justify-center">
          <ClipboardCheck className="w-8 h-8" strokeWidth={1.8} aria-hidden="true" />
        </div>
        <h1 className="font-sans text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#0a1413]">
          Chưa có Bảng điểm nào được chọn
        </h1>
        <p className="font-sans text-sm text-[#465754] max-w-md leading-relaxed">
          Hãy hoàn thành một phiên chất vấn trực tiếp với Hội đồng AI để hệ thống chấm điểm thực tế, hoặc chọn một phiên đã diễn ra trong mục Kho đề án.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <button
            type="button"
            onClick={onRestart}
            className="btn-mint-primary h-10 px-5 text-xs sm:text-sm cursor-pointer"
          >
            Bắt đầu phiên chất vấn mới
          </button>
          {onGoToArchive && (
            <button
              type="button"
              onClick={onGoToArchive}
              className="btn-mint-ghost h-10 px-5 text-xs sm:text-sm cursor-pointer"
            >
              Xem lịch sử các phiên
            </button>
          )}
        </div>
      </main>
    );
  }

  const gradeInfo = getAcademicGrade(scorecard.overall_score);

  const rubrics = [
    {
      title: '1. Logic Học Thuật',
      weight: '35%',
      score: scorecard.logic_accuracy_score,
      textCls: 'text-[#0b6e5e]',
      barCls: 'bg-[#0b6e5e]',
      desc: 'Độ chính xác khái niệm, tính nhất quán lập luận và đối chiếu Ground Truth.',
    },
    {
      title: '2. Kỹ Năng Tranh Biện',
      weight: '30%',
      score: scorecard.argumentation_score,
      textCls: 'text-[#0369a1]',
      barCls: 'bg-[#0369a1]',
      desc: 'Khả năng bảo vệ luận điểm trước phản bác và dẫn chứng số liệu thực tế.',
    },
    {
      title: '3. Bản Lĩnh Phản Biện',
      weight: '20%',
      score: scorecard.composure_score,
      textCls: 'text-[#0a1413]',
      barCls: 'bg-[#334155]',
      desc: 'Độ điềm tĩnh, tốc độ phản xạ và kiểm soát lập luận dưới áp lực hội đồng.',
    },
    {
      title: '4. Độ Khúc Chiết',
      weight: '15%',
      score: scorecard.clarity_score,
      textCls: 'text-[#085448]',
      barCls: 'bg-[#085448]',
      desc: 'Trình bày súc tích theo cấu trúc PREP và thuật ngữ khoa học chuẩn hóa.',
    },
  ];

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="pt-8 sm:pt-12 pb-20 relative z-10 w-full flex-grow outline-none"
    >
      <div className="mint-wrap space-y-7">
        {/* 1. HEADER KẾT QUẢ TỔNG THỂ THẬT */}
        <section className="mint-card mint-card-hover p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-shrink-0 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#eff5f3] border border-[rgba(11,110,94,0.24)]">
                <div className="text-center">
                  <span className="block font-sans text-4xl sm:text-[42px] font-semibold text-[#0b6e5e] leading-none tracking-[-0.03em]">
                    {scorecard.overall_score.toFixed(1)}
                  </span>
                  <span className="font-mono text-[10px] font-medium text-[#556361] mt-1.5 block uppercase tracking-wider">
                    / 100 Điểm
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`mint-tag ${gradeInfo.passed ? 'mint' : 'red'}`}>
                    {gradeInfo.passed ? (
                      <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden="true" />
                    )}
                    <span>{gradeInfo.label}</span>
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-[#eff5f3] text-[#465754] border border-[rgba(10,20,19,0.1)]">
                    {gradeInfo.rank}
                  </span>
                  <span className="text-[11px] font-mono text-[#556361]">
                    #{scorecard.session_id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <h1 className="font-sans text-2xl sm:text-3xl font-semibold text-[#0a1413] tracking-[-0.025em]">
                  Đề tài: {topicTitle}
                </h1>
                <p className="font-sans text-sm text-[#465754] max-w-2xl leading-relaxed">
                  {scorecard.overall_verdict}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-stretch sm:self-auto flex-shrink-0 no-print">
              <button
                id="btn-export-pdf"
                type="button"
                onClick={handleExportPDF}
                className="btn-mint-primary flex-1 sm:flex-none h-10 px-5 text-xs sm:text-sm group cursor-pointer"
              >
                <Download
                  className="w-4 h-4 text-[#6ee7c8] group-hover:-translate-y-0.5 transition-transform"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>Tải Báo Cáo PDF</span>
              </button>
              <button
                type="button"
                onClick={onRestart}
                className="btn-mint-ghost flex-1 sm:flex-none h-10 px-5 text-xs sm:text-sm group cursor-pointer"
              >
                <RotateCcw
                  className="w-4 h-4 text-[#0b6e5e] group-hover:-rotate-90 transition-transform duration-300"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>Luyện Tập Lại</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. 4 TRỤC ĐÁNH GIÁ TIÊU CHUẨN */}
        <section className="mint-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(10,20,19,0.08)] gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ClipboardCheck className="w-4 h-4 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
                <h2 className="mint-h2 text-xl sm:text-2xl">
                  4 trục đánh giá{' '}
                  <span className="mint-serif">học thuật</span>
                </h2>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#465754]">
                Chấm điểm định lượng trực tiếp từ lịch sử trả lời của bạn trong phiên
              </p>
            </div>
            <span className="mint-tag mint self-start sm:self-auto">
              Đã phân tích: {scorecard.optimal_answers?.length || 0} lượt
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            {rubrics.map((axis) => (
              <div
                key={axis.title}
                className="p-4 rounded-2xl border border-[rgba(10,20,19,0.08)] bg-[#f7faf9] hover:bg-white hover:border-[rgba(11,110,94,0.25)] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="font-sans font-semibold text-[#0a1413] text-xs sm:text-sm">
                      {axis.title}
                    </span>
                    <span className={`font-mono text-sm font-bold shrink-0 ${axis.textCls}`}>
                      {axis.score.toFixed(0)}/100
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#dce7e4] overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full progress-fill ${axis.barCls}`}
                      style={{ width: `${Math.min(100, Math.max(0, axis.score))}%` }}
                    />
                  </div>
                </div>
                <p className="font-sans text-xs text-[#465754] leading-relaxed">
                  {axis.desc}{' '}
                  <span className="font-mono font-medium text-[#0a1413]">({axis.weight})</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. KHỐI PHÂN TÍCH SONG SONG (ĐIỂM MẠNH & ĐIỂM CẦN KHẮC PHỤC) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mint-card mint-card-hover p-6 border-[rgba(11,110,94,0.22)]">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[rgba(10,20,19,0.08)]">
              <div className="w-8 h-8 rounded-xl bg-[rgba(110,231,200,0.24)] border border-[rgba(11,110,94,0.2)] text-[#085448] flex items-center justify-center">
                <ThumbsUp className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-sans text-lg font-semibold text-[#0a1413]">Điểm Mạnh Nổi Bật</h2>
                <span className="font-mono text-[11px] text-[#0b6e5e]">
                  Đánh giá thực tế từ các câu trả lời của bạn
                </span>
              </div>
            </div>
            <ul className="space-y-3 font-sans text-xs sm:text-sm text-[#465754]">
              {scorecard.strengths && scorecard.strengths.length > 0 ? (
                scorecard.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0b6e5e] mt-2 flex-shrink-0" aria-hidden="true" />
                    <span className="leading-relaxed text-[#0a1413]">{str}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs italic text-[#556361]">
                  Chưa ghi nhận điểm mạnh nổi bật trong phiên này.
                </li>
              )}
            </ul>
          </div>

          <div className="mint-card mint-card-hover p-6 border-[rgba(3,105,161,0.22)]">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[rgba(10,20,19,0.08)]">
              <div className="w-8 h-8 rounded-xl bg-[#e0f2fe] border border-[rgba(3,105,161,0.2)] text-[#0369a1] flex items-center justify-center">
                <Lightbulb className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-sans text-lg font-semibold text-[#0a1413]">
                  Điểm Cần Lưu Ý &amp; Khắc Phục
                </h2>
                <span className="font-mono text-[11px] text-[#0369a1]">
                  Khuyến nghị cải thiện từ Hội đồng AI
                </span>
              </div>
            </div>
            <ul className="space-y-3 font-sans text-xs sm:text-sm text-[#465754]">
              {scorecard.weaknesses && scorecard.weaknesses.length > 0 ? (
                scorecard.weaknesses.map((weak, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0369a1] mt-2 flex-shrink-0" aria-hidden="true" />
                    <span className="leading-relaxed text-[#0a1413]">{weak}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs italic text-[#556361]">Không phát hiện điểm yếu nghiêm trọng.</li>
              )}
              {scorecard.fallacies_summary &&
                scorecard.fallacies_summary.map((fal, idx) => (
                  <li key={`fal-${idx}`} className="flex items-start gap-2.5 text-[#be123c]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#be123c] mt-2 flex-shrink-0" aria-hidden="true" />
                    <span className="leading-relaxed">
                      <strong>Lỗi lập luận:</strong> {fal}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </section>

        {/* 4. CÂU TRẢ LỜI KIỂU MẪU HỌC THUẬT */}
        <section className="mint-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(10,20,19,0.08)] gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BrainCircuit className="w-4 h-4 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
                <h2 className="mint-h2 text-xl sm:text-2xl">
                  Đối sánh thực tế &amp; gợi ý{' '}
                  <span className="mint-serif">chuẩn PREP</span>
                </h2>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#465754]">
                Phân tích chi tiết từng câu hỏi đã diễn ra trong phiên bảo vệ của bạn
              </p>
            </div>
            <span className="mint-tag mint self-start sm:self-auto">
              PREP: Điểm chính · Luận cứ · Minh chứng · Kết luận
            </span>
          </div>

          <div className="space-y-5">
            {scorecard.optimal_answers && scorecard.optimal_answers.length > 0 ? (
              scorecard.optimal_answers.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-[rgba(10,20,19,0.08)] rounded-2xl p-5 sm:p-6 bg-[#f7faf9] space-y-4"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#0a1413] text-white mt-0.5 shrink-0">
                      Q{item.turn_number || idx + 1}
                    </span>
                    <div className="space-y-1">
                      <span className="mint-eyebrow block">
                        Câu hỏi Hội đồng · Lượt {item.turn_number || idx + 1}
                      </span>
                      <p className="font-serif text-lg sm:text-xl text-[#0a1413] italic leading-snug">
                        “{item.question}”
                      </p>
                    </div>
                  </div>

                  <div className="sm:ml-10 space-y-3.5">
                    <div className="p-3.5 bg-white rounded-xl border border-[rgba(10,20,19,0.08)] text-xs font-sans text-[#465754]">
                      <span className="font-semibold text-[#0a1413]">
                        Tóm tắt câu trả lời của bạn:{' '}
                      </span>
                      <span className="italic">{item.student_answer_summary}</span>
                    </div>

                    <div className="p-4 sm:p-5 bg-gradient-to-br from-[rgba(110,231,200,0.22)] via-white to-[#eff5f3] rounded-2xl border border-[rgba(11,110,94,0.24)] space-y-2.5">
                      <span className="font-sans text-xs font-semibold text-[#085448] flex items-center gap-1.5">
                        <BadgeCheck className="w-4 h-4 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
                        Gợi Ý Trả Lời Tối Ưu Từ Hội Đồng (Chuẩn PREP)
                      </span>
                      <p className="font-sans text-sm text-[#0a1413] leading-relaxed">
                        {item.optimal_answer}
                      </p>
                      {item.key_takeaway && (
                        <div className="flex items-center gap-2 pt-1 font-sans text-xs text-[#0b6e5e] font-semibold">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                          <span>Bài học rút ra: {item.key_takeaway}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#556361] italic">
                Chưa có dữ liệu câu trả lời chi tiết cho phiên này.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Non-blocking Export Toast */}
      {showExportToast && (
        <div
          id="toast-export"
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#0a1413] text-white shadow-[0_20px_50px_-15px_rgba(10,20,19,0.4)] text-sm font-sans border border-white/10 no-print"
        >
          <CheckCircle2 className="w-5 h-5 text-[#6ee7c8] shrink-0" strokeWidth={2} aria-hidden="true" />
          <div>
            <p className="font-semibold text-white">Đang mở hộp thoại in / lưu PDF...</p>
            <p className="font-mono text-[11px] text-white/75">
              Chọn &ldquo;Lưu dưới dạng PDF&rdquo; để xuất báo cáo hậu bảo vệ.
            </p>
          </div>
        </div>
      )}
    </main>
  );
};

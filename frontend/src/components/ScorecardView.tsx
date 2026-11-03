import React from 'react';
import type { Scorecard, CouncilPersona } from '../types';

interface ScorecardViewProps {
  scorecard: Scorecard | null;
  persona: CouncilPersona;
  topicTitle: string;
  onRestart: () => void;
  onGoToArchive?: () => void;
}

const getAcademicGrade = (score: number): { rank: string; passed: boolean; label: string } => {
  if (score >= 90) return { rank: 'Hạng A+ • Xuất sắc', passed: true, label: 'ĐẠT YÊU CẦU BẢO VỆ XUẤT SẮC' };
  if (score >= 85) return { rank: 'Hạng A • Giỏi', passed: true, label: 'ĐẠT YÊU CẦU BẢO VỆ' };
  if (score >= 80) return { rank: 'Hạng B+ • Khá Giỏi', passed: true, label: 'ĐẠT YÊU CẦU BẢO VỆ' };
  if (score >= 70) return { rank: 'Hạng B • Khá', passed: true, label: 'ĐẠT YÊU CẦU (CẦN BỔ SUNG)' };
  if (score >= 55) return { rank: 'Hạng C • Trung bình', passed: true, label: 'THÔNG QUA CÓ ĐIỀU KIỆN' };
  return { rank: 'Hạng D • Chưa đạt', passed: false, label: 'CẦN BẢO VỆ LẠI' };
};

export const ScorecardView: React.FC<ScorecardViewProps> = ({
  scorecard,
  topicTitle,
  onRestart,
  onGoToArchive,
}) => {
  const handleExportPDF = () => {
    window.print();
  };

  if (!scorecard) {
    return (
      <main className="pt-28 pb-16 relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center justify-center gap-4 flex-1">
        <div className="w-16 h-16 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">grading</span>
        </div>
        <h2 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">
          Chưa có Bảng điểm nào được chọn
        </h2>
        <p className="font-body text-sm text-on-surface-variant max-w-md">
          Hãy hoàn thành một phiên chất vấn trực tiếp với Hội đồng AI để hệ thống chấm điểm thực tế, hoặc chọn một phiên đã diễn ra trong mục Lịch sử & Hồ sơ.
        </p>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={onRestart}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-label text-xs sm:text-sm font-bold hover:bg-primary-container transition-all cursor-pointer border-none"
          >
            Bắt đầu phiên chất vấn mới
          </button>
          {onGoToArchive && (
            <button
              onClick={onGoToArchive}
              className="px-5 py-2.5 rounded-xl bg-surface-container-lowest border border-surface-container-high text-on-surface font-label text-xs sm:text-sm font-bold hover:bg-surface-container-low transition-all cursor-pointer"
            >
              Xem lịch sử các phiên
            </button>
          )}
        </div>
      </main>
    );
  }

  const gradeInfo = getAcademicGrade(scorecard.overall_score);

  return (
    <main className="pt-24 pb-16 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow space-y-8">
      {/* 1. HEADER KẾT QUẢ TỔNG THỂ THẬT */}
      <section className="bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl border border-surface-container-high/80 p-6 sm:p-8 shadow-sm hover-lift">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0 flex items-center justify-center w-28 h-28 rounded-2xl bg-gradient-to-br from-primary-fixed/40 via-surface-container-low to-primary/10 border border-primary/20 shadow-xs">
              <div className="text-center">
                <span className="block font-headline text-4xl sm:text-5xl font-extrabold text-primary leading-none tracking-tight">
                  {scorecard.overall_score.toFixed(1)}
                </span>
                <span className="font-label text-[11px] font-bold text-on-surface-variant mt-1 block uppercase tracking-wider">
                  / 100 Điểm
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-label font-bold ${
                    gradeInfo.passed
                      ? 'bg-primary-fixed text-on-primary-fixed-variant'
                      : 'bg-error-container text-on-error-container'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      gradeInfo.passed ? 'bg-primary' : 'bg-error'
                    }`}
                  ></span>
                  <span className="material-symbols-outlined text-[15px]">
                    {gradeInfo.passed ? 'verified' : 'warning'}
                  </span>
                  {gradeInfo.label}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-label font-semibold bg-surface-container-high text-on-surface-variant border border-surface-container-highest">
                  {gradeInfo.rank}
                </span>
                <span className="text-xs font-label text-on-surface-variant/80">
                  Mã phiên: #{scorecard.session_id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-semibold text-on-surface tracking-tight">
                Đề tài: {topicTitle}
              </h1>
              <p className="font-body text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
                {scorecard.overall_verdict}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto flex-shrink-0">
            <button
              onClick={handleExportPDF}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-container text-on-primary font-label text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary transition-all duration-200 group cursor-pointer border-none"
              id="btn-export-pdf"
            >
              <span className="material-symbols-outlined text-[19px] group-hover:-translate-y-0.5 transition-transform">
                download
              </span>
              <span>Tải Báo Cáo PDF</span>
            </button>
            <button
              onClick={onRestart}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label text-sm font-bold border border-surface-container-high transition-all shadow-xs group cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px] text-primary group-hover:rotate-180 transition-transform duration-500">
                replay
              </span>
              <span>Phiên Mới</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. 4 TRỤC ĐÁNH GIÁ HỘI ĐỒNG (DỮ LIỆU THẬT TỪ GEMINI AI) */}
      <section className="bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl border border-surface-container-high/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-surface-container-high/60 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[20px]">grading</span>
              <h2 className="font-headline text-2xl font-semibold text-on-surface">
                4 Trục Đánh Giá Tiêu Chuẩn (Rubrics)
              </h2>
            </div>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant">
              Chấm điểm định lượng trực tiếp từ lịch sử trả lời của bạn trong phiên
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label text-xs font-semibold text-on-surface-variant bg-surface-container-low border border-surface-container-high/80 px-3 py-1.5 rounded-full">
              Tổng số câu đã phân tích: {scorecard.optimal_answers?.length || 0} lượt
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {/* Trục 1: Logic */}
          <div className="p-5 rounded-xl border border-surface-container-high/60 bg-surface-container-low/50 hover:bg-surface-container-lowest transition hover-lift">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="font-label font-bold text-on-surface text-sm">
                  1. Logic & Tính Chính Xác Học Thuật
                </span>
                <span className="font-label text-xs text-on-surface-variant">(Trọng số 35%)</span>
              </div>
              <span className="font-label text-sm font-extrabold text-primary">
                {scorecard.logic_accuracy_score.toFixed(0)} / 100
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden mb-2.5">
              <div
                className="h-full bg-primary rounded-full progress-fill"
                style={{ width: `${Math.min(100, scorecard.logic_accuracy_score)}%` }}
              ></div>
            </div>
          </div>

          {/* Trục 2: Lập luận */}
          <div className="p-5 rounded-xl border border-secondary/30 bg-secondary-fixed/15 hover:bg-surface-container-lowest transition hover-lift">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="font-label font-bold text-on-surface text-sm">
                  2. Kỹ Năng Tranh Biện (Argumentation)
                </span>
                <span className="font-label text-xs text-on-surface-variant">(Trọng số 30%)</span>
              </div>
              <span className="font-label text-sm font-extrabold text-secondary">
                {scorecard.argumentation_score.toFixed(0)} / 100
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden mb-2.5">
              <div
                className="h-full bg-secondary rounded-full progress-fill"
                style={{ width: `${Math.min(100, scorecard.argumentation_score)}%` }}
              ></div>
            </div>
          </div>

          {/* Trục 3: Bản lĩnh phản biện */}
          <div className="p-5 rounded-xl border border-surface-container-high/60 bg-surface-container-low/50 hover:bg-surface-container-lowest transition hover-lift">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="font-label font-bold text-on-surface text-sm">
                  3. Bản Lĩnh Phản Biện (Pressure Resilience)
                </span>
                <span className="font-label text-xs text-on-surface-variant">(Trọng số 20%)</span>
              </div>
              <span className="font-label text-sm font-extrabold text-tertiary">
                {scorecard.composure_score.toFixed(0)} / 100
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden mb-2.5">
              <div
                className="h-full bg-tertiary rounded-full progress-fill"
                style={{ width: `${Math.min(100, scorecard.composure_score)}%` }}
              ></div>
            </div>
          </div>

          {/* Trục 4: Trình bày */}
          <div className="p-5 rounded-xl border border-surface-container-high/60 bg-surface-container-low/50 hover:bg-surface-container-lowest transition hover-lift">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                <span className="font-label font-bold text-on-surface text-sm">
                  4. Trình Bày & Độ Khúc Chiết (Clarity)
                </span>
                <span className="font-label text-xs text-on-surface-variant">(Trọng số 15%)</span>
              </div>
              <span className="font-label text-sm font-extrabold text-primary-container">
                {scorecard.clarity_score.toFixed(0)} / 100
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden mb-2.5">
              <div
                className="h-full bg-primary-container rounded-full progress-fill"
                style={{ width: `${Math.min(100, scorecard.clarity_score)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KHỐI PHÂN TÍCH SONG SONG (ĐIỂM MẠNH & ĐIỂM CẦN KHẮC PHỤC THẬT) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest/90 backdrop-blur-md border border-primary/25 rounded-2xl p-6 sm:p-7 shadow-sm hover-lift">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-surface-container-high/60">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">thumb_up</span>
            </div>
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">Điểm Mạnh Nổi Bật</h3>
              <span className="font-label text-[11px] text-primary font-semibold">
                Đánh giá thực tế từ các câu trả lời của bạn
              </span>
            </div>
          </div>
          <ul className="space-y-3.5 font-body text-sm text-on-surface-variant">
            {scorecard.strengths && scorecard.strengths.length > 0 ? (
              scorecard.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-xs italic">Chưa ghi nhận điểm mạnh nổi bật trong phiên này.</li>
            )}
          </ul>
        </div>

        <div className="bg-surface-container-lowest/90 backdrop-blur-md border border-secondary/30 rounded-2xl p-6 sm:p-7 shadow-sm hover-lift">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-surface-container-high/60">
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">
                Điểm Cần Khắc Phục & Lỗi Ngụy Biện
              </h3>
              <span className="font-label text-[11px] text-secondary font-semibold">
                Khuyến nghị cải thiện từ Hội đồng AI
              </span>
            </div>
          </div>
          <ul className="space-y-3.5 font-body text-sm text-on-surface-variant">
            {scorecard.weaknesses && scorecard.weaknesses.length > 0 ? (
              scorecard.weaknesses.map((weak, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary mt-1.5 flex-shrink-0"></span>
                  <span>{weak}</span>
                </li>
              ))
            ) : (
              <li className="text-xs italic">Không phát hiện điểm yếu nghiêm trọng.</li>
            )}
            {scorecard.fallacies_summary &&
              scorecard.fallacies_summary.map((fal, idx) => (
                <li key={`fal-${idx}`} className="flex items-start gap-3 text-error">
                  <span className="w-2 h-2 rounded-full bg-error mt-1.5 flex-shrink-0"></span>
                  <span>
                    <strong>Lỗi lập luận:</strong> {fal}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </section>

      {/* 4. CÂU TRẢ LỜI KIỂU MẪU HỌC THUẬT CHO TỪNG LƯỢT THẬT */}
      <section className="bg-surface-container-lowest/90 backdrop-blur-md border border-surface-container-high/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-surface-container-high/60 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
              <h2 className="font-headline text-2xl font-semibold text-on-surface">
                Đối Sánh Câu Trả Lời Thực Tế & Gợi Ý Chuẩn PREP
              </h2>
            </div>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant">
              Phân tích chi tiết từng câu hỏi đã diễn ra trong phiên bảo vệ của bạn
            </p>
          </div>
          <span className="font-label text-xs font-semibold text-primary bg-primary-fixed/50 border border-primary/20 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
            Chuẩn PREP: Điểm chính • Luận cứ • Minh chứng • Kết luận
          </span>
        </div>

        <div className="space-y-6">
          {scorecard.optimal_answers && scorecard.optimal_answers.length > 0 ? (
            scorecard.optimal_answers.map((item, idx) => (
              <div
                key={idx}
                className="border border-surface-container-high/80 rounded-2xl p-5 sm:p-6 bg-surface-container-low/40 hover-lift space-y-4"
              >
                <div className="flex items-start gap-3.5">
                  <span className="font-label text-xs font-bold px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface mt-0.5">
                    Q{item.turn_number || idx + 1}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-label text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Câu hỏi Hội đồng • Lượt {item.turn_number || idx + 1}
                      </span>
                    </div>
                    <p className="font-headline text-base sm:text-lg text-on-surface italic leading-snug">
                      “{item.question}”
                    </p>
                  </div>
                </div>

                <div className="sm:ml-9 space-y-3.5">
                  <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-surface-container-high/70 text-xs font-body text-on-surface-variant">
                    <span className="font-label font-bold text-on-surface">
                      Tóm tắt câu trả lời của bạn:{' '}
                    </span>
                    <span className="italic">{item.student_answer_summary}</span>
                  </div>

                  <div className="p-4 sm:p-5 bg-gradient-to-br from-primary-fixed/25 via-surface-container-lowest to-surface-container-low rounded-xl border border-primary/25 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-label text-xs font-bold text-primary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[17px]">verified</span>
                        Gợi Ý Trả Lời Tối Ưu Từ Hội Đồng (Chuẩn PREP)
                      </span>
                    </div>
                    <p className="font-body text-sm text-on-surface leading-relaxed">
                      {item.optimal_answer}
                    </p>
                    {item.key_takeaway && (
                      <div className="flex items-center gap-2 pt-1 font-label text-xs text-primary font-semibold">
                        <span className="material-symbols-outlined text-[15px]">
                          tips_and_updates
                        </span>
                        <span>Bài học rút ra: {item.key_takeaway}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-on-surface-variant italic">
              Chưa có dữ liệu câu trả lời chi tiết cho phiên này.
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

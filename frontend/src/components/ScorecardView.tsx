import React from 'react';
import type { Scorecard, CouncilPersona } from '../types';

interface ScorecardViewProps {
  scorecard: Scorecard;
  persona: CouncilPersona;
  topicTitle: string;
  onRestart: () => void;
}

export const ScorecardView: React.FC<ScorecardViewProps> = ({
  scorecard,
  topicTitle,
  onRestart,
}) => {
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <main className="pt-24 pb-16 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow space-y-8">
      {/* 1. HEADER KẾT QUẢ TỔNG THỂ */}
      <section className="bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl border border-surface-container-high/80 p-6 sm:p-8 shadow-sm hover-lift">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Điểm tổng kết lớn & Nhận định chung */}
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-label font-bold bg-primary-fixed text-on-primary-fixed-variant">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  ĐẠT YÊU CẦU BẢO VỆ
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-label font-semibold bg-surface-container-high text-on-surface-variant border border-surface-container-highest">
                  Hạng A- • Chỉnh sửa thực nghiệm
                </span>
                <span className="text-xs font-label text-on-surface-variant/80">
                  Khóa luận Thạc sĩ CS-2025
                </span>
              </div>
              <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight">
                Báo Cáo Đánh Giá Hậu Bảo Vệ
              </h1>
              <p className="font-body text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
                {scorecard.overall_verdict ||
                  `Ứng viên hoàn thành xuất sắc các lượt phản biện cho đề tài "${topicTitle}". Đề tài đạt chuẩn phương pháp luận quốc tế; cần cụ thể hóa bảng định lượng tiêu hao tài nguyên phần GPU khi triển khai thực tế.`}
              </p>
            </div>
          </div>

          {/* Nút hành động chính */}
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
              <span>Luyện Tập Lại</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. 4 TRỤC ĐÁNH GIÁ HỘI ĐỒNG (RUBRICS TIÊU CHUẨN) */}
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
              Phân tích đa chiều theo chuẩn mực học thuật quốc tế Scopus/ISI
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label text-xs font-semibold text-on-surface-variant bg-surface-container-low border border-surface-container-high/80 px-3 py-1.5 rounded-full">
              Tổng trọng số: 100% • 3 Vòng Chất Vấn
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
                style={{ width: `${scorecard.logic_accuracy_score}%` }}
              ></div>
            </div>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Nắm vững cơ sở toán học, lập luận giả thuyết mạch lạc và không xảy ra sai lệch thuật ngữ toán học cốt lõi.
            </p>
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
                style={{ width: `${scorecard.argumentation_score}%` }}
              ></div>
            </div>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Cấu trúc phản hồi rõ ràng, tuy nhiên còn lúng túng khi bị dồn dập truy vấn con số định lượng chi phí tài nguyên.
            </p>
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
                style={{ width: `${scorecard.composure_score}%` }}
              ></div>
            </div>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Giữ được sự bình tĩnh khi giám khảo ngắt lời phản bác, tốc độ phản hồi có trật tự và ngôn phong chuẩn mực.
            </p>
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
                style={{ width: `${scorecard.clarity_score}%` }}
              ></div>
            </div>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Diễn đạt súc tích, bố cục luận điểm minh họa khoa học và thuật ngữ bám sát quy chuẩn hội nghị quốc tế.
            </p>
          </div>
        </div>
      </section>

      {/* 3. KHỐI PHÂN TÍCH SONG SONG (ĐIỂM MẠNH & ĐIỂM CẦN KHẮC PHỤC) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột Điểm Mạnh Nổi Bật */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-md border border-primary/25 rounded-2xl p-6 sm:p-7 shadow-sm hover-lift">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-surface-container-high/60">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">thumb_up</span>
            </div>
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">Điểm Mạnh Nổi Bật</h3>
              <span className="font-label text-[11px] text-primary font-semibold">
                Ưu thế cần tiếp tục phát huy
              </span>
            </div>
          </div>
          <ul className="space-y-3.5 font-body text-sm text-on-surface-variant">
            {scorecard.strengths?.length > 0 ? (
              scorecard.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>
                    <strong>Cơ sở toán học vững vàng:</strong> Chứng minh chặt chẽ cơ chế hội tụ của mô hình lan truyền (Diffusion Probabilistic Models) tại không gian đồ thị đa tầng.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>
                    <strong>Chứng minh ma trận thưa thuyết phục:</strong> Giải trình thành công thuật toán nén CSR giúp bảo toàn đặc trưng mà không tổn thất thông tin phân loại.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>
                    <strong>Phản xạ định lý Bayes nhanh nhạy:</strong> Ứng biến xuất sắc trước câu hỏi mở rộng về phân phối tiền nghiệm không suy biến của Hội đồng.
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Cột Điểm Cần Khắc Phục & Lưu Ý */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-md border border-secondary/30 rounded-2xl p-6 sm:p-7 shadow-sm hover-lift">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-surface-container-high/60">
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">Điểm Cần Khắc Phục & Lưu Ý</h3>
              <span className="font-label text-[11px] text-secondary font-semibold">
                Khuyến nghị trọng tâm trước giờ G
              </span>
            </div>
          </div>
          <ul className="space-y-3.5 font-body text-sm text-on-surface-variant">
            {scorecard.weaknesses?.length > 0 ? (
              scorecard.weaknesses.map((weak, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary mt-1.5 flex-shrink-0"></span>
                  <span>{weak}</span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary mt-1.5 flex-shrink-0"></span>
                  <span>
                    <strong>Né tránh con số thực tế:</strong> Còn lúng túng khi giám khảo truy vấn dung lượng VRAM GPU tiêu hao thực tế với dữ liệu quy mô 10 triệu node.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary mt-1.5 flex-shrink-0"></span>
                  <span>
                    <strong>Thiếu bảng so sánh phần cứng:</strong> Chưa trình bày bảng đối sánh chi phí tính toán (FLOPs/chi phí GPU) so với phương pháp baseline phổ biến.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary mt-1.5 flex-shrink-0"></span>
                  <span>
                    <strong>Chiến thuật phản hồi:</strong> Cần chủ động thừa nhận giới hạn tài nguyên trước khi trình bày thuật toán thưa để tránh bị hội đồng dồn ép.
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>
      </section>

      {/* 4. CÂU TRẢ LỜI KIỂU MẪU HỌC THUẬT (CHUẨN PREP & TRÍCH DẪN) */}
      <section className="bg-surface-container-lowest/90 backdrop-blur-md border border-surface-container-high/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-surface-container-high/60 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
              <h2 className="font-headline text-2xl font-semibold text-on-surface">
                Câu Trả Lời Kiểu Mẫu Học Thuật
              </h2>
            </div>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant">
              Đối sánh trực quan câu hỏi then chốt của Hội đồng và giải pháp trả lời chuẩn mực PREP để ôn luyện
            </p>
          </div>
          <span className="font-label text-xs font-semibold text-primary bg-primary-fixed/50 border border-primary/20 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
            Chuẩn PREP: Điểm chính • Luận cứ • Minh chứng • Kết luận
          </span>
        </div>

        <div className="space-y-6">
          {/* Turn 1 */}
          <div className="border border-surface-container-high/80 rounded-2xl p-5 sm:p-6 bg-surface-container-low/40 hover-lift space-y-4">
            {/* Question Header */}
            <div className="flex items-start gap-3.5">
              <span className="font-label text-xs font-bold px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface mt-0.5">
                Q1
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-label text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Hội Đồng Phản Biện • Vòng 1
                  </span>
                  <span className="text-xs text-primary font-semibold">GS. TS. Vũ Đình Toàn</span>
                </div>
                <p className="font-headline text-base sm:text-lg text-on-surface italic leading-snug">
                  “Tại sao tác giả lại áp dụng hàm kích hoạt GELU thay vì SwiGLU khi các công bố gần đây chứng minh SwiGLU giảm thiểu hiện tượng vanishing gradient tốt hơn?”
                </p>
              </div>
            </div>

            {/* Comparison Box */}
            <div className="sm:ml-9 space-y-3.5">
              <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-surface-container-high/70 text-xs font-body text-on-surface-variant">
                <span className="font-label font-bold text-on-surface">Thí sinh đã trả lời:</span>
                <span className="italic">
                  {' '}
                  “Em chọn GELU vì PyTorch tối ưu sẵn kernel CUDA tốt hơn và qua thử nghiệm nhỏ độ hội tụ không chênh lệch nhiều.”
                </span>
                <span className="block mt-1 font-label text-[11px] text-secondary font-semibold">
                  → Điểm hạn chế: Chưa cung cấp số liệu thực nghiệm định lượng cụ thể.
                </span>
              </div>

              <div className="p-4 sm:p-5 bg-gradient-to-br from-primary-fixed/25 via-surface-container-lowest to-surface-container-low rounded-xl border border-primary/25 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-label text-xs font-bold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[17px]">verified</span>
                    Gợi Ý Trả Lời Tối Ưu (Chuẩn PREP • AI Benchmark)
                  </span>
                  <span className="font-label text-xs font-bold text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full">
                    98 / 100
                  </span>
                </div>
                <p className="font-body text-sm text-on-surface leading-relaxed">
                  “Việc giữ nguyên GELU dựa trên hai luận cứ thực nghiệm: <strong>Thứ nhất</strong>, trên tập đồ thị thưa có bậc trung bình dưới 4.8, SwiGLU làm tăng 18% tham số tính toán nhưng F1-Score cải thiện không đáng kể (&lt;0.12%). <strong>Thứ hai</strong>, duy trì kiến trúc chuẩn là điều kiện tiên quyết để cô lập biến độc lập khi kiểm định thuật toán nén đồ thị mới.”
                </p>
                <div className="flex items-center gap-2 pt-1 font-label text-xs text-primary font-semibold">
                  <span className="material-symbols-outlined text-[15px]">menu_book</span>
                  <span>Trích dẫn học thuật: Shazeer (2020), GLU Variants Improve Transformer, arXiv:2002.05202.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Turn 2 */}
          <div className="border border-surface-container-high/80 rounded-2xl p-5 sm:p-6 bg-surface-container-low/40 hover-lift space-y-4">
            {/* Question Header */}
            <div className="flex items-start gap-3.5">
              <span className="font-label text-xs font-bold px-2.5 py-1 rounded-md bg-secondary-fixed text-on-secondary-fixed-variant mt-0.5">
                Q2
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-label text-[11px] font-bold text-secondary uppercase tracking-wider">
                    Hội Đồng Phản Biện • Câu Hỏi Cốt Lõi
                  </span>
                  <span className="text-xs text-on-surface-variant font-semibold">GS. Viện sĩ Hoàng Vĩnh</span>
                </div>
                <p className="font-headline text-base sm:text-lg text-on-surface italic leading-snug">
                  “Nếu áp dụng ma trận 10 triệu node, thuật toán có gây tràn bộ nhớ VRAM GPU đơn lẻ không? Hãy nêu con số phần cứng chính xác.”
                </p>
              </div>
            </div>

            {/* Comparison Box */}
            <div className="sm:ml-9 space-y-3.5">
              <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-secondary/30 text-xs font-body text-on-surface-variant">
                <span className="font-label font-bold text-secondary">Lỗi trả lời thực tế:</span>
                <span className="italic">
                  {' '}
                  Trả lời lảng tránh: “Thuật toán chạy rất nhanh và có cụm GPU thì sẽ chạy mượt ạ.”
                </span>
                <span className="block mt-1 font-label text-[11px] text-error font-semibold">
                  → Bị trừ 6 điểm vì thiếu con số định lượng bộ nhớ phần cứng.
                </span>
              </div>

              <div className="p-4 sm:p-5 bg-gradient-to-br from-primary-fixed/25 via-surface-container-lowest to-surface-container-low rounded-xl border border-primary/25 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-label text-xs font-bold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[17px]">verified</span>
                    Gợi Ý Trả Lời Tối Ưu (Định lượng chuẩn xác)
                  </span>
                  <span className="font-label text-xs font-bold text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full">
                    100 / 100
                  </span>
                </div>
                <p className="font-body text-sm text-on-surface leading-relaxed">
                  “Nếu tính toán toàn phần O(N²), hệ thống chắc chắn tràn VRAM trên GPU đơn. Tuy nhiên, luận án áp dụng định dạng thưa CSR kết hợp Neighborhood Sampling, đưa độ phức tạp lưu trữ về <strong>O(V + E)</strong>. Với tham số k=15, bộ nhớ thực tế chỉ tiêu tốn <strong>11.4 GB VRAM</strong>, vận hành hoàn toàn an toàn trên dòng card đồ họa 16GB phổ thông.”
                </p>
                <div className="flex items-center gap-2 pt-1 font-label text-xs text-primary font-semibold">
                  <span className="material-symbols-outlined text-[15px]">tips_and_updates</span>
                  <span>Bí quyết tranh biện: Thừa nhận giới hạn vật lý trước khi giải thích giải pháp tối ưu toán học.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

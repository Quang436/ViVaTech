import React from 'react';
import type { UserProfile } from './Navbar';

interface HomeViewProps {
  onStartSetup: () => void;
  onExploreArchive: () => void;
  onOpenAuth: () => void;
  user: UserProfile | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartSetup,
  onExploreArchive,
  onOpenAuth,
  user,
}) => {
  return (
    <div className="pt-20 pb-16 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-16 lg:gap-24 relative z-10">
      {/* ==================== 1. HERO SECTION ==================== */}
      <section className="flex flex-col items-center text-center pt-4 sm:pt-8 max-w-5xl mx-auto w-full">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-lowest/90 border border-primary/20 shadow-xs text-primary mb-6 hover:border-primary/40 transition-all cursor-default">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="font-label text-xs sm:text-sm font-semibold tracking-wide">
            ✨ Nền tảng Giả lập Bảo vệ Luận án AI • Gemini 3.8 CoT & RAG
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-on-surface leading-[1.15] mb-5 max-w-4xl">
          Vững vàng trước Hội đồng bảo vệ với{' '}
          <span className="italic font-headline font-bold inline-block tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#005c55] via-[#0f766e] to-[#0047bf]">
            AI Phản biện Học thuật
          </span>
        </h1>

        {/* Subtitle */}
        <p className="font-body text-sm sm:text-base lg:text-lg text-on-surface-variant max-w-2xl mx-auto mb-8 leading-relaxed">
          Mô phỏng áp lực bảo vệ luận án trực tiếp. Giám khảo AI ứng dụng suy luận đa bước (CoT) truy vấn
          chéo tài liệu, thử thách logic lập luận và chuẩn hóa phản xạ đối đáp trước giờ G.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-12 w-full sm:w-auto">
          <button
            onClick={onStartSetup}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-primary-container text-on-primary font-label text-base font-semibold shadow-lg shadow-primary/20 hover:bg-primary transition-all duration-200 flex items-center justify-center gap-2 group relative overflow-hidden shimmer-btn-effect cursor-pointer border-none"
          >
            <span className="relative z-10">Bắt đầu diễn tập ngay</span>
            <span className="material-symbols-outlined text-[20px] relative z-10 group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>

          <button
            onClick={onExploreArchive}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-container-lowest/90 hover:bg-surface-container-low text-on-surface font-label text-base font-semibold border border-surface-container-high transition-all flex items-center justify-center gap-2 shadow-xs group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-primary group-hover:scale-110 transition-transform">
              play_circle
            </span>
            <span>Xem Kho đề án mẫu</span>
          </button>

          {!user && (
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label text-base font-bold border border-surface-container-high/80 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              <span>Đăng nhập học thuật</span>
            </button>
          )}
        </div>

        {/* LIVE INTERACTIVE SIMULATION CARD (HERO MOCKUP) */}
        <div className="w-full max-w-4xl bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl border border-surface-container-highest/80 shadow-xl p-5 sm:p-7 text-left relative overflow-hidden hover-lift">
          {/* Top Window Chrome & Live Voice Waveform */}
          <div className="flex flex-wrap items-center justify-between pb-4 mb-5 border-b border-surface-container-high/60 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-error/70"></span>
              <span className="w-3 h-3 rounded-full bg-secondary-container"></span>
              <span className="w-3 h-3 rounded-full bg-primary-fixed-dim"></span>
              <span className="ml-2 font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                Phòng Hội Đồng Trực Tiếp #4029 • Tranh Biện AI Thời Gian Thực
              </span>
            </div>
            {/* Dynamic Soundwave Animation */}
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-[15px] text-primary animate-pulse">
                mic
              </span>
              <div className="flex items-center gap-1 h-4 px-1">
                <span className="w-1 bg-primary rounded-full wave-bar"></span>
                <span className="w-1 bg-primary rounded-full wave-bar"></span>
                <span className="w-1 bg-primary rounded-full wave-bar"></span>
                <span className="w-1 bg-primary rounded-full wave-bar"></span>
                <span className="w-1 bg-primary rounded-full wave-bar"></span>
              </div>
              <span className="font-label text-xs text-primary font-bold">Thu âm giọng nói</span>
            </div>
          </div>

          {/* Body Simulation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left: Question Persona Box */}
            <div className="lg:col-span-7 bg-surface-container-low/70 rounded-xl p-4 sm:p-5 flex flex-col justify-between border border-surface-container-high/40">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs font-label shadow-xs">
                    GS
                  </div>
                  <div>
                    <h3 className="font-label font-bold text-sm text-on-surface">
                      GS. TS. Vũ Thành Đạt
                    </h3>
                    <p className="font-label text-[11px] text-on-surface-variant">
                      Chủ tịch Hội đồng Viện AI Quốc gia
                    </p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest/80 rounded-xl p-3.5 border-l-4 border-primary shadow-xs">
                  <p className="font-headline text-sm sm:text-base italic text-on-surface leading-relaxed">
                    “Bạn đã nêu được 2 thành phần mô hình, nhưng chưa giải thích được{' '}
                    <strong className="text-primary not-italic font-bold">
                      cơ chế dung hợp đặc trưng (Feature Fusion)
                    </strong>
                    . Cụ thể ma trận kề trong GNN được khởi tạo ra sao khi đồ thị có hàng triệu node?”
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-label text-on-surface-variant pt-2 border-t border-surface-container-high/40">
                <span className="flex items-center gap-1.5 text-primary font-semibold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  Thời gian phản xạ: 00:39s
                </span>
                <span className="bg-primary-fixed/40 text-on-primary-fixed-variant px-2 py-0.5 rounded font-mono">
                  Gemini 3.8 Live
                </span>
              </div>
            </div>

            {/* Right: CoT Reasoning Preview */}
            <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-4 sm:p-5 border border-surface-container-high/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-container-high/50">
                  <span className="font-label text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[17px]">psychology</span>
                    Tiến trình Suy luận CoT
                  </span>
                  <span className="text-[10px] font-label font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    Khớp RAG 82%
                  </span>
                </div>
                <div className="space-y-2.5 text-xs font-body">
                  <div className="p-2.5 rounded-lg bg-primary-fixed/20 border border-primary/20">
                    <span className="font-label font-bold text-primary block text-[11px] mb-0.5">
                      1. Đối chiếu tài liệu
                    </span>
                    <span className="text-on-surface-variant leading-snug block">
                      Khớp Chương 3 trang 48: Kiến trúc kết hợp BERT + GNN đã nạp.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary-fixed/25 border border-secondary/20">
                    <span className="font-label font-bold text-secondary block text-[11px] mb-0.5">
                      2. Điểm cần làm rõ
                    </span>
                    <span className="text-on-surface-variant leading-snug block">
                      Thiếu giải trình về tràn VRAM khi mở rộng đồ thị quy mô lớn.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-tertiary-fixed/20 border border-tertiary/20">
                    <span className="font-label font-bold text-tertiary block text-[11px] mb-0.5">
                      3. Hướng truy vấn tiếp theo
                    </span>
                    <span className="text-on-surface-variant leading-snug block">
                      Thử thách thuật toán Neighbor Sampling của GraphSAGE.
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[11px] font-label text-on-surface-variant/80 text-right">
                Độ trễ suy luận: <strong className="text-on-surface">420ms</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl mt-12 pt-8 border-t border-surface-container-high/60">
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/70 shadow-xs flex flex-col items-center">
            <span className="font-headline text-3xl font-bold text-primary">1,280+</span>
            <span className="font-label text-xs text-on-surface-variant mt-1">Phiên bảo vệ giả lập</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/70 shadow-xs flex flex-col items-center">
            <span className="font-headline text-3xl font-bold text-secondary">98.4%</span>
            <span className="font-label text-xs text-on-surface-variant mt-1">Tăng điểm phản biện</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/70 shadow-xs flex flex-col items-center">
            <span className="font-headline text-3xl font-bold text-tertiary">3 Cấp độ</span>
            <span className="font-label text-xs text-on-surface-variant mt-1">Hội đồng áp lực CoT</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/70 shadow-xs flex flex-col items-center">
            <span className="font-headline text-3xl font-bold text-emerald-700">&lt; 0.8s</span>
            <span className="font-label text-xs text-on-surface-variant mt-1">Phản hồi đối đáp AI</span>
          </div>
        </div>
      </section>

      {/* ==================== 2. TRỤ CỘT HỌC THUẬT (3 PILLARS) ==================== */}
      <section className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-label text-xs uppercase font-bold tracking-wider text-primary">
            Công nghệ lõi phục vụ bảo vệ đồ án
          </span>
          <h2 className="font-headline text-2xl sm:text-4xl font-semibold text-on-surface mt-1.5">
            Tại sao VivaArena vượt trội hơn LLM thông thường?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover-lift flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary-fixed/50 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
                RAG Bóc tách Ground Truth
              </h3>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Đọc hiểu trực tiếp tệp PDF đồ án, tự động phân tích cấu trúc chương mục, công thức toán
                học và dữ liệu đo đạc thực nghiệm để truy vấn chéo sát từng trang.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-surface-container-high/50 flex items-center gap-1.5 text-xs font-label text-primary font-semibold">
              <span className="material-symbols-outlined text-[17px]">verified</span>
              <span>Trích xuất trích dẫn số trang chính xác</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover-lift flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-secondary-fixed/50 text-secondary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">psychology</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
                Gemini 3.8 Chain-of-Thought
              </h3>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Hội đồng AI suy luận đa tầng, phát hiện tức thì lỗi ngụy biện né tránh số liệu, kết luận
                vội vã hay lỗ hổng phương pháp luận nghiên cứu khoa học.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-surface-container-high/50 flex items-center gap-1.5 text-xs font-label text-secondary font-semibold">
              <span className="material-symbols-outlined text-[17px]">bolt</span>
              <span>Phản biện đối kháng thời gian thực</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover-lift flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/50 text-tertiary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">grading</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
                Bảng Điểm Chuẩn Scopus/ISI
              </h3>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Phân tích 4 trục năng lực học thuật: Logic phương pháp, kỹ năng tranh luận, bản lĩnh đối
                đáp và độ khúc chiết. Đi kèm gợi ý câu trả lời kiểu mẫu chuẩn PREP.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-surface-container-high/50 flex items-center gap-1.5 text-xs font-label text-tertiary font-semibold">
              <span className="material-symbols-outlined text-[17px]">workspace_premium</span>
              <span>Rubrics hội đồng 100 điểm chi tiết</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 3. BOTTOM CTA BANNER ==================== */}
      <section className="bg-gradient-to-r from-primary-container to-primary text-on-primary rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 max-w-6xl mx-auto w-full relative overflow-hidden">
        <div className="space-y-3 text-center md:text-left relative z-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-label font-bold uppercase tracking-wider backdrop-blur-sm">
            Tối ưu cho khóa luận tốt nghiệp 2025
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight">
            Tự tin bước vào phòng bảo vệ chính thức
          </h2>
          <p className="font-body text-sm sm:text-base text-white/85 max-w-xl leading-relaxed">
            Chỉ cần nạp tệp đồ án, chọn phong cách hội đồng mong muốn và bắt đầu luyện tập phản biện
            trong 30 giây.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 flex-shrink-0">
          <button
            onClick={onStartSetup}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-primary font-label text-base font-bold shadow-lg hover:bg-surface-container-lowest hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            <span>Khởi tạo phiên ngay</span>
          </button>
        </div>
      </section>
    </div>
  );
};

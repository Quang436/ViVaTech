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
    <div className="pt-20 pb-16 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-14 sm:gap-20">
      {/* ================= HERO SECTION ================= */}
      <section className="pt-4 sm:pt-8 flex flex-col items-center text-center gap-6 relative">
        {/* Academic Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest border border-primary/25 text-primary text-xs font-label font-bold shadow-xs anim-float-slow">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span>NỀN TẢNG TRANH BIỆN HỌC THUẬT AI • VIVAARENA 2025</span>
        </div>

        {/* Hero Title */}
        <div className="max-w-4xl mx-auto">
          <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-on-surface leading-[1.15]">
            Vững Vàng Trước Hội Đồng với{' '}
            <span className="text-primary italic font-serif">AI Phản Biện Chuyên Sâu</span>
          </h1>
          <p className="font-body text-sm sm:text-base lg:text-lg text-on-surface-variant max-w-2xl mx-auto mt-4 leading-relaxed">
            Mô phỏng áp lực phòng bảo vệ đồ án tốt nghiệp, luận văn thạc sĩ và bài báo khoa học.
            Công nghệ <strong>Gemini 3.8 CoT & RAG</strong> bóc tách từng luận điểm, truy vấn chéo
            số liệu và rèn luyện phản xạ đối đáp trước giờ G.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-2">
          <button
            onClick={onStartSetup}
            className="px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-container text-white font-label text-sm sm:text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2.5 cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            <span>Khởi tạo Phiên bảo vệ thử</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>

          <button
            onClick={onExploreArchive}
            className="px-5 py-3.5 rounded-2xl bg-surface-container-lowest hover:bg-surface-container-low border border-surface-container-high text-on-surface font-label text-sm sm:text-base font-semibold shadow-xs hover:border-primary/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">folder_open</span>
            <span>Khám phá Kho đề án mẫu</span>
          </button>

          {!user && (
            <button
              onClick={onOpenAuth}
              className="px-5 py-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/80 text-primary font-label text-sm sm:text-base font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              <span>Đăng nhập học thuật</span>
            </button>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl mt-6 pt-6 border-t border-surface-container-high/60">
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/70 shadow-xs flex flex-col items-center">
            <span className="font-headline text-2xl sm:text-3xl font-bold text-primary">1,200+</span>
            <span className="font-label text-xs text-on-surface-variant mt-0.5">Phiên bảo vệ giả lập</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/70 shadow-xs flex flex-col items-center">
            <span className="font-headline text-2xl sm:text-3xl font-bold text-secondary">98.4%</span>
            <span className="font-label text-xs text-on-surface-variant mt-0.5">Tăng điểm phản biện</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/70 shadow-xs flex flex-col items-center">
            <span className="font-headline text-2xl sm:text-3xl font-bold text-tertiary">3 Cấp độ</span>
            <span className="font-label text-xs text-on-surface-variant mt-0.5">Hội đồng áp lực CoT</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/70 shadow-xs flex flex-col items-center">
            <span className="font-headline text-2xl sm:text-3xl font-bold text-emerald-700">&lt; 1.2s</span>
            <span className="font-label text-xs text-on-surface-variant mt-0.5">Phản hồi đối đáp thời gian thực</span>
          </div>
        </div>
      </section>

      {/* ================= 3 PILLARS / TRỤ CỘT HỌC THUẬT ================= */}
      <section className="flex flex-col gap-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-label text-xs uppercase font-bold tracking-wider text-primary">
            Công nghệ lõi phục vụ bảo vệ đồ án
          </span>
          <h2 className="font-headline text-2xl sm:text-4xl font-semibold text-on-surface mt-1">
            Tại sao VivaArena vượt trội hơn LLM thông thường?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1 */}
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-4">
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
            <div className="mt-4 pt-4 border-t border-surface-container-high/50 flex items-center gap-1.5 text-xs font-label text-primary font-semibold">
              <span className="material-symbols-outlined text-[17px]">verified</span>
              <span>Trích xuất trích dẫn số trang chính xác</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center mb-4">
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
            <div className="mt-4 pt-4 border-t border-surface-container-high/50 flex items-center gap-1.5 text-xs font-label text-secondary font-semibold">
              <span className="material-symbols-outlined text-[17px]">bolt</span>
              <span>Phản biện đối kháng thời gian thực</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed text-tertiary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">analytics</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
                Báo cáo Rubrics & Câu trả lời PREP
              </h3>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Chấm điểm 4 trục chuẩn mực học thuật: Tính logic, Lập luận, Bản lĩnh phòng thủ, Khúc chiết;
                kèm gợi ý câu trả lời mẫu theo chuẩn quốc tế Point - Reason - Example - Point.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-surface-container-high/50 flex items-center gap-1.5 text-xs font-label text-tertiary font-semibold">
              <span className="material-symbols-outlined text-[17px]">fact_check</span>
              <span>Xuất phiếu điểm PDF chuẩn Hội đồng</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3 HỘI ĐỒNG GIÁM KHẢO ================= */}
      <section className="flex flex-col gap-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-label text-xs uppercase font-bold tracking-wider text-secondary">
            Cấu hình nhân vật Giám khảo
          </span>
          <h2 className="font-headline text-2xl sm:text-4xl font-semibold text-on-surface mt-1">
            Trải nghiệm 3 Phong cách Hội đồng AI
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Persona 1 */}
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-container-high shadow-xs flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-emerald-500/20 mb-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                alt="TS. Nguyễn Minh Triết"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-label font-bold mb-1">
              Cấp độ 1 • Gợi mở & Củng cố
            </span>
            <h3 className="font-headline text-lg font-bold text-on-surface">TS. Nguyễn Minh Triết</h3>
            <p className="font-label text-xs text-on-surface-variant mb-2">Giảng viên Hướng dẫn</p>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Điềm tĩnh, hỗ trợ làm rõ logic đề tài, củng cố giả thuyết và dẫn dắt giải quyết các điểm
              nghẽn kỹ thuật.
            </p>
          </div>

          {/* Persona 2 */}
          <div className="p-6 rounded-3xl bg-surface-container-lowest border-2 border-primary/40 shadow-md flex flex-col items-center text-center relative">
            <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-primary text-white text-[10px] font-label font-bold tracking-wider uppercase">
              Phổ biến nhất
            </div>
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-primary/20 mb-3">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
                alt="PGS. TS. Đặng Hoàng Lan"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/40 text-primary text-[11px] font-label font-bold mb-1">
              Cấp độ 2 • Nghiêm cẩn & Thẩm định
            </span>
            <h3 className="font-headline text-lg font-bold text-on-surface">PGS. TS. Đặng Hoàng Lan</h3>
            <p className="font-label text-xs text-on-surface-variant mb-2">Phản biện Học thuật</p>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Truy vấn khắt khe phương pháp luận, ma trận thực nghiệm, đối sánh benchmark và độ tin cậy
              của số liệu khảo sát.
            </p>
          </div>

          {/* Persona 3 */}
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-container-high shadow-xs flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-rose-500/20 mb-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                alt="GS. Viện sĩ Hoàng Vĩnh"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-label font-bold mb-1">
              Cấp độ 3 • Đối kháng & Stress-Test
            </span>
            <h3 className="font-headline text-lg font-bold text-on-surface">GS. Viện sĩ Hoàng Vĩnh</h3>
            <p className="font-label text-xs text-on-surface-variant mb-2">Chủ tịch Hội đồng Stress-Test</p>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Tạo áp lực đối thoại dồn dập, chất vấn các trường hợp biên cực đoan và kịch bản sụp đổ
              của mô hình thực tế.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 4-STEP WORKFLOW ================= */}
      <section className="p-8 sm:p-12 rounded-3xl bg-surface-container-low/80 border border-surface-container-high">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-label text-xs uppercase font-bold tracking-wider text-primary">
            Quy trình chuẩn hóa
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-semibold text-on-surface mt-1">
            4 Bước Chinh Phục Phòng Bảo Vệ Đồ Án
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col gap-2">
            <span className="font-headline text-4xl font-extrabold text-primary/30">01</span>
            <h4 className="font-label text-sm font-bold text-on-surface">Tải Lên Báo Cáo Đề Án</h4>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Định dạng PDF khóa luận hoặc bài báo. AI trích xuất 100% mục lục, bảng số liệu và thuật toán.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-headline text-4xl font-extrabold text-secondary/30">02</span>
            <h4 className="font-label text-sm font-bold text-on-surface">Cấu Hình Hội Đồng AI</h4>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Chọn cấp độ phản biện, thiết lập số lượt đối đáp tối đa và kích hoạt nhận diện giọng nói.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-headline text-4xl font-extrabold text-tertiary/30">03</span>
            <h4 className="font-label text-sm font-bold text-on-surface">Tranh Biện Trực Tiếp</h4>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Đối đáp trực diện với Hội đồng AI, rèn luyện làm chủ thời gian và phong thái tự tin.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-headline text-4xl font-extrabold text-primary/30">04</span>
            <h4 className="font-label text-sm font-bold text-on-surface">Xem Bảng Điểm & Ôn Tập</h4>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Nhận kết quả Rubrics 4 trục, danh sách lỗi ngụy biện cần khắc phục và kịch bản mẫu chuẩn PREP.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA BANNER ================= */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary to-primary-container text-white text-center flex flex-col items-center gap-5 shadow-xl">
        <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-label font-bold uppercase tracking-wider">
          Chuẩn Bị Sớm • Thắng Lợi Lớn
        </span>
        <h2 className="font-headline text-3xl sm:text-4xl font-semibold max-w-2xl leading-tight">
          Đừng Để Phòng Bảo Vệ Thật Là Lần Phản Biện Đầu Tiên Của Bạn!
        </h2>
        <p className="font-body text-sm sm:text-base text-white/90 max-w-xl">
          Tham gia cùng hơn 1,200+ học viên từ các trường Đại học hàng đầu Việt Nam để tự tin đạt điểm A trong lễ tốt nghiệp.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <button
            onClick={onStartSetup}
            className="px-6 py-3.5 rounded-xl bg-white text-primary font-label text-sm sm:text-base font-bold shadow-md hover:bg-surface-container-low transition-all cursor-pointer border-none"
          >
            Bắt đầu Phiên Giả lập ngay
          </button>
          {!user && (
            <button
              onClick={onOpenAuth}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-label text-sm sm:text-base font-bold transition-all cursor-pointer"
            >
              Đăng nhập tài khoản
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

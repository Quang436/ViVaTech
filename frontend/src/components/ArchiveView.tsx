import React from 'react';

interface ArchiveViewProps {
  onNewSession: () => void;
  onViewScorecard: () => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  onNewSession,
  onViewScorecard,
}) => {
  return (
    <main className="relative z-10 pt-24 pb-16 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Hero / Portfolio Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-surface-container-high/70">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/60 text-on-primary-fixed-variant font-label text-xs font-semibold tracking-wide mb-3 border border-primary/20">
            <span className="material-symbols-outlined text-sm text-primary">workspace_premium</span>
            <span>HỒ SƠ MINH CHỨNG & TIẾN ĐỘ HỌC THUẬT</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-on-surface leading-tight">
            Hồ sơ Năng lực & Lịch sử Đề án
          </h1>
          <p className="font-body text-sm sm:text-base text-on-surface-variant mt-2 leading-relaxed">
            Theo dõi trực quan hành trình bứt phá tư duy phản biện qua từng phiên thử lửa với Hội đồng AI.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-shrink-0">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-lowest/90 text-on-surface font-label text-sm font-semibold hover:bg-surface-container-low transition-all shadow-xs hover-lift cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px] text-primary">download</span>
            <span>Xuất E-Portfolio</span>
          </button>
          <button
            onClick={onNewSession}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-label text-sm font-semibold hover:bg-primary transition-all shadow-md shadow-primary/20 hover-lift cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-[19px]">add_circle</span>
            <span>Tạo Phiên Mới</span>
          </button>
        </div>
      </section>

      {/* 4 Focused KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-5 border border-surface-container-high/80 hover-lift flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-3">
            <span className="font-label text-xs font-semibold uppercase tracking-wider">Số phiên bảo vệ</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[19px]">fact_check</span>
            </div>
          </div>
          <div>
            <div className="font-headline text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">14</div>
            <div className="font-label text-xs text-on-surface-variant mt-1.5">
              Tổng thời lượng: <span className="font-semibold text-on-surface">4 giờ 25 phút</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-5 border border-primary/25 ring-1 ring-primary/10 hover-lift flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-3">
            <span className="font-label text-xs font-semibold uppercase tracking-wider">Điểm trung bình</span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed/60 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[19px]">award_star</span>
            </div>
          </div>
          <div>
            <div className="font-headline text-3xl sm:text-4xl font-bold text-primary tracking-tight">
              82.8<span className="font-body text-sm font-normal text-on-surface-variant">/100</span>
            </div>
            <div className="font-label text-xs text-primary font-semibold mt-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Tăng 9.2 điểm so với phiên đầu
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-5 border border-surface-container-high/80 hover-lift flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-3">
            <span className="font-label text-xs font-semibold uppercase tracking-wider">Độ sẵn sàng bảo vệ</span>
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed/50 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[19px]">verified_user</span>
            </div>
          </div>
          <div>
            <div className="font-headline text-3xl sm:text-4xl font-bold text-secondary tracking-tight">89%</div>
            <div className="font-label text-xs text-on-surface-variant font-medium mt-1.5">
              Mức độ: <span className="text-secondary font-bold">Rất an toàn</span> (Phản xạ 0.8s)
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-5 border border-surface-container-high/80 hover-lift flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-3">
            <span className="font-label text-xs font-semibold uppercase tracking-wider">Cải thiện tư duy logic</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[19px]">psychology</span>
            </div>
          </div>
          <div>
            <div className="font-headline text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">+28.4%</div>
            <div className="font-label text-xs text-on-surface-variant mt-1.5">
              Giảm ngụy biện xuống <span className="font-semibold text-on-surface">0.4 lỗi / phiên</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Cognitive Growth Curve Vector Graph */}
      <section className="bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-surface-container-high/80 shadow-sm hover-lift">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-surface-container-high/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">insights</span>
              <h2 className="font-headline text-xl sm:text-2xl font-semibold text-on-surface">
                Đường Cong Nhận Thức (Cognitive Growth Curve)
              </h2>
            </div>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1">
              Theo dõi tốc độ tăng trưởng độ vững phương pháp, khả năng chịu áp lực và điểm thẩm định qua 3 tuần.
            </p>
          </div>
          {/* Graph Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-label font-semibold text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <span>Điểm Thẩm định</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Chịu tải Stress AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-secondary"></span>
              <span>Độ vững phương pháp</span>
            </div>
          </div>
        </div>

        {/* SVG Progress Curve */}
        <div className="w-full mt-4 pt-2">
          <svg className="w-full h-60 font-label text-xs" preserveAspectRatio="none" viewBox="0 0 900 230">
            <defs>
              <linearGradient id="scoreAreaLight" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#005c55" stopOpacity="0.18"></stop>
                <stop offset="100%" stopColor="#005c55" stopOpacity="0.0"></stop>
              </linearGradient>
              <linearGradient id="stressAreaLight" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.10"></stop>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0"></stop>
              </linearGradient>
            </defs>
            {/* Horizontal Reference Grid */}
            <line stroke="#eaedff" strokeWidth="1" x1="50" x2="870" y1="25" y2="25"></line>
            <text fill="#6e7977" fontSize="10" x="25" y="29">100</text>
            <line stroke="#eaedff" strokeWidth="1" x1="50" x2="870" y1="75" y2="75"></line>
            <text fill="#6e7977" fontSize="10" x="25" y="79">80</text>
            <line stroke="#eaedff" strokeWidth="1" x1="50" x2="870" y1="125" y2="125"></line>
            <text fill="#6e7977" fontSize="10" x="25" y="129">60</text>
            <line stroke="#eaedff" strokeWidth="1" x1="50" x2="870" y1="175" y2="175"></line>
            <text fill="#6e7977" fontSize="10" x="25" y="179">40</text>

            {/* Vertical Milestone Markers */}
            <line stroke="#dae2fd" strokeDasharray="4 4" strokeWidth="1.2" x1="170" x2="170" y1="20" y2="185"></line>
            <line stroke="#dae2fd" strokeDasharray="4 4" strokeWidth="1.2" x1="470" x2="470" y1="20" y2="185"></line>
            <line stroke="#dae2fd" strokeDasharray="4 4" strokeWidth="1.2" x1="770" x2="770" y1="20" y2="185"></line>
            <text fill="#3e4947" fontWeight="600" textAnchor="middle" x="170" y="208">Tuần 1: Căn bản</text>
            <text fill="#3e4947" fontWeight="600" textAnchor="middle" x="470" y="208">Tuần 2: Peer Review</text>
            <text fill="#005c55" fontWeight="700" textAnchor="middle" x="770" y="208">Tuần 3: Stress-Test Toàn diện</text>

            {/* Area: Stress AI (Amber) */}
            <path d="M 170 148 C 270 142, 370 118, 470 94 C 570 76, 670 64, 770 48 L 770 185 L 170 185 Z" fill="url(#stressAreaLight)"></path>
            <path d="M 170 148 C 270 142, 370 118, 470 94 C 570 76, 670 64, 770 48" fill="none" stroke="#f59e0b" strokeWidth="2.5"></path>

            {/* Line: Methodology Curve (Secondary Blue) */}
            <path d="M 170 160 C 270 146, 370 112, 470 86 C 570 72, 670 58, 770 42" fill="none" stroke="#006398" strokeDasharray="5 4" strokeWidth="2.2"></path>

            {/* Area & Line: Thesis Score (Primary) */}
            <path d="M 170 136 C 270 120, 370 88, 470 66 C 570 52, 670 38, 770 28 L 770 185 L 170 185 Z" fill="url(#scoreAreaLight)"></path>
            <path d="M 170 136 C 270 120, 370 88, 470 66 C 570 52, 670 38, 770 28" fill="none" stroke="#005c55" strokeWidth="3"></path>

            {/* Interactivity Nodes */}
            <circle cx="170" cy="136" fill="#ffffff" r="4.5" stroke="#005c55" strokeWidth="2.5"></circle>
            <circle cx="470" cy="66" fill="#ffffff" r="4.5" stroke="#005c55" strokeWidth="2.5"></circle>
            <circle className="pulse-node" cx="770" cy="28" fill="#005c55" r="5.5" stroke="#ffffff" strokeWidth="2"></circle>

            {/* High-Score Floating Badge */}
            <rect fill="#005c55" height="22" rx="6" width="84" x="728" y="2"></rect>
            <text fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" x="770" y="17">91.0 ĐIỂM</text>
          </svg>
        </div>
      </section>

      {/* 2-Column: Recent Sessions (8 cols) & Action Recommendations (4 cols) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sessions List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="font-headline text-2xl font-semibold text-on-surface">
                Danh sách Phiên Luyện tập Gần nhất
              </h2>
              <p className="font-body text-xs text-on-surface-variant">
                Lịch sử đánh giá từ các phiên bảo vệ đối kháng với Hội đồng AI.
              </p>
            </div>
            <span className="font-label text-xs text-primary bg-primary-fixed/50 px-3 py-1 rounded-full font-bold">
              3 phiên mới nhất
            </span>
          </div>

          {/* Session 1: Good / Passing */}
          <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-5 border border-surface-container-high/80 hover-lift shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label font-bold text-xs">
                  Cấp độ 2 • Academic Reviewer
                </span>
                <span className="font-label text-xs text-on-surface-variant">2 ngày trước (14:32)</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-label font-bold px-3 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> ĐẠT YÊU CẦU
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 my-2">
              <div>
                <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface hover:text-primary transition-colors cursor-pointer">
                  Phiên 1: Hệ thống GNN & BERT Phân tích Văn bản Học thuật
                </h3>
                <p className="font-body text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                  Đề án ứng dụng Graph Neural Network kết hợp BERT phân tích ngữ nghĩa lan truyền tài liệu và bài báo khoa học.
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-headline text-3xl font-bold text-primary">
                  83.5<span className="text-xs font-normal text-on-surface-variant">/100</span>
                </div>
                <span className="font-label text-[11px] text-on-surface-variant">Hội đồng PGS. TS. Trần Thu Hà</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-surface-container-high/60 text-xs font-label text-on-surface-variant">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">timer</span> 22m 15s
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">forum</span> 5 chất vấn
                </span>
                <span className="flex items-center gap-1 text-amber-700 font-semibold">
                  <span className="material-symbols-outlined text-[16px]">warning</span> 1 lỗi né tránh số liệu
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onViewScorecard}
                  className="px-3.5 py-1.5 rounded-xl border border-surface-container-high text-on-surface font-semibold hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  Xem Bảng Điểm
                </button>
                <button
                  onClick={onNewSession}
                  className="px-3.5 py-1.5 rounded-xl bg-primary-fixed text-on-primary-fixed-variant font-bold hover:bg-primary-fixed/80 transition-colors cursor-pointer border-none"
                >
                  Diễn tập lại
                </button>
              </div>
            </div>
          </div>

          {/* Session 2: Needs Review */}
          <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-5 border border-surface-container-high/80 hover-lift shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label font-bold text-xs">
                  Cấp độ 3 • Stress-Test Khó
                </span>
                <span className="font-label text-xs text-on-surface-variant">5 ngày trước (09:15)</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-label font-bold px-3 py-0.5 rounded-full bg-amber-100/80 text-amber-800 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> CẦN ÔN LẠI
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 my-2">
              <div>
                <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface hover:text-primary transition-colors cursor-pointer">
                  Phiên 2: Kiến trúc Vi dịch vụ Chịu lỗi Cao Fintech
                </h3>
                <p className="font-body text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                  Đánh giá khả năng chịu lỗi (fault-tolerance), giải thuật đồng thuận CAP theorem và chi phí phân mảnh cơ sở dữ liệu phân tán.
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-headline text-3xl font-bold text-amber-700">
                  74.0<span className="text-xs font-normal text-on-surface-variant">/100</span>
                </div>
                <span className="font-label text-[11px] text-on-surface-variant">Hội đồng GS. Viện sĩ Hoàng Vĩnh</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-surface-container-high/60 text-xs font-label text-on-surface-variant">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">timer</span> 35m 40s
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">forum</span> 10 chất vấn
                </span>
                <span className="flex items-center gap-1 text-error font-semibold">
                  <span className="material-symbols-outlined text-[16px]">error</span> 2 lỗi Strawman
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onViewScorecard}
                  className="px-3.5 py-1.5 rounded-xl border border-surface-container-high text-on-surface font-semibold hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  Xem Bảng Điểm
                </button>
                <button
                  onClick={onNewSession}
                  className="px-3.5 py-1.5 rounded-xl bg-primary-fixed text-on-primary-fixed-variant font-bold hover:bg-primary-fixed/80 transition-colors cursor-pointer border-none"
                >
                  Diễn tập lại
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-5 border border-primary/20 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-xl">auto_fix_high</span>
              <h3 className="font-headline text-lg font-bold text-on-surface">Khuyến nghị Ôn luyện Tiếp theo</h3>
            </div>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed mb-4">
              Dựa trên phân tích CoT từ 14 phiên trước, AI phát hiện bạn có xu hướng trả lời vội khi gặp câu hỏi về chi phí phần cứng.
            </p>
            <div className="p-3 rounded-xl bg-primary-fixed/20 border border-primary/20 text-xs font-body text-on-surface-variant space-y-2">
              <div className="font-bold text-primary font-label uppercase text-[10px]">Bài tập khắc phục:</div>
              <p>1. Chuẩn bị sẵn bảng thông số VRAM GPU cho các quy mô N=100K, 1M, 10M node.</p>
              <p>2. Áp dụng chuẩn PREP: Nêu trực tiếp luận điểm trước khi giải thích.</p>
            </div>
            <button
              onClick={onNewSession}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-primary text-white font-label font-bold text-xs hover:bg-primary-container transition-all cursor-pointer border-none"
            >
              Luyện Tập Kịch Bản Này Ngay
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

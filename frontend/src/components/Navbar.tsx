import React from 'react';

export type ActiveTab = 'home' | 'documents' | 'setup' | 'arena' | 'scorecard' | 'archive';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  sessionCode?: string;
  hasActiveSession?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  sessionCode = '#VV-9042',
  hasActiveSession = false,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/85 backdrop-blur-md border-b border-surface-container-high/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => onSelectTab('setup')}
            className="flex items-center gap-2.5 group text-left cursor-pointer border-none bg-transparent p-0"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-xs group-hover:bg-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">balance</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label font-bold text-base tracking-tight text-on-surface leading-none">
                VivaArena
              </span>
              <span className="font-label text-[10px] text-on-surface-variant font-medium tracking-wider mt-0.5 uppercase">
                Defense Simulator
              </span>
            </div>
          </button>

          {/* Session Tag */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-label pl-3 border-l border-surface-container-high">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-on-surface">Khóa luận 2025</span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface-variant font-mono">
              {hasActiveSession ? `PHIÊN BẢO VỆ ${sessionCode}` : 'Phiên giả lập số 01'}
            </span>
          </div>
        </div>

        {/* Main Navigation Links (Strict 6 Items Matching Stitch) */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-container-low/70 p-1 rounded-xl">
          <button
            onClick={() => onSelectTab('setup')}
            className={`px-3.5 py-1.5 rounded-lg font-label text-sm transition-all cursor-pointer border-none ${
              activeTab === 'home'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                : 'bg-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Trang chủ
          </button>

          <button
            onClick={() => onSelectTab('documents')}
            className={`px-3.5 py-1.5 rounded-lg font-label text-sm transition-all cursor-pointer border-none ${
              activeTab === 'documents'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                : 'bg-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Tài liệu
          </button>

          <button
            onClick={() => onSelectTab('setup')}
            className={`px-3.5 py-1.5 rounded-lg font-label text-sm transition-all cursor-pointer border-none ${
              activeTab === 'setup'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                : 'bg-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Thiết lập đề tài
          </button>

          <button
            onClick={() => onSelectTab('arena')}
            className={`px-3.5 py-1.5 rounded-lg font-label text-sm transition-all cursor-pointer border-none ${
              activeTab === 'arena'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                : 'bg-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Tranh biện AI
          </button>

          <button
            onClick={() => onSelectTab('scorecard')}
            className={`px-3.5 py-1.5 rounded-lg font-label text-sm transition-all cursor-pointer border-none ${
              activeTab === 'scorecard'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                : 'bg-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Đánh giá
          </button>

          <button
            onClick={() => onSelectTab('archive')}
            className={`px-3.5 py-1.5 rounded-lg font-label text-sm transition-all cursor-pointer border-none ${
              activeTab === 'archive'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                : 'bg-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Kho đề án
          </button>
        </nav>

        {/* Student Profile & Notification Action */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            aria-label="Thông báo"
            className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors relative cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          <div className="flex items-center gap-2 pl-1 border-l border-surface-container-high">
            <img
              alt="Avatar học viên"
              className="w-8 h-8 rounded-full ring-2 ring-primary/20 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjGexftNC_DNLJj7IX4Z7rHQ_XTgpKbqOiwpp0s5LxgeGmdFtlRXRPKEmkGo1gI8yBzrul2zPhizefq5gsyRzi49YA88bhhRMiBTpSaeaZVdF3HnMhqLNRo1CAhxy9PZPyOd8z7uq2pcseL7JSsrXAP5Jn_5IbfFCZy6q-Eb9a098cU2FmFpSREXLX7BmU2Pv2opto9iHC8gYrfMSBczNO__akHUIM84VMgfGyw9Ms"
            />
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="font-label text-xs text-on-surface font-semibold">Nguyễn Văn Khang</span>
              <span className="font-label text-[10px] text-on-surface-variant">Học viên Khóa 2025</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

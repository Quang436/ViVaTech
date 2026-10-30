import React, { useState } from 'react';

export type ActiveTab = 'home' | 'documents' | 'setup' | 'arena' | 'scorecard' | 'archive';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  sessionCode?: string;
  hasActiveSession?: boolean;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  unreadNotificationCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  sessionCode = '#VV-9042',
  hasActiveSession = false,
  user,
  onOpenAuth,
  onLogout,
  onOpenNotifications,
  unreadNotificationCount,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/85 backdrop-blur-md border-b border-surface-container-high/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 lg:gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => onSelectTab('setup')}
            className="flex items-center gap-2.5 group text-left cursor-pointer border-none bg-transparent p-0 flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-xs group-hover:bg-primary transition-colors flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">balance</span>
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-label font-bold text-base tracking-tight text-on-surface leading-none">
                VivaArena
              </span>
              <span className="font-label text-[10px] text-on-surface-variant font-medium tracking-wider mt-0.5 uppercase">
                Defense Simulator
              </span>
            </div>
          </button>

          {/* Session Tag */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-label pl-3 border-l border-surface-container-high whitespace-nowrap flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-on-surface">Khóa luận 2025</span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface-variant font-mono">
              {hasActiveSession ? `PHIÊN BẢO VỆ ${sessionCode}` : 'Phiên giả lập số 01'}
            </span>
          </div>
        </div>

        {/* Main Navigation Links (Strict 6 Items - whitespace-nowrap prevents line wrapping) */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-container-low/70 p-1 rounded-xl flex-shrink-0">
          <button
            onClick={() => onSelectTab('setup')}
            className={`whitespace-nowrap px-3 lg:px-3.5 py-1.5 rounded-lg font-label text-sm transition-all cursor-pointer border-none flex-shrink-0 ${
              activeTab === 'home'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                : 'bg-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Trang chủ
          </button>

          <button
            onClick={() => onSelectTab('documents')}
            className={`whitespace-nowrap px-3 lg:px-3.5 py-1.5 rounded-lg font-label text-sm transition-all cursor-pointer border-none flex-shrink-0 ${
              activeTab === 'documents'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                : 'bg-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Tài liệu
          </button>

          <button
            onClick={() => onSelectTab('setup')}
            className={`whitespace-nowrap px-3 lg:px-3.5 py-1.5 rounded-lg font-label text-sm transition-all cursor-pointer border-none flex-shrink-0 ${
              activeTab === 'setup'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                : 'bg-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Thiết lập đề tài
          </button>

          <button
            onClick={() => onSelectTab('arena')}
            className={`whitespace-nowrap px-3 lg:px-3.5 py-1.5 rounded-lg font-label text-sm transition-all cursor-pointer border-none flex-shrink-0 ${
              activeTab === 'arena'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                : 'bg-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Tranh biện AI
          </button>

          <button
            onClick={() => onSelectTab('scorecard')}
            className={`whitespace-nowrap px-3 lg:px-3.5 py-1.5 rounded-lg font-label text-sm transition-all cursor-pointer border-none flex-shrink-0 ${
              activeTab === 'scorecard'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                : 'bg-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Đánh giá
          </button>

          <button
            onClick={() => onSelectTab('archive')}
            className={`whitespace-nowrap px-3 lg:px-3.5 py-1.5 rounded-lg font-label text-sm transition-all cursor-pointer border-none flex-shrink-0 ${
              activeTab === 'archive'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                : 'bg-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Kho đề án
          </button>
        </nav>

        {/* Student Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 whitespace-nowrap relative">
          {/* Notification Button */}
          <button
            aria-label="Thông báo"
            onClick={onOpenNotifications}
            className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors relative cursor-pointer border-none flex-shrink-0"
            title="Xem thông báo học thuật"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-label font-bold text-[9px] flex items-center justify-center shadow-xs">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* User Profile or Login Trigger */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 pl-2 border-l border-surface-container-high flex-shrink-0 cursor-pointer border-none bg-transparent hover:opacity-85 transition-opacity"
              >
                <img
                  alt={user.name}
                  className="w-8 h-8 rounded-full ring-2 ring-primary/20 object-cover flex-shrink-0"
                  src={
                    user.avatar ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDjGexftNC_DNLJj7IX4Z7rHQ_XTgpKbqOiwpp0s5LxgeGmdFtlRXRPKEmkGo1gI8yBzrul2zPhizefq5gsyRzi49YA88bhhRMiBTpSaeaZVdF3HnMhqLNRo1CAhxy9PZPyOd8z7uq2pcseL7JSsrXAP5Jn_5IbfFCZy6q-Eb9a098cU2FmFpSREXLX7BmU2Pv2opto9iHC8gYrfMSBczNO__akHUIM84VMgfGyw9Ms'
                  }
                />
                <div className="hidden sm:flex flex-col text-left leading-tight whitespace-nowrap">
                  <span className="font-label text-xs text-on-surface font-semibold">{user.name}</span>
                  <span className="font-label text-[10px] text-on-surface-variant">{user.role}</span>
                </div>
                <span className="material-symbols-outlined text-sm text-on-surface-variant hidden sm:inline">
                  expand_more
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xl p-2 anim-float-slow">
                    <div className="p-3 border-b border-surface-container-high/60 mb-1">
                      <p className="font-label font-bold text-xs text-on-surface">{user.name}</p>
                      <p className="font-body text-[11px] text-on-surface-variant truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary-fixed/40 text-primary text-[10px] font-label font-bold">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTab('archive');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-label text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer border-none bg-transparent text-left"
                    >
                      <span className="material-symbols-outlined text-[17px] text-primary">folder_open</span>
                      <span>Hồ sơ đề án của tôi</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectTab('documents');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-label text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer border-none bg-transparent text-left"
                    >
                      <span className="material-symbols-outlined text-[17px] text-secondary">description</span>
                      <span>Quản lý tài liệu RAG</span>
                    </button>

                    <div className="h-px bg-surface-container-high/60 my-1"></div>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-label text-error hover:bg-error-container/40 transition-colors cursor-pointer border-none bg-transparent text-left font-semibold"
                    >
                      <span className="material-symbols-outlined text-[17px] text-error">logout</span>
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white font-label text-xs font-bold hover:bg-primary-container transition-all shadow-xs cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-[17px]">login</span>
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

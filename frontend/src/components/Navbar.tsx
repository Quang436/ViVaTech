import React, { useState, useEffect } from 'react';
import {
  Bell,
  ChevronDown,
  FolderOpen,
  FileText,
  LogOut,
  LogIn,
  Menu,
  X,
} from 'lucide-react';

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
  isNotificationsOpen: boolean;
  unreadNotificationCount: number;
}

const NAV_ITEMS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'home', label: 'Trang chủ' },
  { id: 'documents', label: 'Tài liệu' },
  { id: 'setup', label: 'Thiết lập đề tài' },
  { id: 'arena', label: 'Tranh biện AI' },
  { id: 'scorecard', label: 'Đánh giá' },
  { id: 'archive', label: 'Kho đề án' },
];

export const BrandMark: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" fill="#6ee7c8" />
    <path d="M12 2.5 21.5 12H12Z" fill="#0a1413" />
    <path d="M12 12H7.2L12 16.8Z" fill="#085448" opacity="0.85" />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  sessionCode = '#VV-9042',
  hasActiveSession = false,
  user,
  onOpenAuth,
  onLogout,
  onOpenNotifications,
  isNotificationsOpen,
  unreadNotificationCount,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectNav = (tab: ActiveTab) => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    onSelectTab(tab);
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 h-[69px] bg-[#f7faf9]/85 backdrop-blur-md border-b border-[rgba(10,20,19,0.08)]">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="visually-hidden focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:px-4 focus:py-2 focus:rounded-full focus:bg-[#0a1413] focus:text-white focus:font-label focus:text-xs focus:font-semibold focus:shadow-lg"
      >
        Bỏ qua thanh điều hướng đến nội dung chính
      </a>

      <div className="mint-wrap h-full flex items-center justify-between gap-4">
        {/* Left: Brand & Primary Links */}
        <div className="flex items-center gap-7 lg:gap-10 min-w-0">
          <button
            type="button"
            onClick={() => handleSelectNav('home')}
            className="flex items-center gap-2.5 group text-left cursor-pointer border-none bg-transparent p-0 flex-shrink-0 rounded-xl"
          >
            <span className="w-8 h-8 rounded-xl bg-[#eff5f3] border border-[rgba(10,20,19,0.1)] flex items-center justify-center group-hover:border-[#0b6e5e]/40 transition-colors">
              <BrandMark className="w-5 h-5" />
            </span>
            <span className="font-sans font-semibold text-[17px] tracking-[-0.02em] text-[#0a1413] leading-none">
              VivaArena
            </span>
          </button>

          {/* Main Navigation Links (Desktop) */}
          <nav aria-label="Chính" className="hidden md:flex items-center gap-6 lg:gap-7">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleSelectNav(item.id)}
                  className={`relative py-1 font-sans text-[14px] whitespace-nowrap transition-colors cursor-pointer border-none bg-transparent ${
                    isActive
                      ? 'text-[#0a1413] font-medium'
                      : 'text-[#465754] hover:text-[#0a1413] font-normal'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute left-0 right-0 -bottom-[20px] h-[2px] bg-[#0b6e5e] rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Session Status + Notifications + Profile / CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 whitespace-nowrap relative">
          {hasActiveSession && (
            <button
              type="button"
              onClick={() => handleSelectNav('arena')}
              className="hidden xl:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eff5f3] border border-[rgba(11,110,94,0.22)] text-[11px] font-mono font-medium text-[#085448] hover:border-[#0b6e5e]/50 transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0b6e5e] anim-live-pulse" aria-hidden="true" />
              <span>LIVE · {sessionCode}</span>
            </button>
          )}

          {user ? (
            <>
              <button
                type="button"
                aria-label="Thông báo học thuật"
                aria-expanded={isNotificationsOpen}
                aria-controls="notifications-popover"
                onClick={onOpenNotifications}
                className="w-9 h-9 rounded-full bg-white border border-[rgba(10,20,19,0.12)] flex items-center justify-center text-[#465754] hover:text-[#0a1413] hover:border-[rgba(10,20,19,0.24)] transition-colors relative cursor-pointer"
              >
                <Bell className="w-4 h-4" strokeWidth={1.9} aria-hidden="true" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#be123c] text-white font-mono font-semibold text-[9px] flex items-center justify-center shadow-xs">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  type="button"
                  aria-label={`Tài khoản ${user.name}`}
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                  aria-controls="profile-dropdown-menu"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 rounded-full bg-white border border-[rgba(10,20,19,0.12)] hover:border-[rgba(11,110,94,0.3)] transition-colors cursor-pointer"
                >
                  <img
                    alt=""
                    className="w-7 h-7 rounded-full object-cover object-top bg-[#eff5f3] flex-shrink-0"
                    src={user.avatar || '/avatars/user-default.jpg'}
                  />
                  <span className="hidden sm:inline font-sans text-[13px] font-medium text-[#0a1413] max-w-[128px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown
                    className="w-3.5 h-3.5 text-[#556361] hidden sm:inline"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      id="profile-dropdown-menu"
                      role="menu"
                      aria-label="Tài khoản học viên"
                      className="absolute right-0 top-12 z-50 w-60 rounded-2xl bg-white border border-[rgba(10,20,19,0.12)] shadow-[0_20px_50px_-15px_rgba(10,20,19,0.14)] p-2"
                    >
                      <div className="p-3 border-b border-[rgba(10,20,19,0.08)] mb-1">
                        <p className="font-sans font-semibold text-xs text-[#0a1413]">{user.name}</p>
                        <p className="font-mono text-[11px] text-[#556361] truncate mt-0.5">{user.email}</p>
                        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[rgba(110,231,200,0.24)] text-[#064037] text-[10px] font-mono font-medium">
                          {user.role}
                        </span>
                      </div>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleSelectNav('archive')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans font-medium text-[#0a1413] hover:bg-[#eff5f3] transition-colors cursor-pointer border-none bg-transparent text-left"
                      >
                        <FolderOpen className="w-4 h-4 text-[#0b6e5e]" strokeWidth={1.9} aria-hidden="true" />
                        <span>Hồ sơ đề án của tôi</span>
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleSelectNav('documents')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans font-medium text-[#0a1413] hover:bg-[#eff5f3] transition-colors cursor-pointer border-none bg-transparent text-left"
                      >
                        <FileText className="w-4 h-4 text-[#0369a1]" strokeWidth={1.9} aria-hidden="true" />
                        <span>Quản lý tài liệu RAG</span>
                      </button>

                      <div className="h-px bg-[rgba(10,20,19,0.08)] my-1" />

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans font-semibold text-[#be123c] hover:bg-[rgba(190,18,60,0.08)] transition-colors cursor-pointer border-none bg-transparent text-left"
                      >
                        <LogOut className="w-4 h-4 text-[#be123c]" strokeWidth={1.9} aria-hidden="true" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="btn-mint-primary h-9 px-4 text-xs sm:text-[13px] cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
              <span>Đăng nhập</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#465754] hover:text-[#0a1413] border border-[rgba(10,20,19,0.12)] cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            ) : (
              <Menu className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <nav
          id="mobile-navigation-drawer"
          aria-label="Di động"
          className="md:hidden border-t border-[rgba(10,20,19,0.08)] bg-[#f7faf9]/98 backdrop-blur-md px-4 py-3 shadow-lg"
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleSelectNav(item.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-sans text-sm transition-colors cursor-pointer border-none text-left ${
                    isActive
                      ? 'bg-[#eff5f3] text-[#0b6e5e] font-semibold'
                      : 'bg-transparent text-[#465754] hover:bg-[#eff5f3]/60 hover:text-[#0a1413]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0b6e5e]" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};

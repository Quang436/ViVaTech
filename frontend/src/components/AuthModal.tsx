import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'researcher' | 'advisor'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = activeTab === 'register' && fullName.trim() 
      ? fullName.trim() 
      : email ? email.split('@')[0] : 'Nguyễn Văn Khang';

    const roleName = role === 'student' 
      ? 'Học viên Khóa 2025' 
      : role === 'researcher' 
      ? 'Nghiên cứu sinh' 
      : 'Giảng viên hướng dẫn';

    onLoginSuccess({
      name: finalName,
      email: email || 'khang.nguyen@hcmut.edu.vn',
      role: roleName,
    });
    onClose();
  };

  const handleQuickSSO = (provider: 'Google' | 'Microsoft') => {
    onLoginSuccess({
      name: provider === 'Google' ? 'Nguyễn Văn Khang' : 'TS. Trần Minh',
      email: provider === 'Google' ? 'khang.nguyen@hcmut.edu.vn' : 'minh.tran@univ.edu.vn',
      role: provider === 'Google' ? 'Học viên Khóa 2025' : 'Giảng viên hướng dẫn',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-3xl bg-surface-container-lowest/95 backdrop-blur-xl border border-surface-container-high shadow-2xl overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* ================= LEFT COLUMN: ACADEMIC SHOWCASE ================= */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 bg-surface-container-low/60 border-r border-surface-container-high relative overflow-hidden">
            <div className="relative z-10 flex flex-col gap-6">
              {/* Top Badges */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest border border-primary/20 text-primary">
                  <span className="material-symbols-outlined text-[17px]">shield_lock</span>
                  <span className="font-label text-xs font-bold uppercase tracking-wider">VivaArena Shield</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-lowest text-xs font-label text-on-surface-variant border border-surface-container-high/60">
                  <span className="material-symbols-outlined text-[15px] text-secondary">psychology</span>
                  <span>Gemini 3.8 CoT</span>
                </div>
              </div>

              {/* Editorial Title */}
              <div>
                <h2 className="font-headline text-3xl font-semibold tracking-tight text-on-surface leading-tight">
                  Vững vàng trước Hội đồng với <span className="text-primary italic">AI Phản biện Học thuật</span>.
                </h2>
                <p className="font-body text-xs text-on-surface-variant mt-2 leading-relaxed">
                  Giả lập phản biện áp lực cao, truy vấn chéo dữ liệu và bứt phá năng lực lập luận trước giờ G.
                </p>
              </div>

              {/* 3 Pillars */}
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high/70 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg">forum</span>
                  </div>
                  <div>
                    <h3 className="font-label text-xs font-bold text-on-surface">Luyện tập đối đáp 24/7</h3>
                    <p className="font-body text-[11px] text-on-surface-variant">3 cấp độ Hội đồng AI chuẩn quốc tế Scopus/ISI.</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high/70 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg">menu_book</span>
                  </div>
                  <div>
                    <h3 className="font-label text-xs font-bold text-on-surface">RAG Ground Truth bóc tách đề án</h3>
                    <p className="font-body text-[11px] text-on-surface-variant">Đối soát từng số liệu và citation trực tiếp từ PDF đồ án.</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high/70 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg">analytics</span>
                  </div>
                  <div>
                    <h3 className="font-label text-xs font-bold text-on-surface">Báo cáo Rubrics & Câu trả lời mẫu</h3>
                    <p className="font-body text-[11px] text-on-surface-variant">Chấm điểm 4 trục kèm kịch bản câu trả lời chuẩn PREP.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* University Trust Footer */}
            <div className="relative z-10 pt-4 border-t border-surface-container-high/70 flex flex-col gap-2">
              <span className="uppercase tracking-wider text-outline font-semibold text-[10px] font-label">
                Được tin dùng bởi học viên từ
              </span>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-label">
                <span className="px-2 py-0.5 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 text-on-surface">
                  ĐH Bách Khoa
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 text-on-surface">
                  ĐH KHTN
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 text-on-surface">
                  ĐH Kinh Tế
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 text-on-surface">
                  ĐH Quốc Gia
                </span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: AUTH FORM ================= */}
          <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-center">
            {/* Header and Switcher Tabs */}
            <div className="flex flex-col gap-3 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface">
                    {activeTab === 'signin' ? 'Đăng nhập tài khoản' : 'Đăng ký tài khoản mới'}
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant mt-1">
                    {activeTab === 'signin'
                      ? 'Nhập thông tin xác thực để truy cập phòng hội đồng AI'
                      : 'Khởi tạo tài khoản học thuật để lưu trữ tiến độ phản biện'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-primary-container/10 border border-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">vpn_key</span>
                </div>
              </div>

              {/* Segmented Tab Switcher */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-surface-container-low rounded-2xl border border-surface-container-high/60 mt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className={`py-2 px-3 rounded-xl font-label text-xs sm:text-sm font-bold transition-all text-center cursor-pointer border-none ${
                    activeTab === 'signin'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'bg-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`py-2 px-3 rounded-xl font-label text-xs sm:text-sm font-bold transition-all text-center cursor-pointer border-none ${
                    activeTab === 'register'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'bg-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Đăng ký tài khoản mới
                </button>
              </div>
            </div>

            {/* Academic Single Sign-On (SSO) Quick Buttons */}
            <div className="flex flex-col gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleQuickSSO('Google')}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low border border-surface-container-high text-on-surface font-label text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                </svg>
                <span>Tiếp tục với Google (.edu.vn hoặc cá nhân)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSSO('Microsoft')}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low border border-surface-container-high text-on-surface font-label text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 21 21">
                  <rect fill="#f25022" height="9" width="9" x="1" y="1"></rect>
                  <rect fill="#7fba00" height="9" width="9" x="11" y="1"></rect>
                  <rect fill="#00a4ef" height="9" width="9" x="11" y="1"></rect>
                  <rect fill="#ffb900" height="9" width="9" x="11" y="1"></rect>
                </svg>
                <span>Đăng nhập với Microsoft 365 Academic</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-surface-container-high"></div>
              <span className="font-label text-[11px] uppercase tracking-wider text-outline px-1">
                hoặc dùng Email học thuật
              </span>
              <div className="flex-1 h-px bg-surface-container-high"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {activeTab === 'register' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="font-label text-xs font-semibold text-on-surface" htmlFor="full-name">
                      Họ và tên học viên / Nghiên cứu sinh
                    </label>
                    <div className="relative rounded-xl">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                        person
                      </span>
                      <input
                        id="full-name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nguyễn Văn Khang"
                        className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-container-low border border-surface-container-high/80 text-on-surface font-body text-xs sm:text-sm focus:outline-none focus:bg-surface-container-lowest focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label text-xs font-semibold text-on-surface">Vai trò học thuật</label>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => setRole('student')}
                        className={`py-1.5 px-2 rounded-xl border text-xs font-label cursor-pointer ${
                          role === 'student'
                            ? 'bg-primary text-white border-primary font-bold'
                            : 'bg-surface-container-low border-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        Sinh viên Đồ án
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('researcher')}
                        className={`py-1.5 px-2 rounded-xl border text-xs font-label cursor-pointer ${
                          role === 'researcher'
                            ? 'bg-primary text-white border-primary font-bold'
                            : 'bg-surface-container-low border-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        Nghiên cứu sinh
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('advisor')}
                        className={`py-1.5 px-2 rounded-xl border text-xs font-label cursor-pointer ${
                          role === 'advisor'
                            ? 'bg-primary text-white border-primary font-bold'
                            : 'bg-surface-container-low border-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        Giảng viên
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="font-label text-xs font-semibold text-on-surface" htmlFor="email-input">
                  Email trường học hoặc cá nhân
                </label>
                <div className="relative rounded-xl">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                    alternate_email
                  </span>
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sinhvien@hcmut.edu.vn hoặc name@example.com"
                    className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-container-low border border-surface-container-high/80 text-on-surface font-body text-xs sm:text-sm focus:outline-none focus:bg-surface-container-lowest focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-label text-xs font-semibold text-on-surface" htmlFor="password-input">
                    Mật khẩu bảo mật
                  </label>
                  {activeTab === 'signin' && (
                    <span className="font-label text-[11px] text-primary hover:underline cursor-pointer">
                      Quên mật khẩu?
                    </span>
                  )}
                </div>
                <div className="relative rounded-xl">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                    lock
                  </span>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-10 pl-10 pr-10 rounded-xl bg-surface-container-low border border-surface-container-high/80 text-on-surface font-body text-xs sm:text-sm focus:outline-none focus:bg-surface-container-lowest focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-outline hover:text-on-surface cursor-pointer border-none bg-transparent"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <span className="font-body text-xs text-on-surface-variant">Ghi nhớ phiên đăng nhập</span>
                </label>
                <span className="font-label text-[11px] text-secondary font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">lock_clock</span> 30 ngày an toàn
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full mt-2 py-3 px-6 rounded-xl bg-primary hover:bg-primary-container text-white font-label text-sm font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <span>{activeTab === 'signin' ? 'Đăng nhập vào VivaArena' : 'Hoàn tất đăng ký'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Check,
  GraduationCap,
  User,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

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
  const [helperNotice, setHelperNotice] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const pointerDownOutsideRef = useRef(false);

  // Sync React isOpen prop with native <dialog>.showModal() / .close()
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if ('closedBy' in HTMLDialogElement.prototype) {
        (dialog as HTMLDialogElement & { closedBy?: string }).closedBy = 'any';
      }
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Progressive enhancement fallback for backdrop dismissal when browser lacks native closedBy
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const isOutsideDialog = (clientX: number, clientY: number) => {
      const rect = dialog.getBoundingClientRect();
      return (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      );
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownOutsideRef.current = isOutsideDialog(e.clientX, e.clientY);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (pointerDownOutsideRef.current && isOutsideDialog(e.clientX, e.clientY)) {
        dialog.close();
      }
      pointerDownOutsideRef.current = false;
    };

    dialog.addEventListener('pointerdown', handlePointerDown);
    dialog.addEventListener('pointerup', handlePointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', handlePointerDown);
      dialog.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName =
      activeTab === 'register' && fullName.trim()
        ? fullName.trim()
        : email
        ? email.split('@')[0]
        : 'Nguyễn Văn Khang';

    const roleName =
      role === 'student'
        ? 'Học viên Khóa 2025'
        : role === 'researcher'
        ? 'Nghiên cứu sinh'
        : 'Giảng viên hướng dẫn';

    onLoginSuccess({
      name: finalName,
      email: email || 'khang.nguyen@hcmut.edu.vn',
      role: roleName,
    });
    setHelperNotice(null);
    onClose();
  };

  const handleQuickSSO = (provider: 'Google' | 'Microsoft') => {
    onLoginSuccess({
      name: provider === 'Google' ? 'Nguyễn Văn Khang' : 'TS. Trần Minh',
      email: provider === 'Google' ? 'khang.nguyen@hcmut.edu.vn' : 'minh.tran@univ.edu.vn',
      role: provider === 'Google' ? 'Học viên Khóa 2025' : 'Giảng viên hướng dẫn',
    });
    setHelperNotice(null);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="auth-dialog-title"
      onClose={() => {
        setHelperNotice(null);
        if (isOpen) onClose();
      }}
      className="m-auto w-[min(96vw,68rem)] max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-[rgba(10,20,19,0.12)] shadow-[0_32px_80px_-20px_rgba(10,20,19,0.2)] p-0 text-[#0a1413]"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Đóng hộp thoại đăng nhập"
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-[#eff5f3] hover:bg-[#dce7e4] text-[#465754] hover:text-[#0a1413] flex items-center justify-center transition-colors cursor-pointer border border-[rgba(10,20,19,0.1)]"
        >
          <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* LEFT COLUMN: MINT PAPER EDITORIAL SHOWCASE */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-8 sm:p-10 bg-[#eff5f3] border-r border-[rgba(10,20,19,0.08)] relative overflow-hidden">
            <div
              className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-[rgba(110,231,200,0.3)] blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col justify-between h-full gap-8">
              <div className="flex flex-col gap-6">
                <div>
                  <span className="mint-tag mint">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0b6e5e]" aria-hidden="true" />
                    VIVAARENA ACADEMIC
                  </span>
                  <p className="mint-h2 text-3xl sm:text-4xl mt-5 leading-[1.12]">
                    Vững vàng trước Hội đồng bảo vệ với{' '}
                    <span className="mint-serif">trí tuệ phản biện</span>.
                  </p>
                  <p className="font-sans text-sm sm:text-[15px] text-[#465754] mt-3 leading-relaxed">
                    Giả lập phản biện áp lực cao, truy vấn chéo tài liệu RAG và chuẩn hóa năng lực lập luận trước giờ G.
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-1">
                  {[
                    'Luyện tập phản biện thích ứng đa cấp độ',
                    'Đối soát luận điểm trực tiếp từ tài liệu nạp',
                    'Đánh giá năng lực và gợi ý câu trả lời chuẩn PREP',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-[rgba(10,20,19,0.08)]"
                    >
                      <span className="w-7 h-7 rounded-full bg-[rgba(110,231,200,0.28)] flex items-center justify-center text-[#085448] flex-shrink-0">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.3} aria-hidden="true" />
                      </span>
                      <span className="font-sans text-sm text-[#0a1413] font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t border-[rgba(10,20,19,0.08)] flex items-center gap-3 text-xs font-sans text-[#465754]">
                <span className="w-9 h-9 rounded-xl bg-white border border-[rgba(10,20,19,0.1)] flex items-center justify-center flex-shrink-0 text-[#0b6e5e]">
                  <GraduationCap className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                </span>
                <span>
                  Được tin dùng bởi hơn <strong className="text-[#0a1413] font-semibold">1,280+</strong> học viên và nghiên cứu sinh từ các trường đại học trọng điểm.
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AUTH FORM */}
          <div className="lg:col-span-6 p-6 sm:p-9 flex flex-col justify-center gap-5 bg-white">
            <div className="flex flex-col gap-3 pr-8">
              <div>
                <h2
                  id="auth-dialog-title"
                  className="font-sans text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#0a1413]"
                >
                  {activeTab === 'signin' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản học thuật'}
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#465754] mt-1">
                  {activeTab === 'signin'
                    ? 'Nhập thông tin xác thực để truy cập phòng Hội đồng AI'
                    : 'Đăng ký để lưu trữ lịch sử chất vấn và đề án cá nhân'}
                </p>
              </div>

              {/* Segmented Pill Switcher */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#eff5f3] rounded-full border border-[rgba(10,20,19,0.08)] mt-1">
                <button
                  type="button"
                  aria-pressed={activeTab === 'signin'}
                  onClick={() => {
                    setActiveTab('signin');
                    setHelperNotice(null);
                  }}
                  className={`py-2 px-3 rounded-full font-sans text-xs sm:text-sm transition-all text-center cursor-pointer border-none ${
                    activeTab === 'signin'
                      ? 'bg-[#0a1413] text-white font-medium shadow-xs'
                      : 'bg-transparent text-[#465754] hover:text-[#0a1413] font-medium'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  aria-pressed={activeTab === 'register'}
                  onClick={() => {
                    setActiveTab('register');
                    setHelperNotice(null);
                  }}
                  className={`py-2 px-3 rounded-full font-sans text-xs sm:text-sm transition-all text-center cursor-pointer border-none ${
                    activeTab === 'register'
                      ? 'bg-[#0a1413] text-white font-medium shadow-xs'
                      : 'bg-transparent text-[#465754] hover:text-[#0a1413] font-medium'
                  }`}
                >
                  Đăng ký mới
                </button>
              </div>
            </div>

            {/* 2-Column SSO Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickSSO('Google')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-white hover:bg-[#eff5f3] border border-[rgba(10,20,19,0.14)] text-[#0a1413] font-sans text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Google SSO</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSSO('Microsoft')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-white hover:bg-[#eff5f3] border border-[rgba(10,20,19,0.14)] text-[#0a1413] font-sans text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 21 21" aria-hidden="true">
                  <rect fill="#f25022" height="9" width="9" x="1" y="1" />
                  <rect fill="#7fba00" height="9" width="9" x="11" y="1" />
                  <rect fill="#00a4ef" height="9" width="9" x="1" y="11" />
                  <rect fill="#ffb900" height="9" width="9" x="11" y="11" />
                </svg>
                <span>Microsoft 365</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[rgba(10,20,19,0.08)]" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#556361] px-1">
                hoặc dùng email
              </span>
              <div className="flex-1 h-px bg-[rgba(10,20,19,0.08)]" />
            </div>

            {helperNotice && (
              <div
                role="status"
                aria-live="polite"
                className="p-3 rounded-2xl bg-[rgba(110,231,200,0.16)] border border-[rgba(11,110,94,0.22)] text-xs font-sans text-[#0a1413]"
              >
                {helperNotice}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {activeTab === 'register' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs font-medium text-[#0a1413]" htmlFor="full-name">
                      Họ và tên
                    </label>
                    <div className="relative rounded-xl input-focus-glow">
                      <User
                        className="w-4 h-4 absolute left-3.5 top-3.5 text-[#556361]"
                        strokeWidth={1.9}
                        aria-hidden="true"
                      />
                      <input
                        id="full-name"
                        type="text"
                        required
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nguyễn Văn Khang"
                        className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.14)] text-[#0a1413] font-sans text-sm placeholder:text-[#556361]/70 focus:bg-white focus:border-[#0b6e5e] transition-all"
                      />
                    </div>
                  </div>

                  <fieldset className="flex flex-col gap-1.5 border-none p-0 m-0">
                    <legend className="font-sans text-xs font-medium text-[#0a1413] mb-1">
                      Vai trò học thuật
                    </legend>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'student', label: 'Sinh viên' },
                          { id: 'researcher', label: 'NCS' },
                          { id: 'advisor', label: 'Giảng viên' },
                        ] as const
                      ).map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-center justify-center p-2.5 rounded-full border cursor-pointer transition-all text-center font-sans text-xs font-medium select-none ${
                            role === opt.id
                              ? 'bg-[#0a1413] text-white border-[#0a1413]'
                              : 'bg-[#f7faf9] border-[rgba(10,20,19,0.12)] text-[#465754] hover:bg-[#eff5f3]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="academic_role"
                            value={opt.id}
                            checked={role === opt.id}
                            onChange={() => setRole(opt.id)}
                            className="visually-hidden"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs font-medium text-[#0a1413]" htmlFor="email-input">
                  Email học thuật hoặc cá nhân
                </label>
                <div className="relative rounded-xl input-focus-glow">
                  <AtSign
                    className="w-4 h-4 absolute left-3.5 top-3.5 text-[#556361]"
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                  <input
                    id="email-input"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sinhvien@edu.vn hoặc name@example.com"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.14)] text-[#0a1413] font-sans text-sm placeholder:text-[#556361]/70 focus:bg-white focus:border-[#0b6e5e] transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs font-medium text-[#0a1413]" htmlFor="password-input">
                  Mật khẩu
                </label>
                <div className="relative rounded-xl input-focus-glow">
                  <Lock
                    className="w-4 h-4 absolute left-3.5 top-3.5 text-[#556361]"
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={activeTab === 'signin' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.14)] text-[#0a1413] font-sans text-sm placeholder:text-[#556361]/70 focus:bg-white focus:border-[#0b6e5e] transition-all"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#556361] hover:text-[#0a1413] cursor-pointer border-none bg-transparent p-1 rounded-md"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={1.9} aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={1.9} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0b6e5e] focus:ring-[#0b6e5e]/20 border-[rgba(10,20,19,0.22)] bg-[#f7faf9] cursor-pointer"
                  />
                  <span className="font-sans text-xs text-[#465754]">Ghi nhớ đăng nhập</span>
                </label>
                {activeTab === 'signin' && (
                  <button
                    type="button"
                    onClick={() =>
                      setHelperNotice(
                        'Phiên luyện tập cá nhân lưu trực tiếp trên trình duyệt — bạn có thể đăng nhập bằng email bất kỳ hoặc chọn Google SSO / Microsoft 365 ở trên.'
                      )
                    }
                    className="font-sans text-xs text-[#0b6e5e] hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="btn-mint-primary w-full h-11 mt-1 px-6 text-sm cursor-pointer"
              >
                <span>
                  {activeTab === 'signin'
                    ? 'Đăng nhập vào VivaArena'
                    : 'Khởi tạo tài khoản & Đề tài mới'}
                </span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </button>
            </form>

            <p className="font-sans text-xs text-[#465754] text-center pt-1 leading-relaxed">
              Cần cấp tài khoản cho Viện hoặc Nhóm nghiên cứu?{' '}
              <button
                type="button"
                onClick={() =>
                  setHelperNotice(
                    'Liên hệ phòng Quản trị Đào tạo hoặc quản trị viên máy chủ VivaArena để cấp gói tổ chức.'
                  )
                }
                className="text-[#0b6e5e] hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
              >
                Liên hệ Quản trị
              </button>
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
};

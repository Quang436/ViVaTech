import React, { useState, useRef, useEffect, useId } from 'react';
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
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import type { AcademicRoleKey, AuthUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  promptMessage?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  promptMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AcademicRoleKey>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [helperNotice, setHelperNotice] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const pointerDownOutsideRef = useRef(false);
  const uid = useId();
  const titleId = `${uid}-auth-title`;
  const emailHintId = `${uid}-email-hint`;
  const emailErrorId = `${uid}-email-error`;
  const pwRulesId = `${uid}-pw-rules`;
  const pwErrorId = `${uid}-pw-error`;

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

  const switchTab = (next: 'signin' | 'register') => {
    setActiveTab(next);
    setErrorMsg(null);
    setHelperNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    if (activeTab === 'register' && fullName.trim().length < 2) {
      setErrorMsg('Họ và tên cần ít nhất 2 ký tự.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu cần ít nhất 6 ký tự.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setHelperNotice(null);

    try {
      const result =
        activeTab === 'register'
          ? await api.register({
              full_name: fullName.trim(),
              email: cleanEmail,
              password,
              role,
              remember_me: rememberMe,
            })
          : await api.login({
              email: cleanEmail,
              password,
              remember_me: rememberMe,
            });

      setFullName('');
      setEmail('');
      setPassword('');
      setActiveTab('signin');
      onLoginSuccess(result.user);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Không thể xác thực tài khoản lúc này. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={() => {
        setActiveTab('signin');
        setPassword('');
        setErrorMsg(null);
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
                    Dữ liệu thật. Phản biện thật với{' '}
                    <span className="mint-serif">hồ sơ riêng tư</span>.
                  </p>
                  <p className="font-sans text-sm sm:text-[15px] text-[#465754] mt-3 leading-relaxed">
                    Mọi tài liệu RAG, phiên chất vấn Gemini CoT và bảng điểm 4 trục đều gắn liền với tài khoản của bạn trong cơ sở dữ liệu.
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-1">
                  {[
                    'Tách biệt tài liệu đề án và chỉ mục ChromaDB theo từng tài khoản',
                    'Lưu trữ toàn bộ lịch sử đối đáp và bảng điểm chấm bởi Gemini AI',
                    'Xác thực phiên làm việc với mã hóa PBKDF2-SHA256 và Bearer Token',
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
                  Phiên làm việc được bảo vệ trực tiếp qua máy chủ FastAPI và thu hồi ngay khi bạn nhấn Đăng xuất.
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: REAL CREDENTIAL AUTH FORM */}
          <div className="lg:col-span-6 p-6 sm:p-9 flex flex-col justify-center gap-5 bg-white">
            <div className="flex flex-col gap-3 pr-8">
              <div>
                <h2
                  id={titleId}
                  className="font-sans text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#0a1413]"
                >
                  {activeTab === 'signin' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản học thuật'}
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#465754] mt-1">
                  {activeTab === 'signin'
                    ? 'Nhập email và mật khẩu đã đăng ký để tiếp tục phiên nghiên cứu.'
                    : 'Đăng ký tài khoản mới để tải tài liệu và mở phòng phản biện AI.'}
                </p>
              </div>

              {/* Segmented Pill Switcher */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#eff5f3] rounded-full border border-[rgba(10,20,19,0.08)] mt-1">
                <button
                  type="button"
                  aria-pressed={activeTab === 'signin'}
                  onClick={() => switchTab('signin')}
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
                  onClick={() => switchTab('register')}
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

            {promptMessage && (
              <div
                role="status"
                className="p-3 rounded-2xl bg-[#eff5f3] border border-[rgba(11,110,94,0.22)] text-xs font-sans text-[#064037] flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#0b6e5e] shrink-0" strokeWidth={2} aria-hidden="true" />
                <span>{promptMessage}</span>
              </div>
            )}

            {errorMsg && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-[#ffe4e6] border border-[#be123c]/25 text-xs font-sans text-[#881337] flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-[#be123c] shrink-0 mt-0.5" strokeWidth={2} aria-hidden="true" />
                <span className="font-medium leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {helperNotice && (
              <div
                role="status"
                aria-live="polite"
                className="p-3 rounded-2xl bg-[rgba(110,231,200,0.16)] border border-[rgba(11,110,94,0.22)] text-xs font-sans text-[#0a1413]"
              >
                {helperNotice}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              method="post"
              aria-labelledby={titleId}
              className="flex flex-col gap-4"
            >
              {activeTab === 'register' && (
                <>
                  <div className="auth-field flex flex-col gap-1.5">
                    <label className="font-sans text-xs font-medium text-[#0a1413]" htmlFor="full-name">
                      Họ và tên <span aria-hidden="true">*</span>
                    </label>
                    <div className="relative rounded-xl input-focus-glow">
                      <User
                        className="w-4 h-4 absolute left-3.5 top-3.5 text-[#556361]"
                        strokeWidth={1.9}
                        aria-hidden="true"
                      />
                      <input
                        id="full-name"
                        name="name"
                        type="text"
                        required
                        minLength={2}
                        autoComplete="name"
                        enterKeyHint="next"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setErrorMsg(null);
                        }}
                        placeholder="Ví dụ: Nguyễn Minh Tuấn"
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

              <div className="auth-field flex flex-col gap-1">
                <label className="font-sans text-xs font-medium text-[#0a1413]" htmlFor="email-input">
                  Địa chỉ Email <span aria-hidden="true">*</span>
                </label>
                <span id={emailHintId} className="font-sans text-[11px] text-[#556361] mb-0.5">
                  Định dạng: ten@truong.edu.vn hoặc email cá nhân
                </span>
                <div className="relative rounded-xl input-focus-glow">
                  <AtSign
                    className="w-4 h-4 absolute left-3.5 top-3.5 text-[#556361]"
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                  <input
                    id="email-input"
                    name="email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="next"
                    aria-describedby={emailHintId}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="you@example.com"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.14)] text-[#0a1413] font-sans text-sm placeholder:text-[#556361]/70 focus:bg-white focus:border-[#0b6e5e] transition-all"
                  />
                </div>
                <span id={emailErrorId} className="auth-error-msg font-sans text-[11px] text-[#be123c] mt-0.5">
                  Lỗi: Vui lòng nhập email đúng định dạng (ví dụ: ten@domain.com).
                </span>
              </div>

              <div className="auth-field flex flex-col gap-1">
                <label className="font-sans text-xs font-medium text-[#0a1413]" htmlFor="password-input">
                  Mật khẩu <span aria-hidden="true">*</span>
                </label>
                {activeTab === 'register' && (
                  <span id={pwRulesId} className="font-sans text-[11px] text-[#556361] mb-0.5">
                    Tối thiểu 6 ký tự (hỗ trợ dán từ trình quản lý mật khẩu)
                  </span>
                )}
                <div className="relative rounded-xl input-focus-glow">
                  <Lock
                    className="w-4 h-4 absolute left-3.5 top-3.5 text-[#556361]"
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                  <input
                    id="password-input"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete={activeTab === 'signin' ? 'current-password' : 'new-password'}
                    enterKeyHint="done"
                    aria-describedby={activeTab === 'register' ? pwRulesId : undefined}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="Nhập ít nhất 6 ký tự"
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
                <span id={pwErrorId} className="auth-error-msg font-sans text-[11px] text-[#be123c] mt-0.5">
                  Lỗi: Mật khẩu phải chứa tối thiểu 6 ký tự.
                </span>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    id="remember-me"
                    name="remember_me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0b6e5e] focus:ring-[#0b6e5e]/20 border-[rgba(10,20,19,0.22)] bg-[#f7faf9] cursor-pointer"
                  />
                  <span className="font-sans text-xs text-[#465754]">Ghi nhớ trên thiết bị (7 ngày)</span>
                </label>
                {activeTab === 'signin' && (
                  <button
                    type="button"
                    onClick={() =>
                      setHelperNotice(
                        'Mật khẩu được băm một chiều (PBKDF2-SHA256) trên máy chủ. Nếu quên mật khẩu cũ, hãy liên hệ quản trị hệ thống hoặc tạo tài khoản mới ở tab Đăng ký mới.'
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
                disabled={isSubmitting}
                className="btn-mint-primary w-full h-11 mt-1 px-6 text-sm cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#6ee7c8]" strokeWidth={2} aria-hidden="true" />
                    <span>{activeTab === 'signin' ? 'Đang xác thực...' : 'Đang khởi tạo tài khoản...'}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {activeTab === 'signin'
                        ? 'Đăng nhập vào VivaArena'
                        : 'Đăng ký & Bắt đầu ngay'}
                    </span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <p className="font-sans text-xs text-[#465754] text-center pt-1 leading-relaxed">
              {activeTab === 'signin' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
              <button
                type="button"
                onClick={() => switchTab(activeTab === 'signin' ? 'register' : 'signin')}
                className="text-[#0b6e5e] hover:underline font-semibold bg-transparent border-none p-0 cursor-pointer"
              >
                {activeTab === 'signin' ? 'Đăng ký miễn phí' : 'Quay lại Đăng nhập'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
};

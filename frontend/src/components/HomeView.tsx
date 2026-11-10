import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Briefcase,
  Check,
  CircleCheck,
  Cpu,
  Database,
  FileSearch,
  FileText,
  FlaskConical,
  Gauge,
  Landmark,
  Layers,
  Mic,
  PlayCircle,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import type {
  CouncilPersona,
  DebateSession,
  PlatformStats,
  Scorecard,
  UploadedDocument,
} from '../types';
import type { UserProfile } from './Navbar';

interface HomeViewProps {
  onStartSetup: () => void;
  onExploreArchive: () => void;
  onOpenAuth: () => void;
  onSelectPersona?: (persona: CouncilPersona) => void;
  user: UserProfile | null;
  stats: PlatformStats | null;
  documents?: UploadedDocument[];
  sessions?: DebateSession[];
  scorecards?: Scorecard[];
}

type PreviewTabId = 'live' | 'pipeline' | 'personas' | 'rubric';

const COUNCIL_BADGES: Record<
  CouncilPersona,
  {
    chip: string;
    name: string;
    roleA: string;
    roleB: string;
    code: string;
    tagline: string;
  }
> = {
  feynman: {
    chip: 'Feynman',
    name: 'GS. Lê Minh Triết',
    roleA: 'Feynman',
    roleB: 'Trực giác',
    code: 'EXAMINER · CẤP 1',
    tagline: 'Bóc tách bản chất khái niệm & tinh giản thuật ngữ phức tạp.',
  },
  academic_reviewer: {
    chip: 'Học thuật',
    name: 'PGS. TS. Trần Thu Hà',
    roleA: 'Phản biện',
    roleB: 'Học thuật',
    code: 'EXAMINER · CẤP 2',
    tagline: 'Kiểm định phương pháp luận, baseline và trích dẫn theo chuẩn Scopus/ISI.',
  },
  strict_council: {
    chip: 'Stress-Test',
    name: 'GS. Viện sĩ Hoàng Vĩnh',
    roleA: 'Đối kháng',
    roleB: 'Stress-Test',
    code: 'EXAMINER · CẤP 3',
    tagline: 'Truy vấn dồn dập vào trường hợp biên (Edge Cases) & lỗ hổng logic.',
  },
};

const MODEL_NOTES: Record<string, string> = {
  'Gemini 2.5': 'Suy luận CoT 3 bước · Đối soát toàn văn luận án dài',
  'Gemini Flash': 'Độ trễ thấp · Phản hồi hội thoại giọng nói tức thì',
  'Vector RAG': 'Chia đoạn ngữ nghĩa · Truy xuất dẫn chứng theo phân đoạn',
  'D-ID WebRTC': 'Video stream giám khảo · Khẩu hình đồng bộ giọng đọc',
  'STT Neural': 'Nhận diện tiếng Việt học thuật · Đo tốc độ nói WPM',
  'PREP Grader': 'Chấm 4 trục Rubric · Gợi ý câu trả lời tối ưu chuẩn PREP',
};

const TOOL_TILES = [
  { id: 'rag', label: 'Vector RAG Ground Truth', Icon: FileSearch },
  { id: 'cot', label: 'Chuỗi suy luận CoT', Icon: BrainCircuit },
  { id: 'voice', label: 'Phòng thoại WebRTC', Icon: Mic },
  { id: 'rubric', label: 'Bảng điểm 4 trục', Icon: BarChart3 },
  { id: 'shield', label: 'Phát hiện ngụy biện', Icon: ShieldCheck },
  { id: 'speed', label: 'Đo tốc độ phản xạ', Icon: Gauge },
  { id: 'live', label: 'Giám khảo trực tiếp', Icon: Radio },
  { id: 'doc', label: 'Bóc tách PDF / DOCX', Icon: FileText },
];

const PIPELINE_STEPS = [
  { step: '01', label: 'Nạp tài liệu & lập chỉ mục RAG' },
  { step: '02', label: 'Khởi tạo CoT 3 bước chất vấn' },
  { step: '03', label: 'Chấm điểm 4 trục & xuất PREP' },
];

const RUBRIC_WEIGHTS = [
  { label: 'Logic Học Thuật', weight: 35, detail: 'Đối soát Ground Truth RAG' },
  { label: 'Kỹ Năng Tranh Biện', weight: 30, detail: 'Bảo vệ luận điểm thực nghiệm' },
  { label: 'Bản Lĩnh Phản Biện', weight: 20, detail: 'Giữ nhịp dưới áp lực hội đồng' },
  { label: 'Độ Khúc Chiết', weight: 15, detail: 'Cấu trúc PREP súc tích' },
];

const parseTimestamp = (iso: string): number => {
  const normalized = iso.endsWith('Z') ? iso : `${iso}Z`;
  const ts = new Date(normalized).getTime();
  return Number.isNaN(ts) ? 0 : ts;
};

export const HomeView: React.FC<HomeViewProps> = ({
  onStartSetup,
  onExploreArchive,
  onOpenAuth,
  onSelectPersona,
  user,
  stats,
  documents = [],
  sessions = [],
  scorecards = [],
}) => {
  const [previewTabPref, setPreviewTabPref] = useState<{
    userKey: string | null;
    tab: PreviewTabId;
  } | null>(null);
  const currentUserKey = user?.email ?? null;
  const activePreviewTab: PreviewTabId =
    previewTabPref && previewTabPref.userKey === currentUserKey
      ? previewTabPref.tab
      : user
      ? 'live'
      : 'pipeline';
  const setActivePreviewTab = (tab: PreviewTabId) => {
    setPreviewTabPref({ userKey: currentUserKey, tab });
  };
  const [badgePersona, setBadgePersona] = useState<CouncilPersona>('academic_reviewer');
  const [selectedModel, setSelectedModel] = useState<string>('Gemini 2.5');
  const [isApproved, setIsApproved] = useState(false);
  const [activeToolLabel, setActiveToolLabel] = useState<string | null>(null);
  const [pipelineIdx, setPipelineIdx] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 3
      : 1
  );

  // Animated pipeline indicator respecting prefers-reduced-motion
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const timer = setInterval(() => {
      setPipelineIdx((prev) => (prev >= PIPELINE_STEPS.length + 1 ? 1 : prev + 1));
    }, 1050);
    return () => clearInterval(timer);
  }, []);

  const currentBadge = COUNCIL_BADGES[badgePersona];

  // Derived 100% real user stats (only computed when authenticated)
  const userTotalChunks = documents.reduce((acc, doc) => acc + (doc.total_chunks || 0), 0);
  const userCompletedCount = sessions.filter((s) => s.status === 'completed').length;
  const userAvgScore =
    scorecards.length > 0
      ? scorecards.reduce((acc, sc) => acc + sc.overall_score, 0) / scorecards.length
      : null;

  const chronologicalScorecards = [...scorecards]
    .sort((a, b) => parseTimestamp(a.created_at) - parseTimestamp(b.created_at))
    .slice(-8);

  const previewTabs: Array<{ id: PreviewTabId; label: string }> = user
    ? [
        { id: 'live', label: 'Hồ sơ thật của bạn' },
        { id: 'pipeline', label: 'Quy trình RAG & CoT' },
        { id: 'personas', label: '3 Cấp Giám Khảo' },
        { id: 'rubric', label: 'Rubric 4 Trục PREP' },
      ]
    : [
        { id: 'pipeline', label: 'Quy trình RAG & CoT' },
        { id: 'personas', label: '3 Cấp Giám Khảo' },
        { id: 'rubric', label: 'Rubric 4 Trục PREP' },
      ];

  const handlePersonaPick = (persona: CouncilPersona) => {
    if (onSelectPersona) {
      onSelectPersona(persona);
    } else {
      onStartSetup();
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="relative z-10 flex-1 outline-none">
      {/* ==================== 1. HERO SECTION ==================== */}
      <section className="relative pt-14 sm:pt-20 overflow-hidden">
        <div className="mint-wrap flex flex-col items-center text-center">
          {/* Announcement Pill */}
          <button
            type="button"
            onClick={onStartSetup}
            className="inline-flex items-center gap-2.5 py-1 pl-1 pr-3.5 rounded-full bg-white border border-[rgba(10,20,19,0.12)] shadow-2xs text-xs sm:text-[13px] text-[#0a1413] hover:border-[rgba(11,110,94,0.35)] hover:bg-[#eff5f3]/70 transition-all cursor-pointer group"
          >
            <span className="px-2.5 py-1 rounded-full bg-[#6ee7c8] text-[#064037] font-mono font-semibold text-[10px] tracking-[0.06em] uppercase leading-none">
              LIVE DB
            </span>
            <span className="font-sans font-medium text-[#465754] group-hover:text-[#0a1413]">
              Hệ thống CoT 3 bước &amp; RAG Vector đã sẵn sàng
            </span>
            <ArrowRight
              className="w-3.5 h-3.5 text-[#0b6e5e] group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>

          {/* Two-line Mint Paper Headline with Italic Instrument Serif Accent */}
          <h1 className="mint-hero-h mt-7 text-[40px] sm:text-[60px] lg:text-[74px] max-w-4xl">
            <span className="block">Mọi giả thuyết, mọi số liệu.</span>
            <span className="block">
              Hội đồng AI <span className="mint-serif">phản biện</span> thực chiến.
            </span>
          </h1>

          {/* Lede */}
          <p className="mt-6 max-w-xl font-sans text-[15px] sm:text-[18px] leading-[1.55] text-[#465754]">
            Nạp luận án, mô phỏng áp lực chất vấn trực tiếp và kiểm chứng từng luận cứ với suy luận đa bước — vững vàng làm chủ buổi bảo vệ.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onStartSetup}
              className="btn-mint-primary h-12 px-6 text-sm sm:text-[15px] cursor-pointer w-full sm:w-auto"
            >
              <Mic className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              <span>Bắt đầu diễn tập ngay</span>
            </button>

            <button
              type="button"
              onClick={onExploreArchive}
              className="btn-mint-ghost h-12 px-6 text-sm sm:text-[15px] cursor-pointer w-full sm:w-auto"
            >
              <PlayCircle className="w-4 h-4 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
              <span>Xem Kho đề án</span>
              <ArrowRight className="w-4 h-4 text-[#556361]" strokeWidth={2} aria-hidden="true" />
            </button>

            {!user && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="btn-mint-ghost h-12 px-5 text-sm cursor-pointer w-full sm:w-auto"
              >
                <span>Đăng nhập học thuật</span>
              </button>
            )}
          </div>

          {/* 100% Real Server / User Database Status Line (Zero Mock Counters) */}
          <div className="mt-7 flex flex-col sm:flex-row items-center gap-2.5 text-xs sm:text-[13px] font-sans text-[#556361] px-4 py-2 rounded-full bg-white/80 border border-[rgba(10,20,19,0.08)]">
            <span
              className="w-2 h-2 rounded-full bg-[#6ee7c8] border border-[#0b6e5e] shrink-0"
              aria-hidden="true"
            />
            {user ? (
              <span>
                Đang đăng nhập <strong className="text-[#0a1413] font-semibold">{user.name}</strong> ·{' '}
                {documents.length} tài liệu RAG · {sessions.length} phiên phản biện (
                {scorecards.length} bảng điểm đã lưu)
              </span>
            ) : stats ? (
              <span>
                Dữ liệu thực trên máy chủ: {stats.total_users.toLocaleString('vi-VN')} tài khoản ·{' '}
                {stats.total_documents.toLocaleString('vi-VN')} tài liệu RAG (
                {stats.total_chunks.toLocaleString('vi-VN')} phân đoạn) ·{' '}
                {stats.total_sessions.toLocaleString('vi-VN')} phiên phản biện
              </span>
            ) : (
              <span>Đang kết nối dữ liệu thực tế từ FastAPI SQLite &amp; Vector DB...</span>
            )}
          </div>

          {/* INTERACTIVE WORKSPACE PREVIEW WINDOW */}
          <div className="relative w-full max-w-[1140px] mt-12 sm:mt-16 text-left">
            {/* Soft Mint Halo behind App Window */}
            <div
              className="absolute -inset-x-6 top-8 h-[420px] rounded-full blur-3xl pointer-events-none"
              style={{
                background:
                  'radial-gradient(closest-side, rgba(110, 231, 200, 0.28), rgba(110, 231, 200, 0))',
              }}
              aria-hidden="true"
            />

            <div
              role="group"
              aria-label="Không gian tổng quan và cấu hình hệ thống VivaArena"
              className="relative rounded-[20px] bg-white border border-[rgba(10,20,19,0.12)] shadow-[0_30px_80px_-24px_rgba(10,20,19,0.16),0_0_90px_-10px_rgba(110,231,200,0.22)] overflow-hidden flex flex-col md:flex-row"
            >
              {/* Sidebar */}
              <aside className="w-full md:w-[244px] shrink-0 bg-[#eff5f3] border-b md:border-b-0 md:border-r border-[rgba(10,20,19,0.08)] p-3 sm:p-4 flex flex-col justify-between gap-4">
                <div>
                  {/* Window Traffic Lights */}
                  <div className="flex items-center gap-2 px-2 py-1 mb-3" aria-hidden="true">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>

                  {/* Quick Nav Shortcut Items */}
                  <div className="hidden md:flex flex-col gap-0.5 mb-4">
                    <button
                      type="button"
                      onClick={onStartSetup}
                      className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-[13px] font-sans text-[#465754] hover:bg-white/70 hover:text-[#0a1413] transition-colors text-left cursor-pointer border-none bg-transparent"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                      <span>Tạo phiên phản biện</span>
                    </button>
                    <button
                      type="button"
                      onClick={onStartSetup}
                      className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-[13px] font-sans text-[#465754] hover:bg-white/70 hover:text-[#0a1413] transition-colors text-left cursor-pointer border-none bg-transparent"
                    >
                      <Activity className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                      <span>3 Cấp giám khảo AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={onExploreArchive}
                      className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-[13px] font-sans text-[#465754] hover:bg-white/70 hover:text-[#0a1413] transition-colors text-left cursor-pointer border-none bg-transparent"
                    >
                      <Layers className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                      <span>Kho đề án &amp; Điểm số</span>
                    </button>
                  </div>

                  {/* Tab Group Heading */}
                  <div className="px-2 pb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[#556361]">
                    {user ? 'TỔNG QUAN & KIẾN TRÚC' : 'KIẾN TRÚC HỆ THỐNG'}
                  </div>
                  <div
                    role="tablist"
                    aria-label="Chọn góc nhìn tổng quan hệ thống"
                    className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0"
                  >
                    {previewTabs.map((item) => {
                      const isActive = activePreviewTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setActivePreviewTab(item.id)}
                          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-sans whitespace-nowrap md:whitespace-normal text-left transition-all cursor-pointer border ${
                            isActive
                              ? 'bg-white text-[#0a1413] font-medium border-[rgba(10,20,19,0.1)] shadow-2xs'
                              : 'bg-transparent text-[#465754] hover:bg-white/55 border-transparent'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 border-[1.5px] ${
                              isActive
                                ? 'border-[#0b6e5e] bg-[#6ee7c8]'
                                : 'border-[#556361]/60'
                            }`}
                            aria-hidden="true"
                          />
                          <span className="flex-1 truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar User Footer */}
                <div className="hidden md:flex items-center gap-2.5 px-2 pt-3 border-t border-[rgba(10,20,19,0.08)]">
                  {user ? (
                    <>
                      <img
                        src={user.avatar || '/avatars/user-default.jpg'}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover object-top bg-white shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-sans text-xs font-medium text-[#0a1413] block truncate">
                          {user.name}
                        </span>
                        <span className="font-mono text-[10px] text-[#0b6e5e] block truncate">
                          {user.role}
                        </span>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="flex items-center gap-2 text-left text-xs font-sans text-[#0b6e5e] hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                      <span>Đăng nhập để lưu hồ sơ</span>
                    </button>
                  )}
                </div>
              </aside>

              {/* Main Preview Canvas */}
              <div className="flex-1 min-w-0 p-5 sm:p-7 bg-white flex flex-col gap-4">
                {activePreviewTab === 'live' && user && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[rgba(10,20,19,0.08)]">
                      <span className="font-sans font-medium text-sm text-[#0a1413]">
                        Hồ sơ thực tế · {user.email}
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-[11px] font-medium bg-[rgba(110,231,200,0.22)] text-[#064037] border border-[rgba(11,110,94,0.2)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0b6e5e]" aria-hidden="true" />
                        <span>Dữ liệu đồng bộ SQLite</span>
                      </span>
                    </div>

                    <div className="font-sans font-semibold text-lg sm:text-xl tracking-[-0.02em] text-[#0a1413]">
                      Tổng quan tiến độ bảo vệ đề tài của {user.name}
                    </div>

                    {/* 4 REAL KPI Tiles */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)] flex flex-col gap-1">
                        <span className="font-sans text-xs text-[#556361]">Tài liệu RAG</span>
                        <span className="font-sans font-semibold text-xl sm:text-2xl tracking-[-0.025em] text-[#0a1413] tabular-nums">
                          {documents.length} tệp
                        </span>
                        <span className="font-mono text-[11px] font-medium text-[#0b6e5e]">
                          {userTotalChunks} phân đoạn
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)] flex flex-col gap-1">
                        <span className="font-sans text-xs text-[#556361]">Phiên phản biện</span>
                        <span className="font-sans font-semibold text-xl sm:text-2xl tracking-[-0.025em] text-[#0a1413] tabular-nums">
                          {sessions.length} phiên
                        </span>
                        <span className="font-mono text-[11px] font-medium text-[#0b6e5e]">
                          {userCompletedCount} đã hoàn thành
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)] flex flex-col gap-1">
                        <span className="font-sans text-xs text-[#556361]">Bảng điểm CoT</span>
                        <span className="font-sans font-semibold text-xl sm:text-2xl tracking-[-0.025em] text-[#0a1413] tabular-nums">
                          {scorecards.length} báo cáo
                        </span>
                        <span className="font-mono text-[11px] font-medium text-[#0369a1]">
                          Lưu cơ sở dữ liệu
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)] flex flex-col gap-1">
                        <span className="font-sans text-xs text-[#556361]">Điểm trung bình</span>
                        <span className="font-sans font-semibold text-xl sm:text-2xl tracking-[-0.025em] text-[#0a1413] tabular-nums">
                          {userAvgScore !== null ? `${userAvgScore.toFixed(1)}/100` : '--'}
                        </span>
                        <span className="font-mono text-[11px] font-medium text-[#0b6e5e]">
                          {userAvgScore !== null ? 'Rubric 4 trục' : 'Chưa chấm điểm'}
                        </span>
                      </div>
                    </div>

                    {/* Real Data Visualization Panel */}
                    <div className="p-4 rounded-xl border border-[rgba(10,20,19,0.08)] bg-[#f7faf9]">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-sans text-[#556361] mb-2.5">
                        <span>
                          {chronologicalScorecards.length >= 2
                            ? `Biến thiên điểm tổng hợp qua ${chronologicalScorecards.length} phiên gần nhất`
                            : scorecards.length === 1
                            ? `Chi tiết 4 trục phiên #${scorecards[0].session_id.slice(0, 8).toUpperCase()}`
                            : 'Trạng thái ghi nhận dữ liệu thực tế'}
                        </span>
                        <span className="font-mono font-medium text-[#0a1413]">
                          {userAvgScore !== null ? `TB: ${userAvgScore.toFixed(1)} điểm` : '0 bảng điểm'}
                        </span>
                      </div>

                      {chronologicalScorecards.length >= 2 ? (
                        <svg viewBox="0 0 776 110" className="block w-full h-[96px]" aria-hidden="true">
                          <polyline
                            fill="none"
                            stroke="#0b6e5e"
                            strokeWidth="2.5"
                            points={chronologicalScorecards
                              .map((sc, i) => {
                                const x = Math.round(
                                  24 + (i / (chronologicalScorecards.length - 1)) * 728
                                );
                                const y = Math.round(92 - (Math.max(0, Math.min(100, sc.overall_score)) / 100) * 74);
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />
                          {chronologicalScorecards.map((sc, i) => {
                            const x = Math.round(
                              24 + (i / (chronologicalScorecards.length - 1)) * 728
                            );
                            const y = Math.round(92 - (Math.max(0, Math.min(100, sc.overall_score)) / 100) * 74);
                            return <circle key={sc.id} cx={x} cy={y} r="4.5" fill="#085448" stroke="#6ee7c8" strokeWidth="2" />;
                          })}
                        </svg>
                      ) : scorecards.length === 1 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
                          {[
                            { name: 'Logic học thuật', val: scorecards[0].logic_accuracy_score },
                            { name: 'Kỹ năng tranh biện', val: scorecards[0].argumentation_score },
                            { name: 'Bản lĩnh phản biện', val: scorecards[0].composure_score },
                            { name: 'Độ khúc chiết', val: scorecards[0].clarity_score },
                          ].map((ax) => (
                            <div key={ax.name} className="p-2.5 rounded-lg bg-white border border-[rgba(10,20,19,0.08)]">
                              <span className="text-[#556361] block text-[11px]">{ax.name}</span>
                              <strong className="font-mono text-sm text-[#0b6e5e]">{ax.val.toFixed(0)}/100</strong>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-sans text-[#465754] leading-relaxed">
                          Tài khoản mới khởi tạo sạch sẽ. Hãy tải lên tài liệu nghiên cứu và hoàn thành ít nhất một phiên phản biện để hiển thị biểu đồ điểm số thật của riêng bạn.
                        </p>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[rgba(110,231,200,0.14)] border border-[rgba(11,110,94,0.22)]">
                      <span className="font-mono font-semibold text-[10px] tracking-[0.08em] uppercase text-[#085448] block mb-1">
                        GHI NHẬN MỚI NHẤT TỪ CƠ SỞ DỮ LIỆU
                      </span>
                      <p className="font-sans text-[13px] leading-relaxed text-[#0a1413]">
                        {scorecards[0]?.overall_verdict ||
                          (sessions[0]
                            ? `Phiên gần nhất "${sessions[0].title}" đang ở lượt ${sessions[0].current_turn}/${sessions[0].max_turns}.`
                            : 'Chưa có phiên nào được ghi nhận cho tài khoản này.')}
                      </p>
                    </div>
                  </>
                )}

                {activePreviewTab === 'pipeline' && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[rgba(10,20,19,0.08)]">
                      <span className="font-sans font-medium text-sm text-[#0a1413]">
                        Quy trình RAG &amp; CoT
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-[11px] font-medium bg-[#eff5f3] text-[#085448] border border-[rgba(11,110,94,0.2)]">
                        <Database className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
                        <span>Kiến trúc vận hành</span>
                      </span>
                    </div>

                    <div className="font-sans font-semibold text-lg sm:text-xl tracking-[-0.02em] text-[#0a1413]">
                      Chuỗi xử lý tài liệu RAG &amp; suy luận CoT 3 bước
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)] flex flex-col gap-1">
                        <span className="font-sans text-xs text-[#556361]">Chuỗi suy luận</span>
                        <span className="font-sans font-semibold text-xl sm:text-2xl tracking-[-0.025em] text-[#0a1413]">
                          3 Bước
                        </span>
                        <span className="font-mono text-[11px] font-medium text-[#0b6e5e]">
                          Kiểm chứng · Lỗ hổng
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)] flex flex-col gap-1">
                        <span className="font-sans text-xs text-[#556361]">Định dạng RAG</span>
                        <span className="font-sans font-semibold text-xl sm:text-2xl tracking-[-0.025em] text-[#0a1413]">
                          3 Loại
                        </span>
                        <span className="font-mono text-[11px] font-medium text-[#0b6e5e]">
                          PDF · DOCX · TXT
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)] flex flex-col gap-1">
                        <span className="font-sans text-xs text-[#556361]">Kho tài liệu thực</span>
                        <span className="font-sans font-semibold text-xl sm:text-2xl tracking-[-0.025em] text-[#0a1413] tabular-nums">
                          {stats ? stats.total_documents.toLocaleString('vi-VN') : 0} Tệp
                        </span>
                        <span className="font-mono text-[11px] font-medium text-[#0369a1]">
                          {stats ? stats.total_chunks.toLocaleString('vi-VN') : 0} phân đoạn Vector
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)] flex flex-col gap-1">
                        <span className="font-sans text-xs text-[#556361]">Phiên trên máy chủ</span>
                        <span className="font-sans font-semibold text-xl sm:text-2xl tracking-[-0.025em] text-[#0a1413] tabular-nums">
                          {stats ? stats.total_sessions.toLocaleString('vi-VN') : 0} Phiên
                        </span>
                        <span className="font-mono text-[11px] font-medium text-[#0b6e5e]">
                          {stats ? stats.total_answered_turns.toLocaleString('vi-VN') : 0} lượt đối đáp
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-[rgba(10,20,19,0.08)] bg-[#f7faf9] grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          step: 'BƯỚC 01 · FACT-CHECK',
                          title: 'Đối soát Ground Truth',
                          desc: 'Truy xuất đoạn văn tương đồng từ tệp đề án của bạn.',
                        },
                        {
                          step: 'BƯỚC 02 · LOGIC AUDIT',
                          title: 'Truy vết lỗ hổng',
                          desc: 'Phát hiện suy diễn thiếu cơ sở hoặc mâu thuẫn số liệu.',
                        },
                        {
                          step: 'BƯỚC 03 · REBUTTAL',
                          title: 'Sinh câu hỏi Socratic',
                          desc: 'Đặt câu hỏi phản bác xoáy thẳng vào phần cần giải trình.',
                        },
                      ].map((item) => (
                        <div key={item.step} className="p-3 rounded-lg bg-white border border-[rgba(10,20,19,0.08)]">
                          <span className="font-mono text-[10px] font-semibold text-[#0b6e5e] block mb-1">
                            {item.step}
                          </span>
                          <strong className="font-sans text-xs font-semibold text-[#0a1413] block mb-1">
                            {item.title}
                          </strong>
                          <span className="font-sans text-[11px] text-[#465754] leading-snug block">
                            {item.desc}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[rgba(110,231,200,0.14)] border border-[rgba(11,110,94,0.22)]">
                      <span className="font-mono font-semibold text-[10px] tracking-[0.08em] uppercase text-[#085448] block mb-1">
                        NGUYÊN TẮC ĐỐI SOÁT DỮ LIỆU THẬT
                      </span>
                      <p className="font-sans text-[13px] leading-relaxed text-[#0a1413]">
                        Mỗi tài liệu được tách đoạn riêng theo tài khoản sở hữu trong ChromaDB và gắn liền với phiên chất vấn thực tế của bạn.
                      </p>
                    </div>
                  </>
                )}

                {activePreviewTab === 'personas' && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[rgba(10,20,19,0.08)]">
                      <span className="font-sans font-medium text-sm text-[#0a1413]">
                        3 Cấp Giám Khảo
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-[11px] font-medium bg-[#eff5f3] text-[#085448] border border-[rgba(11,110,94,0.2)]">
                        <span>3 Persona chuyên trách</span>
                      </span>
                    </div>

                    <div className="font-sans font-semibold text-lg sm:text-xl tracking-[-0.02em] text-[#0a1413]">
                      Cấu hình Hội đồng AI theo cường độ phản biện
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(['feynman', 'academic_reviewer', 'strict_council'] as CouncilPersona[]).map((pId) => {
                        const info = COUNCIL_BADGES[pId];
                        return (
                          <div
                            key={pId}
                            className="p-4 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)] flex flex-col justify-between gap-2"
                          >
                            <div>
                              <span className="font-mono text-[10px] font-semibold text-[#0b6e5e] block mb-1">
                                {info.code}
                              </span>
                              <strong className="font-sans text-sm font-semibold text-[#0a1413] block">
                                {info.name}
                              </strong>
                              <p className="font-sans text-xs text-[#465754] mt-1.5 leading-relaxed">
                                {info.tagline}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePersonaPick(pId)}
                              className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-[#0b6e5e] hover:underline bg-transparent border-none p-0 cursor-pointer w-fit"
                            >
                              <span>Chọn giám khảo này</span>
                              <ArrowRight className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[rgba(110,231,200,0.14)] border border-[rgba(11,110,94,0.22)]">
                      <span className="font-mono font-semibold text-[10px] tracking-[0.08em] uppercase text-[#085448] block mb-1">
                        TƯƠNG TÁC GIỌNG NÓI &amp; VĂN BẢN THỰC
                      </span>
                      <p className="font-sans text-[13px] leading-relaxed text-[#0a1413]">
                        Chọn giữa 3, 5 hoặc 10 lượt chất vấn kèm luồng giọng nói Edge-TTS / D-ID WebRTC hoặc gõ phản biện trực tiếp ngay tại phòng thi.
                      </p>
                    </div>
                  </>
                )}

                {activePreviewTab === 'rubric' && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[rgba(10,20,19,0.08)]">
                      <span className="font-sans font-medium text-sm text-[#0a1413]">
                        Rubric 4 Trục PREP
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-[11px] font-medium bg-[#eff5f3] text-[#085448] border border-[rgba(11,110,94,0.2)]">
                        <span>Trọng số chấm điểm thực tế</span>
                      </span>
                    </div>

                    <div className="font-sans font-semibold text-lg sm:text-xl tracking-[-0.02em] text-[#0a1413]">
                      Công thức thẩm định 4 trục học thuật sau bảo vệ
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {RUBRIC_WEIGHTS.map((item) => (
                        <div
                          key={item.label}
                          className="p-3.5 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)] flex flex-col gap-1"
                        >
                          <span className="font-sans text-xs text-[#556361]">{item.label}</span>
                          <span className="font-sans font-semibold text-xl sm:text-2xl tracking-[-0.025em] text-[#0b6e5e]">
                            {item.weight}%
                          </span>
                          <span className="font-mono text-[11px] font-medium text-[#465754]">
                            {item.detail}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl border border-[rgba(10,20,19,0.08)] bg-[#f7faf9] space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-sans text-[#556361]">
                        <span>Phân bổ trọng số tổng hợp 100%</span>
                        <span className="font-mono text-[#0a1413]">35% + 30% + 20% + 15%</span>
                      </div>
                      <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#dce7e4]">
                        <div className="h-full bg-[#0b6e5e]" style={{ width: '35%' }} title="Logic Học Thuật 35%" />
                        <div className="h-full bg-[#0369a1]" style={{ width: '30%' }} title="Kỹ Năng Tranh Biện 30%" />
                        <div className="h-full bg-[#334155]" style={{ width: '20%' }} title="Bản Lĩnh Phản Biện 20%" />
                        <div className="h-full bg-[#6ee7c8]" style={{ width: '15%' }} title="Độ Khúc Chiết 15%" />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[rgba(110,231,200,0.14)] border border-[rgba(11,110,94,0.22)]">
                      <span className="font-mono font-semibold text-[10px] tracking-[0.08em] uppercase text-[#085448] block mb-1">
                        GỢI Ý CẢI THIỆN CHUẨN PREP
                      </span>
                      <p className="font-sans text-[13px] leading-relaxed text-[#0a1413]">
                        Bảng điểm chỉ được tạo sau khi bạn trả lời tối thiểu 1 câu hỏi của Hội đồng, kèm phần gợi ý trả lời tối ưu hóa cho từng lượt đã thi.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Signature Soft Fade into Light Paper Canvas (#f7faf9) */}
            <div
              aria-hidden="true"
              className="pointer-events-none hidden sm:block absolute inset-x-0 bottom-0 h-24"
              style={{
                background: 'linear-gradient(to bottom, rgba(247, 250, 249, 0), #f7faf9)',
              }}
            />
          </div>
        </div>
      </section>

      {/* ==================== 2. ACADEMIC DISCIPLINES STRIP ==================== */}
      <section className="mint-wrap pt-12 pb-20 sm:pb-24 text-center" aria-label="Lĩnh vực nghiên cứu hỗ trợ">
        <p className="mint-eyebrow text-[#556361] mb-6">
          PHÙ HỢP CHO HỘI ĐỒNG BẢO VỆ CÁC CHUYÊN NGÀNH
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-14">
          {[
            { name: 'Khoa học Máy tính & AI', Icon: Cpu },
            { name: 'Kỹ thuật & Công nghệ', Icon: FlaskConical },
            { name: 'Kinh tế & Tài chính', Icon: Landmark },
            { name: 'Quản trị & Kinh doanh', Icon: Briefcase },
            { name: 'Y sinh & Khoa học', Icon: BookOpen },
            { name: 'Nghiên cứu Đa ngành', Icon: Layers },
          ].map(({ name, Icon }) => (
            <div
              key={name}
              className="inline-flex items-center gap-2.5 text-[#556361] hover:text-[#0a1413] transition-colors font-sans font-semibold text-sm sm:text-base tracking-[-0.015em]"
            >
              <Icon className="w-4 h-4 text-[#0b6e5e]" strokeWidth={1.9} aria-hidden="true" />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 3. SECTION 01 — WORKSPACE FEATURES ==================== */}
      <section className="border-t border-[rgba(10,20,19,0.08)] py-20 sm:py-28">
        <div className="mint-wrap">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <p className="mint-eyebrow mb-4">01 — KHÔNG GIAN LUYỆN TẬP</p>
              <h2 className="mint-h2 text-[32px] sm:text-[42px] lg:text-[48px] max-w-2xl">
                Phòng giả lập bảo vệ cho tư duy{' '}
                <span className="mint-serif">thực chiến</span>.
              </h2>
            </div>
            <p className="font-sans text-sm sm:text-base text-[#465754] max-w-sm leading-relaxed">
              Kết nối trực tiếp báo cáo PDF, DOCX hoặc TXT của bạn. Hội đồng AI ghi nhớ cấu trúc luận điểm và xoáy sâu vào phần cốt lõi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <article className="mint-card mint-card-hover p-7 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-[rgba(110,231,200,0.18)] border border-[rgba(11,110,94,0.22)] text-[#085448] flex items-center justify-center">
                  <FileSearch className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-[#556361]">01</span>
              </div>
              <div className="mt-14">
                <h3 className="font-sans font-semibold text-xl tracking-[-0.015em] text-[#0a1413]">
                  Đối soát Ground Truth RAG
                </h3>
                <p className="mt-2.5 font-sans text-sm text-[#465754] leading-relaxed">
                  Tài liệu được phân đoạn ngữ nghĩa tự động theo từng tài khoản. Mọi câu trả lời đều được đối chiếu với nội dung gốc.
                </p>
              </div>
            </article>

            <article className="mint-card mint-card-hover p-7 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-[rgba(110,231,200,0.18)] border border-[rgba(11,110,94,0.22)] text-[#085448] flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-[#556361]">02</span>
              </div>
              <div className="mt-14">
                <h3 className="font-sans font-semibold text-xl tracking-[-0.015em] text-[#0a1413]">
                  Chuỗi suy luận CoT 3 bước
                </h3>
                <p className="mt-2.5 font-sans text-sm text-[#465754] leading-relaxed">
                  Hiển thị minh bạch 3 pha suy nghĩ: kiểm chứng sự thật, truy vết ngụy biện và lựa chọn hướng phản bác sắc bén nhất.
                </p>
              </div>
            </article>

            <article className="mint-card mint-card-hover p-7 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-[rgba(110,231,200,0.18)] border border-[rgba(11,110,94,0.22)] text-[#085448] flex items-center justify-center">
                  <Mic className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-[#556361]">03</span>
              </div>
              <div className="mt-14">
                <h3 className="font-sans font-semibold text-xl tracking-[-0.015em] text-[#0a1413]">
                  Giọng nói WebRTC &amp; Chuẩn PREP
                </h3>
                <p className="mt-2.5 font-sans text-sm text-[#465754] leading-relaxed">
                  Tương tác giọng nói cùng giám khảo AI, đo tốc độ phản xạ thực tế và nhận bản gợi ý trả lời tối ưu chuẩn PREP.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ==================== 4. SECTION 02 — BENTO COUNCIL SHOWCASE ==================== */}
      <section className="border-t border-[rgba(10,20,19,0.08)] py-20 sm:py-28">
        <div className="mint-wrap">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <p className="mint-eyebrow mb-4">02 — HỘI ĐỒNG CHUYÊN SÂU</p>
              <h2 className="mint-h2 text-[32px] sm:text-[42px] lg:text-[48px] max-w-2xl">
                Cả một <span className="mint-serif">hội đồng,</span> không chỉ một chatbot.
              </h2>
            </div>
            <p className="font-sans text-sm sm:text-base text-[#465754] max-w-sm leading-relaxed">
              Ba phong cách chấm thi đặc thù, đa mô hình suy luận và khung tiêu chí đánh giá minh bạch để bạn sẵn sàng mọi tình huống.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* BENTO ROW 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Wide Card: Specialist Examiners */}
              <div className="lg:col-span-8 mint-card mint-card-hover p-6 sm:p-8 bg-gradient-to-br from-white via-white to-[#eff5f3] flex flex-col md:flex-row items-center gap-8 group">
                <div className="flex-1 flex flex-col gap-4">
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#556361]">
                    GIÁM KHẢO CHUYÊN TRÁCH
                  </span>
                  <h3 className="font-sans font-semibold text-2xl sm:text-[28px] leading-[1.18] tracking-[-0.02em] text-[#0a1413]">
                    Chọn phong cách chất vấn từ Feynman đến Stress-Test chỉ với một cú nhấp.
                  </h3>
                  <p className="font-sans text-sm text-[#465754] leading-relaxed">
                    {currentBadge.tagline}
                  </p>

                  {/* Clickable Persona Switcher Pills */}
                  <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Xem trước chân dung giám khảo">
                    {(['feynman', 'academic_reviewer', 'strict_council'] as CouncilPersona[]).map((id) => {
                      const active = badgePersona === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setBadgePersona(id)}
                          className={`px-3.5 py-1.5 rounded-full font-sans text-xs font-medium border transition-all cursor-pointer ${
                            active
                              ? 'bg-[#0a1413] text-white border-[#0a1413]'
                              : 'bg-white text-[#465754] border-[rgba(10,20,19,0.14)] hover:border-[#0b6e5e]/40 hover:text-[#0a1413]'
                          }`}
                        >
                          {COUNCIL_BADGES[id].chip}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handlePersonaPick(badgePersona)}
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#0b6e5e] hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      <span>Thiết lập ngay với {currentBadge.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Tilted Studio ID Badge */}
                <div className="w-[228px] shrink-0 flex items-center justify-center py-2">
                  <div className="w-[216px] p-3 rounded-[18px] bg-[#f4f7f6] border border-[rgba(10,20,19,0.12)] shadow-[0_24px_48px_-14px_rgba(10,20,19,0.18)] rotate-[3.5deg] group-hover:rotate-[1deg] group-hover:-translate-y-1 transition-transform duration-500">
                    <img
                      src="/avatars/examiner-id.jpg"
                      alt={`Chân dung ${currentBadge.name}`}
                      className="w-full h-[196px] rounded-[12px] object-cover object-[50%_18%] bg-[#dce7e4]"
                    />
                    <div className="pt-3 flex flex-col gap-0.5 text-left">
                      <span className="font-sans text-xs text-[#556361]">{currentBadge.name}</span>
                      <span className="font-sans font-semibold text-lg tracking-[-0.02em] text-[#0a1413] leading-tight">
                        <em className="not-italic text-[#0b6e5e]">{currentBadge.roleA}</em>{' '}
                        {currentBadge.roleB}
                      </span>
                      <span className="font-mono text-[10px] font-medium tracking-[0.06em] text-[#556361] pt-0.5">
                        {currentBadge.code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capability Tiles Card */}
              <div className="lg:col-span-4 mint-card mint-card-hover p-6 sm:p-7 flex flex-col justify-between gap-4">
                <div>
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#556361]">
                    8 NĂNG LỰC CỐT LÕI
                  </span>
                  <h3 className="mt-2 font-sans font-semibold text-xl tracking-[-0.015em] text-[#0a1413]">
                    Đầy đủ công cụ cho giờ G.
                  </h3>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {TOOL_TILES.map(({ id, label, Icon }) => {
                    const selected = activeToolLabel === label;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-label={label}
                        onClick={() => setActiveToolLabel(label)}
                        className={`aspect-square rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                          selected
                            ? 'bg-[rgba(110,231,200,0.22)] border-[rgba(11,110,94,0.38)] text-[#064037] -translate-y-0.5'
                            : 'bg-[#f7faf9] border-[rgba(10,20,19,0.08)] text-[#465754] hover:text-[#0b6e5e] hover:border-[rgba(11,110,94,0.26)] hover:bg-[rgba(110,231,200,0.12)]'
                        }`}
                      >
                        <Icon className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>

                <p className="font-mono text-[11px] text-[#0b6e5e] min-h-[16px]">
                  {activeToolLabel || 'Nhấp biểu tượng để xem mô-đun tích hợp'}
                </p>
              </div>
            </div>

            {/* BENTO ROW 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tile 3: Multi-Model Selector */}
              <div className="mint-card mint-card-hover p-6 sm:p-7 flex flex-col justify-between gap-4">
                <div>
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#556361]">
                    KIẾN TRÚC ĐA TÁC TỬ
                  </span>
                  <h3 className="mt-2 font-sans font-semibold text-xl tracking-[-0.015em] text-[#0a1413]">
                    Đúng mô hình cho từng tác vụ.
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn mô hình AI">
                  {Object.keys(MODEL_NOTES).map((modelName) => {
                    const active = selectedModel === modelName;
                    return (
                      <button
                        key={modelName}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelectedModel(modelName)}
                        className={`px-3 py-1.5 rounded-full font-mono text-xs font-medium border transition-all cursor-pointer ${
                          active
                            ? 'bg-[rgba(110,231,200,0.24)] border-[rgba(11,110,94,0.35)] text-[#064037]'
                            : 'bg-[#f7faf9] border-[rgba(10,20,19,0.1)] text-[#465754] hover:text-[#0a1413] hover:border-[rgba(10,20,19,0.22)]'
                        }`}
                      >
                        {modelName}
                      </button>
                    );
                  })}
                </div>

                <p className="font-mono text-[11px] text-[#556361]">{MODEL_NOTES[selectedModel]}</p>
              </div>

              {/* Tile 4: Interactive Scope Guard */}
              <div className="mint-card mint-card-hover p-6 sm:p-7 flex flex-col justify-between gap-4">
                <div>
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#556361]">
                    KIỂM SOÁT PHẠM VI
                  </span>
                  <h3 className="mt-2 font-sans font-semibold text-xl tracking-[-0.015em] text-[#0a1413]">
                    Bạn chốt phạm vi. AI chất vấn.
                  </h3>
                </div>

                <div
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-colors ${
                    isApproved
                      ? 'bg-[rgba(110,231,200,0.16)] border-[rgba(11,110,94,0.28)]'
                      : 'bg-[#f7faf9] border-[rgba(10,20,19,0.1)]'
                  }`}
                >
                  <ShieldCheck
                    className="w-5 h-5 text-[#0b6e5e] shrink-0"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span className="flex-1 font-sans text-xs sm:text-[13px] font-medium text-[#0a1413]">
                    {isApproved ? 'Đã bật đối soát tài liệu RAG' : 'Giới hạn câu hỏi theo tệp đề án?'}
                  </span>
                  <button
                    type="button"
                    aria-pressed={isApproved}
                    onClick={() => setIsApproved((prev) => !prev)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-all cursor-pointer border ${
                      isApproved
                        ? 'bg-white text-[#085448] border-[rgba(11,110,94,0.3)]'
                        : 'bg-[#6ee7c8] text-[#064037] border-[rgba(11,110,94,0.18)] hover:bg-[#53dec0]'
                    }`}
                  >
                    {isApproved && <Check className="w-3.5 h-3.5" strokeWidth={2.4} aria-hidden="true" />}
                    <span>{isApproved ? 'Đã khóa' : 'Kích hoạt'}</span>
                  </button>
                </div>

                <p className="font-mono text-[11px] text-[#556361]">
                  {isApproved
                    ? 'Hội đồng bám sát đúng ngữ cảnh từ tài liệu bạn đã tải lên.'
                    : 'Liên kết tệp PDF/DOCX hoặc tự nhập tóm tắt trước khi thi.'}
                </p>
              </div>

              {/* Tile 5: Animated Pipeline Timeline */}
              <div className="mint-card mint-card-hover p-6 sm:p-7 flex flex-col justify-between gap-4">
                <div>
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#556361]">
                    QUY TRÌNH TỰ ĐỘNG
                  </span>
                  <h3 className="mt-2 font-sans font-semibold text-xl tracking-[-0.015em] text-[#0a1413]">
                    Mỗi lượt chất vấn chuẩn nhịp.
                  </h3>
                </div>

                <div className="flex flex-col gap-3">
                  {PIPELINE_STEPS.map((item, i) => {
                    const isLit = i < pipelineIdx;
                    const isCurrent = i === pipelineIdx - 1;
                    return (
                      <div key={item.step} className="flex items-center gap-3">
                        <span className="font-mono text-xs text-[#556361] w-8 shrink-0">
                          {item.step}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                            isLit ? 'bg-[#0b6e5e]' : 'bg-[#cddbd7]'
                          } ${isCurrent ? 'mint-timeline-dot-active' : ''}`}
                          aria-hidden="true"
                        />
                        <span
                          className={`font-sans text-xs sm:text-sm transition-colors ${
                            isLit ? 'text-[#0a1413] font-medium' : 'text-[#556361]'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. PEDAGOGICAL STATEMENT & REAL DATABASE STATS ==================== */}
      <section className="border-t border-[rgba(10,20,19,0.08)] py-24 sm:py-32">
        <div className="mint-wrap flex flex-col items-center text-center gap-8">
          <div
            aria-hidden="true"
            className="font-serif text-[88px] sm:text-[112px] leading-[0.5] text-[#0b6e5e] h-9 select-none"
          >
            &ldquo;
          </div>

          <blockquote className="max-w-4xl font-serif text-[28px] sm:text-[38px] lg:text-[44px] leading-[1.24] tracking-[-0.01em] text-[#0a1413]">
            Bản lĩnh bảo vệ đề tài không đến từ việc đọc thuộc kịch bản, mà từ khả năng giữ vững luận điểm và trích dẫn đúng số liệu khi bị{' '}
            <span className="mint-serif">phản bác trực diện</span>.
          </blockquote>

          <div className="flex items-center gap-3.5 text-left">
            <span className="w-11 h-11 rounded-full bg-[rgba(110,231,200,0.25)] border border-[rgba(11,110,94,0.24)] text-[#085448] flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
            </span>
            <div>
              <b className="block font-sans font-semibold text-sm text-[#0a1413]">
                Phân hệ Chất vấn Socratic · VivaArena Core
              </b>
              <small className="block font-sans text-xs text-[#556361] mt-0.5">
                Chuỗi suy luận CoT 3 bước · Đối soát RAG Vector &amp; Bảng điểm 4 trục PREP
              </small>
            </div>
          </div>

          {/* 4 100% REAL Server Metrics from GET /api/v1/stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 pt-8 mt-2 w-full max-w-4xl border-t border-[rgba(10,20,19,0.08)]">
            <div className="px-4 flex flex-col items-center gap-1">
              <b className="font-sans font-semibold text-3xl sm:text-4xl tracking-[-0.03em] text-[#0a1413] tabular-nums">
                {stats ? stats.total_users.toLocaleString('vi-VN') : '0'}
              </b>
              <span className="font-sans text-xs sm:text-[13px] text-[#556361]">
                Tài khoản đã đăng ký
              </span>
            </div>
            <div className="px-4 md:border-l border-[rgba(10,20,19,0.08)] flex flex-col items-center gap-1">
              <b className="font-sans font-semibold text-3xl sm:text-4xl tracking-[-0.03em] text-[#0a1413] tabular-nums">
                {stats ? stats.total_documents.toLocaleString('vi-VN') : '0'}
              </b>
              <span className="font-sans text-xs sm:text-[13px] text-[#556361]">
                Tài liệu RAG ({stats ? stats.total_chunks.toLocaleString('vi-VN') : 0} đoạn)
              </span>
            </div>
            <div className="px-4 md:border-l border-[rgba(10,20,19,0.08)] flex flex-col items-center gap-1">
              <b className="font-sans font-semibold text-3xl sm:text-4xl tracking-[-0.03em] text-[#0a1413] tabular-nums">
                {stats ? stats.total_sessions.toLocaleString('vi-VN') : '0'}
              </b>
              <span className="font-sans text-xs sm:text-[13px] text-[#556361]">
                Phiên phản biện ({stats ? stats.completed_sessions.toLocaleString('vi-VN') : 0} hoàn thành)
              </span>
            </div>
            <div className="px-4 md:border-l border-[rgba(10,20,19,0.08)] flex flex-col items-center gap-1">
              <b className="font-sans font-semibold text-3xl sm:text-4xl tracking-[-0.03em] text-[#0a1413] tabular-nums">
                {stats && stats.average_overall_score !== null
                  ? `${stats.average_overall_score.toFixed(1)}/100`
                  : stats
                  ? stats.total_answered_turns.toLocaleString('vi-VN')
                  : '0'}
              </b>
              <span className="font-sans text-xs sm:text-[13px] text-[#556361]">
                {stats && stats.average_overall_score !== null
                  ? 'Điểm trung bình từ SQLite'
                  : 'Lượt đối đáp CoT đã lưu'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 6. CLOSING CTA CARD ==================== */}
      <section className="pb-20 sm:pb-28">
        <div className="mint-wrap">
          <div className="relative overflow-hidden rounded-[28px] bg-white border border-[rgba(10,20,19,0.12)] shadow-[0_24px_70px_-24px_rgba(11,110,94,0.18)] px-6 py-16 sm:py-24 text-center flex flex-col items-center gap-5 group">
            {/* Soft Bottom Mint Glow inside Light Card */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 -bottom-44 -translate-x-1/2 w-[720px] h-[340px] rounded-full blur-3xl transition-transform duration-500 group-hover:scale-105"
              style={{
                background:
                  'radial-gradient(closest-side, rgba(110, 231, 200, 0.36), rgba(110, 231, 200, 0))',
              }}
            />

            <p className="relative mint-eyebrow">QUY TRÌNH BẢO VỆ THỰC TẾ</p>
            <h2 className="relative mint-h2 text-[36px] sm:text-[54px] lg:text-[66px] leading-[1.08] tracking-[-0.035em]">
              Giảm áp lực. Làm chủ{' '}
              <span className="mint-serif">hội đồng</span>.
            </h2>
            <p className="relative font-sans text-sm sm:text-base text-[#465754] max-w-md">
              Đăng nhập tài khoản, tải lên báo cáo đề án và bước vào lượt hỏi đáp thực chiến cùng Hội đồng AI.
            </p>

            <div className="relative flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onStartSetup}
                className="btn-mint-primary h-12 px-7 text-sm sm:text-[15px] cursor-pointer"
              >
                <Sparkles className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                <span>{user ? 'Tạo phiên phản biện mới' : 'Đăng nhập & Diễn tập'}</span>
              </button>
              <button
                type="button"
                onClick={onExploreArchive}
                className="btn-mint-ghost h-12 px-6 text-sm sm:text-[15px] cursor-pointer"
              >
                <span>Xem Kho đề án</span>
                <CircleCheck className="w-4 h-4 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

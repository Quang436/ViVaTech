import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Building2,
  Check,
  CircleCheck,
  Cpu,
  FileSearch,
  FileText,
  FlaskConical,
  Gauge,
  GraduationCap,
  Landmark,
  Layers,
  Mic,
  PlayCircle,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { CouncilPersona } from '../types';
import type { UserProfile } from './Navbar';

interface HomeViewProps {
  onStartSetup: () => void;
  onExploreArchive: () => void;
  onOpenAuth: () => void;
  onSelectPersona?: (persona: CouncilPersona) => void;
  user: UserProfile | null;
}

interface SimulationReport {
  id: number;
  tabLabel: string;
  isLive?: boolean;
  status: string;
  done: boolean;
  heading: string;
  kpis: Array<{
    label: string;
    target: number;
    decimals: number;
    suffix: string;
    delta: string;
    bad?: boolean;
  }>;
  chartLabel: string;
  chartTotal: string;
  pts: number[];
  finding: string;
}

const SIMULATION_REPORTS: SimulationReport[] = [
  {
    id: 0,
    tabLabel: 'Phản biện Chương 3',
    isLive: true,
    status: 'Đang chất vấn · Lượt 3/5',
    done: false,
    heading: 'Phân tích lập luận · Chương 3: Thực nghiệm',
    kpis: [
      { label: 'Ground Truth', target: 94.2, decimals: 1, suffix: '%', delta: '+8.4% RAG' },
      { label: 'Vững luận điểm', target: 88, decimals: 0, suffix: '/100', delta: '+12 điểm' },
      { label: 'Lỗ hổng phát hiện', target: 2, decimals: 0, suffix: ' điểm', delta: 'P-value biên', bad: true },
      { label: 'Độ trễ phản xạ', target: 1.4, decimals: 1, suffix: 's', delta: '-0.6s nhanh hơn' },
    ],
    chartLabel: 'Độ khớp chứng cứ RAG · 14 câu hỏi gần nhất',
    chartTotal: '94.2% khớp',
    pts: [92, 82, 86, 72, 76, 62, 65, 50, 52, 38, 30, 22, 14, 8],
    finding:
      'Bảng 4.2 trang 86 cần nêu rõ khoảng tin cậy P < 0.05 trên tập 500 mẫu biên trước khi kết luận tổng quát.',
  },
  {
    id: 1,
    tabLabel: 'Feynman Trực giác',
    status: 'Hoàn tất · 3/3 tiêu chí',
    done: true,
    heading: 'Truy vấn bản chất · GS. Lê Minh Triết',
    kpis: [
      { label: 'Độ khúc chiết', target: 92, decimals: 0, suffix: '/100', delta: 'Hạng A+' },
      { label: 'Ví dụ thực tế', target: 5, decimals: 0, suffix: ' ví dụ', delta: 'Trực giác tốt' },
      { label: 'Thuật ngữ mờ', target: 1, decimals: 0, suffix: ' mục', delta: 'Cần tinh giản', bad: true },
      { label: 'Nhịp độ nói', target: 132, decimals: 0, suffix: ' từ/p', delta: 'Ổn định' },
    ],
    chartLabel: 'Chỉ số truyền đạt mạch lạc · 14 phân đoạn',
    chartTotal: '92.0 / 100',
    pts: [88, 84, 78, 72, 70, 60, 54, 48, 42, 34, 28, 22, 18, 12],
    finding:
      'Giải thích cơ chế Attention qua ví dụ tìm kiếm từ khóa giúp Hội đồng nắm bắt đóng góp trong 45 giây đầu.',
  },
  {
    id: 2,
    tabLabel: 'Stress-Test Bắt bài',
    isLive: true,
    status: 'Áp lực cao · Lượt 4/5',
    done: false,
    heading: 'Phản biện góc biên · GS. Viện sĩ Hoàng Vĩnh',
    kpis: [
      { label: 'Bản lĩnh tâm lý', target: 86, decimals: 0, suffix: '/100', delta: '+9.5% giữ vững' },
      { label: 'Edge Cases vượt', target: 4, decimals: 0, suffix: '/4 ca', delta: 'Không né tránh' },
      { label: 'Mâu thuẫn logic', target: 1, decimals: 0, suffix: ' cảnh báo', delta: 'Giả thuyết H2', bad: true },
      { label: 'Tốc độ định hình', target: 1.8, decimals: 1, suffix: 's', delta: 'Chuẩn PREP' },
    ],
    chartLabel: 'Đường cong giữ vững lập luận dưới áp lực',
    chartTotal: '86.0 / 100',
    pts: [96, 86, 90, 74, 68, 72, 58, 50, 44, 40, 32, 26, 20, 14],
    finding:
      'Khi bị truy vấn về sai lệch giữa Giả thuyết H2 và kết luận Chương 3, khung PREP giúp giữ mạch dẫn chứng mạch lạc.',
  },
  {
    id: 3,
    tabLabel: 'Đánh giá 4 Trục',
    status: 'Hoàn tất · Đã xuất PDF',
    done: true,
    heading: 'Tổng kết E-Portfolio & Chuẩn PREP',
    kpis: [
      { label: 'Điểm tổng hợp', target: 91.5, decimals: 1, suffix: '/100', delta: 'Xuất sắc A+' },
      { label: 'Logic học thuật', target: 94, decimals: 0, suffix: '%', delta: '+14% đầu kỳ' },
      { label: 'Tranh biện', target: 89, decimals: 0, suffix: '%', delta: 'Đạt chuẩn ISI' },
      { label: 'Độ súc tích', target: 90, decimals: 0, suffix: '%', delta: '4 lượt tối ưu' },
    ],
    chartLabel: 'Tiến bộ qua các phiên diễn tập (Cognitive Curve)',
    chartTotal: '91.5 / 100',
    pts: [94, 88, 82, 74, 70, 62, 54, 46, 38, 30, 24, 18, 12, 6],
    finding:
      'Sẵn sàng bước vào hội đồng bảo vệ chính thức với 4 câu trả lời chuẩn PREP đã được kiểm chứng số liệu.',
  },
];

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
  'Gemini 2.5 Pro': 'Suy luận CoT 3 bước · Đối soát toàn văn luận án dài',
  'Gemini Flash': 'Độ trễ thấp · Phản hồi hội thoại giọng nói tức thì',
  'Vector RAG': 'Chia đoạn ngữ nghĩa · Truy xuất dẫn chứng theo trang',
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
  { time: '00:00', label: 'Nạp tài liệu & lập chỉ mục RAG' },
  { time: '01:20', label: 'Khởi tạo CoT 3 bước chất vấn' },
  { time: '12:00', label: 'Chấm điểm 4 trục & xuất PREP' },
];

const buildSparkPaths = (pts: number[]) => {
  const width = 776;
  const n = pts.length;
  let line = '';
  for (let i = 0; i < n; i++) {
    const x = ((width * i) / (n - 1)).toFixed(1);
    const y = (10 + pts[i]).toFixed(1);
    line += (i ? 'L' : 'M') + x + ' ' + y;
  }
  const area = `${line}L${width} 130L0 130Z`;
  return { line, area };
};

export const HomeView: React.FC<HomeViewProps> = ({
  onStartSetup,
  onExploreArchive,
  onOpenAuth,
  onSelectPersona,
  user,
}) => {
  const [activeReportIdx, setActiveReportIdx] = useState(0);
  const [seenTabs, setSeenTabs] = useState<Set<number>>(() => new Set([0]));
  const [sparkReady, setSparkReady] = useState(true);
  const [animatedKpis, setAnimatedKpis] = useState<number[]>(() =>
    SIMULATION_REPORTS[0].kpis.map((k) => k.target)
  );
  const [badgePersona, setBadgePersona] = useState<CouncilPersona>('academic_reviewer');
  const [selectedModel, setSelectedModel] = useState<string>('Gemini 2.5 Pro');
  const [isApproved, setIsApproved] = useState(false);
  const [activeToolLabel, setActiveToolLabel] = useState<string | null>(null);
  const [pipelineIdx, setPipelineIdx] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 3
      : 1
  );
  const [proofValues, setProofValues] = useState<[number, number, number, number]>([
    98.4, 15000, 42, 4,
  ]);

  const proofRef = useRef<HTMLDivElement>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);

  const report = SIMULATION_REPORTS[activeReportIdx];
  const { line: sparkLinePath, area: sparkAreaPath } = buildSparkPaths(report.pts);
  const currentBadge = COUNCIL_BADGES[badgePersona];

  // Animate preview KPI numbers & sparkline clip-path reveal on simulation tab change
  useEffect(() => {
    const targets = SIMULATION_REPORTS[activeReportIdx].kpis.map((k) => k.target);
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setAnimatedKpis(targets);
      setSparkReady(true);
      return;
    }

    setSparkReady(false);
    const sparkTimer = setTimeout(() => setSparkReady(true), 40);

    let rafId = 0;
    const duration = 680;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedKpis(targets.map((val) => val * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };
    rafId = requestAnimationFrame(step);

    return () => {
      clearTimeout(sparkTimer);
      cancelAnimationFrame(rafId);
    };
  }, [activeReportIdx]);

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

  // Proof counters count-up once scrolled into view
  useEffect(() => {
    const el = proofRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let rafId = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1100;
        const targets: [number, number, number, number] = [98.4, 15000, 42, 4];

        const tick = (now: number) => {
          const k = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - k, 3);
          setProofValues([
            Number((targets[0] * eased).toFixed(1)),
            Math.round(targets[1] * eased),
            Math.round(targets[2] * eased),
            Math.max(1, Math.round(targets[3] * eased)),
          ]);
          if (k < 1) {
            rafId = requestAnimationFrame(tick);
          }
        };
        rafId = requestAnimationFrame(tick);
      },
      { threshold: 0.35 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleSelectReport = (idx: number) => {
    if (idx === activeReportIdx) return;
    setActiveReportIdx(idx);
    setSeenTabs((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  };

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
              MỚI
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

          {/* 5-Avatar Scholar Trust Stack */}
          <div className="mt-7 flex flex-col sm:flex-row items-center gap-3 text-xs sm:text-[13px] font-sans text-[#556361]">
            <div className="flex items-center -space-x-2" aria-hidden="true">
              {[
                '/avatars/user-default.jpg',
                '/avatars/scholar-2.jpg',
                '/avatars/scholar-3.jpg',
                '/avatars/scholar-4.jpg',
                '/avatars/scholar-testimonial.jpg',
              ].map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover object-top ring-2 ring-[#f7faf9] bg-[#eff5f3]"
                />
              ))}
            </div>
            <span>Tin dùng bởi hơn 1,280+ học viên thạc sĩ &amp; nghiên cứu sinh</span>
          </div>

          {/* INTERACTIVE APP PREVIEW WINDOW (fading gracefully into #f7faf9) */}
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
              aria-label="Mô phỏng giao diện phòng phản biện VivaArena"
              className="relative rounded-[20px] bg-white border border-[rgba(10,20,19,0.12)] shadow-[0_30px_80px_-24px_rgba(10,20,19,0.16),0_0_90px_-10px_rgba(110,231,200,0.22)] overflow-hidden flex flex-col md:flex-row"
            >
              {/* Sidebar */}
              <aside className="w-full md:w-[238px] shrink-0 bg-[#eff5f3] border-b md:border-b-0 md:border-r border-[rgba(10,20,19,0.08)] p-3 sm:p-4 flex flex-col justify-between gap-4">
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
                      <span>Phiên mới</span>
                    </button>
                    <button
                      type="button"
                      onClick={onStartSetup}
                      className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-[13px] font-sans text-[#465754] hover:bg-white/70 hover:text-[#0a1413] transition-colors text-left cursor-pointer border-none bg-transparent"
                    >
                      <Activity className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                      <span>3 Cấp giám khảo</span>
                    </button>
                    <button
                      type="button"
                      onClick={onExploreArchive}
                      className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-[13px] font-sans text-[#465754] hover:bg-white/70 hover:text-[#0a1413] transition-colors text-left cursor-pointer border-none bg-transparent"
                    >
                      <Layers className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                      <span>Chỉ mục Vector RAG</span>
                    </button>
                  </div>

                  {/* Interactive Tasks / Simulation Switcher */}
                  <div className="px-2 pb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[#556361]">
                    KỊCH BẢN MÔ PHỎNG
                  </div>
                  <div
                    role="tablist"
                    aria-label="Chọn kịch bản phản biện mẫu"
                    className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0"
                  >
                    {SIMULATION_REPORTS.map((item, idx) => {
                      const isActive = idx === activeReportIdx;
                      const showUnreadDot = item.isLive && !seenTabs.has(idx);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => handleSelectReport(idx)}
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
                          <span className="flex-1 truncate">{item.tabLabel}</span>
                          {showUnreadDot && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-[#0b6e5e]"
                              aria-label="Mới"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar User Footer */}
                <div className="hidden md:flex items-center gap-2.5 px-2 pt-3 border-t border-[rgba(10,20,19,0.08)]">
                  <img
                    src={user?.avatar || '/avatars/user-default.jpg'}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover object-top bg-white shrink-0"
                  />
                  <span className="font-sans text-xs font-medium text-[#0a1413] truncate">
                    {user?.name || 'Nghiên cứu sinh'}
                  </span>
                </div>
              </aside>

              {/* Main Preview Canvas */}
              <div className="flex-1 min-w-0 p-5 sm:p-7 bg-white flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[rgba(10,20,19,0.08)]">
                  <span className="font-sans font-medium text-sm text-[#0a1413]">
                    {report.tabLabel}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-[11px] font-medium ${
                      report.done
                        ? 'bg-[#eff5f3] text-[#465754] border border-[rgba(10,20,19,0.08)]'
                        : 'bg-[rgba(110,231,200,0.22)] text-[#064037] border border-[rgba(11,110,94,0.2)]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        report.done ? 'bg-[#556361]' : 'bg-[#0b6e5e] anim-live-pulse'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{report.status}</span>
                  </span>
                </div>

                <div className="font-sans font-semibold text-lg sm:text-xl tracking-[-0.02em] text-[#0a1413]">
                  {report.heading}
                </div>

                {/* 4 KPI Tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {report.kpis.map((k, idx) => {
                    const currentVal = animatedKpis[idx] ?? k.target;
                    return (
                      <div
                        key={k.label}
                        className="p-3.5 rounded-xl bg-[#f7faf9] border border-[rgba(10,20,19,0.08)] flex flex-col gap-1"
                      >
                        <span className="font-sans text-xs text-[#556361]">{k.label}</span>
                        <span className="font-sans font-semibold text-xl sm:text-2xl tracking-[-0.025em] text-[#0a1413] tabular-nums">
                          {currentVal.toFixed(k.decimals)}
                          {k.suffix}
                        </span>
                        <span
                          className={`font-mono text-[11px] font-medium ${
                            k.bad ? 'text-[#be123c]' : 'text-[#0b6e5e]'
                          }`}
                        >
                          {k.delta}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Sparkline Chart */}
                <div className="p-4 pb-2 rounded-xl border border-[rgba(10,20,19,0.08)] bg-gradient-to-b from-[rgba(110,231,200,0.09)] to-transparent">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-sans text-[#556361] mb-2">
                    <span>{report.chartLabel}</span>
                    <span className="font-mono font-medium text-[#0a1413]">{report.chartTotal}</span>
                  </div>
                  <svg
                    viewBox="0 0 776 130"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    className={`block w-full h-[108px] sm:h-[124px] mint-spark ${
                      sparkReady ? 'draw' : ''
                    }`}
                  >
                    <defs>
                      <linearGradient id="home-spark-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6ee7c8" stopOpacity="0.34" />
                        <stop offset="100%" stopColor="#6ee7c8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={sparkAreaPath} fill="url(#home-spark-fill)" />
                    <path
                      d={sparkLinePath}
                      fill="none"
                      stroke="#0b6e5e"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Key Finding Strip */}
                <div className="p-3.5 rounded-xl bg-[rgba(110,231,200,0.14)] border border-[rgba(11,110,94,0.22)]">
                  <span className="font-mono font-semibold text-[10px] tracking-[0.08em] uppercase text-[#085448] block mb-1">
                    KEY FINDING · ĐỐI SOÁT RAG
                  </span>
                  <p className="font-sans text-[13px] leading-relaxed text-[#0a1413]">
                    {report.finding}
                  </p>
                </div>
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

      {/* ==================== 2. UNIVERSITY & INSTITUTION STRIP ==================== */}
      <section className="mint-wrap pt-12 pb-20 sm:pb-24 text-center" aria-label="Cơ sở đào tạo tin dùng">
        <p className="mint-eyebrow text-[#556361] mb-6">
          ĐƯỢC TIN DÙNG BỞI HỌC VIÊN &amp; NGHIÊN CỨU SINH TỪ
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-14">
          {[
            { name: 'ĐH Bách Khoa', Icon: Cpu },
            { name: 'KHTN TP.HCM', Icon: FlaskConical },
            { name: 'Kinh Tế Quốc Dân', Icon: Landmark },
            { name: 'ĐH Ngoại Thương', Icon: Building2 },
            { name: 'ĐH Y Dược', Icon: BookOpen },
            { name: 'RMIT Việt Nam', Icon: GraduationCap },
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
              Kết nối trực tiếp báo cáo PDF hoặc DOCX của bạn. Hội đồng AI ghi nhớ cấu trúc luận điểm và xoáy sâu vào phần cốt lõi.
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
                  Tài liệu được phân đoạn ngữ nghĩa tự động. Mọi câu trả lời đều được đối chiếu với bảng số liệu và giả thuyết gốc.
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
                  Tương tác giọng nói song công cùng giám khảo D-ID, đo tốc độ phản xạ WPM và nhận bản gợi ý trả lời tối ưu chuẩn PREP.
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
            {/* BENTO ROW 1: Examiner ID Showcase + Capability Tiles */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Wide Card: Specialist Examiners + Tilted Studio ID Card */}
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

                {/* Tilted Studio ID Badge matching bs-mint-noir-saas-site */}
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

              {/* Capability Tiles Card (4x2 Grid) */}
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

            {/* BENTO ROW 2: Multi-Model Picker + Interactive Approval + Live Sequence */}
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

              {/* Tile 4: Interactive Approval Card */}
              <div className="mint-card mint-card-hover p-6 sm:p-7 flex flex-col justify-between gap-4">
                <div>
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#556361]">
                    KIỂM SOÁT HỌC THUẬT
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
                    {isApproved ? 'Đã khóa 5 lượt phản biện Chương 3' : 'Khóa 5 lượt xoáy Chương 3?'}
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
                    <span>{isApproved ? 'Đã duyệt' : 'Phê duyệt'}</span>
                  </button>
                </div>

                <p className="font-mono text-[11px] text-[#556361]">
                  {isApproved
                    ? 'Sẵn sàng khởi chạy phiên chất vấn theo đề cương đã duyệt.'
                    : 'Giới hạn ngữ cảnh RAG trước khi kích hoạt hội đồng.'}
                </p>
              </div>

              {/* Tile 5: Animated Pipeline Timeline */}
              <div
                ref={pipelineRef}
                className="mint-card mint-card-hover p-6 sm:p-7 flex flex-col justify-between gap-4"
              >
                <div>
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#556361]">
                    QUY TRÌNH TỰ ĐỘNG
                  </span>
                  <h3 className="mt-2 font-sans font-semibold text-xl tracking-[-0.015em] text-[#0a1413]">
                    Mỗi lượt chất vấn chuẩn nhịp.
                  </h3>
                </div>

                <div className="flex flex-col gap-3">
                  {PIPELINE_STEPS.map((step, i) => {
                    const isLit = i < pipelineIdx;
                    const isCurrent = i === pipelineIdx - 1;
                    return (
                      <div key={step.time} className="flex items-center gap-3">
                        <span className="font-mono text-xs text-[#556361] w-11 shrink-0">
                          {step.time}
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
                          {step.label}
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

      {/* ==================== 5. TESTIMONIAL & PROOF STATS ==================== */}
      <section className="border-t border-[rgba(10,20,19,0.08)] py-24 sm:py-32">
        <div className="mint-wrap flex flex-col items-center text-center gap-8">
          <div
            aria-hidden="true"
            className="font-serif text-[88px] sm:text-[112px] leading-[0.5] text-[#0b6e5e] h-9 select-none"
          >
            &ldquo;
          </div>

          <blockquote className="max-w-4xl font-serif text-[28px] sm:text-[38px] lg:text-[44px] leading-[1.24] tracking-[-0.01em] text-[#0a1413]">
            Mình từng lúng túng trước các câu hỏi ngoại lệ của hội đồng. Sau ba buổi luyện Stress-Test với VivaArena, điểm bảo vệ thử tăng từ{' '}
            <span className="mint-serif">74 lên 92/100</span> nhờ trả lời đúng trọng tâm số liệu ngay 15 giây đầu.
          </blockquote>

          <div className="flex items-center gap-3.5 text-left">
            <img
              src="/avatars/scholar-testimonial.jpg"
              alt="Chân dung NCV. Minh Anh"
              className="w-11 h-11 rounded-full object-cover object-top border border-[rgba(10,20,19,0.1)] bg-[#eff5f3]"
            />
            <div>
              <b className="block font-sans font-semibold text-sm text-[#0a1413]">NCV. Minh Anh</b>
              <small className="block font-sans text-xs text-[#556361] mt-0.5">
                Học viên Cao học Khoa học Dữ liệu · ĐH Bách Khoa TP.HCM
              </small>
            </div>
          </div>

          {/* 4 Count-Up Proof Metrics */}
          <div
            ref={proofRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-y-8 pt-8 mt-2 w-full max-w-4xl border-t border-[rgba(10,20,19,0.08)]"
          >
            <div className="px-4 flex flex-col items-center gap-1">
              <b className="font-sans font-semibold text-3xl sm:text-4xl tracking-[-0.03em] text-[#0a1413] tabular-nums">
                {proofValues[0].toFixed(1)}%
              </b>
              <span className="font-sans text-xs sm:text-[13px] text-[#556361]">
                Vững vàng sau 2 phiên
              </span>
            </div>
            <div className="px-4 md:border-l border-[rgba(10,20,19,0.08)] flex flex-col items-center gap-1">
              <b className="font-sans font-semibold text-3xl sm:text-4xl tracking-[-0.03em] text-[#0a1413] tabular-nums">
                {proofValues[1].toLocaleString('en-US')}+
              </b>
              <span className="font-sans text-xs sm:text-[13px] text-[#556361]">
                Lượt chất vấn CoT
              </span>
            </div>
            <div className="px-4 md:border-l border-[rgba(10,20,19,0.08)] flex flex-col items-center gap-1">
              <b className="font-sans font-semibold text-3xl sm:text-4xl tracking-[-0.03em] text-[#0a1413] tabular-nums">
                −{proofValues[2]}%
              </b>
              <span className="font-sans text-xs sm:text-[13px] text-[#556361]">
                Lỗ hổng lập luận
              </span>
            </div>
            <div className="px-4 md:border-l border-[rgba(10,20,19,0.08)] flex flex-col items-center gap-1">
              <b className="font-sans font-semibold text-3xl sm:text-4xl tracking-[-0.03em] text-[#0a1413] tabular-nums">
                {proofValues[3]} Trục
              </b>
              <span className="font-sans text-xs sm:text-[13px] text-[#556361]">
                Rubric chuẩn hội đồng
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

            <p className="relative mint-eyebrow">BẮT ĐẦU TRONG 30 GIÂY</p>
            <h2 className="relative mint-h2 text-[36px] sm:text-[54px] lg:text-[66px] leading-[1.08] tracking-[-0.035em]">
              Giảm áp lực. Làm chủ{' '}
              <span className="mint-serif">hội đồng</span>.
            </h2>
            <p className="relative font-sans text-sm sm:text-base text-[#465754] max-w-md">
              Tải lên báo cáo đề án và bước vào lượt hỏi đáp thực chiến cùng Hội đồng AI ngay hôm nay.
            </p>

            <div className="relative flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onStartSetup}
                className="btn-mint-primary h-12 px-7 text-sm sm:text-[15px] cursor-pointer"
              >
                <Sparkles className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                <span>Tạo phiên diễn tập miễn phí</span>
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

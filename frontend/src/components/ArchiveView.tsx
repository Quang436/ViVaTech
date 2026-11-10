import React from 'react';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BrainCircuit,
  CheckSquare,
  Download,
  History,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import type { DebateSession, Scorecard } from '../types';

interface ArchiveViewProps {
  sessions: DebateSession[];
  scorecards: Scorecard[];
  onNewSession: () => void;
  onViewScorecard: (session: DebateSession) => void;
  onResumeSession: (session: DebateSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenDocuments?: () => void;
}

const getPersonaBadge = (persona: string) => {
  if (persona === 'feynman') {
    return {
      label: 'Cấp độ 1 · Feynman Mode',
      speaker: 'GS. Lê Minh Triết',
      tagVariant: 'mint' as const,
    };
  }
  if (persona === 'strict_council') {
    return {
      label: 'Cấp độ 3 · Stress-Test',
      speaker: 'GS. Viện sĩ Hoàng Vĩnh',
      tagVariant: 'red' as const,
    };
  }
  return {
    label: 'Cấp độ 2 · Học thuật Chuẩn',
    speaker: 'PGS. TS. Trần Thu Hà',
    tagVariant: 'sky' as const,
  };
};

const parseTimestamp = (iso: string): number => {
  const normalized = iso.endsWith('Z') ? iso : `${iso}Z`;
  const ts = new Date(normalized).getTime();
  return Number.isNaN(ts) ? 0 : ts;
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Map score [0..100] to SVG Y coordinates [190..18]
const scoreToY = (score: number): number => {
  const clamped = Math.max(0, Math.min(100, score));
  const y = 175 - ((clamped - 40) / 60) * 150;
  return Math.max(18, Math.min(190, Math.round(y)));
};

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  sessions,
  scorecards,
  onNewSession,
  onViewScorecard,
  onResumeSession,
  onDeleteSession,
  onOpenDocuments,
}) => {
  const scorecardMap = new Map<string, Scorecard>();
  scorecards.forEach((sc) => scorecardMap.set(sc.session_id, sc));

  // Real KPI calculations
  const totalSessions = sessions.length;
  const completedCount = sessions.filter((s) => s.status === 'completed').length;

  const totalDurationSec = sessions.reduce((acc, s) => {
    const turnSec = (s.turns || []).reduce((tAcc, t) => tAcc + (t.duration_seconds || 0), 0);
    return acc + turnSec;
  }, 0);
  const totalMinutes = totalDurationSec > 0 ? Math.max(1, Math.round(totalDurationSec / 60)) : 0;

  const avgScore =
    scorecards.length > 0
      ? scorecards.reduce((acc, sc) => acc + sc.overall_score, 0) / scorecards.length
      : 0;

  const avgLogic =
    scorecards.length > 0
      ? scorecards.reduce((acc, sc) => acc + sc.logic_accuracy_score, 0) / scorecards.length
      : 0;

  const totalFlaws = sessions.reduce((acc, s) => {
    return (
      acc +
      (s.turns || []).reduce((fAcc, t) => fAcc + (t.logic_flaws ? t.logic_flaws.length : 0), 0)
    );
  }, 0);
  const flawsPerSession = totalSessions > 0 ? (totalFlaws / totalSessions).toFixed(1) : '0.0';

  // Chronological dataset (oldest -> newest, up to 8 scored points) for Cognitive Growth Curve
  const scoredOrdered = [...scorecards]
    .sort((a, b) => parseTimestamp(a.created_at) - parseTimestamp(b.created_at))
    .slice(-8);

  const chartNodes = scoredOrdered.map((sc, index) => {
    const x =
      scoredOrdered.length === 1
        ? 470
        : Math.round(130 + (index / (scoredOrdered.length - 1)) * 660);
    return {
      x,
      overallY: scoreToY(sc.overall_score),
      stressY: scoreToY(sc.composure_score),
      logicY: scoreToY(sc.logic_accuracy_score),
      overall: sc.overall_score,
      label: `P${index + 1}`,
    };
  });

  const overallLinePoints = chartNodes.map((p) => `${p.x},${p.overallY}`).join(' ');
  const stressLinePoints = chartNodes.map((p) => `${p.x},${p.stressY}`).join(' ');
  const logicLinePoints = chartNodes.map((p) => `${p.x},${p.logicY}`).join(' ');
  const overallAreaPoints =
    chartNodes.length >= 2
      ? `${chartNodes[0].x},185 ${overallLinePoints} ${chartNodes[chartNodes.length - 1].x},185`
      : '';
  const latestNode = chartNodes[chartNodes.length - 1];

  // Dynamic Improvement Recommendation from lowest average scorecard axis
  const avgArgumentation =
    scorecards.length > 0
      ? scorecards.reduce((acc, sc) => acc + sc.argumentation_score, 0) / scorecards.length
      : 0;
  const avgComposure =
    scorecards.length > 0
      ? scorecards.reduce((acc, sc) => acc + sc.composure_score, 0) / scorecards.length
      : 0;

  const weakestTip =
    scorecards.length === 0
      ? 'Chạy phiên bảo vệ đầu tiên với chế độ Học thuật Chuẩn để AI xác định điểm yếu lập luận thực tế.'
      : avgLogic <= avgArgumentation && avgLogic <= avgComposure
        ? `Độ chính xác Logic trung bình hiện đạt ${avgLogic.toFixed(0)}%. Nên ôn kỹ số liệu thực nghiệm và cấu trúc chương mục trong tài liệu RAG.`
        : avgComposure <= avgArgumentation
          ? `Bản lĩnh phản biện dưới áp lực đạt ${avgComposure.toFixed(0)}%. Hãy luyện chế độ Cấp 3 Stress-Test trong thời gian ngắn.`
          : `Kỹ năng phản bác đạt ${avgArgumentation.toFixed(0)}%. Tập trung sử dụng cấu trúc PREP (Point-Reason-Example-Point) để tăng sức thuyết phục.`;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative z-10 pt-8 sm:pt-12 pb-20 outline-none"
    >
      <div className="mint-wrap space-y-8">
        {/* Hero / Portfolio Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-[rgba(10,20,19,0.08)]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[rgba(11,110,94,0.22)] text-[#085448] mb-3.5 w-fit">
              <Award className="w-3.5 h-3.5 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
              <span className="mint-eyebrow">Hồ sơ minh chứng &amp; Tiến độ học thuật</span>
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-[-0.032em] leading-[1.08] text-[#0a1413]">
              Kho đề án &amp;{' '}
              <span className="mint-serif">hồ sơ năng lực</span>.
            </h1>
            <p className="font-sans text-sm sm:text-[15px] text-[#465754] mt-2.5 leading-relaxed">
              Dữ liệu thống kê thực tế từ các phiên chất vấn của bạn được lưu trữ trực tiếp trong cơ sở dữ liệu hệ thống.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-shrink-0 no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-mint-ghost h-10 px-4 text-xs sm:text-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
              <span>Xuất E-Portfolio</span>
            </button>
            <button
              type="button"
              onClick={onNewSession}
              className="btn-mint-primary h-10 px-5 text-xs sm:text-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#6ee7c8]" strokeWidth={2} aria-hidden="true" />
              <span>Tạo Phiên Mới</span>
            </button>
          </div>
        </section>

        {/* 4 Focused KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Thống kê tổng hợp">
          {/* KPI 1 */}
          <div className="mint-card mint-card-hover p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#556361] mb-3">
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em]">
                Số phiên bảo vệ
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#eff5f3] border border-[rgba(10,20,19,0.08)] text-[#0b6e5e] flex items-center justify-center">
                <CheckSquare className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </div>
            </div>
            <div>
              <div className="font-sans text-3xl sm:text-[34px] font-semibold text-[#0a1413] tracking-[-0.03em]">
                {totalSessions}
              </div>
              <div className="font-sans text-xs text-[#465754] mt-1.5">
                Đã hoàn tất:{' '}
                <span className="font-semibold text-[#0a1413]">{completedCount} phiên</span> ({totalMinutes} phút)
              </div>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="mint-card mint-card-hover p-5 border-[rgba(11,110,94,0.28)] ring-1 ring-[rgba(110,231,200,0.35)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#556361] mb-3">
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em]">
                Điểm trung bình
              </span>
              <div className="w-8 h-8 rounded-xl bg-[rgba(110,231,200,0.24)] border border-[rgba(11,110,94,0.2)] text-[#085448] flex items-center justify-center">
                <Sparkles className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </div>
            </div>
            <div>
              <div className="font-sans text-3xl sm:text-[34px] font-semibold text-[#0b6e5e] tracking-[-0.03em]">
                {scorecards.length > 0 ? avgScore.toFixed(1) : '--'}
                <span className="font-mono text-sm font-normal text-[#556361]">/100</span>
              </div>
              <div className="font-sans text-xs text-[#0b6e5e] font-medium mt-1.5 inline-flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                Từ {scorecards.length} bảng điểm đã chấm
              </div>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="mint-card mint-card-hover p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#556361] mb-3">
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em]">
                Độ chính xác Logic
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#e0f2fe] border border-[rgba(3,105,161,0.2)] text-[#0369a1] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </div>
            </div>
            <div>
              <div className="font-sans text-3xl sm:text-[34px] font-semibold text-[#0369a1] tracking-[-0.03em]">
                {scorecards.length > 0 ? `${avgLogic.toFixed(0)}%` : '--'}
              </div>
              <div className="font-sans text-xs text-[#465754] font-medium mt-1.5">
                Đối soát Ground Truth RAG
              </div>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="mint-card mint-card-hover p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#556361] mb-3">
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em]">
                Mật độ lỗi lập luận
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#fef3c7] border border-[rgba(180,83,9,0.2)] text-[#b45309] flex items-center justify-center">
                <BrainCircuit className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </div>
            </div>
            <div>
              <div className="font-sans text-3xl sm:text-[34px] font-semibold text-[#0a1413] tracking-[-0.03em]">
                {flawsPerSession}
              </div>
              <div className="font-sans text-xs text-[#465754] mt-1.5">
                Trung bình <span className="font-semibold text-[#0a1413]">lỗi / phiên</span>
              </div>
            </div>
          </div>
        </section>

        {/* COGNITIVE GROWTH CURVE VECTOR GRAPH (Real Scorecards Data) */}
        <section className="mint-card mint-card-hover p-6 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[rgba(10,20,19,0.08)]">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
                <h2 className="mint-h2 text-xl sm:text-2xl">
                  Đường cong{' '}
                  <span className="mint-serif">nhận thức</span> (Cognitive Growth)
                </h2>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#465754] mt-1">
                Theo dõi biến thiên thực tế về điểm thẩm định, bản lĩnh chịu áp lực và độ vững phương pháp qua các phiên đã chấm.
              </p>
            </div>

            {/* Graph Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-sans font-medium text-[#465754]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0b6e5e]" aria-hidden="true" />
                <span>Điểm Thẩm định</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" aria-hidden="true" />
                <span>Bản lĩnh Stress-Test</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0369a1]" aria-hidden="true" />
                <span>Độ chính xác Logic</span>
              </div>
            </div>
          </div>

          <figure className="w-full mt-4 pt-2 m-0 relative">
            <svg
              role="img"
              aria-labelledby="growth-curve-caption"
              className="w-full h-auto max-h-64 font-mono text-xs"
              viewBox="0 0 900 230"
            >
              <defs>
                <linearGradient id="scoreAreaLight" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6ee7c8" stopOpacity="0.34" />
                  <stop offset="100%" stopColor="#6ee7c8" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grid (Mint Hairline Neutrals) */}
              <line stroke="#dce7e4" strokeWidth="1" x1="55" x2="865" y1="25" y2="25" />
              <text fill="#556361" fontSize="10" x="25" y="29">
                100
              </text>
              <line stroke="#dce7e4" strokeWidth="1" x1="55" x2="865" y1="75" y2="75" />
              <text fill="#556361" fontSize="10" x="25" y="79">
                80
              </text>
              <line stroke="#dce7e4" strokeWidth="1" x1="55" x2="865" y1="125" y2="125" />
              <text fill="#556361" fontSize="10" x="25" y="129">
                60
              </text>
              <line stroke="#dce7e4" strokeWidth="1" x1="55" x2="865" y1="175" y2="175" />
              <text fill="#556361" fontSize="10" x="25" y="179">
                40
              </text>

              {/* Vertical axis milestone markers & labels */}
              {chartNodes.map((pt) => (
                <g key={`axis-${pt.label}-${pt.x}`}>
                  <line
                    stroke="#cddbd7"
                    strokeDasharray="4 4"
                    strokeWidth="1.2"
                    x1={pt.x}
                    x2={pt.x}
                    y1="20"
                    y2="185"
                  />
                  <text fill="#0a1413" fontWeight="600" textAnchor="middle" x={pt.x} y="208">
                    {pt.label}
                  </text>
                </g>
              ))}

              {/* Plotted Curves when >= 2 real scorecards exist */}
              {chartNodes.length >= 2 && (
                <>
                  <polygon points={overallAreaPoints} fill="url(#scoreAreaLight)" />
                  <polyline
                    points={stressLinePoints}
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2.2"
                  />
                  <polyline
                    points={logicLinePoints}
                    fill="none"
                    stroke="#0369a1"
                    strokeDasharray="5 4"
                    strokeWidth="2.2"
                  />
                  <polyline
                    points={overallLinePoints}
                    fill="none"
                    stroke="#0b6e5e"
                    strokeWidth="3"
                  />
                </>
              )}

              {/* Plotted Nodes & Latest Floating Score Badge */}
              {chartNodes.map((pt, idx) => {
                const isLatest = idx === chartNodes.length - 1;
                return (
                  <circle
                    key={`node-${pt.label}`}
                    className={isLatest ? 'pulse-node' : ''}
                    cx={pt.x}
                    cy={pt.overallY}
                    fill={isLatest ? '#085448' : '#ffffff'}
                    r={isLatest ? 5.5 : 4.5}
                    stroke={isLatest ? '#6ee7c8' : '#0b6e5e'}
                    strokeWidth={isLatest ? 2.5 : 2.5}
                  />
                );
              })}

              {latestNode && (
                <g>
                  <rect
                    fill="#0a1413"
                    height="22"
                    rx="11"
                    width="90"
                    x={Math.min(780, Math.max(60, latestNode.x - 45))}
                    y={Math.max(2, latestNode.overallY - 30)}
                  />
                  <text
                    fill="#6ee7c8"
                    fontSize="10.5"
                    fontWeight="600"
                    textAnchor="middle"
                    x={Math.min(825, Math.max(105, latestNode.x))}
                    y={Math.max(17, latestNode.overallY - 15)}
                  >
                    {latestNode.overall.toFixed(1)} ĐIỂM
                  </text>
                </g>
              )}
            </svg>

            {chartNodes.length < 2 && (
              <div className="mt-3 p-3.5 rounded-2xl bg-[#eff5f3] border border-[rgba(10,20,19,0.08)] text-xs font-sans text-[#465754] flex items-center justify-between gap-3 flex-wrap">
                <span>
                  {chartNodes.length === 0
                    ? 'Chưa có bảng điểm nào trong lịch sử — hoàn thành một phiên tranh biện để hệ thống vẽ đường cong tiến bộ.'
                    : `Đã ghi nhận 1 phiên chấm điểm (${chartNodes[0].overall.toFixed(1)}/100). Chấm thêm ít nhất 1 phiên nữa để vẽ đường xu hướng tăng trưởng.`}
                </span>
                <button
                  type="button"
                  onClick={onNewSession}
                  className="inline-flex items-center gap-1 text-[#0b6e5e] font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  <span>Khởi tạo phiên ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            )}

            <figcaption id="growth-curve-caption" className="visually-hidden">
              {scorecards.length > 0
                ? `Biểu đồ đường cong nhận thức hiển thị ${chartNodes.length} phiên đã chấm với điểm trung bình ${avgScore.toFixed(1)} trên 100.`
                : 'Chưa có dữ liệu điểm số để hiển thị biểu đồ đường cong nhận thức.'}
            </figcaption>
          </figure>
        </section>

        {/* 2-COLUMN BOTTOM: SESSIONS LIST (8 COLS) & RECOMMENDATIONS SIDEBAR (4 COLS) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Sessions List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between gap-3 pb-1">
              <div>
                <h2 className="font-sans text-xl sm:text-2xl font-semibold text-[#0a1413]">
                  Danh sách Phiên Tranh Biện ({sessions.length})
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#465754]">
                  Lịch sử đánh giá thực tế từ cơ sở dữ liệu hệ thống. Bạn có thể tiếp tục hoặc xem bảng điểm từng phiên.
                </p>
              </div>
              {sessions.length > 0 && (
                <span className="mint-tag mint shrink-0">{completedCount} hoàn thành</span>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="mint-card border-dashed p-12 text-center flex flex-col items-center gap-3">
                <History className="w-9 h-9 text-[#556361]/60" strokeWidth={1.6} aria-hidden="true" />
                <h3 className="font-sans text-lg font-semibold text-[#0a1413]">
                  Chưa có phiên tranh biện nào trong lịch sử
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#465754] max-w-md">
                  Hãy khởi tạo phiên bảo vệ đầu tiên để hệ thống ghi nhận lịch sử hỏi đáp và chấm bảng điểm chi tiết.
                </p>
                <button
                  type="button"
                  onClick={onNewSession}
                  className="btn-mint-primary mt-2 h-10 px-5 text-xs cursor-pointer"
                >
                  Tạo Phiên Bảo Vệ Ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {sessions.map((sess) => {
                  const pBadge = getPersonaBadge(sess.persona);
                  const sc = scorecardMap.get(sess.id);
                  const answeredTurns = (sess.turns || []).filter((t) => !!t.student_response).length;
                  const isDone = sess.status === 'completed';

                  return (
                    <article key={sess.id} className="mint-card mint-card-hover p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`mint-tag ${pBadge.tagVariant}`}>{pBadge.label}</span>
                          <span className="font-mono text-[11px] text-[#556361]">
                            {formatDateTime(sess.created_at)}
                          </span>
                          <span className="font-mono text-[11px] text-[#556361]">
                            #{sess.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <span className={`mint-tag ${isDone ? 'mint' : 'amber'} w-fit`}>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDone ? 'bg-[#0b6e5e]' : 'bg-[#b45309]'
                            }`}
                            aria-hidden="true"
                          />
                          {isDone
                            ? 'ĐÃ HOÀN THÀNH'
                            : `ĐANG DIỄN RA (Lượt ${sess.current_turn}/${sess.max_turns})`}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4 my-2">
                        <div className="min-w-0">
                          <h3 className="font-sans text-lg font-semibold text-[#0a1413]">
                            {sess.title}
                          </h3>
                          {sess.document_name && (
                            <p className="font-sans text-xs text-[#0b6e5e] font-medium mt-0.5">
                              Tài liệu gốc: {sess.document_name}
                            </p>
                          )}
                          {sess.turns && sess.turns.length > 0 && (
                            <p className="font-sans text-xs text-[#465754] mt-1 line-clamp-2 italic">
                              Câu hỏi gần nhất: “{sess.turns[sess.turns.length - 1].ai_question}”
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {sc ? (
                            <>
                              <div className="font-sans text-3xl font-semibold text-[#0b6e5e]">
                                {sc.overall_score.toFixed(1)}
                                <span className="font-mono text-xs font-normal text-[#556361]">/100</span>
                              </div>
                              <span className="font-mono text-[11px] text-[#556361]">
                                {pBadge.speaker}
                              </span>
                            </>
                          ) : (
                            <span className="font-mono text-xs text-[#556361] block">
                              {pBadge.speaker}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 mt-3.5 border-t border-[rgba(10,20,19,0.08)] text-xs font-sans text-[#465754]">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="inline-flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-[#556361]" strokeWidth={1.9} aria-hidden="true" />
                            Đã trả lời {answeredTurns}/{sess.max_turns} lượt
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            aria-label={`Xóa phiên ${sess.title}`}
                            onClick={() => onDeleteSession(sess.id)}
                            className="w-8 h-8 rounded-full border border-[rgba(10,20,19,0.12)] text-[#465754] hover:text-[#be123c] hover:bg-[#ffe4e6] hover:border-[#be123c]/30 transition-colors cursor-pointer bg-[#eff5f3] flex items-center justify-center"
                            title="Xóa phiên này"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.9} aria-hidden="true" />
                          </button>
                          {(sc || answeredTurns > 0) && (
                            <button
                              type="button"
                              onClick={() => onViewScorecard(sess)}
                              className="btn-mint-ghost h-8 px-3.5 text-xs cursor-pointer"
                            >
                              {sc ? 'Xem Bảng Điểm' : 'Chấm & Xem Điểm'}
                            </button>
                          )}
                          {!isDone && (
                            <button
                              type="button"
                              onClick={() => onResumeSession(sess)}
                              className="btn-mint-primary h-8 px-3.5 text-xs cursor-pointer"
                            >
                              {answeredTurns > 0 ? 'Tiếp tục chất vấn' : 'Bắt đầu trả lời'}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Action Recommendations */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="mint-card mint-card-hover p-6">
              <div className="flex items-center gap-2.5 mb-1.5">
                <Sparkles className="w-4 h-4 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
                <h2 className="font-sans text-lg font-semibold text-[#0a1413]">Đề Xuất Cải Thiện</h2>
              </div>
              <p className="font-sans text-xs text-[#465754] mb-5">
                Gợi ý hành động rèn phản xạ dựa trên thống kê năng lực thực tế của bạn.
              </p>

              <div className="space-y-3.5">
                <div className="p-4 rounded-2xl border border-[rgba(10,20,19,0.08)] bg-[#f7faf9] hover:bg-[#eff5f3] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="mint-tag amber">ƯU TIÊN CAO</span>
                    <span className="font-mono text-[11px] text-[#556361]">Chẩn đoán AI</span>
                  </div>
                  <h3 className="font-sans text-xs font-semibold text-[#0a1413]">
                    Củng cố trục yếu &amp; Số liệu Ground Truth
                  </h3>
                  <p className="font-sans text-xs text-[#465754] mt-1 leading-snug">
                    {weakestTip}
                  </p>
                  {onOpenDocuments && (
                    <button
                      type="button"
                      onClick={onOpenDocuments}
                      className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-[#0b6e5e] hover:underline mt-3 bg-transparent border-none p-0 cursor-pointer"
                    >
                      <span>Kiểm tra lại kho tài liệu</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-2xl border border-[rgba(10,20,19,0.08)] bg-[#f7faf9] hover:bg-[#eff5f3] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="mint-tag sky">PHẢN XẠ NHANH</span>
                    <span className="font-mono text-[11px] text-[#556361]">3–5 lượt</span>
                  </div>
                  <h3 className="font-sans text-xs font-semibold text-[#0a1413]">
                    Luyện đối đáp áp lực với Hội đồng mới
                  </h3>
                  <p className="font-sans text-xs text-[#465754] mt-1 leading-snug">
                    Thử sức cấu hình 3 lượt nhanh hoặc bật Cấp độ 3 Stress-Test để nâng khả năng chịu áp lực.
                  </p>
                  <button
                    type="button"
                    onClick={onNewSession}
                    className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-[#0b6e5e] hover:underline mt-3 bg-transparent border-none p-0 cursor-pointer"
                  >
                    <span>Khởi tạo phiên luyện tập</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[rgba(10,20,19,0.08)] flex items-center gap-2 text-xs font-sans text-[#465754]">
                <BadgeCheck className="w-4 h-4 text-[#0b6e5e] shrink-0" strokeWidth={2} aria-hidden="true" />
                <span>Dữ liệu đồng bộ tự động từ cơ sở dữ liệu phiên bảo vệ.</span>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
};

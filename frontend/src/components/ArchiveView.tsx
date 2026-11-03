import React from 'react';
import type { DebateSession, Scorecard } from '../types';

interface ArchiveViewProps {
  sessions: DebateSession[];
  scorecards: Scorecard[];
  onNewSession: () => void;
  onViewScorecard: (session: DebateSession) => void;
  onResumeSession: (session: DebateSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

const getPersonaBadge = (persona: string) => {
  if (persona === 'feynman') {
    return {
      label: 'Cấp độ 1 • Feynman Mode',
      speaker: 'GS. Lê Minh Triết',
      cls: 'bg-primary-fixed text-on-primary-fixed-variant',
    };
  }
  if (persona === 'strict_council') {
    return {
      label: 'Cấp độ 3 • Stress-Test',
      speaker: 'GS. Viện sĩ Hoàng Vĩnh',
      cls: 'bg-error-container text-on-error-container',
    };
  }
  return {
    label: 'Cấp độ 2 • Academic Reviewer',
    speaker: 'PGS. TS. Trần Thu Hà',
    cls: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  };
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

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  sessions,
  scorecards,
  onNewSession,
  onViewScorecard,
  onResumeSession,
  onDeleteSession,
}) => {
  // Map scorecards by session_id
  const scorecardMap = new Map<string, Scorecard>();
  scorecards.forEach((sc) => scorecardMap.set(sc.session_id, sc));

  // Real KPI calculations
  const totalSessions = sessions.length;
  const completedCount = sessions.filter((s) => s.status === 'completed').length;

  const totalDurationSec = sessions.reduce((acc, s) => {
    const turnSec = (s.turns || []).reduce((tAcc, t) => tAcc + (t.duration_seconds || 0), 0);
    return acc + turnSec;
  }, 0);
  const totalMinutes = Math.max(1, Math.round(totalDurationSec / 60));

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

  return (
    <main className="relative z-10 pt-24 pb-16 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Hero / Portfolio Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-surface-container-high/70">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/60 text-on-primary-fixed-variant font-label text-xs font-semibold tracking-wide mb-3 border border-primary/20">
            <span className="material-symbols-outlined text-sm text-primary">
              workspace_premium
            </span>
            <span>HỒ SƠ MINH CHỨNG & LỊCH SỬ BẢO VỆ THỰC TẾ</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-on-surface leading-tight">
            Hồ sơ Năng lực & Lịch sử Đề án
          </h1>
          <p className="font-body text-sm sm:text-base text-on-surface-variant mt-2 leading-relaxed">
            Dữ liệu thống kê thực tế từ các phiên chất vấn của bạn được lưu trữ trực tiếp trong cơ sở dữ liệu hệ thống.
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

      {/* 4 Focused KPI Cards (Dữ liệu thật 100%) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-5 border border-surface-container-high/80 hover-lift flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-3">
            <span className="font-label text-xs font-semibold uppercase tracking-wider">
              Số phiên bảo vệ
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[19px]">fact_check</span>
            </div>
          </div>
          <div>
            <div className="font-headline text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
              {totalSessions}
            </div>
            <div className="font-label text-xs text-on-surface-variant mt-1.5">
              Đã hoàn tất: <span className="font-semibold text-on-surface">{completedCount} phiên</span> ({totalMinutes} phút)
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-5 border border-primary/25 ring-1 ring-primary/10 hover-lift flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-3">
            <span className="font-label text-xs font-semibold uppercase tracking-wider">
              Điểm trung bình
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed/60 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[19px]">award_star</span>
            </div>
          </div>
          <div>
            <div className="font-headline text-3xl sm:text-4xl font-bold text-primary tracking-tight">
              {scorecards.length > 0 ? avgScore.toFixed(1) : '--'}
              <span className="font-body text-sm font-normal text-on-surface-variant">/100</span>
            </div>
            <div className="font-label text-xs text-primary font-semibold mt-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">insights</span>
              Từ {scorecards.length} bảng điểm đã chấm
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-5 border border-surface-container-high/80 hover-lift flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-3">
            <span className="font-label text-xs font-semibold uppercase tracking-wider">
              Độ chính xác Logic
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed/50 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[19px]">verified_user</span>
            </div>
          </div>
          <div>
            <div className="font-headline text-3xl sm:text-4xl font-bold text-secondary tracking-tight">
              {scorecards.length > 0 ? `${avgLogic.toFixed(0)}%` : '--'}
            </div>
            <div className="font-label text-xs text-on-surface-variant font-medium mt-1.5">
              Đối soát Ground Truth RAG
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-5 border border-surface-container-high/80 hover-lift flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-3">
            <span className="font-label text-xs font-semibold uppercase tracking-wider">
              Mật độ lỗi lập luận
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[19px]">psychology</span>
            </div>
          </div>
          <div>
            <div className="font-headline text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
              {flawsPerSession}
            </div>
            <div className="font-label text-xs text-on-surface-variant mt-1.5">
              Trung bình <span className="font-semibold text-on-surface">lỗi / phiên</span>
            </div>
          </div>
        </div>
      </section>

      {/* Danh sách các phiên thật từ Database */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h2 className="font-headline text-2xl font-semibold text-on-surface">
              Danh sách Phiên Tranh Biện Trong Cơ Sở Dữ Liệu ({sessions.length})
            </h2>
            <p className="font-body text-xs text-on-surface-variant">
              Bạn có thể tiếp tục phiên đang diễn ra, hoặc bấm "Chấm & Xem Bảng Điểm" cho bất kỳ phiên nào.
            </p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-surface-container-lowest/90 rounded-2xl border border-dashed border-surface-container-high p-12 text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/60">
              history_edu
            </span>
            <h3 className="font-headline text-lg font-semibold text-on-surface">
              Chưa có phiên tranh biện nào trong lịch sử
            </h3>
            <p className="font-body text-xs text-on-surface-variant max-w-md">
              Hãy khởi tạo phiên bảo vệ đầu tiên để hệ thống ghi nhận lịch sử hỏi đáp và chấm bảng điểm chi tiết.
            </p>
            <button
              onClick={onNewSession}
              className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-white font-label text-xs font-bold hover:bg-primary-container transition-all cursor-pointer border-none"
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
                <div
                  key={sess.id}
                  className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-5 border border-surface-container-high/80 hover-lift shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-label font-bold text-xs ${pBadge.cls}`}
                      >
                        {pBadge.label}
                      </span>
                      <span className="font-label text-xs text-on-surface-variant">
                        {formatDateTime(sess.created_at)}
                      </span>
                      <span className="font-mono text-[11px] text-on-surface-variant/75">
                        #{sess.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-label font-bold px-3 py-0.5 rounded-full w-fit ${
                        isDone
                          ? 'bg-primary-fixed text-on-primary-fixed-variant'
                          : 'bg-amber-100/80 text-amber-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isDone ? 'bg-primary' : 'bg-amber-600'
                        }`}
                      ></span>
                      {isDone ? 'ĐÃ HOÀN THÀNH' : `ĐANG DIỄN RA (Lượt ${sess.current_turn}/${sess.max_turns})`}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 my-2">
                    <div>
                      <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface">
                        {sess.title}
                      </h3>
                      {sess.document_name && (
                        <p className="font-label text-xs text-primary font-semibold mt-0.5">
                          Tài liệu gốc: {sess.document_name}
                        </p>
                      )}
                      {sess.turns && sess.turns.length > 0 && (
                        <p className="font-body text-xs text-on-surface-variant mt-1 line-clamp-2 italic">
                          Câu hỏi gần nhất: “{sess.turns[sess.turns.length - 1].ai_question}”
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {sc ? (
                        <>
                          <div className="font-headline text-3xl font-bold text-primary">
                            {sc.overall_score.toFixed(1)}
                            <span className="text-xs font-normal text-on-surface-variant">/100</span>
                          </div>
                          <span className="font-label text-[11px] text-on-surface-variant">
                            {pBadge.speaker}
                          </span>
                        </>
                      ) : (
                        <span className="font-label text-xs text-on-surface-variant block">
                          {pBadge.speaker}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-surface-container-high/60 text-xs font-label text-on-surface-variant">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-outline">
                          forum
                        </span>{' '}
                        Đã trả lời {answeredTurns}/{sess.max_turns} lượt
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDeleteSession(sess.id)}
                        className="p-1.5 rounded-xl border border-surface-container-high text-on-surface-variant hover:text-error hover:border-error/40 transition-colors cursor-pointer bg-surface-container-lowest"
                        title="Xóa phiên này"
                      >
                        <span className="material-symbols-outlined text-[17px] block">delete</span>
                      </button>
                      <button
                        onClick={() => onViewScorecard(sess)}
                        className="px-3.5 py-1.5 rounded-xl border border-surface-container-high text-on-surface font-semibold hover:bg-surface-container-low transition-colors cursor-pointer bg-surface-container-lowest"
                      >
                        {sc ? 'Xem Bảng Điểm' : 'Chấm & Xem Điểm'}
                      </button>
                      {!isDone && (
                        <button
                          onClick={() => onResumeSession(sess)}
                          className="px-3.5 py-1.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-colors cursor-pointer border-none"
                        >
                          Tiếp tục chất vấn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

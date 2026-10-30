import React from 'react';
import type { Scorecard, CouncilPersona } from '../types';
import { Award, CheckCircle, AlertTriangle, Lightbulb, RotateCcw, ShieldCheck } from 'lucide-react';

interface ScorecardModalProps {
  scorecard: Scorecard;
  persona: CouncilPersona;
  topicTitle: string;
  onRestart: () => void;
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({
  scorecard,
  topicTitle,
  onRestart,
}) => {
  const getGrade = (score: number) => {
    if (score >= 90) return { label: 'Xuất Sắc (A+)', color: '#10b981' };
    if (score >= 80) return { label: 'Giỏi (A)', color: '#6366f1' };
    if (score >= 70) return { label: 'Khá (B)', color: '#38bdf8' };
    if (score >= 50) return { label: 'Trung Bình (C)', color: '#f59e0b' };
    return { label: 'Cần Rèn Luyện Thêm (D)', color: '#f43f5e' };
  };

  const grade = getGrade(scorecard.overall_score);

  const metrics = [
    { label: 'Độ chính xác Kiến thức & Logic', score: scorecard.logic_accuracy_score, color: '#6366f1' },
    { label: 'Kỹ năng Lập luận & Phản biện', score: scorecard.argumentation_score, color: '#06b6d4' },
    { label: 'Bản lĩnh & Khả năng Chịu áp lực', score: scorecard.composure_score, color: '#10b981' },
    { label: 'Độ Mạch lạc & Súc tích', score: scorecard.clarity_score, color: '#f59e0b' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(30, 41, 65, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Award size={28} color="#eab308" />
          <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px', color: '#eab308', textTransform: 'uppercase' }}>
            Bảng Đánh Giá Tổng Kết Phiên Bảo Vệ Đồ Án
          </span>
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
          {topicTitle}
        </h2>

        {/* Big Score circle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
          <div
            style={{
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(15, 23, 42, 0.9) 70%)',
              border: `3px solid ${grade.color}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 30px ${grade.color}44`,
            }}
          >
            <span style={{ fontSize: '38px', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
              {scorecard.overall_score.toFixed(1)}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>/ 100 điểm</span>
          </div>
        </div>

        <div style={{ display: 'inline-block' }}>
          <span
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              background: `${grade.color}22`,
              color: grade.color,
              border: `1px solid ${grade.color}55`,
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            Đánh giá: {grade.label}
          </span>
        </div>

        <p style={{ maxWidth: '700px', margin: '20px auto 0', fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>
          "{scorecard.overall_verdict}"
        </p>
      </div>

      {/* 4 Quantitative Metrics */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
          Chi tiết Điểm số 4 Trục Năng Lực
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {metrics.map((m, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{m.label}</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: m.color }}>{m.score.toFixed(1)}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${m.score}%`, height: '100%', background: m.color, borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Strengths */}
        <div className="glass-panel" style={{ padding: '24px', borderTop: '3px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CheckCircle size={20} color="#10b981" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>Điểm mạnh nổi bật</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scorecard.strengths.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses / Fallacies */}
        <div className="glass-panel" style={{ padding: '24px', borderTop: '3px solid #f43f5e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={20} color="#f43f5e" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>Lỗ hổng Logic & Cần cải thiện</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scorecard.weaknesses.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                <span style={{ color: '#f43f5e', fontWeight: 700 }}>✗</span>
                <span>{item}</span>
              </li>
            ))}
            {scorecard.fallacies_summary.map((fallacy, idx) => (
              <li key={`f-${idx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#fda4af', lineHeight: '1.5' }}>
                <span style={{ color: '#f43f5e', fontWeight: 700 }}>⚠️</span>
                <span>{fallacy}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Optimal Model Answers (Gợi ý câu trả lời chuẩn) */}
      <div className="glass-panel" style={{ padding: '24px', borderTop: '3px solid #06b6d4' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Lightbulb size={22} color="#06b6d4" />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
              Gợi ý Câu trả lời Chuẩn (Optimal Model Answers)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Cách thức phản biện tối ưu và bài học rút ra để đạt điểm tối đa trước hội đồng
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {scorecard.optimal_answers.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ background: '#06b6d4', color: '#090d16', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                  Câu hỏi lượt {item.turn_number}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>"{item.question}"</span>
              </div>

              <div style={{ margin: '10px 0', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid #64748b' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Ý bạn đã trả lời:</p>
                <p style={{ fontSize: '13px', color: '#cbd5e1' }}>{item.student_answer_summary}</p>
              </div>

              <div style={{ margin: '10px 0', padding: '12px 14px', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '8px', borderLeft: '3px solid #06b6d4' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
                  ★ Câu trả lời chuẩn mực đề xuất:
                </p>
                <p style={{ fontSize: '13px', color: '#f8fafc', lineHeight: '1.5' }}>
                  {item.optimal_answer}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <ShieldCheck size={14} color="#10b981" />
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 500 }}>
                  Bài học rút ra: {item.key_takeaway}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action footer */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
        <button onClick={onRestart} className="btn-primary" style={{ padding: '12px 28px' }}>
          <RotateCcw size={18} />
          Bắt đầu Phiên Tranh biện Mới
        </button>
      </div>
    </div>
  );
};

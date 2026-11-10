import React from 'react';
import {
  AlertTriangle,
  Award,
  Check,
  CheckCircle,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import type { Scorecard, CouncilPersona } from '../types';

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
    if (score >= 90) return { label: 'Xuất Sắc (A+)', color: '#085448' };
    if (score >= 80) return { label: 'Giỏi (A)', color: '#0b6e5e' };
    if (score >= 70) return { label: 'Khá (B)', color: '#0369a1' };
    if (score >= 50) return { label: 'Trung Bình (C)', color: '#b45309' };
    return { label: 'Cần Rèn Luyện Thêm (D)', color: '#be123c' };
  };

  const grade = getGrade(scorecard.overall_score);

  const metrics = [
    { label: 'Độ chính xác Kiến thức & Logic', score: scorecard.logic_accuracy_score, color: '#0b6e5e' },
    { label: 'Kỹ năng Lập luận & Phản biện', score: scorecard.argumentation_score, color: '#0369a1' },
    { label: 'Bản lĩnh & Khả năng Chịu áp lực', score: scorecard.composure_score, color: '#085448' },
    { label: 'Độ Mạch lạc & Súc tích', score: scorecard.clarity_score, color: '#334155' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      {/* Top Banner */}
      <div
        className="mint-card"
        style={{
          padding: '32px',
          background: '#ffffff',
          border: '1px solid rgba(11, 110, 94, 0.24)',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Award size={24} color="#0b6e5e" aria-hidden="true" />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: '#0b6e5e',
              textTransform: 'uppercase',
            }}
          >
            Bảng Đánh Giá Tổng Kết Phiên Bảo Vệ Đồ Án
          </span>
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: 600, color: '#0a1413', marginBottom: '8px' }}>
          {topicTitle}
        </h2>

        {/* Score emblem */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
          <div
            style={{
              width: '126px',
              height: '126px',
              borderRadius: '24px',
              background: '#eff5f3',
              border: `2px solid ${grade.color}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '38px', fontWeight: 700, color: grade.color, lineHeight: 1 }}>
              {scorecard.overall_score.toFixed(1)}
            </span>
            <span style={{ fontSize: '11px', color: '#556361', marginTop: '6px' }}>/ 100 điểm</span>
          </div>
        </div>

        <span
          style={{
            display: 'inline-block',
            padding: '5px 16px',
            borderRadius: '9999px',
            background: 'rgba(110, 231, 200, 0.22)',
            color: grade.color,
            border: `1px solid ${grade.color}33`,
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          Đánh giá: {grade.label}
        </span>

        <p
          style={{
            maxWidth: '700px',
            margin: '18px auto 0',
            fontSize: '14px',
            color: '#465754',
            lineHeight: '1.6',
          }}
        >
          “{scorecard.overall_verdict}”
        </p>
      </div>

      {/* 4 Quantitative Metrics */}
      <div className="mint-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0a1413', marginBottom: '16px' }}>
          Chi tiết Điểm số 4 Trục Năng Lực
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {metrics.map((m, idx) => (
            <div
              key={idx}
              style={{
                background: '#f7faf9',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid rgba(10, 20, 19, 0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#465754', fontWeight: 500 }}>{m.label}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: m.color }}>
                  {m.score.toFixed(1)}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: '#dce7e4',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${m.score}%`,
                    height: '100%',
                    background: m.color,
                    borderRadius: '9999px',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        <div className="mint-card" style={{ padding: '24px', borderTop: '3px solid #0b6e5e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CheckCircle size={19} color="#0b6e5e" aria-hidden="true" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0a1413' }}>Điểm mạnh nổi bật</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scorecard.strengths.map((item, idx) => (
              <li
                key={idx}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#0a1413', lineHeight: '1.5' }}
              >
                <Check size={14} color="#0b6e5e" style={{ marginTop: '3px', flexShrink: 0 }} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mint-card" style={{ padding: '24px', borderTop: '3px solid #be123c' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={19} color="#be123c" aria-hidden="true" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0a1413' }}>
              Lỗ hổng Logic &amp; Cần cải thiện
            </h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scorecard.weaknesses.map((item, idx) => (
              <li
                key={idx}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#0a1413', lineHeight: '1.5' }}
              >
                <X size={14} color="#be123c" style={{ marginTop: '3px', flexShrink: 0 }} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
            {scorecard.fallacies_summary.map((fallacy, idx) => (
              <li
                key={`f-${idx}`}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#be123c', lineHeight: '1.5' }}
              >
                <AlertTriangle size={14} color="#be123c" style={{ marginTop: '3px', flexShrink: 0 }} aria-hidden="true" />
                <span>{fallacy}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Optimal Model Answers */}
      <div className="mint-card" style={{ padding: '24px', borderTop: '3px solid #0369a1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Lightbulb size={20} color="#0369a1" aria-hidden="true" />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0a1413' }}>
              Gợi ý Câu trả lời Chuẩn (Optimal Model Answers)
            </h3>
            <p style={{ fontSize: '12px', color: '#465754' }}>
              Cách thức phản biện tối ưu và bài học rút ra để đạt điểm tối đa trước hội đồng
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {scorecard.optimal_answers.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#f7faf9',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid rgba(10, 20, 19, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: '#0a1413',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  Câu hỏi lượt {item.turn_number}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0a1413' }}>
                  “{item.question}”
                </span>
              </div>

              <div
                style={{
                  margin: '10px 0',
                  padding: '10px 14px',
                  background: '#ffffff',
                  borderRadius: '10px',
                  borderLeft: '3px solid #556361',
                }}
              >
                <p style={{ fontSize: '11px', color: '#556361', marginBottom: '2px', fontWeight: 600 }}>
                  Ý bạn đã trả lời:
                </p>
                <p style={{ fontSize: '13px', color: '#465754' }}>{item.student_answer_summary}</p>
              </div>

              <div
                style={{
                  margin: '10px 0',
                  padding: '12px 14px',
                  background: 'rgba(110, 231, 200, 0.16)',
                  borderRadius: '10px',
                  borderLeft: '3px solid #0b6e5e',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#085448',
                    marginBottom: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Sparkles size={13} aria-hidden="true" />
                  <span>Câu trả lời chuẩn mực đề xuất:</span>
                </p>
                <p style={{ fontSize: '13px', color: '#0a1413', lineHeight: '1.5' }}>
                  {item.optimal_answer}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <ShieldCheck size={14} color="#0b6e5e" aria-hidden="true" />
                <span style={{ fontSize: '12px', color: '#0b6e5e', fontWeight: 500 }}>
                  Bài học rút ra: {item.key_takeaway}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action footer */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
        <button
          type="button"
          onClick={onRestart}
          className="btn-mint-primary"
          style={{ padding: '12px 24px', cursor: 'pointer' }}
        >
          <RotateCcw size={16} aria-hidden="true" />
          <span>Bắt đầu Phiên Tranh biện Mới</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import type { DebateTurn, CouncilPersona } from '../types';
import { AlertCircle, BrainCircuit, ChevronDown, ChevronUp, Mic } from 'lucide-react';

interface DebateTranscriptProps {
  turns: DebateTurn[];
  persona: CouncilPersona;
  currentTurnNumber: number;
}

export const DebateTranscript: React.FC<DebateTranscriptProps> = ({ turns, currentTurnNumber }) => {
  const [expandedCoT, setExpandedCoT] = useState<Record<string, boolean>>({});

  const toggleCoT = (turnId: string) => {
    setExpandedCoT((prev) => ({ ...prev, [turnId]: !prev[turnId] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {turns.map((turn) => {
        const isCurrent = turn.turn_number === currentTurnNumber;
        const hasCritique = !!turn.critique_comment || (turn.logic_flaws && turn.logic_flaws.length > 0);
        const isCoTOpen = !!expandedCoT[turn.id];

        return (
          <div
            key={turn.id}
            className="glass-panel"
            style={{
              padding: '20px',
              border: isCurrent ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-subtle)',
              background: isCurrent ? 'rgba(20, 27, 45, 0.9)' : 'var(--bg-card)',
            }}
          >
            {/* Header: Turn Number */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    background: '#6366f1',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  LƯỢT {turn.turn_number}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                  {turn.council_speaker}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* AI Council Question Box */}
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.08)',
                borderLeft: '3px solid #6366f1',
                padding: '14px 18px',
                borderRadius: '0 12px 12px 0',
                marginBottom: '16px',
              }}
            >
              <p style={{ fontSize: '15px', color: '#f8fafc', lineHeight: '1.6', fontWeight: 500 }}>
                "{turn.ai_question}"
              </p>
            </div>

            {/* Student Response (if answered) */}
            {turn.student_response ? (
              <div style={{ marginTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8' }}>
                    Sinh viên phản hồi:
                  </span>
                  {turn.response_mode === 'voice' && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '10px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      <Mic size={10} /> Giọng nói
                    </span>
                  )}
                </div>

                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {turn.student_response}
                  </p>
                </div>

                {/* AI Council Critique & "Bắt bài" flaws */}
                {hasCritique && (
                  <div
                    style={{
                      marginTop: '12px',
                      background: 'rgba(244, 63, 94, 0.06)',
                      border: '1px solid rgba(244, 63, 94, 0.2)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={14} color="#f43f5e" />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#f43f5e' }}>
                          Hội đồng "Bắt bài" & Nhận xét phản biện:
                        </span>
                      </div>
                      {turn.ground_truth_accuracy !== undefined && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: turn.ground_truth_accuracy >= 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                            color: turn.ground_truth_accuracy >= 70 ? '#10b981' : '#f43f5e',
                          }}
                        >
                          Độ chính xác: {turn.ground_truth_accuracy}%
                        </span>
                      )}
                    </div>

                    {turn.critique_comment && (
                      <p style={{ fontSize: '13px', color: '#e2e8f0', marginBottom: '8px' }}>
                        {turn.critique_comment}
                      </p>
                    )}

                    {/* Detected logic flaws tags */}
                    {turn.logic_flaws && turn.logic_flaws.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        {turn.logic_flaws.map((flaw, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '11px',
                              background: 'rgba(244, 63, 94, 0.15)',
                              color: '#fda4af',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid rgba(244, 63, 94, 0.3)',
                            }}
                          >
                            ⚠️ {flaw}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CoT Chain of Thought button */}
                    {turn.ai_thought_process && (
                      <div style={{ marginTop: '10px', borderTop: '1px solid rgba(244, 63, 94, 0.15)', paddingTop: '8px' }}>
                        <button
                          type="button"
                          onClick={() => toggleCoT(turn.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <BrainCircuit size={12} color="#818cf8" />
                          <span>Xem 3 bước suy luận ngầm (Chain-of-Thought) của AI</span>
                          {isCoTOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>

                        {isCoTOpen && (
                          <div
                            style={{
                              marginTop: '8px',
                              padding: '10px',
                              background: 'rgba(0, 0, 0, 0.3)',
                              borderRadius: '8px',
                              fontSize: '11px',
                              color: '#cbd5e1',
                              lineHeight: '1.5',
                            }}
                          >
                            <p style={{ color: '#818cf8', fontWeight: 600 }}>1. Kiểm tra tính đúng đắn (Fact check):</p>
                            <p style={{ marginBottom: '6px' }}>{turn.ai_thought_process.step1_fact_check || 'Đạt'}</p>

                            <p style={{ color: '#f43f5e', fontWeight: 600 }}>2. Tìm kiếm lỗ hổng logic & ngụy biện:</p>
                            <p style={{ marginBottom: '6px' }}>
                              {Array.isArray(turn.ai_thought_process.step2_logic_flaws)
                                ? turn.ai_thought_process.step2_logic_flaws.join(', ')
                                : 'Không phát hiện mâu thuẫn lớn'}
                            </p>

                            <p style={{ color: '#10b981', fontWeight: 600 }}>3. Chiến lược phản bác:</p>
                            <p>{turn.ai_thought_process.step3_rebuttal_strategy || 'Chất vấn trọng tâm'}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : isCurrent ? (
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.05)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  border: '1px dashed rgba(99, 102, 241, 0.3)',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '13px', color: '#818cf8' }}>
                  ⏳ Đến lượt bạn: Hãy bấm Micro để phát biểu hoặc gõ câu trả lời vào khung bên dưới...
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

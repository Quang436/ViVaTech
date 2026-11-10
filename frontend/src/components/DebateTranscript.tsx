import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Clock,
  Mic,
} from 'lucide-react';
import type { DebateTurn, CouncilPersona } from '../types';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {turns.map((turn) => {
        const isCurrent = turn.turn_number === currentTurnNumber;
        const hasCritique =
          !!turn.critique_comment || (turn.logic_flaws && turn.logic_flaws.length > 0);
        const isCoTOpen = !!expandedCoT[turn.id];

        return (
          <div
            key={turn.id}
            className="mint-card"
            style={{
              padding: '20px',
              border: isCurrent
                ? '1px solid rgba(11, 110, 94, 0.38)'
                : '1px solid rgba(10, 20, 19, 0.1)',
              background: '#ffffff',
            }}
          >
            {/* Header: Turn Number */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    background: '#0a1413',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 9px',
                    borderRadius: '9999px',
                  }}
                >
                  LƯỢT {turn.turn_number}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a1413' }}>
                  {turn.council_speaker}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#556361', fontFamily: 'var(--mono)' }}>
                {new Date(turn.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* AI Council Question Box */}
            <div
              style={{
                background: '#eff5f3',
                borderLeft: '3px solid #0b6e5e',
                padding: '14px 18px',
                borderRadius: '0 14px 14px 0',
                marginBottom: '16px',
              }}
            >
              <p style={{ fontSize: '15px', color: '#0a1413', lineHeight: '1.6', fontWeight: 500 }}>
                “{turn.ai_question}”
              </p>
            </div>

            {/* Student Response (if answered) */}
            {turn.student_response ? (
              <div style={{ marginTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0369a1' }}>
                    Sinh viên phản hồi:
                  </span>
                  {turn.response_mode === 'voice' && (
                    <span className="mint-tag sky" style={{ fontSize: '10px', padding: '1px 8px' }}>
                      <Mic size={10} aria-hidden="true" /> Giọng nói
                    </span>
                  )}
                </div>

                <div
                  style={{
                    background: '#f7faf9',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(10, 20, 19, 0.08)',
                  }}
                >
                  <p style={{ fontSize: '14px', color: '#0a1413', lineHeight: '1.5' }}>
                    {turn.student_response}
                  </p>
                </div>

                {/* AI Council Critique & Flaws */}
                {hasCritique && (
                  <div
                    style={{
                      marginTop: '12px',
                      background: 'rgba(190, 18, 60, 0.05)',
                      border: '1px solid rgba(190, 18, 60, 0.2)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={14} color="#be123c" aria-hidden="true" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#be123c' }}>
                          Hội đồng phản biện &amp; nhận xét:
                        </span>
                      </div>
                      {turn.ground_truth_accuracy !== undefined && (
                        <span
                          className={`mint-tag ${
                            turn.ground_truth_accuracy >= 70 ? 'mint' : 'red'
                          }`}
                        >
                          Độ chính xác: {turn.ground_truth_accuracy}%
                        </span>
                      )}
                    </div>

                    {turn.critique_comment && (
                      <p style={{ fontSize: '13px', color: '#0a1413', marginBottom: '8px' }}>
                        {turn.critique_comment}
                      </p>
                    )}

                    {turn.logic_flaws && turn.logic_flaws.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        {turn.logic_flaws.map((flaw, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              background: 'rgba(190, 18, 60, 0.09)',
                              color: '#881337',
                              padding: '3px 9px',
                              borderRadius: '9999px',
                              border: '1px solid rgba(190, 18, 60, 0.24)',
                            }}
                          >
                            <AlertTriangle size={11} color="#be123c" aria-hidden="true" />
                            {flaw}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CoT Chain of Thought toggle */}
                    {turn.ai_thought_process && (
                      <div
                        style={{
                          marginTop: '10px',
                          borderTop: '1px solid rgba(10, 20, 19, 0.08)',
                          paddingTop: '8px',
                        }}
                      >
                        <button
                          type="button"
                          aria-expanded={isCoTOpen}
                          onClick={() => toggleCoT(turn.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#465754',
                            fontSize: '11px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            fontWeight: 500,
                          }}
                        >
                          <BrainCircuit size={13} color="#0b6e5e" aria-hidden="true" />
                          <span>Xem 3 bước suy luận ngầm (Chain-of-Thought)</span>
                          {isCoTOpen ? (
                            <ChevronUp size={13} aria-hidden="true" />
                          ) : (
                            <ChevronDown size={13} aria-hidden="true" />
                          )}
                        </button>

                        {isCoTOpen && (
                          <div
                            style={{
                              marginTop: '8px',
                              padding: '12px',
                              background: '#f7faf9',
                              border: '1px solid rgba(10, 20, 19, 0.08)',
                              borderRadius: '10px',
                              fontSize: '12px',
                              color: '#465754',
                              lineHeight: '1.5',
                            }}
                          >
                            <p style={{ color: '#0369a1', fontWeight: 600 }}>
                              1. Kiểm tra tính đúng đắn (Fact check):
                            </p>
                            <p style={{ marginBottom: '6px', color: '#0a1413' }}>
                              {turn.ai_thought_process.step1_fact_check || 'Đạt'}
                            </p>

                            <p style={{ color: '#be123c', fontWeight: 600 }}>
                              2. Tìm kiếm lỗ hổng logic &amp; ngụy biện:
                            </p>
                            <p style={{ marginBottom: '6px', color: '#0a1413' }}>
                              {Array.isArray(turn.ai_thought_process.step2_logic_flaws)
                                ? turn.ai_thought_process.step2_logic_flaws.join(', ')
                                : 'Không phát hiện mâu thuẫn lớn'}
                            </p>

                            <p style={{ color: '#0b6e5e', fontWeight: 600 }}>
                              3. Chiến lược phản bác:
                            </p>
                            <p style={{ color: '#0a1413' }}>
                              {turn.ai_thought_process.step3_rebuttal_strategy || 'Chất vấn trọng tâm'}
                            </p>
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
                  background: 'rgba(110, 231, 200, 0.14)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  border: '1px dashed rgba(11, 110, 94, 0.35)',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontSize: '13px',
                    color: '#085448',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 500,
                  }}
                >
                  <Clock size={14} aria-hidden="true" />
                  <span>Đến lượt bạn: Hãy bấm Micro để phát biểu hoặc gõ câu trả lời vào khung bên dưới...</span>
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

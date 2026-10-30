import React from 'react';
import type { CouncilPersona } from '../types';
import { Volume2 } from 'lucide-react';

interface CouncilAvatarProps {
  persona: CouncilPersona;
  speakerName: string;
  isSpeaking: boolean;
  isThinking: boolean;
  onReplayAudio?: () => void;
}

export const CouncilAvatar: React.FC<CouncilAvatarProps> = ({
  persona,
  speakerName,
  isSpeaking,
  isThinking,
  onReplayAudio,
}) => {
  const getPersonaMeta = () => {
    switch (persona) {
      case 'feynman':
        return {
          icon: '🌱',
          color: '#10b981',
          roleTitle: 'Bạn học Tò mò',
          styleBadge: 'Phong cách Feynman',
          intensity: 'Mức độ: Ôn hòa & Truy vấn bản chất',
        };
      case 'strict_council':
        return {
          icon: '⚡',
          color: '#f43f5e',
          roleTitle: 'Chủ tịch Hội đồng Chấm',
          styleBadge: 'Stress-Test & Vạch trần Logic',
          intensity: 'Mức độ: Cực kỳ Nghiêm khắc',
        };
      case 'academic_reviewer':
      default:
        return {
          icon: '🎓',
          color: '#6366f1',
          roleTitle: 'Giáo sư Phản biện',
          styleBadge: 'Học thuật & Chuẩn mực',
          intensity: 'Mức độ: Chặt chẽ & Học thuật',
        };
    }
  };

  const meta = getPersonaMeta();

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderLeft: `4px solid ${meta.color}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Avatar Ring */}
        <div style={{ position: 'relative' }}>
          <div
            className={isSpeaking ? 'speaking-pulse' : ''}
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${meta.color}44 0%, rgba(15, 23, 42, 0.9) 70%)`,
              border: `2px solid ${meta.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '34px',
              boxShadow: `0 0 20px ${meta.color}44`,
            }}
          >
            {meta.icon}
          </div>

          {/* Sound wave icon badge */}
          {isSpeaking && (
            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                background: meta.color,
                borderRadius: '50%',
                padding: '4px',
                display: 'flex',
                boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              }}
            >
              <Volume2 size={14} color="#ffffff" />
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
              {speakerName || meta.roleTitle}
            </h3>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                background: `${meta.color}22`,
                color: meta.color,
                border: `1px solid ${meta.color}44`,
              }}
            >
              {meta.styleBadge}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{meta.intensity}</p>

          {/* Status line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            {isThinking ? (
              <span style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="wave-bar" style={{ height: '10px' }} />
                Hội đồng đang đối chiếu Ground Truth & phân tích logic...
              </span>
            ) : isSpeaking ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span style={{ fontSize: '12px', color: meta.color, fontWeight: 600, marginLeft: '6px' }}>
                  Đang phát biểu chất vấn
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ● Đang lắng nghe sinh viên phản biện
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Replay voice button */}
      {onReplayAudio && (
        <button
          onClick={onReplayAudio}
          className="btn-secondary"
          title="Nghe lại câu hỏi của hội đồng"
          style={{ padding: '8px 14px' }}
        >
          <Volume2 size={16} />
          <span style={{ fontSize: '12px' }}>Nghe lại</span>
        </button>
      )}
    </div>
  );
};

import React from 'react';
import { GraduationCap, Sprout, Volume2, Zap } from 'lucide-react';
import type { CouncilPersona } from '../types';

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
          Icon: Sprout,
          color: '#0b6e5e',
          bgTint: 'rgba(110, 231, 200, 0.22)',
          roleTitle: 'Bạn học Tò mò',
          styleBadge: 'Phong cách Feynman',
          intensity: 'Mức độ: Ôn hòa & Truy vấn bản chất',
        };
      case 'strict_council':
        return {
          Icon: Zap,
          color: '#be123c',
          bgTint: 'rgba(190, 18, 60, 0.1)',
          roleTitle: 'Chủ tịch Hội đồng Chấm',
          styleBadge: 'Stress-Test & Vạch trần Logic',
          intensity: 'Mức độ: Cực kỳ Nghiêm khắc',
        };
      case 'academic_reviewer':
      default:
        return {
          Icon: GraduationCap,
          color: '#0369a1',
          bgTint: 'rgba(3, 105, 161, 0.1)',
          roleTitle: 'Giáo sư Phản biện',
          styleBadge: 'Học thuật & Chuẩn mực',
          intensity: 'Mức độ: Chặt chẽ & Học thuật',
        };
    }
  };

  const meta = getPersonaMeta();
  const PersonaIcon = meta.Icon;

  return (
    <div
      className="mint-card"
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
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: meta.bgTint,
              border: `2px solid ${meta.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: meta.color,
            }}
          >
            <PersonaIcon size={30} strokeWidth={1.8} aria-hidden="true" />
          </div>

          {isSpeaking && (
            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                background: meta.color,
                borderRadius: '50%',
                padding: '5px',
                display: 'flex',
              }}
            >
              <Volume2 size={13} color="#ffffff" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0a1413' }}>
              {speakerName || meta.roleTitle}
            </h3>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: '9999px',
                background: meta.bgTint,
                color: meta.color,
                border: `1px solid ${meta.color}40`,
              }}
            >
              {meta.styleBadge}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#465754' }}>{meta.intensity}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            {isThinking ? (
              <span style={{ fontSize: '12px', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Hội đồng đang đối chiếu Ground Truth &amp; phân tích logic...
              </span>
            ) : isSpeaking ? (
              <span style={{ fontSize: '12px', color: meta.color, fontWeight: 600 }}>
                Đang phát biểu chất vấn
              </span>
            ) : (
              <span style={{ fontSize: '12px', color: '#0b6e5e', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    background: '#6ee7c8',
                    border: '1px solid #0b6e5e',
                    display: 'inline-block',
                  }}
                  aria-hidden="true"
                />
                Đang lắng nghe sinh viên phản biện
              </span>
            )}
          </div>
        </div>
      </div>

      {onReplayAudio && (
        <button
          type="button"
          onClick={onReplayAudio}
          className="btn-mint-ghost"
          title="Nghe lại câu hỏi của hội đồng"
          style={{ padding: '8px 14px', fontSize: '12px', cursor: 'pointer' }}
        >
          <Volume2 size={15} aria-hidden="true" />
          <span>Nghe lại</span>
        </button>
      )}
    </div>
  );
};

import React from 'react';
import type { CouncilPersona, PersonaInfo } from '../types';
import { CheckCircle2 } from 'lucide-react';

export const PERSONAS: PersonaInfo[] = [
  {
    id: 'feynman',
    title: 'Phương pháp Feynman',
    subtitle: 'Bạn học tò mò & Trực giác đời thực',
    badge: 'Cấp độ 1: Dễ',
    badgeColor: '#10b981',
    accentColor: '#10b981',
    difficulty: 'Dễ',
    avatarIcon: '🌱',
    description:
      'AI đóng vai người học ngô nghê, liên tục hỏi "Tại sao?", yêu cầu bạn giải thích ý tưởng phức tạp bằng ngôn từ đơn giản nhất và ví dụ đời sống thực tế.',
  },
  {
    id: 'academic_reviewer',
    title: 'Thầy Phản biện Học thuật',
    subtitle: 'Giáo sư nghiên cứu chuẩn mực',
    badge: 'Cấp độ 2: Vừa',
    badgeColor: '#6366f1',
    accentColor: '#6366f1',
    difficulty: 'Vừa',
    avatarIcon: '🎓',
    description:
      'AI xoáy sâu vào tính chính xác của định nghĩa, công thức toán học/thuật toán, ưu và nhược điểm so với các giải pháp State-of-the-Art hiện nay.',
  },
  {
    id: 'strict_council',
    title: 'Hội đồng Bảo vệ Gắt gao',
    subtitle: 'Chủ tịch Hội đồng Khó tính (Stress-Test)',
    badge: 'Cấp độ 3: Khó (Stress-Test)',
    badgeColor: '#f43f5e',
    accentColor: '#f43f5e',
    difficulty: 'Khó (Stress-Test)',
    avatarIcon: '⚡',
    description:
      'AI truy quét triệt để các lỗ hổng logic, bắt bài khi trả lời vòng vo, đối chiếu mâu thuẫn giữa các câu trước và ép sinh viên vào các tình huống ngoại lệ cực đoan.',
  },
];

interface PersonaSelectorProps {
  selectedPersona: CouncilPersona;
  onSelect: (persona: CouncilPersona) => void;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ selectedPersona, onSelect }) => {
  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
          Chọn Cấp độ Hội đồng Phản biện AI
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Mỗi vai trò áp dụng chiến thuật chất vấn và mức độ nghiêm khắc riêng biệt
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {PERSONAS.map((p) => {
          const isSelected = selectedPersona === p.id;
          return (
            <div
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="glass-panel"
              style={{
                padding: '20px',
                cursor: 'pointer',
                border: isSelected ? `2px solid ${p.accentColor}` : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(30, 41, 65, 0.9)' : 'var(--bg-card)',
                boxShadow: isSelected ? `0 0 24px ${p.accentColor}33` : 'none',
                position: 'relative',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '32px' }}>{p.avatarIcon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: `${p.badgeColor}22`,
                      color: p.badgeColor,
                      border: `1px solid ${p.badgeColor}44`,
                    }}
                  >
                    {p.badge}
                  </span>
                  {isSelected && <CheckCircle2 size={18} color={p.accentColor} />}
                </div>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                {p.title}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {p.subtitle}
              </p>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                {p.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

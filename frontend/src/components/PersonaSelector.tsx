import React from 'react';
import { CheckCircle2, GraduationCap, Sprout, Zap } from 'lucide-react';
import type { CouncilPersona, PersonaInfo } from '../types';

export const PERSONAS: PersonaInfo[] = [
  {
    id: 'feynman',
    title: 'Phương pháp Feynman',
    subtitle: 'Bạn học tò mò & Trực giác đời thực',
    badge: 'Cấp độ 1: Dễ',
    badgeColor: '#0b6e5e',
    accentColor: '#0b6e5e',
    difficulty: 'Dễ',
    avatarIcon: 'feynman',
    description:
      'AI đóng vai người học ngô nghê, liên tục hỏi "Tại sao?", yêu cầu bạn giải thích ý tưởng phức tạp bằng ngôn từ đơn giản nhất và ví dụ đời sống thực tế.',
  },
  {
    id: 'academic_reviewer',
    title: 'Thầy Phản biện Học thuật',
    subtitle: 'Giáo sư nghiên cứu chuẩn mực',
    badge: 'Cấp độ 2: Vừa',
    badgeColor: '#0369a1',
    accentColor: '#0369a1',
    difficulty: 'Vừa',
    avatarIcon: 'academic_reviewer',
    description:
      'AI xoáy sâu vào tính chính xác của định nghĩa, công thức toán học/thuật toán, ưu và nhược điểm so với các giải pháp State-of-the-Art hiện nay.',
  },
  {
    id: 'strict_council',
    title: 'Hội đồng Bảo vệ Gắt gao',
    subtitle: 'Chủ tịch Hội đồng Khó tính (Stress-Test)',
    badge: 'Cấp độ 3: Khó (Stress-Test)',
    badgeColor: '#be123c',
    accentColor: '#be123c',
    difficulty: 'Khó (Stress-Test)',
    avatarIcon: 'strict_council',
    description:
      'AI truy quét triệt để các lỗ hổng logic, bắt bài khi trả lời vòng vo, đối chiếu mâu thuẫn giữa các câu trước và ép sinh viên vào các tình huống ngoại lệ cực đoan.',
  },
];

interface PersonaSelectorProps {
  selectedPersona: CouncilPersona;
  onSelect: (persona: CouncilPersona) => void;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ selectedPersona, onSelect }) => {
  const renderIcon = (id: CouncilPersona, color: string) => {
    if (id === 'feynman') return <Sprout size={24} color={color} aria-hidden="true" />;
    if (id === 'strict_council') return <Zap size={24} color={color} aria-hidden="true" />;
    return <GraduationCap size={24} color={color} aria-hidden="true" />;
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0a1413' }}>
          Chọn Cấp độ Hội đồng Phản biện AI
        </h3>
        <p style={{ fontSize: '13px', color: '#465754' }}>
          Mỗi vai trò áp dụng chiến thuật chất vấn và mức độ nghiêm khắc riêng biệt
        </p>
      </div>

      <div
        role="group"
        aria-label="Chọn cấp độ hội đồng"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {PERSONAS.map((p) => {
          const isSelected = selectedPersona === p.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(p.id)}
              className="mint-card mint-card-hover"
              style={{
                padding: '20px',
                cursor: 'pointer',
                textAlign: 'left',
                border: isSelected ? `2px solid ${p.accentColor}` : '1px solid rgba(10, 20, 19, 0.1)',
                background: '#ffffff',
                boxShadow: isSelected ? '0 14px 30px -14px rgba(11, 110, 94, 0.2)' : undefined,
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: '#eff5f3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {renderIcon(p.id, p.accentColor)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: '#eff5f3',
                      color: p.badgeColor,
                      border: `1px solid ${p.badgeColor}33`,
                    }}
                  >
                    {p.badge}
                  </span>
                  {isSelected && <CheckCircle2 size={18} color={p.accentColor} aria-hidden="true" />}
                </div>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#0a1413', marginBottom: '4px' }}>
                {p.title}
              </h4>
              <p style={{ fontSize: '12px', color: '#465754', marginBottom: '10px', fontWeight: 500 }}>
                {p.subtitle}
              </p>
              <p style={{ fontSize: '13px', color: '#465754', lineHeight: '1.5' }}>{p.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

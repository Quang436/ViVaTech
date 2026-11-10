import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerCountdownProps {
  initialSeconds?: number;
  isRunning: boolean;
  onTimeUp?: () => void;
  turnKey: number; // Reset timer when turn changes
}

export const TimerCountdown: React.FC<TimerCountdownProps> = ({
  initialSeconds = 60,
  isRunning,
  onTimeUp,
  turnKey,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [turnKey, initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onTimeUp]);

  const percentage = Math.max(0, (timeLeft / initialSeconds) * 100);
  const isUrgent = timeLeft <= 15;
  const timerColor = timeLeft > 30 ? '#0b6e5e' : timeLeft > 15 ? '#b45309' : '#be123c';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#eff5f3',
        border: `1px solid ${isUrgent ? 'rgba(190, 18, 60, 0.35)' : 'rgba(10, 20, 19, 0.12)'}`,
        borderRadius: '9999px',
        padding: '8px 16px',
        transition: 'all 0.25s ease',
      }}
    >
      <Clock size={16} color={timerColor} aria-hidden="true" />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#465754' }}>Thời gian phản biện:</span>
          <span
            style={{
              fontSize: '14px',
              fontFamily: 'var(--mono)',
              fontWeight: 700,
              color: timerColor,
            }}
          >
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
          </span>
          {isUrgent && <AlertTriangle size={14} color="#be123c" aria-hidden="true" />}
        </div>
        <div
          style={{
            width: '120px',
            height: '4px',
            background: '#dce7e4',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginTop: '4px',
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              background: timerColor,
              transition: 'width 1s linear',
            }}
          />
        </div>
      </div>
    </div>
  );
};

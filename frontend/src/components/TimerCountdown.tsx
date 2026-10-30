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
  const timerColor = timeLeft > 30 ? '#10b981' : timeLeft > 15 ? '#f59e0b' : '#f43f5e';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.7)',
        border: `1px solid ${isUrgent ? '#f43f5e' : 'var(--border-subtle)'}`,
        borderRadius: '12px',
        padding: '8px 16px',
        boxShadow: isUrgent ? '0 0 15px rgba(244, 63, 94, 0.3)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <Clock size={16} color={timerColor} />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thời gian phản biện:</span>
          <span
            style={{
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: timerColor,
            }}
          >
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
          </span>
          {isUrgent && <AlertTriangle size={14} color="#f43f5e" className="animate-bounce" />}
        </div>
        {/* Progress bar */}
        <div
          style={{
            width: '120px',
            height: '4px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '2px',
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

import { useState, useEffect } from 'react';

interface CountdownProps {
  endTime: string;
  className?: string;
  compact?: boolean;
}

function getTimeLeft(end: string) {
  const diff = Math.max(0, new Date(end).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hrs:  Math.floor((diff % 86400000) / 3600000),
    min:  Math.floor((diff % 3600000) / 60000),
    sec:  Math.floor((diff % 60000) / 1000),
    done: diff === 0,
  };
}

export function Countdown({ endTime, className = '', compact = false }: CountdownProps) {
  const [t, setT] = useState(() => getTimeLeft(endTime));

  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(endTime)), 1000);
    return () => clearInterval(id);
  }, [endTime]);

  if (t.done) {
    return (
      <span className={`countdown${className ? ` ${className}` : ''}`}>
        <span className="countdown-val" style={{ color: 'var(--shadow-type)' }}>ENDED</span>
      </span>
    );
  }

  const urgency = t.days === 0 && t.hrs < 2 ? 'urgent' : t.days === 0 && t.hrs < 6 ? 'warning' : '';

  if (compact) {
    return (
      <span className={`countdown countdown-compact ${urgency}${className ? ` ${className}` : ''}`}>
        {t.days > 0 && <><span className="countdown-val">{t.days}</span><span className="countdown-sep">D</span></>}
        <span className="countdown-val">{String(t.hrs).padStart(2, '0')}</span>
        <span className="countdown-sep">:</span>
        <span className="countdown-val">{String(t.min).padStart(2, '0')}</span>
        <span className="countdown-sep">:</span>
        <span className="countdown-val">{String(t.sec).padStart(2, '0')}</span>
      </span>
    );
  }

  return (
    <span className={`countdown ${urgency}${className ? ` ${className}` : ''}`}>
      {t.days > 0 && (
        <>
          <span className="countdown-val">{t.days}</span>
          <span className="countdown-sep">D</span>
        </>
      )}
      <span className="countdown-val">{String(t.hrs).padStart(2, '0')}</span>
      <span className="countdown-sep">:</span>
      <span className="countdown-val">{String(t.min).padStart(2, '0')}</span>
      <span className="countdown-sep">:</span>
      <span className="countdown-val">{String(t.sec).padStart(2, '0')}</span>
    </span>
  );
}

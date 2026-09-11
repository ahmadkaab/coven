import { useState, useEffect } from 'react';
import { getSyndicateProgression } from '../../services/achievementService';
import type { AvatarFrame } from '../../types/achievement';

interface AvatarWithFrameProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  avatarUrl?: string;
  frame?: AvatarFrame | null;
  frameClass?: string;
  level?: number;
  showLevel?: boolean;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

const SIZE_MAP = {
  xs: { dim: 24, radius: '4px', levelScale: 0.6 },
  sm: { dim: 32, radius: '6px', levelScale: 0.7 },
  md: { dim: 44, radius: '8px', levelScale: 0.8 },
  lg: { dim: 64, radius: '10px', levelScale: 0.9 },
  xl: { dim: 96, radius: '14px', levelScale: 1 },
};

export function AvatarWithFrame({
  size = 'sm',
  avatarUrl,
  frame,
  frameClass,
  level,
  showLevel = false,
  alt = 'Collector Avatar',
  className = '',
  onClick,
}: AvatarWithFrameProps) {
  const [activeProgression, setActiveProgression] = useState(() => getSyndicateProgression());

  useEffect(() => {
    const handleUpdate = () => {
      setActiveProgression(getSyndicateProgression());
    };
    window.addEventListener('coven:progression_update', handleUpdate);
    return () => window.removeEventListener('coven:progression_update', handleUpdate);
  }, []);

  const config = SIZE_MAP[size];
  const resolvedFrameClass =
    frameClass ||
    frame?.cssClass ||
    activeProgression.equippedFrame?.cssClass ||
    'frame-operative';

  const resolvedAvatar =
    avatarUrl ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

  const resolvedLevel = level !== undefined ? level : activeProgression.level;

  return (
    <div
      className={`collector-avatar-wrap ${className}`}
      onClick={onClick}
      style={{
        width: `${config.dim}px`,
        height: `${config.dim}px`,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <img
        src={resolvedAvatar}
        alt={alt}
        className={`collector-avatar-img ${resolvedFrameClass}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: config.radius,
          display: 'block',
        }}
      />

      {showLevel && (
        <span
          className="collector-level-tag"
          style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            fontFamily: 'var(--font-mono)',
            fontSize: `${Math.max(8, Math.round(10 * config.levelScale))}px`,
            padding: '1px 4px',
            lineHeight: 1,
            zIndex: 2,
            background: 'var(--void)',
            color: '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            borderRadius: '2px',
          }}
        >
          LVL {resolvedLevel}
        </span>
      )}
    </div>
  );
}

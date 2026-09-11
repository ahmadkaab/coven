import { Link } from 'react-router-dom';

interface CovenLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function CovenLogo({ size = 'sm', showText = true, className = '' }: CovenLogoProps) {
  const iconDimensions = {
    sm: { width: 22, height: 22, markSize: '0.875rem' },
    md: { width: 30, height: 30, markSize: '1.15rem' },
    lg: { width: 44, height: 44, markSize: '1.65rem' },
  }[size];

  return (
    <Link
      to="/"
      className={`coven-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'lg' ? '12px' : '9px',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      {/* Bespoke Geometric Vector Emblem */}
      <div
        style={{
          width: iconDimensions.width,
          height: iconDimensions.height,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="covenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff2a4b" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
            <linearGradient id="covenGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
            <filter id="covenGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#e11d48" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Outer Precision Diamond Ring */}
          <path
            d="M16 2 L29 16 L16 30 L3 16 Z"
            stroke="url(#covenGrad)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#covenGlow)"
          />

          {/* Interlocking Modern Stylized 'C' Monogram */}
          <path
            d="M20 11.5 C18.2 9.5 14.5 9.5 12.5 11.5 C10 14 10 18 12.5 20.5 C14.5 22.5 18.2 22.5 20 20.5"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Radiant Core Aperture */}
          <circle cx="16" cy="16" r="1.8" fill="url(#covenGold)" />
        </svg>
      </div>

      {/* Luxury Wordmark */}
      {showText && (
        <span
          style={{
            fontFamily: "'Syne', 'Outfit', 'DM Sans', sans-serif",
            fontSize: iconDimensions.markSize,
            fontWeight: 800,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#ffffff',
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'baseline',
          }}
        >
          COVEN
        </span>
      )}
    </Link>
  );
}

import { useMemo } from 'react';
import type { WatermarkStyle } from '../../services/vaultService';
import { ShieldCheck, LockKey } from '@phosphor-icons/react';

interface WatermarkOverlayProps {
  style?: WatermarkStyle;
  artistName?: string;
  artistTornId?: string;
  artworkId?: string;
  opacity?: number;
  showBadge?: boolean;
}

export function WatermarkOverlay({
  style = 'MATRIX_GRID',
  artistName = 'COVEN_ARTIST',
  artistTornId = '994821',
  artworkId = 'ART-001',
  opacity = 0.35,
  showBadge = true,
}: WatermarkOverlayProps) {
  const cleanArtist = (artistName || 'COVEN_ARTIST').toUpperCase();
  const shortId = artworkId.slice(0, 8).toUpperCase();

  const patternSvg = useMemo(() => {
    if (style === 'SECTOR_STENCIL') {
      return (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}>
          {/* Heavy diagonal warning band */}
          <div style={{
            transform: 'rotate(-25deg)',
            width: '160%',
            background: 'rgba(230, 25, 25, 0.18)',
            borderTop: '2px solid rgba(230, 25, 25, 0.6)',
            borderBottom: '2px solid rgba(230, 25, 25, 0.6)',
            padding: '12px 0',
            textAlign: 'center',
            boxShadow: '0 0 30px rgba(0,0,0,0.8)',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1rem, 2.5vw, 1.75rem)',
              letterSpacing: '0.15em',
              color: 'rgba(255, 255, 255, 0.85)',
              textTransform: 'uppercase',
              textShadow: '0 2px 8px rgba(0,0,0,0.9)',
            }}>
              ⚠ COVEN // UNLICENSED PREVIEW ⚠
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: 'var(--phosphor)',
              letterSpacing: '0.25em',
              marginTop: '4px',
              textTransform: 'uppercase',
            }}>
              ORIGINAL WORK BY {cleanArtist} [TORN #{artistTornId}] • DO NOT REPRODUCE
            </div>
          </div>
        </div>
      );
    }

    if (style === 'SECURITY_CREST') {
      return (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Center Seal */}
          <div style={{
            width: '180px',
            height: '180px',
            border: '2px dashed rgba(255, 255, 255, 0.25)',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(8, 8, 8, 0.45)',
            backdropFilter: 'blur(2px)',
            boxShadow: '0 0 40px rgba(0,0,0,0.7)',
            transform: 'rotate(-10deg)',
          }}>
            <LockKey size={36} color="var(--red-hi)" weight="duotone" />
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              color: 'var(--phosphor)',
              marginTop: '6px',
            }}>
              COVEN VAULT
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.5rem',
              color: 'var(--ghost)',
              letterSpacing: '0.1em',
            }}>
              SEALED ASSET
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.4375rem',
              color: 'var(--red)',
              marginTop: '4px',
            }}>
              HASH: 0x{shortId}F8..9B
            </div>
          </div>
        </div>
      );
    }

    // Default: MATRIX_GRID repeating pattern
    return (
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity,
        }}
      >
        <defs>
          <pattern
            id={`coven-watermark-${artworkId}`}
            width="280"
            height="140"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-30)"
          >
            {/* Fine grid crosshairs */}
            <line x1="0" y1="70" x2="280" y2="70" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="140" y1="0" x2="140" y2="140" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,3" />
            <text
              x="14"
              y="40"
              fill="rgba(255,255,255,0.7)"
              fontFamily="var(--font-mono)"
              fontSize="9"
              letterSpacing="2"
              fontWeight="bold"
            >
              COVEN // PREVIEW ONLY
            </text>
            <text
              x="14"
              y="60"
              fill="rgba(230,25,25,0.85)"
              fontFamily="var(--font-mono)"
              fontSize="7.5"
              letterSpacing="1.5"
            >
              ARTIST: {cleanArtist} [#{artistTornId}]
            </text>
            <text
              x="14"
              y="110"
              fill="rgba(255,255,255,0.5)"
              fontFamily="var(--font-mono)"
              fontSize="7"
              letterSpacing="2"
            >
              IMMUTABLE VAULT RECORD • {shortId}
            </text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#coven-watermark-${artworkId})`} />
      </svg>
    );
  }, [style, cleanArtist, artistTornId, artworkId, shortId, opacity]);

  return (
    <div
      className="watermark-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 5,
      }}
      aria-hidden="true"
    >
      {/* Pattern layer */}
      {patternSvg}

      {/* Cyberpunk corner brackets */}
      <div style={{
        position: 'absolute',
        top: 8,
        left: 8,
        width: 14,
        height: 14,
        borderTop: '2px solid rgba(230, 25, 25, 0.7)',
        borderLeft: '2px solid rgba(230, 25, 25, 0.7)',
      }} />
      <div style={{
        position: 'absolute',
        top: 8,
        right: 8,
        width: 14,
        height: 14,
        borderTop: '2px solid rgba(230, 25, 25, 0.7)',
        borderRight: '2px solid rgba(230, 25, 25, 0.7)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: 8,
        width: 14,
        height: 14,
        borderBottom: '2px solid rgba(230, 25, 25, 0.7)',
        borderLeft: '2px solid rgba(230, 25, 25, 0.7)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 14,
        height: 14,
        borderBottom: '2px solid rgba(230, 25, 25, 0.7)',
        borderRight: '2px solid rgba(230, 25, 25, 0.7)',
      }} />

      {/* Top security pill */}
      {showBadge && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'rgba(8, 8, 8, 0.88)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(230, 25, 25, 0.5)',
          padding: '3px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.5625rem',
          letterSpacing: '0.12em',
          color: 'var(--phosphor)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        }}>
          <ShieldCheck size={11} color="var(--red-hi)" weight="bold" />
          <span>COVEN PROTECTED</span>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from 'react';
import { WatermarkOverlay } from './WatermarkOverlay';
import type { WatermarkStyle } from '../../services/vaultService';
import { ArrowsLeftRight, LockKey, Sparkle } from '@phosphor-icons/react';

interface SplitViewSliderProps {
  imageUrl: string;
  title: string;
  artistName?: string;
  artistTornId?: string;
  artworkId: string;
  watermarkStyle?: WatermarkStyle;
  isUnlocked?: boolean;
}

export function SplitViewSlider({
  imageUrl,
  title,
  artistName = 'COVEN_ARTIST',
  artistTornId = '994821',
  artworkId,
  watermarkStyle = 'MATRIX_GRID',
  isUnlocked = false,
}: SplitViewSliderProps) {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percent = Math.round((clampedX / rect.width) * 100);
    setSliderPos(percent);
  }, []);

  const onMouseDown = () => setIsDragging(true);
  const onTouchStart = () => setIsDragging(true);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      handleMove(e.touches[0].clientX);
    };

    const onMouseUp = () => setIsDragging(false);
    const onTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <div
      ref={containerRef}
      className="split-slider-container"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4/3',
        overflow: 'hidden',
        userSelect: 'none',
        background: 'var(--void)',
        cursor: isDragging ? 'ew-resize' : 'default',
      }}
      onClick={(e) => {
        // Direct jump click if not dragging
        if (!isDragging && containerRef.current) {
          handleMove(e.clientX);
        }
      }}
    >
      {/* ── UNDER LAYER: Full clean master image ── */}
      <img
        src={imageUrl}
        alt={`${title} - Master Asset`}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          filter: isUnlocked ? 'none' : 'contrast(1.05)',
        }}
      />

      {/* Clean asset badge on right side */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'rgba(8, 8, 8, 0.85)',
        backdropFilter: 'blur(6px)',
        border: '1px solid var(--term-green)',
        padding: '3px 8px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.5625rem',
        letterSpacing: '0.12em',
        color: 'var(--term-green)',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        pointerEvents: 'none',
        zIndex: 2,
      }}>
        <Sparkle size={11} weight="fill" />
        <span>MASTER ASSET {isUnlocked ? '[UNLOCKED]' : '[PREVIEW ONLY]'}</span>
      </div>

      {/* ── TOP LAYER: Clipped watermarked preview image ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${sliderPos}%`,
          height: '100%',
          overflow: 'hidden',
          borderRight: '2px solid var(--red)',
          zIndex: 3,
        }}
      >
        <img
          src={imageUrl}
          alt={`${title} - Watermarked Preview`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: containerRef.current ? containerRef.current.clientWidth : '100%',
            height: '100%',
            maxWidth: 'none',
            objectFit: 'cover',
            filter: 'contrast(0.95)',
          }}
        />

        {/* The Watermark Overlay on this left side */}
        <WatermarkOverlay
          style={watermarkStyle}
          artistName={artistName}
          artistTornId={artistTornId}
          artworkId={artworkId}
          opacity={0.4}
          showBadge={false}
        />

        {/* Protected badge on left side */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(8, 8, 8, 0.85)',
          backdropFilter: 'blur(6px)',
          border: '1px solid var(--red)',
          padding: '3px 8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.5625rem',
          letterSpacing: '0.12em',
          color: 'var(--red-hi)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          pointerEvents: 'none',
        }}>
          <LockKey size={11} weight="bold" />
          <span>PROTECTED PREVIEW</span>
        </div>
      </div>

      {/* ── DRAGGABLE DIVIDER HANDLE ── */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPos}%`,
          width: '32px',
          transform: 'translateX(-50%)',
          cursor: 'ew-resize',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          touchAction: 'none',
        }}
      >
        {/* Central Tactile Grip Badge */}
        <div style={{
          width: '28px',
          height: '44px',
          background: 'var(--void)',
          border: '1px solid var(--red)',
          boxShadow: '0 0 16px rgba(230, 25, 25, 0.4), 0 4px 12px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
        }}>
          <ArrowsLeftRight size={12} color="var(--phosphor)" weight="bold" />
          <div style={{ display: 'flex', gap: '2px' }}>
            <div style={{ width: '1px', height: '10px', background: 'var(--ghost)' }} />
            <div style={{ width: '1px', height: '10px', background: 'var(--ghost)' }} />
            <div style={{ width: '1px', height: '10px', background: 'var(--ghost)' }} />
          </div>
        </div>

        {/* Readout label below grip */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          background: 'rgba(8, 8, 8, 0.92)',
          border: '1px solid var(--seam)',
          padding: '2px 6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.5rem',
          color: 'var(--phosphor)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          {sliderPos}%
        </div>
      </div>

      {/* Preset snap buttons bar at bottom left */}
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: 8,
        display: 'flex',
        gap: '2px',
        zIndex: 12,
      }}>
        {[25, 50, 75].map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSliderPos(pct);
            }}
            style={{
              background: sliderPos === pct ? 'var(--red)' : 'rgba(15,15,15,0.85)',
              border: '1px solid var(--seam)',
              color: sliderPos === pct ? '#fff' : 'var(--ghost)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.5rem',
              padding: '2px 6px',
              cursor: 'pointer',
            }}
          >
            {pct}%
          </button>
        ))}
      </div>
    </div>
  );
}

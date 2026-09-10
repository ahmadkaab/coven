import { useMarketIndices } from '../../hooks/useMarketPulse';
import { formatTornCash } from '../../utils/format';
import { TrendUp, TrendDown, Broadcast } from '@phosphor-icons/react';

interface TickerTapeProps {
  showLiveDot?: boolean;
}

export function TickerTape({ showLiveDot = true }: TickerTapeProps) {
  const { indices } = useMarketIndices();

  return (
    <div
      className="ticker-tape-container"
      style={{
        background: 'var(--pit)',
        borderTop: '1px solid var(--seam)',
        borderBottom: '1px solid var(--seam)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        display: 'flex',
        alignItems: 'center',
        padding: '6px 16px',
        gap: '24px',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {/* Live Terminal Status Tag */}
      {showLiveDot && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--term-green)',
              boxShadow: '0 0 8px var(--term-green)',
              display: 'inline-block',
            }}
          />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5625rem',
            color: 'var(--phosphor)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            TORN MARKET PULSE
          </span>
        </div>
      )}

      {/* Index Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
        {indices.map((idx) => (
          <div
            key={idx.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
            }}
          >
            <span style={{ color: 'var(--ghost)', letterSpacing: '0.05em' }}>
              {idx.code}
            </span>
            <span style={{ color: 'var(--phosphor)', fontWeight: 600 }}>
              {formatTornCash(idx.currentValue)}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                color: idx.isPositive ? 'var(--term-green)' : 'var(--red-hi)',
                fontSize: '0.5625rem',
              }}
            >
              {idx.isPositive ? <TrendUp size={11} weight="bold" /> : <TrendDown size={11} weight="bold" />}
              {idx.isPositive ? `+${idx.change24h}%` : `${idx.change24h}%`}
            </span>
            <span style={{ color: 'var(--seam)', marginLeft: '8px' }}>|</span>
          </div>
        ))}
      </div>
    </div>
  );
}

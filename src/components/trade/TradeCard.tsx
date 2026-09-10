import { Link } from 'react-router-dom';
import { ArrowsLeftRight, CheckCircle, LockKey, CurrencyDollar, ArrowRight, Clock } from '@phosphor-icons/react';
import type { TradeOffer } from '../../types/trade';

interface TradeCardProps {
  trade: TradeOffer;
  onSelect?: (trade: TradeOffer) => void;
}

export function TradeCard({ trade, onSelect }: TradeCardProps) {
  const getStatusColor = (status: TradeOffer['status']) => {
    switch (status) {
      case 'OPEN': return 'var(--term-green)';
      case 'LOCKED': return '#fbbf24';
      case 'ACCEPTED': return '#818cf8';
      case 'SETTLED': return 'var(--term-green)';
      case 'COUNTERED': return '#f59e0b';
      case 'DECLINED': return 'var(--red)';
      default: return 'var(--ghost)';
    }
  };

  const initAsset = trade.initiatorSide.offeredAssets[0];
  const targetAsset = trade.targetSide.offeredAssets[0];

  return (
    <div
      className="card-industrial"
      style={{
        background: 'var(--void)',
        border: '1px solid var(--wire)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        position: 'relative',
        transition: 'border-color 0.2s, transform 0.2s',
      }}
    >
      {/* Top Meta Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: 'var(--pit)',
              border: `1px solid ${getStatusColor(trade.status)}`,
              color: getStatusColor(trade.status),
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '2px',
              letterSpacing: '0.08em',
            }}
          >
            {trade.status === 'SETTLED' ? '✓ SETTLED CONTRACT' : trade.status}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)' }}>
            {trade.escrowContractId}
          </span>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            color: 'var(--ghost)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Clock size={12} />
          {new Date(trade.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.0625rem',
          margin: '0 0 12px 0',
          color: 'var(--chalk)',
          letterSpacing: '0.02em',
          lineHeight: 1.25,
        }}
      >
        {trade.title}
      </h3>

      {/* Dual Swap Comparison Box */}
      <div
        style={{
          background: 'var(--pit)',
          border: '1px solid var(--wire)',
          borderRadius: '2px',
          padding: '12px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '14px',
        }}
      >
        {/* Side A: Initiator */}
        <div style={{ textAlign: 'left', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--term-green)',
                fontWeight: 700,
              }}
            >
              {trade.initiatorSide.party.username}
            </span>
            {trade.initiatorSide.party.factionTag && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5625rem',
                  color: 'var(--ghost)',
                  background: 'var(--void)',
                  padding: '1px 4px',
                }}
              >
                [{trade.initiatorSide.party.factionTag}]
              </span>
            )}
          </div>

          {initAsset ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src={initAsset.imageUrl}
                alt={initAsset.title}
                style={{
                  width: '42px',
                  height: '42px',
                  objectFit: 'cover',
                  borderRadius: '2px',
                  border: '1px solid var(--wire)',
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--chalk)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {initAsset.title}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)' }}>
                  {initAsset.edition}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
              (Pure Cash Offer)
            </div>
          )}

          {trade.initiatorSide.cashSweetener > 0 && (
            <div
              style={{
                marginTop: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--term-green)',
                fontWeight: 700,
              }}
            >
              +${(trade.initiatorSide.cashSweetener / 1_000_000).toFixed(1)}M CASH
            </div>
          )}
        </div>

        {/* Swap Icon */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--void)',
            border: '1px solid var(--wire)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--phosphor)',
            flexShrink: 0,
          }}
        >
          <ArrowsLeftRight size={16} weight="bold" />
        </div>

        {/* Side B: Target */}
        <div style={{ textAlign: 'right', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginBottom: '6px' }}>
            {trade.targetSide.party.factionTag && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5625rem',
                  color: 'var(--ghost)',
                  background: 'var(--void)',
                  padding: '1px 4px',
                }}
              >
                [{trade.targetSide.party.factionTag}]
              </span>
            )}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: '#818cf8',
                fontWeight: 700,
              }}
            >
              {trade.targetSide.party.username}
            </span>
          </div>

          {targetAsset ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--chalk)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {targetAsset.title}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)' }}>
                  {targetAsset.edition}
                </div>
              </div>
              <img
                src={targetAsset.imageUrl}
                alt={targetAsset.title}
                style={{
                  width: '42px',
                  height: '42px',
                  objectFit: 'cover',
                  borderRadius: '2px',
                  border: '1px solid var(--wire)',
                  flexShrink: 0,
                }}
              />
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
              (Pure Cash Request)
            </div>
          )}

          {trade.targetSide.cashSweetener > 0 && (
            <div
              style={{
                marginTop: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--term-green)',
                fontWeight: 700,
              }}
            >
              +${(trade.targetSide.cashSweetener / 1_000_000).toFixed(1)}M CASH
            </div>
          )}
        </div>
      </div>

      {/* Tags Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
        {trade.tags.map((tag) => (
          <span
            key={tag}
            style={{
              background: 'var(--pit)',
              border: '1px solid var(--wire)',
              fontSize: '0.5625rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--ghost)',
              padding: '2px 6px',
              borderRadius: '2px',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer CTA */}
      <div style={{ marginTop: 'auto' }}>
        {onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(trade)}
            className="btn btn-industrial"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '0.6875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>INSPECT TRADE CONTRACT</span>
            <ArrowRight size={12} weight="bold" />
          </button>
        ) : (
          <Link
            to={`/trade/${trade.id}`}
            className="btn btn-industrial"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '0.6875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              textDecoration: 'none',
            }}
          >
            <span>INSPECT TRADE CONTRACT</span>
            <ArrowRight size={12} weight="bold" />
          </Link>
        )}
      </div>
    </div>
  );
}

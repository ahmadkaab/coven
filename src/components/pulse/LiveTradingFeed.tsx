import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useTradingTape } from '../../hooks/useMarketPulse';
import { formatTornCash, timeAgo } from '../../utils/format';
import type { TradeEventType } from '../../services/marketPulseService';
import {
  CurrencyCircleDollar, Lightning, Handshake, Star, Play, Pause, Broadcast
} from '@phosphor-icons/react';

function getEventBadge(type: TradeEventType) {
  switch (type) {
    case 'SALE':
      return {
        label: 'SALE',
        color: 'var(--term-green)',
        bg: 'rgba(0, 255, 100, 0.08)',
        border: 'var(--term-green)',
        icon: <CurrencyCircleDollar size={11} weight="bold" />,
      };
    case 'OUTBID':
      return {
        label: 'OUTBID',
        color: 'var(--red-hi)',
        bg: 'rgba(230, 25, 25, 0.08)',
        border: 'var(--red)',
        icon: <Lightning size={11} weight="fill" />,
      };
    case 'COMMISSION_ESCROW':
      return {
        label: 'ESCROW',
        color: 'var(--phosphor)',
        bg: 'rgba(255, 255, 255, 0.08)',
        border: 'var(--ghost)',
        icon: <Handshake size={11} weight="bold" />,
      };
    case 'VOUCH_RECORDED':
      return {
        label: 'VOUCH',
        color: 'var(--amber)',
        bg: 'rgba(255, 180, 0, 0.08)',
        border: 'var(--amber)',
        icon: <Star size={11} weight="fill" />,
      };
    default:
      return {
        label: 'TRADE',
        color: 'var(--ghost)',
        bg: 'var(--plate)',
        border: 'var(--seam)',
        icon: <CurrencyCircleDollar size={11} />,
      };
  }
}

export function LiveTradingFeed() {
  const reduce = useReducedMotion();
  const [isLive, setIsLive] = useState<boolean>(true);
  const { events } = useTradingTape(8, isLive);

  return (
    <div style={{ background: 'var(--plate)', border: '1px solid var(--seam)' }}>
      {/* Header */}
      <div style={{
        padding: 'var(--sp-4) var(--sp-5)',
        borderBottom: '1px solid var(--seam)',
        background: 'var(--pit)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Broadcast size={14} color={isLive ? 'var(--term-green)' : 'var(--ghost)'} weight="bold" />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--phosphor)',
          }}>
            LIVE TORN ART TRANSACTION TAPE
          </span>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isLive ? 'var(--term-green)' : 'var(--dead)',
            display: 'inline-block',
          }} />
        </div>

        <button
          type="button"
          onClick={() => setIsLive(!isLive)}
          className="btn btn-sm btn-ghost"
          style={{ padding: '2px 8px', fontSize: '0.5625rem' }}
          title={isLive ? 'Pause real-time stream' : 'Resume real-time stream'}
        >
          {isLive ? <><Pause size={10} /> PAUSE</> : <><Play size={10} /> RESUME</>}
        </button>
      </div>

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--seam)' }}>
        {events.length === 0 ? (
          <div style={{ padding: 'var(--sp-8)', textAlign: 'center', background: 'var(--pit)' }}>
            <Broadcast size={28} color="var(--ghost)" style={{ marginBottom: '8px' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--chalk)', marginBottom: '4px' }}>
              NO TRANSACTION TELEMETRY RECORDED
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)' }}>
              Completed escrow trades and auction settlements will stream live to this tape.
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((evt) => {
            const badge = getEventBadge(evt.type);
            return (
              <motion.div
                key={evt.id}
                initial={reduce ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
                style={{
                  background: 'var(--pit)',
                  padding: 'var(--sp-3) var(--sp-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--sp-3)',
                  flexWrap: 'wrap',
                }}
              >
                {/* Left info: Badge + Title + Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px', flex: '1 1 240px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5rem',
                    color: badge.color,
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    padding: '2px 6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {badge.icon}
                    {badge.label}
                  </span>

                  <div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--phosphor)',
                      fontWeight: 600,
                    }}>
                      {evt.title}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.5625rem',
                      color: 'var(--ghost)',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      marginTop: '2px',
                    }}>
                      <span>Artist: <strong style={{ color: 'var(--phosphor)' }}>{evt.artistName}</strong></span>
                      <span>•</span>
                      <span>
                        Buyer: {evt.counterpartyName} <span style={{ color: 'var(--shadow-type)' }}>[#{evt.counterpartyTornId}]</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right info: Faction + Amount + Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'right' }}>
                  {evt.factionTag && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.5625rem',
                      color: 'var(--ghost)',
                      background: 'var(--void)',
                      border: '1px solid var(--seam)',
                      padding: '2px 6px',
                    }}>
                      [{evt.factionTag}]
                    </span>
                  )}

                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.875rem',
                      color: 'var(--phosphor)',
                      letterSpacing: '-0.02em',
                    }}>
                      {formatTornCash(evt.amountTorn)}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.5rem',
                      color: 'var(--shadow-type)',
                    }}>
                      {evt.dpEquivalent} DP • {timeAgo(evt.timestamp)}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
      </div>
    </div>
  );
}

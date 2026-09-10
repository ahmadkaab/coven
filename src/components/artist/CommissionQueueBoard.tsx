import React from 'react';
import type { QueueSlot, StudioStatus } from '../../services/studioService';
import { Clock, ShieldCheck, User, Sparkle, ArrowRight, CheckCircle } from '@phosphor-icons/react';

interface CommissionQueueBoardProps {
  queueSlots: QueueSlot[];
  studioStatus: StudioStatus;
  turnaroundDays?: number;
  onRequestCommission: () => void;
}

export function CommissionQueueBoard({
  queueSlots,
  studioStatus,
  turnaroundDays = 3,
  onRequestCommission,
}: CommissionQueueBoardProps) {
  const openSlots = queueSlots.filter((s) => s.status === 'open');
  const inProgressSlots = queueSlots.filter((s) => s.status === 'in_progress' || s.status === 'review');

  const getStatusBadge = (status: QueueSlot['status']) => {
    switch (status) {
      case 'open':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: 'var(--term-green)',
              background: 'rgba(0, 255, 100, 0.08)',
              border: '1px solid rgba(0, 255, 100, 0.3)',
              padding: '2px 8px',
              letterSpacing: '0.08em',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--term-green)', display: 'inline-block' }} />
            OPEN SLOT
          </span>
        );
      case 'in_progress':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: 'var(--red)',
              background: 'rgba(230, 25, 25, 0.1)',
              border: '1px solid rgba(230, 25, 25, 0.35)',
              padding: '2px 8px',
              letterSpacing: '0.08em',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
            IN PRODUCTION
          </span>
        );
      case 'review':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: 'var(--amber, #f59e0b)',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              padding: '2px 8px',
              letterSpacing: '0.08em',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber, #f59e0b)', display: 'inline-block' }} />
            CLIENT REVIEW
          </span>
        );
      case 'completed':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: 'var(--ghost)',
              background: 'var(--hull)',
              border: '1px solid var(--seam)',
              padding: '2px 8px',
              letterSpacing: '0.08em',
            }}
          >
            COMPLETED
          </span>
        );
    }
  };

  return (
    <div
      style={{
        background: 'var(--pit)',
        border: '1px solid var(--hull)',
        borderTop: '3px solid var(--red)',
        padding: 'var(--sp-6)',
      }}
    >
      {/* Board Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--sp-4)',
          borderBottom: '1px solid var(--seam)',
          paddingBottom: 'var(--sp-4)',
          marginBottom: 'var(--sp-5)',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: 'var(--shadow-type)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkle size={12} weight="fill" color="var(--red)" />
            LIVE ARTIST WORKROOM
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              color: 'var(--phosphor)',
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              marginTop: '2px',
              marginRight: '12px',
            }}
          >
            COMMISSION QUEUE
          </h3>
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              padding: '4px 10px',
              background: studioStatus === 'open' ? 'rgba(0, 255, 100, 0.08)' : 'rgba(230, 25, 25, 0.1)',
              border: `1px solid ${studioStatus === 'open' ? 'rgba(0, 255, 100, 0.3)' : 'rgba(230, 25, 25, 0.3)'}`,
              color: studioStatus === 'open' ? 'var(--term-green)' : 'var(--red)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: studioStatus === 'open' ? 'var(--term-green)' : 'var(--red)',
                boxShadow: studioStatus === 'open' ? '0 0 8px var(--term-green)' : '0 0 8px var(--red)',
              }}
            />
            {studioStatus === 'open' ? `${openSlots.length} SLOTS OPEN` : studioStatus.toUpperCase()}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--ghost)',
              padding: '4px 10px',
              background: 'var(--plate)',
              border: '1px solid var(--hull)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={12} weight="bold" />
            SLA: ~{turnaroundDays} DAYS
          </div>
        </div>
      </div>

      {/* Queue Slots List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {queueSlots.map((slot) => {
          const isOpen = slot.status === 'open';

          return (
            <div
              key={slot.id}
              style={{
                background: isOpen ? 'rgba(255, 255, 255, 0.015)' : 'var(--plate)',
                border: isOpen ? '1px dashed var(--hull)' : '1px solid var(--hull)',
                borderLeft: isOpen ? '3px solid var(--term-green)' : '3px solid var(--red)',
                padding: 'var(--sp-4)',
                display: 'grid',
                gridTemplateColumns: '80px 1fr auto',
                alignItems: 'center',
                gap: 'var(--sp-4)',
                transition: 'border-color 0.2s ease',
              }}
            >
              {/* Slot Index */}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.125rem',
                    letterSpacing: '-0.02em',
                    color: isOpen ? 'var(--ghost)' : 'var(--phosphor)',
                  }}
                >
                  SLOT #{slot.slotNumber}
                </div>
                <div style={{ marginTop: '4px' }}>{getStatusBadge(slot.status)}</div>
              </div>

              {/* Slot Content */}
              <div>
                {isOpen ? (
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8125rem',
                        color: 'var(--phosphor)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      Available for Custom Production
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.625rem',
                        color: 'var(--shadow-type)',
                        marginTop: '2px',
                      }}
                    >
                      Avatars • Forum Signatures • War Standards • BBCode Layouts
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 'var(--sp-2)',
                        marginBottom: '4px',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: 'var(--phosphor)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {slot.projectTitle || 'Commissioned Custom Artwork'}
                      </div>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6875rem',
                          color: 'var(--red)',
                          fontWeight: 700,
                        }}
                      >
                        {slot.progressPct ?? 50}%
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        background: 'var(--void)',
                        border: '1px solid var(--hull)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${slot.progressPct ?? 50}%`,
                          height: '100%',
                          background: slot.status === 'review' ? 'var(--amber, #f59e0b)' : 'var(--red)',
                          transition: 'width 0.4s ease',
                          boxShadow: '0 0 6px rgba(230, 25, 25, 0.4)',
                        }}
                      />
                    </div>

                    {/* Meta info */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--sp-3)',
                        marginTop: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.625rem',
                        color: 'var(--shadow-type)',
                      }}
                    >
                      {slot.clientUsername && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ghost)' }}>
                          <User size={10} weight="bold" />
                          Client: {slot.clientUsername} {slot.clientTornId ? `[${slot.clientTornId}]` : ''}
                        </span>
                      )}
                      {slot.estimatedCompletion && (
                        <span>ETA: {slot.estimatedCompletion}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Slot Action */}
              <div>
                {isOpen ? (
                  <button
                    type="button"
                    onClick={onRequestCommission}
                    className="btn btn-primary btn-sm"
                    style={{
                      borderRadius: 0,
                      padding: '6px 12px',
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    CLAIM SLOT <ArrowRight size={10} weight="bold" />
                  </button>
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      color: 'var(--shadow-type)',
                      padding: '4px 8px',
                      background: 'var(--void)',
                      border: '1px solid var(--hull)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    IN QUEUE
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Board Footer Guarantee */}
      <div
        style={{
          marginTop: 'var(--sp-5)',
          paddingTop: 'var(--sp-4)',
          borderTop: '1px solid var(--seam)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--sp-3)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.625rem',
          color: 'var(--shadow-type)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="var(--term-green)" weight="bold" />
          <span>Torn API Log Escrow & Verification Enabled</span>
        </div>
        <div style={{ color: 'var(--ghost)' }}>
          {openSlots.length} of {queueSlots.length} slots available
        </div>
      </div>
    </div>
  );
}

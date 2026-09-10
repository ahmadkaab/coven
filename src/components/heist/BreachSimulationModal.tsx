import { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Lightning,
  Crosshair,
  Skull,
  Trophy,
  CurrencyDollar,
  Play,
} from '@phosphor-icons/react';
import { executeHeist, calculateHeistOdds } from '../../services/heistService';
import { useToast } from '../../context/ToastContext';
import { formatTornCash } from '../../utils/format';
import type { HeistTarget, HeistCrewMember, HeistOperation, HeistStageResult } from '../../types/heist';

interface BreachSimulationModalProps {
  target: HeistTarget;
  crew: HeistCrewMember[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (operation: HeistOperation) => void;
}

export function BreachSimulationModal({
  target,
  crew,
  isOpen,
  onClose,
  onComplete,
}: BreachSimulationModalProps) {
  const { addToast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [stageResults, setStageResults] = useState<HeistStageResult[]>([]);
  const [finalOp, setFinalOp] = useState<HeistOperation | null>(null);

  if (!isOpen) return null;

  const odds = calculateHeistOdds(target, crew);

  const startHeist = () => {
    setIsRunning(true);
    setCurrentStageIndex(0);
    setStageResults([]);
    setFinalOp(null);

    // Run the operation in backend
    const op = executeHeist(target, crew);

    // Animate the 4 stages with delays
    op.stages.forEach((stage, idx) => {
      setTimeout(() => {
        setCurrentStageIndex(idx);
        setStageResults((prev) => [...prev, stage]);

        if (idx === op.stages.length - 1) {
          setTimeout(() => {
            setFinalOp(op);
            setIsRunning(false);
            if (op.status === 'SUCCESS') {
              addToast(`Heist Successful! Secured ${op.lootedArtworkTitle}!`, 'success');
            } else {
              addToast(`Operation compromised at ${stage.stageName}!`, 'error');
            }
            if (onComplete) onComplete(op);
          }, 800);
        }
      }, (idx + 1) * 1100);
    });
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-4)',
      }}
      onClick={() => {
        if (!isRunning) onClose();
      }}
    >
      <div
        className="card-industrial"
        style={{
          width: '100%',
          maxWidth: '720px',
          background: 'var(--void)',
          border: `1px solid ${finalOp?.status === 'SUCCESS' ? 'var(--term-green)' : 'var(--red)'}`,
          boxShadow: `0 0 45px ${finalOp?.status === 'SUCCESS' ? 'rgba(16,185,129,0.25)' : 'rgba(225,29,72,0.25)'}`,
          position: 'relative',
          padding: 'var(--sp-6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {!isRunning && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              color: 'var(--ghost)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--sp-5)' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '2px',
              background: 'rgba(225,29,72,0.15)',
              border: '1px solid var(--red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--red)',
            }}
          >
            <Crosshair size={24} weight="bold" />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--red)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              [ TACTICAL INFILTRATION SIMULATOR // TORN CRIME 2.0 ]
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.375rem',
                margin: 0,
                color: 'var(--chalk)',
                letterSpacing: '0.03em',
              }}
            >
              TARGET: {target.targetName.toUpperCase()}
            </h3>
          </div>
        </div>

        {/* Target & Target Asset Info */}
        <div
          style={{
            background: 'var(--pit)',
            border: '1px solid var(--wire)',
            padding: '12px',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: 'var(--sp-5)',
          }}
        >
          <img
            src={target.targetArtwork.imageUrl}
            alt={target.targetArtwork.title}
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'cover',
              borderRadius: '2px',
              border: '1px solid var(--wire)',
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)' }}>
              PRIMARY LOOT OBJECTIVE
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--chalk)' }}>
              {target.targetArtwork.title}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--term-green)', fontWeight: 700 }}>
              VALUATION: ${formatTornCash(target.targetArtwork.estimatedValue)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)' }}>
              SECURITY RATING
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--red)', fontWeight: 700 }}>
              LEVEL {target.securityLevel} [{target.difficulty}]
            </div>
          </div>
        </div>

        {/* Crew Roster Bar */}
        <div style={{ marginBottom: 'var(--sp-5)' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--ghost)',
              letterSpacing: '0.1em',
              marginBottom: '8px',
            }}
          >
            ACTIVE SPECIALIST CREW ({crew.length} OPERATIVES):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            {crew.map((c) => (
              <div
                key={c.id}
                style={{
                  background: 'var(--pit)',
                  border: '1px solid var(--wire)',
                  padding: '8px',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <img
                  src={c.avatarUrl}
                  alt={c.name}
                  style={{ width: '28px', height: '28px', borderRadius: '2px', objectFit: 'cover' }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--chalk)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {c.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)' }}>
                    {c.role} ({c.skill}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Stages Simulation Stream */}
        {currentStageIndex >= 0 && (
          <div style={{ marginBottom: 'var(--sp-5)' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--term-green)',
                letterSpacing: '0.1em',
                marginBottom: '8px',
              }}
            >
              BREACH TELEMETRY STREAM:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stageResults.map((s) => (
                <div
                  key={s.stage}
                  style={{
                    background: s.success ? 'rgba(16,185,129,0.1)' : 'rgba(225,29,72,0.1)',
                    border: `1px solid ${s.success ? 'var(--term-green)' : 'var(--red)'}`,
                    padding: '10px 14px',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {s.success ? (
                        <CheckCircle size={16} weight="fill" color="var(--term-green)" />
                      ) : (
                        <XCircle size={16} weight="fill" color="var(--red)" />
                      )}
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--chalk)',
                        }}
                      >
                        {s.stageName}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        color: 'var(--ghost)',
                        marginTop: '2px',
                      }}
                    >
                      {s.log}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        color: s.success ? 'var(--term-green)' : 'var(--red)',
                        fontWeight: 700,
                      }}
                    >
                      ROLL: {s.diceRoll} (REQ: {s.requiredRoll})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Resolution Card */}
        {finalOp && (
          <div
            style={{
              padding: '16px',
              borderRadius: '2px',
              background: finalOp.status === 'SUCCESS' ? 'rgba(16,185,129,0.15)' : 'rgba(225,29,72,0.15)',
              border: `1px solid ${finalOp.status === 'SUCCESS' ? 'var(--term-green)' : 'var(--red)'}`,
              marginBottom: 'var(--sp-5)',
              textAlign: 'center',
            }}
          >
            {finalOp.status === 'SUCCESS' ? (
              <div>
                <Trophy size={40} color="var(--term-green)" weight="fill" style={{ marginBottom: '8px' }} />
                <h4
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    color: 'var(--term-green)',
                    margin: '0 0 4px 0',
                  }}
                >
                  OPERATION SUCCESSFUL // LOOT EXTRACTED
                </h4>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--chalk)', marginBottom: '8px' }}>
                  Looted: <strong style={{ color: 'var(--term-green)' }}>{finalOp.lootedArtworkTitle}</strong> +{' '}
                  <strong style={{ color: 'var(--term-green)' }}>${finalOp.lootCash.toLocaleString()} Cash</strong>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                  SYNDICATE REPUTATION GAINED: +{finalOp.respectGained} RESPECT
                </div>
              </div>
            ) : (
              <div>
                <Skull size={40} color="var(--red)" weight="fill" style={{ marginBottom: '8px' }} />
                <h4
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    color: 'var(--red)',
                    margin: '0 0 4px 0',
                  }}
                >
                  OPERATION COMPROMISED // CREW EVACUATED
                </h4>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--chalk)', marginBottom: '4px' }}>
                  Intrusion triggered facility lockdowns.
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--red)' }}>
                  SECURITY BOUNTY FINE: -${finalOp.bountyFine.toLocaleString()} TORN CASH
                </div>
              </div>
            )}
          </div>
        )}

        {/* Launch / Action Area */}
        <div>
          {!isRunning && !finalOp ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)' }}>
                  CALCULATED INFILTRATION CHANCE
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.375rem',
                    fontWeight: 700,
                    color: odds >= 60 ? 'var(--term-green)' : odds >= 40 ? '#fbbf24' : 'var(--red)',
                  }}
                >
                  {odds}% SUCCESS ODDS
                </div>
              </div>

              <button
                type="button"
                onClick={startHeist}
                className="btn btn-industrial"
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'var(--red)',
                  borderColor: 'var(--red)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  letterSpacing: '0.1em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Play size={16} weight="fill" />
                <span>EXECUTE HEIST BREACH</span>
              </button>
            </div>
          ) : finalOp ? (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-industrial"
              style={{
                width: '100%',
                padding: '12px',
                fontWeight: 700,
                fontSize: '0.8125rem',
              }}
            >
              CLOSE TACTICAL DEBRIEF
            </button>
          ) : (
            <div
              style={{
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--term-green)',
                padding: '12px',
              }}
            >
              INFILTRATION OPERATION IN PROGRESS...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

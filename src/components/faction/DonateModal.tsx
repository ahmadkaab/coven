import { useState } from 'react';
import { X, CurrencyDollar, ShieldCheck, CheckCircle } from '@phosphor-icons/react';
import { donateToTreasury } from '../../services/factionService';
import { useToast } from '../../context/ToastContext';
import type { FactionProfile } from '../../types/faction';

interface DonateModalProps {
  faction: FactionProfile;
  isOpen: boolean;
  onClose: () => void;
  onDonationComplete?: (newBalance: number) => void;
}

const PRESETS = [1_000_000, 5_000_000, 10_000_000, 25_000_000];

export function DonateModal({
  faction,
  isOpen,
  onClose,
  onDonationComplete,
}: DonateModalProps) {
  const { addToast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<number>(5_000_000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAmount = customAmount
    ? parseInt(customAmount.replace(/[^0-9]/g, ''), 10) || 0
    : selectedPreset;

  const handlePresetSelect = (amt: number) => {
    setSelectedPreset(amt);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(clean ? parseInt(clean, 10).toLocaleString() : '');
  };

  const handleDonate = () => {
    if (currentAmount <= 0) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const result = donateToTreasury(
        faction.id,
        currentAmount,
        'SINTEX', // Current authenticated persona
        2190421,
        note || 'Syndicate Art Vault pledge'
      );

      setIsSubmitting(false);

      if (result.success) {
        setSuccessMsg(
          `Successfully allocated $${currentAmount.toLocaleString()} to ${faction.name} Art Escrow!`
        );
        addToast(
          `+$${(currentAmount / 1_000_000).toFixed(1)}M logged to ${faction.tag} Treasury`,
          'success'
        );
        if (onDonationComplete) onDonationComplete(result.newBalance);

        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 1400);
      }
    }, 600);
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-4)',
      }}
      onClick={onClose}
    >
      <div
        className="card-industrial"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--void)',
          border: `1px solid ${faction.accentColor || 'var(--red)'}`,
          boxShadow: `0 0 35px ${faction.accentColor}33`,
          position: 'relative',
          padding: 'var(--sp-6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
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

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--sp-4)' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '2px',
              background: `${faction.accentColor}22`,
              border: `1px solid ${faction.accentColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: faction.accentColor,
            }}
          >
            <CurrencyDollar size={24} weight="bold" />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: faction.accentColor,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              [ FACTION ART TREASURY ESCROW ]
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                letterSpacing: '0.04em',
                margin: 0,
                color: 'var(--chalk)',
              }}
            >
              FUND {faction.name.toUpperCase()}
            </h3>
          </div>
        </div>

        {successMsg ? (
          <div
            style={{
              padding: 'var(--sp-8) var(--sp-4)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <CheckCircle size={48} weight="fill" color="var(--term-green)" />
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--term-green)',
                fontSize: '0.875rem',
                letterSpacing: '0.05em',
              }}
            >
              {successMsg}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ghost)' }}>
              Updating syndicate ledger records...
            </div>
          </div>
        ) : (
          <>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--ghost)',
                lineHeight: 1.5,
                marginBottom: 'var(--sp-4)',
              }}
            >
              Pooled funds are locked into COVEN escrow and exclusively allocated
              toward faction war banners, custom signature suites, and verified artist bounties.
            </p>

            {/* Current Balance Display */}
            <div
              style={{
                background: 'var(--pit)',
                border: '1px solid var(--wire)',
                padding: '12px 16px',
                borderRadius: '2px',
                marginBottom: 'var(--sp-5)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ghost)' }}>
                CURRENT VAULT BALANCE
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--term-green)',
                }}
              >
                ${(faction.treasuryBalance / 1_000_000).toFixed(2)}M
              </span>
            </div>

            {/* Presets */}
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--ghost)',
                  marginBottom: '8px',
                  letterSpacing: '0.08em',
                }}
              >
                SELECT CONTRIBUTION TIER
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {PRESETS.map((amt) => {
                  const isSelected = selectedPreset === amt && !customAmount;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handlePresetSelect(amt)}
                      style={{
                        padding: '10px 4px',
                        background: isSelected ? faction.accentColor : 'var(--pit)',
                        color: isSelected ? '#fff' : 'var(--phosphor)',
                        border: `1px solid ${isSelected ? faction.accentColor : 'var(--wire)'}`,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8125rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        borderRadius: '2px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      ${amt >= 1_000_000 ? `${amt / 1_000_000}M` : `${amt / 1_000}k`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount */}
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--ghost)',
                  marginBottom: '6px',
                  letterSpacing: '0.08em',
                }}
              >
                OR CUSTOM AMOUNT ($ TORN CASH)
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--ghost)',
                  }}
                >
                  $
                </span>
                <input
                  type="text"
                  placeholder="e.g. 15,000,000"
                  value={customAmount}
                  onChange={handleCustomChange}
                  style={{
                    width: '100%',
                    background: 'var(--pit)',
                    border: '1px solid var(--wire)',
                    padding: '10px 12px 10px 28px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--chalk)',
                    fontSize: '0.875rem',
                    borderRadius: '2px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Note Input */}
            <div style={{ marginBottom: 'var(--sp-6)' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--ghost)',
                  marginBottom: '6px',
                  letterSpacing: '0.08em',
                }}
              >
                MEMO / PURPOSE (OPTIONAL)
              </label>
              <input
                type="text"
                placeholder="e.g. Territory War banner commission pool"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--pit)',
                  border: '1px solid var(--wire)',
                  padding: '10px 12px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--chalk)',
                  fontSize: '0.8125rem',
                  borderRadius: '2px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Security Guarantee */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: 'var(--sp-5)',
                color: 'var(--ghost)',
                fontSize: '0.75rem',
              }}
            >
              <ShieldCheck size={16} color="var(--term-green)" />
              <span>COVEN Escrow Protection: Verified Torn API Transaction Record</span>
            </div>

            {/* Submit Action */}
            <button
              type="button"
              className="btn btn-industrial"
              disabled={isSubmitting || currentAmount <= 0}
              onClick={handleDonate}
              style={{
                width: '100%',
                padding: '12px',
                background: faction.accentColor || 'var(--red)',
                borderColor: faction.accentColor || 'var(--red)',
                color: '#fff',
                fontSize: '0.8125rem',
                letterSpacing: '0.1em',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <span>LOGGING ESCROW TRANSMISSION...</span>
              ) : (
                <span>
                  CONFIRM TRANSFER OF ${currentAmount.toLocaleString()}
                </span>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

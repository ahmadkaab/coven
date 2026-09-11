/* ================================================================
   COVEN — Commission Ahmad Modal
   Bespoke order submission directly to ahmad_kaab [4295891].
   Allows clients to define category, brief, references, and budget
   with automated escrow lock and instant queue addition.
   ================================================================ */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X, PaintBrush, Sparkle, Lightning, ShieldCheck,
  Coins, ArrowUpRight, Check, WarningCircle
} from '@phosphor-icons/react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { getWallet, saveWallet, CR_PER_XANAX, convertCreditsToXanax } from '../../services/walletService';
import { createCommission } from '../../services/commissionService';
import { AHMAD_SOVEREIGN_ARTIST } from '../../services/artistService';

interface CommissionAhmadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { id: 'banner', label: 'Faction War Banner', minCr: 5000, desc: 'High-impact 1920x1080 or custom propaganda artwork' },
  { id: 'scene', label: 'Profile Scene Backdrop', minCr: 8000, desc: 'Atmospheric scene tailored to your Torn profile' },
  { id: 'signature', label: 'Forum Signature (GIF/Static)', minCr: 4000, desc: '600x120 or 500x200 signature with custom typography' },
  { id: 'avatar', label: 'Cyber / Classical Avatar', minCr: 3000, desc: 'Square 200x200 character render with glowing frame' },
  { id: 'bespoke', label: 'Bespoke 3D / Fine Art', minCr: 10000, desc: 'One-of-one Michelangelo + Cyberpunk hybrid masterpiece' },
];

export function CommissionAhmadModal({ isOpen, onClose, onSuccess }: CommissionAhmadModalProps) {
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const userId = user ? String(user.player_id) : 'demo-collector';
  const tornId = user ? String(user.player_id) : '4295891';
  const wallet = getWallet(userId, tornId);

  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [budgetCr, setBudgetCr] = useState<number>(CATEGORIES[0].minCr);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedCat = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];
  const budgetXan = convertCreditsToXanax(budgetCr);
  const hasSufficientBalance = wallet.balance_cr >= budgetCr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      addToast({ type: 'error', title: 'Missing Information', message: 'Please provide a title and creative brief.' });
      return;
    }

    if (!hasSufficientBalance) {
      addToast({
        type: 'error',
        title: 'Insufficient Escrow Balance',
        message: `You need ${budgetCr.toLocaleString()} CR. Current balance: ${wallet.balance_cr.toLocaleString()} CR.`,
      });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Lock credits in wallet
      wallet.balance_cr -= budgetCr;
      wallet.locked_cr += budgetCr;
      saveWallet(wallet);

      // 2. Create commission record
      await createCommission({
        artistId: AHMAD_SOVEREIGN_ARTIST.id,
        buyerUserId: user ? String(user.player_id) : userId,
        title: `[${selectedCat.label.toUpperCase()}] ${title.trim()}`,
        description: `${description.trim()}\n\n[Reference Links]: ${referenceUrl.trim() || 'None provided'}`,
        budgetTorn: budgetCr * 1000, // stored in Torn cash equivalent
      });

      addToast({
        type: 'success',
        title: 'Commission Brief Submitted',
        message: `Your order for "${title}" has been placed in Ahmad's Studio Queue! Escrow locked: ${budgetCr.toLocaleString()} CR.`,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Submission Failed', message: err.message || 'Could not place commission order.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1200,
      background: 'rgba(8, 10, 9, 0.88)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px'
    }}>
      <div
        className="renaissance-glass-panel"
        style={{
          width: '100%', maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto',
          padding: '20px 16px', position: 'relative'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff',
            borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          aria-label="Close modal"
        >
          <X size={18} weight="bold" />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '20px', paddingRight: '40px' }}>
          <div style={{
            fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)',
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px'
          }}>
            CUSTOM COMMISSION &bull; AHMAD KAAB [4295891]
          </div>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.25rem, 5vw, 1.6rem)', color: '#fff', margin: 0 }}>
            Commission Ahmad [4295891]
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
            Order custom artwork directly from Ahmad. Guaranteed turnaround, 100% money-back escrow protection, and high-resolution file delivery.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 1. Category Selector */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', display: 'block', marginBottom: '8px' }}>
              1. SELECT ARTWORK FORMAT
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '8px' }}>
              {CATEGORIES.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    setCategory(c.id);
                    if (budgetCr < c.minCr) setBudgetCr(c.minCr);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: category === c.id ? 'rgba(212, 175, 55, 0.12)' : 'rgba(244, 241, 234, 0.02)',
                    border: category === c.id ? '1px solid var(--antique-gold)' : '1px solid rgba(244, 241, 234, 0.08)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-cinzel)', color: category === c.id ? 'var(--antique-gold)' : '#fff', fontWeight: 600 }}>
                    {c.label}
                  </div>
                  <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', marginTop: '4px' }}>
                    From {c.minCr.toLocaleString()} CR
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Project Title */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', display: 'block', marginBottom: '6px' }}>
              2. PROJECT TITLE &bull; SPECS
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Monarch Syndicate War Banner (1920x1080)"
              className="input-industrial"
              style={{ width: '100%' }}
              required
            />
          </div>

          {/* 3. Creative Brief */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', display: 'block', marginBottom: '6px' }}>
              3. CREATIVE BRIEF &amp; AESTHETIC REQUIREMENTS
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your vision: theme, colors, character details, faction tags, text/slogans, or mood..."
              className="input-industrial"
              style={{ width: '100%', resize: 'vertical' }}
              required
            />
          </div>

          {/* 4. Reference URLs */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', display: 'block', marginBottom: '6px' }}>
              4. REFERENCE IMAGE LINKS (OPTIONAL)
            </label>
            <input
              type="url"
              value={referenceUrl}
              onChange={e => setReferenceUrl(e.target.value)}
              placeholder="https://imgur.com/your_reference_moodboard.jpg"
              className="input-industrial"
              style={{ width: '100%' }}
            />
          </div>

          {/* 5. Budget & Escrow Lock */}
          <div style={{
            background: 'rgba(244, 241, 234, 0.02)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '8px',
            padding: '18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)' }}>
                5. OFFERED ESCROW BUDGET
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
                Available in Wallet: <strong style={{ color: '#fff' }}>{wallet.balance_cr.toLocaleString()} CR</strong>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <input
                type="number"
                min={selectedCat.minCr}
                step={500}
                value={budgetCr}
                onChange={e => setBudgetCr(Number(e.target.value))}
                className="input-industrial"
                style={{ width: '140px', fontSize: '1.1rem', fontWeight: 700 }}
                required
              />
              <div>
                <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.15rem', color: 'var(--neon-magenta)', fontWeight: 700 }}>
                  = {budgetCr.toLocaleString()} CR
                </div>
                <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
                  ≈ {budgetXan}x Xanax (Zero Platform Commission)
                </div>
              </div>
            </div>

            {!hasSufficientBalance && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginTop: '12px', padding: '8px 12px', borderRadius: '4px',
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171', fontSize: '0.75rem'
              }}>
                <WarningCircle size={16} weight="bold" />
                <span>You need {(budgetCr - wallet.balance_cr).toLocaleString()} more CR.</span>
                <Link
                  to="/wallet"
                  onClick={onClose}
                  style={{ color: '#fff', textDecoration: 'underline', fontWeight: 600, marginLeft: 'auto' }}
                >
                  Deposit Xanax ↗
                </Link>
              </div>
            )}
          </div>

          {/* Submission CTA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-md btn-ghost"
              style={{ fontSize: '0.8125rem', minHeight: '44px', padding: '10px 18px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !hasSufficientBalance}
              className="renaissance-btn-primary"
              style={{
                padding: '12px 24px', fontSize: '0.8125rem',
                opacity: !hasSufficientBalance ? 0.5 : 1,
                minHeight: '44px'
              }}
            >
              {submitting ? 'Locking Escrow...' : 'Lock Escrow & Submit Brief ⚡'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

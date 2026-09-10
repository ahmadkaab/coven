import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, PaperPlaneRight, Warning, CheckCircle } from '@phosphor-icons/react';
import { createCommission } from '../../services/commissionService';
import { useAuthStore } from '../../store/authStore';
import type { Artist } from '../../types';

interface Props {
  artist: Artist;
  onClose: () => void;
}

const BUDGET_PRESETS = [
  { label: '$10k',  value: 10_000 },
  { label: '$25k',  value: 25_000 },
  { label: '$50k',  value: 50_000 },
  { label: '$100k', value: 100_000 },
  { label: '$250k', value: 250_000 },
  { label: 'Custom', value: 0 },
];

export function CommissionModal({ artist, onClose }: Props) {
  const { userId } = useAuthStore();

  const [title, setTitle]           = useState('');
  const [description, setDesc]      = useState('');
  const [budget, setBudget]         = useState<number>(0);
  const [customBudget, setCustom]   = useState('');
  const [deadline, setDeadline]     = useState('');
  const [useCustom, setUseCustom]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [done, setDone]             = useState(false);

  const effectiveBudget = useCustom
    ? parseInt(customBudget.replace(/\D/g, ''), 10) || 0
    : budget;

  const handleSubmit = async () => {
    if (!userId)            { setError('You must be logged in'); return; }
    if (!title.trim())      { setError('Add a title for your commission'); return; }
    if (!description.trim()){ setError('Describe what you need'); return; }
    if (!effectiveBudget)   { setError('Set a budget'); return; }

    setError(null);
    setSubmitting(true);
    try {
      await createCommission({
        artistId:     artist.id,
        buyerUserId:  userId,
        title:        title.trim(),
        description:  description.trim(),
        budgetTorn:   effectiveBudget,
        deadline:     deadline || undefined,
      });
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
        }}
      />

      {/* Panel */}
      <motion.div
        key="panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0,
          width: 'min(520px, 100vw)',
          background: 'var(--void)',
          borderLeft: '2px solid var(--red)',
          zIndex: 201,
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ padding: 'var(--sp-6)', borderBottom: '1px solid var(--seam)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--sp-1)' }}>
              [ COMMISSION REQUEST ]
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '-0.03em', color: 'var(--phosphor)', lineHeight: 0.9 }}>
              {artist.username}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', marginTop: '6px' }}>
              {artist.specialization} · {artist.tier?.toUpperCase()}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', color: 'var(--ghost)', cursor: 'pointer', padding: '4px', border: '1px solid var(--hull)', marginTop: '4px' }}
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {done ? (
          /* ── Success state ─────────────────────────────── */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-8)', textAlign: 'center' }}>
            <CheckCircle size={48} color="var(--term-green)" weight="fill" style={{ marginBottom: 'var(--sp-4)' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '-0.04em', color: 'var(--phosphor)', marginBottom: 'var(--sp-3)' }}>
              REQUEST SENT
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', lineHeight: 1.8, marginBottom: 'var(--sp-6)', maxWidth: 320 }}>
              {artist.username} has received your commission request. Track progress in your Dashboard.
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
              <a href="/dashboard" className="btn btn-primary">Open Dashboard</a>
              <button onClick={onClose} className="btn btn-ghost">Close</button>
            </div>
          </div>
        ) : (
          /* ── Form ───────────────────────────────────────── */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--seam)' }}>

            {/* Title */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-5) var(--sp-6)' }}>
              <label htmlFor="commission-title" className="form-label">Commission Title *</label>
              <input
                id="commission-title"
                className="form-input"
                type="text"
                placeholder="e.g. Faction banner for SYNDICATE X"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
              />
            </div>

            {/* Description */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-5) var(--sp-6)' }}>
              <label htmlFor="commission-desc" className="form-label">Description *</label>
              <textarea
                id="commission-desc"
                className="form-input"
                rows={5}
                placeholder={`Describe exactly what you need:\n• Style / vibe references\n• Colours, dimensions\n• Torn characters / faction details\n• Any text to include`}
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                style={{ resize: 'vertical', lineHeight: 1.8 }}
                maxLength={1000}
              />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--shadow-type)', marginTop: 'var(--sp-1)', textAlign: 'right' }}>
                {description.length}/1000
              </div>
            </div>

            {/* Budget */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-5) var(--sp-6)' }}>
              <div className="form-label">Budget (Torn Cash) *</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--seam)', marginBottom: 'var(--sp-3)' }}>
                {BUDGET_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      if (p.value === 0) { setUseCustom(true); setBudget(0); }
                      else { setUseCustom(false); setBudget(p.value); }
                    }}
                    style={{
                      padding: 'var(--sp-3)',
                      background: (!useCustom && budget === p.value) || (useCustom && p.value === 0) ? 'var(--void)' : 'var(--plate)',
                      fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: (!useCustom && budget === p.value) || (useCustom && p.value === 0) ? 'var(--phosphor)' : 'var(--ghost)',
                      borderBottom: (!useCustom && budget === p.value) || (useCustom && p.value === 0) ? '2px solid var(--red)' : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {useCustom && (
                <input
                  className="form-input"
                  type="number"
                  placeholder="Enter amount in Torn cash"
                  value={customBudget}
                  onChange={(e) => setCustom(e.target.value)}
                  min={1000}
                />
              )}
              {effectiveBudget > 0 && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--term-green)', marginTop: 'var(--sp-2)' }}>
                  Budget: ${effectiveBudget.toLocaleString()} Torn cash
                </div>
              )}
            </div>

            {/* Deadline */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-5) var(--sp-6)' }}>
              <label htmlFor="commission-deadline" className="form-label">Deadline (optional)</label>
              <input
                id="commission-deadline"
                className="form-input"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* How payment works */}
            <div style={{ background: 'var(--pit)', padding: 'var(--sp-5) var(--sp-6)', borderTop: '1px solid var(--seam)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--shadow-type)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>
                [ HOW PAYMENT WORKS ]
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)', lineHeight: 2 }}>
                1. Artist accepts → you both agree on final terms<br />
                2. Send payment via Torn cash transfer<br />
                3. Paste the Torn transaction ID to verify payment<br />
                4. Artist delivers → mark complete → leave review<br />
                <span style={{ color: 'var(--shadow-type)' }}>COVEN takes no cut — 100% peer-to-peer</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'var(--plate)', padding: 'var(--sp-4) var(--sp-6)', borderLeft: '3px solid var(--red)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Warning size={14} color="var(--red-hi)" weight="fill" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--red-hi)' }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            {!userId && (
              <div style={{ background: 'var(--plate)', padding: 'var(--sp-4) var(--sp-6)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                <a href="/login" style={{ color: 'var(--red-hi)' }}>Login</a> to send a commission request
              </div>
            )}
            <button
              className="btn btn-primary"
              style={{ borderRadius: 0, padding: 'var(--sp-5)', justifyContent: 'center', fontSize: '0.8125rem', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={handleSubmit}
              disabled={submitting || !userId}
            >
              <PaperPlaneRight size={16} weight="bold" />
              {submitting ? 'SENDING...' : 'SEND REQUEST'}
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

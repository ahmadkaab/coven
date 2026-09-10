import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Warning, ArrowSquareOut, ShieldCheck, CurrencyCircleDollar } from '@phosphor-icons/react';
import { createArtworkTransaction } from '../../services/transactionService';
import { useAuthStore } from '../../store/authStore';
import { formatTornCash } from '../../utils/format';
import type { Artwork } from '../../types';

interface Props {
  artwork: Artwork;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PurchaseModal({ artwork, onClose, onSuccess }: Props) {
  const { userId } = useAuthStore();

  const [notes, setNotes]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [done, setDone]             = useState(false);
  const [txId, setTxId]             = useState<string | null>(null);

  const artist = artwork.artist;
  const price = artwork.price_torn || 0;
  const sellerUserId = artist?.user_id || artwork.artist_id;
  const tornProfileUrl = artist?.torn_id ? `https://www.torn.com/profiles.php?XID=${artist.torn_id}` : 'https://www.torn.com';

  const handleConfirm = async () => {
    if (!userId) {
      setError('You must be logged in to buy artwork');
      return;
    }
    if (!price) {
      setError('Artwork price is not specified');
      return;
    }
    if (userId === sellerUserId) {
      setError('You cannot purchase your own artwork');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const tx = await createArtworkTransaction({
        artworkId:    artwork.id,
        buyerUserId:  userId,
        sellerUserId: sellerUserId,
        amount:       price,
        notes:        notes.trim() || undefined,
      });
      setTxId(tx.id);
      setDone(true);
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setError(e.message || 'Failed to record purchase transaction');
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
          width: 'min(500px, 100vw)',
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
              [ CONFIRM PURCHASE ]
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '-0.03em', color: 'var(--phosphor)', lineHeight: 0.9 }}>
              {artwork.title}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)', marginTop: '6px' }}>
              BY {artist?.username ?? 'ARTIST'} {artist?.torn_id ? `[${artist.torn_id}]` : ''}
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
          /* ── SUCCESS RECEIPT ────────────────────────── */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-8)', textAlign: 'center' }}>
            <CheckCircle size={48} color="var(--term-green)" weight="fill" style={{ marginBottom: 'var(--sp-4)' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '-0.04em', color: 'var(--phosphor)', marginBottom: 'var(--sp-2)' }}>
              TRANSACTION LOGGED
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', marginBottom: 'var(--sp-4)' }}>
              TX #{txId ? txId.slice(0, 8).toUpperCase() : 'PENDING'}
            </div>

            <div style={{
              background: 'var(--plate)', border: '1px solid var(--hull)',
              padding: 'var(--sp-5)', width: '100%', textAlign: 'left',
              marginBottom: 'var(--sp-6)',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)', lineHeight: 2 }}>
                <span style={{ color: 'var(--shadow-type)' }}>TOTAL DUE:</span> <strong style={{ color: 'var(--phosphor)' }}>{formatTornCash(price)}</strong><br />
                <span style={{ color: 'var(--shadow-type)' }}>RECIPIENT:</span> {artist?.username} [XID: {artist?.torn_id}]<br />
                <span style={{ color: 'var(--shadow-type)' }}>STATUS:</span> <span style={{ color: 'var(--amber)' }}>PENDING SELLER VERIFICATION</span>
              </div>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', lineHeight: 1.8, marginBottom: 'var(--sp-6)', maxWidth: 360 }}>
              Complete the transfer on Torn. Once the seller verifies the payment in their dashboard or via the automated Torn API check, the artwork will be marked as verified.
            </div>

            <div style={{ display: 'flex', gap: 'var(--sp-3)', width: '100%' }}>
              <a
                href={tornProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Send Cash on Torn <ArrowSquareOut size={14} />
              </a>
              <a href="/dashboard" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                Dashboard
              </a>
            </div>
          </div>
        ) : (
          /* ── PURCHASE CONFIRMATION FORM ──────────────── */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--seam)' }}>
            
            {/* Artwork Preview Card */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-5) var(--sp-6)', display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
              <img
                src={artwork.thumbnail_url || artwork.image_url}
                alt={artwork.title}
                style={{ width: 80, height: 80, objectFit: 'cover', border: '1px solid var(--hull)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', textTransform: 'uppercase', color: 'var(--phosphor)' }}>
                  {artwork.title}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', marginTop: '2px' }}>
                  {artwork.listing_type.toUpperCase()} LISTING
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--red-hi)', marginTop: '6px' }}>
                  {formatTornCash(price)}
                </div>
              </div>
            </div>

            {/* Seller info & Torn Transfer Link */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-5) var(--sp-6)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--shadow-type)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
                [ TORN RECIPIENT ]
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--void)', padding: 'var(--sp-4)', border: '1px solid var(--hull)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--phosphor)', fontWeight: 'bold' }}>
                    {artist?.username}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)', marginTop: '2px' }}>
                    Torn Player ID: {artist?.torn_id ?? 'N/A'}
                  </div>
                </div>
                {artist?.torn_id && (
                  <a
                    href={tornProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                    style={{ fontSize: '0.625rem', padding: '6px 10px' }}
                  >
                    Open Torn Profile <ArrowSquareOut size={12} />
                  </a>
                )}
              </div>
            </div>

            {/* Optional transfer note / Log ID */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-5) var(--sp-6)' }}>
              <label htmlFor="tx-notes" className="form-label">Torn Transfer Log ID or Note (Optional)</label>
              <input
                id="tx-notes"
                className="form-input"
                type="text"
                placeholder="e.g. Log #4810-XXXX or Torn transfer message"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', marginTop: 'var(--sp-2)' }}>
                Helps the seller quickly match and verify your cash transfer in Torn.
              </div>
            </div>

            {/* How Torn payment works */}
            <div style={{ background: 'var(--pit)', padding: 'var(--sp-5) var(--sp-6)', borderTop: '1px solid var(--seam)' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
                <ShieldCheck size={14} color="var(--term-green)" weight="bold" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--phosphor)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  PEER-TO-PEER TORN PAYMENT
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)', lineHeight: 2 }}>
                1. Clicking confirm creates the order & reserves the artwork.<br />
                2. Send <strong style={{ color: 'var(--phosphor)' }}>{formatTornCash(price)}</strong> to {artist?.username} on Torn.<br />
                3. The seller verifies the payment via Torn API log #4810.<br />
                4. View real-time status in your Dashboard Transactions tab.
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ background: 'var(--plate)', padding: 'var(--sp-4) var(--sp-6)', borderLeft: '3px solid var(--red)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Warning size={14} color="var(--red-hi)" weight="fill" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--red-hi)' }}>{error}</span>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ padding: 'var(--sp-5) var(--sp-6)', background: 'var(--plate)', marginTop: 'auto' }}>
              {!userId ? (
                <div style={{ textAlign: 'center', padding: 'var(--sp-3)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                  <a href="/login" style={{ color: 'var(--red-hi)' }}>Login with your Torn API key</a> to purchase
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', borderRadius: 0, padding: 'var(--sp-5)', justifyContent: 'center', fontSize: '0.875rem', letterSpacing: '0.08em' }}
                  onClick={handleConfirm}
                  disabled={submitting}
                >
                  <CurrencyCircleDollar size={18} weight="bold" />
                  {submitting ? 'RECORDING TRANSACTION...' : `CONFIRM & BUY FOR ${formatTornCash(price)}`}
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

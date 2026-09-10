import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, PaperPlaneRight, Warning, CheckCircle } from '@phosphor-icons/react';
import { submitReview } from '../../services/artistService';
import type { ExtendedTransaction } from '../../services/transactionService';

interface Props {
  transaction: ExtendedTransaction;
  userId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReviewModal({ transaction, userId, onClose, onSuccess }: Props) {
  const [rating, setRating]     = useState(0);
  const [hoveredStar, setHover] = useState(0);
  const [body, setBody]         = useState('');
  const [submitting, setSub]    = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState(false);

  const artistName = transaction.seller?.username ?? 'Artist';
  const artworkTitle = transaction.artwork?.title ?? 'Artwork';

  const handleSubmit = async () => {
    if (!rating) { setError('Select a star rating'); return; }
    setError(null);
    setSub(true);
    try {
      const artistId = transaction.artwork?.artist_id;
      if (!artistId) { setError('Could not determine artist — try again later'); setSub(false); return; }

      await submitReview({
        artistId,
        reviewerUserId: userId,
        rating,
        body: body.trim() || undefined,
        transactionId: transaction.id,
      });
      setDone(true);
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setError(e.message || 'Failed to submit review');
    } finally {
      setSub(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="review-backdrop"
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
        key="review-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0,
          width: 'min(480px, 100vw)',
          background: 'var(--void)',
          borderLeft: '2px solid var(--term-green)',
          zIndex: 201,
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ padding: 'var(--sp-6)', borderBottom: '1px solid var(--seam)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--sp-1)' }}>
              [ LEAVE A REVIEW ]
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '-0.03em', color: 'var(--phosphor)', lineHeight: 0.9 }}>
              {artistName}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)', marginTop: '6px' }}>
              FOR "{artworkTitle}" · TX #{transaction.id.slice(0, 8).toUpperCase()}
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
          /* ── SUCCESS ──────────────────────────────── */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-8)', textAlign: 'center' }}>
            <CheckCircle size={48} color="var(--term-green)" weight="fill" style={{ marginBottom: 'var(--sp-4)' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '-0.04em', color: 'var(--phosphor)', marginBottom: 'var(--sp-2)' }}>
              REVIEW SUBMITTED
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', marginBottom: 'var(--sp-6)', maxWidth: 320 }}>
              Your {rating}-star review for {artistName} is now live on their profile. Thanks for building trust in the Coven marketplace.
            </div>
            <button onClick={onClose} className="btn btn-primary" style={{ padding: 'var(--sp-4) var(--sp-8)' }}>
              Close
            </button>
          </div>
        ) : (
          /* ── REVIEW FORM ──────────────────────────── */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--seam)' }}>

            {/* Transaction context */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-5) var(--sp-6)', display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
              {transaction.artwork?.image_url ? (
                <img
                  src={transaction.artwork.thumbnail_url || transaction.artwork.image_url}
                  alt={artworkTitle}
                  style={{ width: 64, height: 64, objectFit: 'cover', border: '1px solid var(--hull)' }}
                />
              ) : (
                <div style={{ width: 64, height: 64, background: 'var(--void)', border: '1px solid var(--hull)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={24} color="var(--ghost)" />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', textTransform: 'uppercase', color: 'var(--phosphor)' }}>
                  {artworkTitle}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', marginTop: '2px' }}>
                  VERIFIED PURCHASE · {transaction.verified_at ? new Date(transaction.verified_at).toLocaleDateString() : '—'}
                </div>
              </div>
            </div>

            {/* Star rating selector */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-6)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--shadow-type)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 'var(--sp-4)' }}>
                [ RATE YOUR EXPERIENCE ]
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: 'var(--sp-3)' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '4px',
                      transform: (hoveredStar || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.15s',
                    }}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={32}
                      weight={(hoveredStar || rating) >= star ? 'fill' : 'regular'}
                      color={(hoveredStar || rating) >= star ? 'var(--amber)' : 'var(--dead)'}
                    />
                  </button>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: rating ? 'var(--phosphor)' : 'var(--shadow-type)' }}>
                {rating === 0 && 'Click a star to rate'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Below Average'}
                {rating === 3 && 'Average'}
                {rating === 4 && 'Great'}
                {rating === 5 && 'Exceptional'}
              </div>
            </div>

            {/* Review body */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-5) var(--sp-6)' }}>
              <label htmlFor="review-body" className="form-label">Your Review (Optional)</label>
              <textarea
                id="review-body"
                className="form-input"
                rows={4}
                placeholder="Share your experience with this artist — delivery time, quality, communication..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                style={{ resize: 'vertical', minHeight: 80 }}
              />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', marginTop: 'var(--sp-2)', textAlign: 'right' }}>
                {body.length}/500
              </div>
            </div>

            {/* Trust info */}
            <div style={{ background: 'var(--pit)', padding: 'var(--sp-5) var(--sp-6)', borderTop: '1px solid var(--seam)' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                <CheckCircle size={14} color="var(--term-green)" weight="bold" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--phosphor)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  VERIFIED BUYER REVIEW
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)', lineHeight: 1.8 }}>
                This review is linked to a verified transaction. Only buyers who completed a purchase can leave reviews. One review per artist.
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
            <div style={{ padding: 'var(--sp-5) var(--sp-6)', background: 'var(--plate)', marginTop: 'auto' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: 0, padding: 'var(--sp-4)', justifyContent: 'center', fontSize: '0.875rem', letterSpacing: '0.08em' }}
                onClick={handleSubmit}
                disabled={submitting || !rating}
              >
                <PaperPlaneRight size={16} weight="bold" />
                {submitting ? 'SUBMITTING...' : `SUBMIT ${rating ? rating + '-STAR' : ''} REVIEW`}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

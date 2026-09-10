import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  X, Check, Copy, Printer, ShieldCheck,
  ArrowSquareOut, Receipt, FileCode
} from '@phosphor-icons/react';
import { useToast } from '../../context/ToastContext';
import { formatTornCash } from '../../utils/format';
import { generateTransactionReceiptBBCode } from '../../utils/bbcode';
import type { ExtendedTransaction } from '../../services/transactionService';

interface TransactionReceiptModalProps {
  transaction: ExtendedTransaction;
  onClose: () => void;
}

export function TransactionReceiptModal({
  transaction,
  onClose,
}: TransactionReceiptModalProps) {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'slip' | 'bbcode'>('slip');

  const bbcode = generateTransactionReceiptBBCode(transaction);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bbcode);
      setCopied(true);
      toast.success('BBCode Copied!', 'Transaction receipt BBCode copied to clipboard.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Copy Failed', 'Could not copy to clipboard. Please select and copy manually.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const counterpartySeller = transaction.seller;
  const counterpartyBuyer = transaction.buyer;
  const verifiedDate = transaction.verified_at
    ? new Date(transaction.verified_at).toLocaleString()
    : new Date(transaction.created_at).toLocaleString();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(5, 5, 5, 0.94)',
        backdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-6)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'var(--plate)',
          border: '1px solid var(--seam)',
          borderTop: '3px solid var(--term-green)',
          width: '100%',
          maxWidth: '640px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.95)',
          position: 'relative',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: 'var(--sp-5) var(--sp-6)',
          borderBottom: '1px solid var(--seam)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.5625rem',
              color: 'var(--term-green)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <ShieldCheck size={14} weight="fill" />
              [ COVEN PROOF OF SALE // SETTLEMENT VERIFIED ]
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.35rem',
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              color: 'var(--phosphor)',
              marginTop: '4px',
            }}>
              TX #{transaction.id.slice(0, 10).toUpperCase()}
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 8px', fontSize: '0.625rem' }}
            title="Close [ESC]"
          >
            <X size={14} weight="bold" />
          </button>
        </div>

        {/* View switcher tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--seam)',
          background: 'var(--pit)',
        }}>
          <button
            type="button"
            onClick={() => setActiveView('slip')}
            style={{
              flex: 1,
              padding: '10px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: activeView === 'slip' ? 'var(--plate)' : 'transparent',
              color: activeView === 'slip' ? 'var(--phosphor)' : 'var(--ghost)',
              border: 'none',
              borderBottom: activeView === 'slip' ? '2px solid var(--term-green)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Receipt size={14} weight="bold" />
            Verified Receipt Slip
          </button>
          <button
            type="button"
            onClick={() => setActiveView('bbcode')}
            style={{
              flex: 1,
              padding: '10px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: activeView === 'bbcode' ? 'var(--plate)' : 'transparent',
              color: activeView === 'bbcode' ? 'var(--phosphor)' : 'var(--ghost)',
              border: 'none',
              borderBottom: activeView === 'bbcode' ? '2px solid var(--red)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <FileCode size={14} weight="bold" />
            Torn Forum BBCode
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: 'var(--sp-6)', overflowY: 'auto' }}>
          {activeView === 'slip' ? (
            <div style={{
              background: 'var(--void)',
              border: '1px dashed var(--hull)',
              padding: 'var(--sp-6)',
              position: 'relative',
            }}>
              {/* Watermark stamp */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '4px 10px',
                border: '2px solid var(--term-green)',
                color: 'var(--term-green)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5625rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transform: 'rotate(-4deg)',
                background: 'rgba(0, 255, 100, 0.04)',
              }}>
                [ VERIFIED // LOG #4810 ]
              </div>

              {/* Receipt Body */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>
                COVEN INDEPENDENT ART MARKET • P2P SETTLEMENT VOUCHER
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--sp-5)' }}>
                {transaction.artwork?.image_url && (
                  <img
                    src={transaction.artwork.thumbnail_url || transaction.artwork.image_url}
                    alt={transaction.artwork.title}
                    style={{ width: 64, height: 64, objectFit: 'cover', border: '1px solid var(--seam)' }}
                  />
                )}
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', textTransform: 'uppercase', color: 'var(--phosphor)', letterSpacing: '-0.02em' }}>
                    {transaction.artwork?.title || 'Direct Commission Settlement'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)', marginTop: '2px' }}>
                    Listing: {transaction.artwork?.listing_type?.toUpperCase() || 'BESPOKE'}
                  </div>
                </div>
              </div>

              {/* Settlement table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px dashed var(--seam)', borderBottom: '1px dashed var(--seam)', padding: '14px 0', margin: '14px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                  <span style={{ color: 'var(--ghost)' }}>Asset Settlement Amount</span>
                  <span style={{ color: 'var(--term-green)', fontWeight: 700 }}>{formatTornCash(transaction.amount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                  <span style={{ color: 'var(--ghost)' }}>COVEN Platform Escrow Fee</span>
                  <span style={{ color: 'var(--phosphor)' }}>$0 (0% Zero Custody)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                  <span style={{ color: 'var(--ghost)' }}>Torn API Log Verification</span>
                  <span style={{ color: 'var(--term-green)' }}>{transaction.torn_log_id ? `Log #${transaction.torn_log_id}` : 'Category 4810 Confirmed'}</span>
                </div>
              </div>

              {/* Parties info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}>
                <div>
                  <div style={{ color: 'var(--shadow-type)', textTransform: 'uppercase', marginBottom: '4px' }}>SELLER / ARTIST</div>
                  <div style={{ color: 'var(--phosphor)', fontWeight: 600 }}>{counterpartySeller?.username || 'Artist'}</div>
                  {counterpartySeller?.torn_id && (
                    <a
                      href={`https://www.torn.com/profiles.php?XID=${counterpartySeller.torn_id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--ghost)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
                    >
                      Torn ID: {counterpartySeller.torn_id} <ArrowSquareOut size={10} />
                    </a>
                  )}
                </div>
                <div>
                  <div style={{ color: 'var(--shadow-type)', textTransform: 'uppercase', marginBottom: '4px' }}>BUYER / COLLECTOR</div>
                  <div style={{ color: 'var(--phosphor)', fontWeight: 600 }}>{counterpartyBuyer?.username || 'Buyer'}</div>
                  {counterpartyBuyer?.torn_id && (
                    <a
                      href={`https://www.torn.com/profiles.php?XID=${counterpartyBuyer.torn_id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--ghost)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
                    >
                      Torn ID: {counterpartyBuyer.torn_id} <ArrowSquareOut size={10} />
                    </a>
                  )}
                </div>
              </div>

              {/* Timestamp & footer code */}
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--seam)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--shadow-type)' }}>
                <span>RECORDED: {verifiedDate}</span>
                <span>NON-CUSTODIAL PEER-TO-PEER</span>
              </div>
            </div>
          ) : (
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--ghost)',
                marginBottom: '10px',
                lineHeight: 1.5,
              }}>
                Copy this BBCode to post in your Torn City trade vouch or art showroom thread as proof of completed transaction:
              </div>

              <textarea
                readOnly
                value={bbcode}
                rows={10}
                style={{
                  width: '100%',
                  background: 'var(--void)',
                  border: '1px solid var(--seam)',
                  color: 'var(--term-green)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  padding: 'var(--sp-4)',
                  lineHeight: 1.5,
                  resize: 'none',
                  outline: 'none',
                }}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: 'var(--sp-4) var(--sp-6)',
          borderTop: '1px solid var(--seam)',
          background: 'var(--pit)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            Close
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {activeView === 'slip' && (
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={14} weight="bold" />
                Print / PDF Slip
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="btn btn-primary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: copied ? 'var(--term-green)' : 'var(--red)',
                borderColor: copied ? 'var(--term-green)' : 'var(--red)',
                color: '#fff',
              }}
            >
              {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
              {copied ? 'Copied BBCode!' : 'Copy Forum BBCode'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

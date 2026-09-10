import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X, Copy, Check, TerminalWindow, Info } from '@phosphor-icons/react';
import { useToast } from '../../context/ToastContext';

interface BBCodeModalProps {
  title: string;
  subtitle?: string;
  bbcode: string;
  onClose: () => void;
}

export function BBCodeModal({ title, subtitle, bbcode, onClose }: BBCodeModalProps) {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bbcode);
      setCopied(true);
      toast.success('BBCode Copied!', 'Ready to paste into Torn City forums or signatures.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Copy Failed', 'Please highlight and copy the text manually.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(5, 5, 5, 0.94)',
        backdropFilter: 'blur(12px)',
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
          borderTop: '3px solid var(--red)',
          width: '100%',
          maxWidth: '640px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.9)',
          position: 'relative',
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
              color: 'var(--shadow-type)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>
              [ TORN FORUM EXPORTER ]
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              color: 'var(--phosphor)',
              marginTop: '4px',
            }}>
              {title}
            </div>
            {subtitle && (
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--ghost)',
                marginTop: '2px',
              }}>
                {subtitle}
              </div>
            )}
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

        {/* Content */}
        <div style={{ padding: 'var(--sp-6)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--sp-2)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: 'var(--ghost)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <TerminalWindow size={14} weight="bold" color="var(--red-hi)" />
              BBCODE OUTPUT
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.5625rem',
              color: 'var(--shadow-type)',
            }}>
              {bbcode.length} CHARS
            </span>
          </div>

          <textarea
            readOnly
            value={bbcode}
            rows={10}
            style={{
              width: '100%',
              background: 'var(--void)',
              border: '1px solid var(--hull)',
              color: 'var(--phosphor)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              lineHeight: 1.6,
              padding: 'var(--sp-3)',
              resize: 'none',
              outline: 'none',
              borderRadius: 0,
            }}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />

          {/* Info Notice */}
          <div style={{
            marginTop: 'var(--sp-4)',
            padding: 'var(--sp-3) var(--sp-4)',
            background: 'rgba(230,25,25,0.04)',
            borderLeft: '2px solid var(--red)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}>
            <Info size={14} weight="fill" color="var(--red-hi)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)', lineHeight: 1.5 }}>
              Paste directly into any Torn City Forum post (e.g. <strong>Graphics & Art</strong> or <strong>Trade</strong>), player mail, or profile signature.
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{
          padding: 'var(--sp-4) var(--sp-6)',
          borderTop: '1px solid var(--seam)',
          background: 'var(--pit)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--sp-3)',
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-primary btn-sm"
            style={{
              gap: '6px',
              minWidth: '140px',
              justifyContent: 'center',
              background: copied ? 'var(--term-green)' : undefined,
              borderColor: copied ? 'var(--term-green)' : undefined,
            }}
          >
            {copied ? (
              <>
                <Check size={14} weight="bold" />
                COPIED!
              </>
            ) : (
              <>
                <Copy size={14} weight="bold" />
                COPY BBCODE
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

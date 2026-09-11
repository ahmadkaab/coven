import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X, Copy, Check, TerminalWindow, Info, Eye } from '@phosphor-icons/react';
import { useToast } from '../../context/ToastContext';

interface BBCodeModalProps {
  title: string;
  subtitle?: string;
  bbcode: string;
  rawHtml?: string;
  onClose: () => void;
}

export function BBCodeModal({ title, subtitle, bbcode, rawHtml, onClose }: BBCodeModalProps) {
  const reduce = useReducedMotion();
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'html' | 'bbcode'>(rawHtml ? 'html' : 'bbcode');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

  const currentContent = format === 'html' ? (rawHtml || bbcode) : bbcode;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);
      addToast({
        type: 'success',
        title: format === 'html' ? 'Torn Raw HTML Copied!' : 'BBCode Copied!',
        message: format === 'html'
          ? 'Paste in Torn Editor via Tools > Source code (<>) and click Save.'
          : 'Ready to paste into Torn City forum thread or signature.',
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Please highlight and copy the snippet manually.',
      });
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
        padding: '16px',
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
          borderTop: '3px solid var(--antique-gold)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.9)',
          position: 'relative',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--seam)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.5625rem',
              color: 'var(--antique-gold)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>
              [ TORN FORUM EXPORTER &bull; RAW HTML &amp; CSS ]
            </div>
            <div style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '1.25rem',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              color: '#ffffff',
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

        {/* Format & Mode Sub-bar */}
        <div style={{
          padding: '10px 20px',
          borderBottom: '1px solid var(--seam)',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          {rawHtml ? (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setFormat('html')}
                className={`renaissance-pill ${format === 'html' ? 'active' : ''}`}
                style={{ fontSize: '0.6875rem', padding: '4px 10px' }}
              >
                Raw HTML (Tools &gt; Source code)
              </button>
              <button
                type="button"
                onClick={() => setFormat('bbcode')}
                className={`renaissance-pill ${format === 'bbcode' ? 'active' : ''}`}
                style={{ fontSize: '0.6875rem', padding: '4px 10px' }}
              >
                BBCode
              </button>
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
              OUTPUT: BBCODE / TORN COMPATIBLE
            </div>
          )}

          {format === 'html' && (
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '2px', borderRadius: '4px' }}>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                style={{
                  background: viewMode === 'preview' ? 'var(--antique-gold)' : 'transparent',
                  color: viewMode === 'preview' ? '#000' : 'var(--ghost)',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '4px 8px',
                  fontSize: '0.625rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Eye size={10} weight="bold" /> 600px Preview
              </button>
              <button
                type="button"
                onClick={() => setViewMode('code')}
                style={{
                  background: viewMode === 'code' ? 'var(--antique-gold)' : 'transparent',
                  color: viewMode === 'code' ? '#000' : 'var(--ghost)',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '4px 8px',
                  fontSize: '0.625rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <TerminalWindow size={10} weight="bold" /> Code
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {format === 'html' && viewMode === 'preview' ? (
            <div style={{
              background: '#040605',
              border: '1px dashed rgba(212,175,55,0.3)',
              borderRadius: '6px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'center',
              overflowX: 'auto',
            }}>
              <div
                style={{ width: '100%', maxWidth: '600px' }}
                dangerouslySetInnerHTML={{ __html: currentContent }}
              />
            </div>
          ) : (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  color: 'var(--ghost)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <TerminalWindow size={14} weight="bold" color="var(--antique-gold)" />
                  {format === 'html' ? 'RAW HTML WITH INLINE CSS' : 'BBCODE OUTPUT'}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5625rem',
                  color: 'var(--ghost)',
                }}>
                  {currentContent.length} CHARS
                </span>
              </div>

              <textarea
                readOnly
                value={currentContent}
                rows={11}
                style={{
                  width: '100%',
                  background: 'var(--void)',
                  border: '1px solid var(--hull)',
                  color: 'var(--phosphor)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  lineHeight: 1.6,
                  padding: '12px',
                  resize: 'none',
                  outline: 'none',
                  borderRadius: '4px',
                }}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
          )}

          {/* Info Notice */}
          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: 'rgba(212,175,55,0.06)',
            borderLeft: '2px solid var(--antique-gold)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            borderRadius: '0 4px 4px 0',
          }}>
            <Info size={14} weight="fill" color="var(--antique-gold)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)', lineHeight: 1.5 }}>
              {format === 'html' ? (
                <>
                  In Torn City forum editor: click <strong>Tools &rarr; Source code (&lt;&gt;)</strong>, paste this raw HTML, and click <strong>Ok</strong>. Strict 600px width limit guaranteed.
                </>
              ) : (
                <>
                  Paste directly into any Torn City Forum post (e.g. <strong>Graphics & Art</strong> or <strong>Trade</strong>), player mail, or profile signature.
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--seam)',
          background: 'var(--pit)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
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
            className="renaissance-btn-gold"
            style={{
              gap: '6px',
              minWidth: '150px',
              justifyContent: 'center',
              padding: '8px 16px',
              fontSize: '0.75rem',
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
                {format === 'html' ? 'COPY RAW HTML' : 'COPY BBCODE'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

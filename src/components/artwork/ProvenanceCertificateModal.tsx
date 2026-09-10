import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  X, ShieldCheck, Copy, Check, Printer, Certificate, LockKey, ArrowSquareOut, Hash
} from '@phosphor-icons/react';
import { useToast } from '../../context/ToastContext';
import {
  type ProvenanceCertificate,
  generateCertificateBBCode,
} from '../../services/vaultService';
import { formatTornCash } from '../../utils/format';

interface ProvenanceCertificateModalProps {
  certificate: ProvenanceCertificate;
  artworkImageUrl?: string;
  onClose: () => void;
}

export function ProvenanceCertificateModal({
  certificate,
  artworkImageUrl,
  onClose,
}: ProvenanceCertificateModalProps) {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [copiedBBCode, setCopiedBBCode] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleCopyBBCode = async () => {
    try {
      const code = generateCertificateBBCode(certificate);
      await navigator.clipboard.writeText(code);
      setCopiedBBCode(true);
      toast.success('Certificate BBCode Copied!', 'Ready to paste into your Torn profile or signature.');
      setTimeout(() => setCopiedBBCode(false), 2500);
    } catch {
      toast.error('Copy Failed', 'Unable to copy certificate badge.');
    }
  };

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(certificate.sha256Hash);
      setCopiedHash(true);
      toast.success('Hash Copied!', 'Cryptographic fingerprint copied to clipboard.');
      setTimeout(() => setCopiedHash(false), 2000);
    } catch { /* silent */ }
  };

  const handlePrint = () => {
    window.print();
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
        padding: 'var(--sp-4)',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'var(--plate)',
          border: '1px solid var(--seam)',
          borderTop: '3px solid var(--term-green)',
          width: '100%',
          maxWidth: '740px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.95), 0 0 40px rgba(0, 255, 100, 0.08)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--sp-4) var(--sp-6)',
          borderBottom: '1px solid var(--seam)',
          background: 'var(--pit)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Certificate size={16} color="var(--term-green)" weight="fill" />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--phosphor)',
            }}>
              COVEN ARTISTRY REGISTRY // PROVENANCE RECORD
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ghost)',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px',
            }}
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Certificate Card Content */}
        <div style={{ padding: 'var(--sp-6)', background: 'var(--void)' }}>
          {/* Inner Certificate Parchment / Industrial Plate */}
          <div style={{
            border: '1px solid var(--seam)',
            background: 'var(--plate)',
            padding: 'var(--sp-6)',
            position: 'relative',
            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.6)',
          }}>
            {/* Hologram Foil Watermark Stamp */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '2px dashed rgba(0, 255, 100, 0.35)',
              background: 'radial-gradient(circle, rgba(0, 255, 100, 0.1) 0%, rgba(8,8,8,0.7) 70%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              transform: 'rotate(-12deg)',
            }}>
              <ShieldCheck size={28} color="var(--term-green)" weight="duotone" />
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.5rem',
                color: 'var(--term-green)',
                letterSpacing: '0.15em',
                marginTop: '4px',
              }}>
                SEALED
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.375rem',
                color: 'var(--ghost)',
              }}>
                {certificate.verificationSeal}
              </div>
            </div>

            {/* Title & Serial */}
            <div style={{ marginBottom: 'var(--sp-5)' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--term-green)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>
                [ CERTIFICATE OF AUTHENTICITY ]
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.4rem, 3vw, 2.1rem)',
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: 'var(--phosphor)',
                margin: 0,
                lineHeight: 1.1,
              }}>
                {certificate.artworkTitle}
              </h2>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--ghost)',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span>SERIAL: <strong style={{ color: 'var(--phosphor)' }}>{certificate.serialNumber}</strong></span>
                <span>•</span>
                <span>STATUS: <strong style={{ color: 'var(--term-green)' }}>{certificate.verificationStatus}</strong></span>
              </div>
            </div>

            {/* Thumbnail + Metadata Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: artworkImageUrl ? '160px 1fr' : '1fr',
              gap: 'var(--sp-5)',
              alignItems: 'start',
              marginBottom: 'var(--sp-5)',
            }}>
              {artworkImageUrl && (
                <div style={{
                  border: '1px solid var(--seam)',
                  background: 'var(--void)',
                  aspectRatio: '4/3',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <img
                    src={artworkImageUrl}
                    alt={certificate.artworkTitle}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    insetInline: 0,
                    background: 'rgba(0,0,0,0.75)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5rem',
                    color: 'var(--ghost)',
                    padding: '2px 4px',
                    textAlign: 'center',
                  }}>
                    {certificate.dimensions}
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--seam)' }}>
                <div style={{ background: 'var(--pit)', padding: 'var(--sp-3) var(--sp-4)' }}>
                  <div className="artwork-price-label">Creator / Artist</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--phosphor)', marginTop: '2px' }}>
                    {certificate.artistName} <span style={{ color: 'var(--red)', fontSize: '0.6875rem' }}>[#{certificate.artistTornId}]</span>
                  </div>
                </div>

                <div style={{ background: 'var(--pit)', padding: 'var(--sp-3) var(--sp-4)' }}>
                  <div className="artwork-price-label">Current Titular Owner</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--term-green)', marginTop: '2px' }}>
                    {certificate.ownerName} <span style={{ color: 'var(--ghost)', fontSize: '0.6875rem' }}>[#{certificate.ownerTornId}]</span>
                  </div>
                </div>

                <div style={{ background: 'var(--pit)', padding: 'var(--sp-3) var(--sp-4)' }}>
                  <div className="artwork-price-label">Mint Date</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ghost)', marginTop: '2px' }}>
                    {new Date(certificate.mintDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <div style={{ background: 'var(--pit)', padding: 'var(--sp-3) var(--sp-4)' }}>
                  <div className="artwork-price-label">Asset Format & Resolution</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ghost)', marginTop: '2px' }}>
                    {certificate.fileFormat} • {certificate.resolutionDpi} DPI
                  </div>
                </div>

                <div style={{ background: 'var(--pit)', padding: 'var(--sp-3) var(--sp-4)' }}>
                  <div className="artwork-price-label">Torn Cash Value</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', color: 'var(--phosphor)', marginTop: '2px' }}>
                    {certificate.amountTorn ? formatTornCash(certificate.amountTorn) : 'Torn Market Standard'}
                  </div>
                </div>

                <div style={{ background: 'var(--pit)', padding: 'var(--sp-3) var(--sp-4)' }}>
                  <div className="artwork-price-label">Torn Verification Log</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', marginTop: '2px' }}>
                    {certificate.tornLogId || 'VERIFIED_API_LOG_394'}
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Fingerprint */}
            <div style={{
              background: 'var(--void)',
              border: '1px solid var(--seam)',
              padding: 'var(--sp-3) var(--sp-4)',
              marginBottom: 'var(--sp-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--sp-3)',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5rem',
                  color: 'var(--ghost)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}>
                  IMMUTABLE SHA-256 CONTENT FINGERPRINT
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--phosphor)',
                  letterSpacing: '0.05em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginTop: '2px',
                }}>
                  {certificate.sha256Hash}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyHash}
                className="btn btn-sm btn-ghost"
                style={{ flexShrink: 0, padding: '4px 8px' }}
                title="Copy cryptographic hash"
              >
                {copiedHash ? <Check size={12} color="var(--term-green)" /> : <Copy size={12} />}
                {copiedHash ? 'COPIED' : 'COPY HASH'}
              </button>
            </div>

            {/* Legal / License statement */}
            <div style={{
              borderLeft: '2px solid var(--term-green)',
              paddingLeft: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: 'var(--ghost)',
              lineHeight: 1.5,
            }}>
              <strong>TITULAR RIGHTS:</strong> The registered owner is granted exclusive, perpetual rights to display this artwork across Torn City forums, personal signatures, and profile spaces. Certified through COVEN decentralized art validation.
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--sp-3)',
          padding: 'var(--sp-4) var(--sp-6)',
          borderTop: '1px solid var(--seam)',
          background: 'var(--pit)',
        }}>
          <button
            type="button"
            onClick={handleCopyBBCode}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {copiedBBCode ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
            {copiedBBCode ? 'BADGE BBCODE COPIED!' : 'COPY FORUM BADGE BBCODE'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={14} /> PRINT / SAVE
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-industrial"
            >
              CLOSE
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

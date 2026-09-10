import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  X, DownloadSimple, Copy, Check, TerminalWindow, Sparkle, ShieldCheck, Certificate, ArrowSquareOut
} from '@phosphor-icons/react';
import { useToast } from '../../context/ToastContext';
import type { Artwork } from '../../types';
import type { ProvenanceCertificate } from '../../services/vaultService';

interface VaultUnlockModalProps {
  artwork: Artwork;
  certificate: ProvenanceCertificate | null;
  onClose: () => void;
  onOpenCertificate?: () => void;
}

export function VaultUnlockModal({
  artwork,
  certificate,
  onClose,
  onOpenCertificate,
}: VaultUnlockModalProps) {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [decryptionProgress, setDecryptionProgress] = useState<number>(0);
  const [isDecrypted, setIsDecrypted] = useState<boolean>(false);
  const [copiedBBCode, setCopiedBBCode] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Terminal decryption sequence animation
  useEffect(() => {
    if (reduce) {
      setDecryptionProgress(100);
      setIsDecrypted(true);
      return;
    }

    const interval = setInterval(() => {
      setDecryptionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDecrypted(true);
          return 100;
        }
        return prev + 20;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [reduce]);

  const rawUrl = artwork.image_url || '';
  const forumBBCode = `[center]\n[img]${rawUrl}[/img]\n[size=1][color=#888888]Artwork by ${artwork.artist?.username || 'Verified Artist'} • Authenticated via COVEN[/color][/size]\n[/center]`;

  const handleCopyBBCode = async () => {
    try {
      await navigator.clipboard.writeText(forumBBCode);
      setCopiedBBCode(true);
      toast.success('Clean BBCode Copied!', 'Unwatermarked image tag copied for your forum profile.');
      setTimeout(() => setCopiedBBCode(false), 2500);
    } catch {
      toast.error('Copy Failed', 'Unable to copy BBCode tag.');
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(rawUrl);
      setCopiedUrl(true);
      toast.success('Direct URL Copied!', 'Direct unwatermarked asset URL copied.');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch { /* silent */ }
  };

  const handleDownload = () => {
    if (!rawUrl) return;
    const a = document.createElement('a');
    a.href = rawUrl;
    a.download = `${artwork.title.toLowerCase().replace(/\s+/g, '_')}_master.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Download Initiated', 'Unwatermarked master payload retrieved.');
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
        initial={reduce ? false : { opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'var(--plate)',
          border: '1px solid var(--seam)',
          borderTop: '3px solid var(--term-green)',
          width: '100%',
          maxWidth: '680px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.95), 0 0 40px rgba(0, 255, 100, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--sp-4) var(--sp-6)',
          borderBottom: '1px solid var(--seam)',
          background: 'var(--pit)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TerminalWindow size={16} color="var(--term-green)" weight="fill" />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--phosphor)',
            }}>
              COVEN DIGITAL ASSET VAULT // MASTER ACCESS
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

        {/* Content Area */}
        <div style={{ padding: 'var(--sp-6)', background: 'var(--void)' }}>
          {!isDecrypted ? (
            /* Decryption Animation Terminal */
            <div style={{
              padding: 'var(--sp-8) var(--sp-6)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--sp-4)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--term-green)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}>
                [ DECRYPTING MASTER PAYLOAD — {decryptionProgress}% ]
              </div>

              {/* Progress bar */}
              <div style={{
                width: '100%',
                maxWidth: '360px',
                height: '6px',
                background: 'var(--pit)',
                border: '1px solid var(--seam)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${decryptionProgress}%`,
                  background: 'var(--term-green)',
                  transition: 'width 0.15s ease-out',
                }} />
              </div>

              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--ghost)',
                letterSpacing: '0.1em',
                lineHeight: 1.6,
                maxWidth: '420px',
              }}>
                <div>▶ VERIFYING TORN CITIZEN AUTHORIZATION...</div>
                {decryptionProgress >= 40 && <div>▶ STRIPPING WATERMARK SECURITY LAYER...</div>}
                {decryptionProgress >= 80 && <div>▶ UNPACKING LOSSLESS HIGH-RESOLUTION MASTER...</div>}
              </div>
            </div>
          ) : (
            /* Decrypted Master Asset Display */
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: 'var(--sp-4)',
                background: 'rgba(0, 255, 100, 0.04)',
                border: '1px solid rgba(0, 255, 100, 0.2)',
                padding: '8px 12px',
              }}>
                <Sparkle size={16} color="var(--term-green)" weight="fill" />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.1em',
                  color: 'var(--term-green)',
                  textTransform: 'uppercase',
                }}>
                  VAULT ACCESS GRANTED — ORIGINAL MASTER ASSET DECRYPTED
                </span>
              </div>

              {/* Master Artwork Image Box */}
              <div style={{
                border: '1px solid var(--seam)',
                background: 'var(--pit)',
                overflow: 'hidden',
                aspectRatio: '16/9',
                maxHeight: '280px',
                position: 'relative',
                marginBottom: 'var(--sp-4)',
              }}>
                <img
                  src={rawUrl}
                  alt={artwork.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  background: 'rgba(8,8,8,0.85)',
                  border: '1px solid var(--seam)',
                  padding: '3px 8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5625rem',
                  color: 'var(--phosphor)',
                }}>
                  {certificate?.dimensions || '1920 × 1080 LOSSLESS'}
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <DownloadSimple size={15} weight="bold" /> DOWNLOAD MASTER
                </button>

                <button
                  type="button"
                  onClick={handleCopyBBCode}
                  className="btn btn-industrial"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {copiedBBCode ? <Check size={15} color="var(--term-green)" /> : <Copy size={15} />}
                  {copiedBBCode ? 'BBCODE COPIED!' : 'COPY FORUM BBCODE'}
                </button>
              </div>

              {/* Quick URL Copy Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--plate)',
                border: '1px solid var(--seam)',
                padding: '6px 12px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  color: 'var(--ghost)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '70%',
                }}>
                  DIRECT URL: <span style={{ color: 'var(--phosphor)' }}>{rawUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="btn btn-sm btn-ghost"
                  style={{ padding: '2px 8px' }}
                >
                  {copiedUrl ? <Check size={11} color="var(--term-green)" /> : <Copy size={11} />}
                  {copiedUrl ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--sp-4) var(--sp-6)',
          borderTop: '1px solid var(--seam)',
          background: 'var(--pit)',
        }}>
          {certificate && onOpenCertificate ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCertificate();
              }}
              className="btn btn-sm btn-ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Certificate size={14} color="var(--term-green)" />
              VIEW PROVENANCE CERTIFICATE
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-industrial"
          >
            CLOSE
          </button>
        </div>
      </motion.div>
    </div>
  );
}

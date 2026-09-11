import React, { useState } from 'react';
import type { Artist, Artwork, Review } from '../../types';
import type { ArtistStudioConfig } from '../../services/studioService';
import { generateTornForumShopHtml, generateTornForumSignatureHtml } from '../../utils/tornHtml';
import { X, Copy, Check, TerminalWindow, Eye, Info, Sparkle } from '@phosphor-icons/react';

interface ForumShopModalProps {
  studio: ArtistStudioConfig;
  artist: Artist;
  featuredArt?: Artwork;
  reviews?: Review[];
  onClose: () => void;
}

export function ForumShopModal({
  studio,
  artist,
  featuredArt,
  reviews = [],
  onClose,
}: ForumShopModalProps) {
  const [template, setTemplate] = useState<'thread' | 'signature'>('thread');
  const [activeTab, setActiveTab] = useState<'html' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);

  const rawHtml = template === 'signature'
    ? generateTornForumSignatureHtml(artist, studio)
    : generateTornForumShopHtml(studio, artist, featuredArt, reviews);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = rawHtml;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 5, 5, 0.88)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-4)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--pit)',
          border: '1px solid var(--hull)',
          borderTop: '3px solid var(--antique-gold)',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--sp-4) var(--sp-6)',
            borderBottom: '1px solid var(--seam)',
            background: 'var(--plate)',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--antique-gold)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkle size={10} weight="fill" />
              TORN RAW HTML &amp; INLINE CSS ENGINE
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                color: 'var(--phosphor)',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                margin: '2px 0 0 0',
              }}
            >
              TORN FORUM SHOP THREAD (600px)
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ghost)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Sub-bar with template picker & mode tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--sp-3) var(--sp-6)',
            borderBottom: '1px solid var(--seam)',
            background: 'var(--void)',
            flexWrap: 'wrap',
            gap: 'var(--sp-3)',
          }}
        >
          {/* Template pills */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
              FORMAT:
            </span>
            <button
              type="button"
              onClick={() => setTemplate('thread')}
              className={`renaissance-pill ${template === 'thread' ? 'active' : ''}`}
              style={{ fontSize: '0.6875rem', padding: '4px 10px' }}
            >
              Forum Thread (600px)
            </button>
            <button
              type="button"
              onClick={() => setTemplate('signature')}
              className={`renaissance-pill ${template === 'signature' ? 'active' : ''}`}
              style={{ fontSize: '0.6875rem', padding: '4px 10px' }}
            >
              Signature (600×100)
            </button>
          </div>

          {/* Toggle source vs visual preview */}
          <div style={{ display: 'flex', gap: '1px', background: 'var(--hull)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '4px 12px',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                cursor: 'pointer',
                background: activeTab === 'preview' ? 'var(--antique-gold)' : 'var(--plate)',
                color: activeTab === 'preview' ? '#000' : 'var(--ghost)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
              }}
            >
              <Eye size={12} weight="bold" />
              600px PREVIEW
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('html')}
              style={{
                padding: '4px 12px',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                cursor: 'pointer',
                background: activeTab === 'html' ? 'var(--antique-gold)' : 'var(--plate)',
                color: activeTab === 'html' ? '#000' : 'var(--ghost)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
              }}
            >
              <TerminalWindow size={12} weight="bold" />
              RAW HTML CODE
            </button>
          </div>
        </div>

        {/* Step Guide Banner */}
        <div style={{
          padding: '8px 24px',
          background: 'rgba(16, 185, 129, 0.06)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
          fontSize: '0.6875rem',
          color: 'var(--ghost)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)'
        }}>
          <Info size={14} color="#10b981" weight="bold" />
          <span>In Torn Forum Editor: Click <strong>Tools &rarr; Source code (&lt;&gt;)</strong>, paste this raw HTML, and click <strong>Ok</strong>.</span>
        </div>

        {/* Content Body */}
        <div style={{ padding: 'var(--sp-6)', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'html' ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--sp-2)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--antique-gold)' }}>
                  {rawHtml.length} CHARACTERS &bull; SANITIZED INLINE CSS
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)' }}>
                  Click inside to select all
                </div>
              </div>

              <textarea
                readOnly
                value={rawHtml}
                rows={16}
                style={{
                  width: '100%',
                  background: 'var(--void)',
                  border: '1px solid var(--hull)',
                  color: 'var(--phosphor)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  lineHeight: 1.6,
                  padding: 'var(--sp-4)',
                  resize: 'vertical',
                  outline: 'none',
                }}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
          ) : (
            /* Visual preview mimicking Torn forum thread with strict 600px width */
            <div
              style={{
                background: '#040605',
                border: '1px dashed rgba(212, 175, 55, 0.3)',
                padding: '24px 16px',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowX: 'auto'
              }}
            >
              <div
                style={{ width: '100%', maxWidth: '600px' }}
                dangerouslySetInnerHTML={{ __html: rawHtml }}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: 'var(--sp-4) var(--sp-6)',
            borderTop: '1px solid var(--seam)',
            background: 'var(--plate)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--sp-3)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
            {copied ? (
              <span style={{ color: 'var(--term-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} weight="bold" />
                COPIED TO CLIPBOARD! Ready to paste into Torn Source Code editor.
              </span>
            ) : (
              '1-Click Raw HTML Export for Torn City Forums & Signatures'
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              style={{ borderRadius: 0 }}
            >
              CLOSE
            </button>
            <button
              type="button"
              className="renaissance-btn-gold"
              onClick={handleCopy}
              style={{
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                fontSize: '0.75rem',
                minHeight: '38px',
              }}
            >
              {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
              {copied ? 'HTML COPIED' : 'COPY RAW TORN HTML'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

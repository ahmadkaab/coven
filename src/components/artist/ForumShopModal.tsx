import React, { useState } from 'react';
import type { Artist, Artwork, Review } from '../../types';
import { type ArtistStudioConfig, generateForumShopBBCode } from '../../services/studioService';
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
  const [activeTab, setActiveTab] = useState<'bbcode' | 'preview'>('bbcode');
  const [copied, setCopied] = useState(false);

  const bbcode = generateForumShopBBCode(studio, artist, featuredArt, reviews);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bbcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = bbcode;
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
          borderTop: '3px solid var(--red)',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
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
                color: 'var(--red)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkle size={10} weight="fill" />
              TORN FORUM SHOP ENGINE
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
              OFFICIAL FORUM SHOP BBCODE THREAD
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

        {/* Sub-bar with description & tabs */}
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
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--ghost)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Info size={14} color="var(--red)" weight="bold" />
            <span>Formatted for Torn City Graphic Forums (Forum ID: 23)</span>
          </div>

          {/* Toggle source vs visual preview */}
          <div style={{ display: 'flex', gap: '1px', background: 'var(--hull)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('bbcode')}
              style={{
                padding: '4px 12px',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                cursor: 'pointer',
                background: activeTab === 'bbcode' ? 'var(--red)' : 'var(--plate)',
                color: activeTab === 'bbcode' ? '#fff' : 'var(--ghost)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <TerminalWindow size={12} weight="bold" />
              BBCODE SOURCE
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '4px 12px',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                cursor: 'pointer',
                background: activeTab === 'preview' ? 'var(--red)' : 'var(--plate)',
                color: activeTab === 'preview' ? '#fff' : 'var(--ghost)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Eye size={12} weight="bold" />
              FORUM PREVIEW
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: 'var(--sp-6)', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'bbcode' ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--sp-2)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)' }}>
                  {bbcode.split('\n').length} LINES • {bbcode.length} CHARACTERS
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)' }}>
                  Includes: Header, Pricing Table, Live Queue, Showcase & Terms
                </div>
              </div>

              <textarea
                readOnly
                value={bbcode}
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
            /* Visual preview mimicking Torn forum thread */
            <div
              style={{
                background: '#1a1a1a',
                border: '1px solid #333',
                padding: 'var(--sp-6)',
                color: '#ddd',
                fontFamily: 'Segoe UI, Tahoma, sans-serif',
                textAlign: 'center',
                borderRadius: '4px',
              }}
            >
              <div style={{ color: '#E61919', fontWeight: 'bold', fontSize: '1.4rem', letterSpacing: '0.05em' }}>
                ◈ ═══════ {studio.studioName} ═══════ ◈
              </div>
              <div style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.95rem', marginTop: '6px' }}>
                {studio.tagline}
              </div>
              <div style={{ color: '#888888', fontSize: '0.75rem', marginTop: '2px' }}>
                AUTHENTICATED CREATIVE STUDIO • COVEN INDEPENDENT ART MARKET
              </div>

              <div
                style={{
                  display: 'inline-block',
                  background: '#222',
                  border: '1px solid #444',
                  padding: '8px 16px',
                  margin: '16px auto',
                  fontSize: '0.8125rem',
                }}
              >
                <strong>CREATOR:</strong> {artist.username} &nbsp;|&nbsp;
                <strong>STATUS:</strong>{' '}
                <span style={{ color: studio.status === 'open' ? '#00FF64' : '#E61919' }}>
                  {studio.status.toUpperCase()}
                </span>{' '}
                &nbsp;|&nbsp;
                <strong>SLA:</strong> {studio.turnaroundDays} DAYS
              </div>

              {/* Pricing Box */}
              <div
                style={{
                  background: '#242424',
                  border: '1px solid #444',
                  padding: '12px 16px',
                  margin: '16px 0',
                  textAlign: 'left',
                }}
              >
                <div style={{ color: '#E61919', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
                  ─── PRICING GUIDE (TORN CASH & DONATOR PACKS) ───
                </div>
                <div style={{ fontSize: '0.8125rem', lineHeight: 1.8, color: '#ccc' }}>
                  <div>• <strong>1:1 PROFILE AVATARS:</strong> $5,000,000 – $8,000,000 (0.2 – 0.3 DP)</div>
                  <div>• <strong>FORUM SIGNATURES (600×200):</strong> $8,000,000 – $14,000,000 (0.3 – 0.6 DP)</div>
                  <div>• <strong>ANIMATED SIGNATURES (60 FPS):</strong> $16,000,000 – $22,000,000 (0.7 – 0.9 DP)</div>
                  <div>• <strong>FACTION WAR BANNERS & CRESTS:</strong> $28,000,000 – $40,000,000 (1.1 – 1.6 DP)</div>
                  <div>• <strong>COMPLETE PROFILE BBCode SUITES:</strong> $45,000,000 – $75,000,000 (1.8 – 3.0 DP)</div>
                </div>
              </div>

              {/* Queue Status Box */}
              <div
                style={{
                  background: '#242424',
                  border: '1px solid #444',
                  padding: '12px 16px',
                  margin: '16px 0',
                  textAlign: 'left',
                }}
              >
                <div style={{ color: '#E61919', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
                  ─── LIVE COMMISSION QUEUE ───
                </div>
                <div style={{ fontSize: '0.8125rem', lineHeight: 1.8 }}>
                  {studio.queueSlots.map((slot) => (
                    <div key={slot.id}>
                      <strong>SLOT {slot.slotNumber}:</strong>{' '}
                      {slot.status === 'open' ? (
                        <span style={{ color: '#00FF64' }}>● OPEN FOR COMMISSION</span>
                      ) : (
                        <span style={{ color: '#E61919' }}>
                          ▲ {slot.status === 'review' ? 'IN REVIEW' : 'IN PROGRESS'} [{slot.progressPct ?? 50}%] — {slot.projectTitle || 'Custom Graphic'} (Client: {slot.clientUsername || 'Anonymous'})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {featuredArt && (
                <div style={{ margin: '16px 0' }}>
                  <div style={{ color: '#E61919', fontWeight: 'bold', marginBottom: '6px' }}>
                    ─── FEATURED MASTERPIECE: {featuredArt.title} ───
                  </div>
                  <img
                    src={featuredArt.image_url}
                    alt={featuredArt.title}
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', border: '1px solid #444' }}
                  />
                </div>
              )}

              {/* Terms */}
              <div style={{ fontStyle: 'italic', fontSize: '0.75rem', color: '#aaa', marginTop: '16px' }}>
                "{studio.termsOfService}"
              </div>
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
                COPIED TO CLIPBOARD! Ready to paste into Torn thread.
              </span>
            ) : (
              '1-Click Export for Torn City Graphic & Art Forum threads'
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
              className="btn btn-primary btn-sm"
              onClick={handleCopy}
              style={{
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
              }}
            >
              {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
              {copied ? 'THREAD COPIED' : 'COPY FULL FORUM SHOP BBCODE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

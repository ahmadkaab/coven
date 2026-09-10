import React from 'react';
import { Link } from 'react-router-dom';
import type { Artwork } from '../../types';
import { ShieldCheck, Eye, Sparkle, ArrowRight, LockKey } from '@phosphor-icons/react';
import { formatTornCash } from '../../utils/format';

interface StudioSpotlightProps {
  artwork: Artwork;
  studioName: string;
  onRequestSimilar?: () => void;
}

export function StudioSpotlight({ artwork, studioName, onRequestSimilar }: StudioSpotlightProps) {
  return (
    <div
      style={{
        background: 'var(--pit)',
        border: '1px solid var(--hull)',
        borderLeft: '4px solid var(--red)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 'var(--sp-8)',
      }}
    >
      {/* Subtle background glow effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '100%',
          background: 'radial-gradient(ellipse at top right, rgba(230, 25, 25, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 380px) 1fr',
          gap: 'var(--sp-6)',
          alignItems: 'center',
          padding: 'var(--sp-6)',
        }}
        className="studio-spotlight-grid"
      >
        {/* Artwork Image Container */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'relative',
              border: '1px solid var(--hull)',
              background: 'var(--void)',
              aspectRatio: '16/9',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={artwork.image_url}
              alt={artwork.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Watermark preview tag */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                background: 'rgba(5, 5, 5, 0.85)',
                border: '1px solid var(--hull)',
                padding: '2px 6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5625rem',
                color: 'var(--ghost)',
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <LockKey size={10} color="var(--red)" weight="bold" />
              COVEN DIGITAL VAULT
            </div>

            {/* Dimension / format pill */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                background: 'rgba(5, 5, 5, 0.85)',
                border: '1px solid var(--hull)',
                padding: '2px 6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5625rem',
                color: 'var(--phosphor)',
                letterSpacing: '0.08em',
              }}
            >
              {artwork.listing_type === 'auction' ? 'AUCTION PIECE' : 'FIXED MASTER'}
            </div>
          </div>
        </div>

        {/* Artwork Metadata & Actions */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sp-2)',
              marginBottom: 'var(--sp-2)',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--red)',
                background: 'rgba(230, 25, 25, 0.12)',
                border: '1px solid rgba(230, 25, 25, 0.3)',
                padding: '2px 6px',
                letterSpacing: '0.1em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sparkle size={10} weight="fill" />
              FLAGSHIP MASTERPIECE
            </span>

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--shadow-type)',
                letterSpacing: '0.08em',
              }}
            >
              PINNED BY {studioName}
            </span>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
              color: 'var(--phosphor)',
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: 'var(--sp-3)',
            }}
          >
            {artwork.title}
          </h3>

          {artwork.description && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                color: 'var(--ghost)',
                lineHeight: 1.6,
                marginBottom: 'var(--sp-4)',
                maxWidth: '560px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {artwork.description}
            </p>
          )}

          {/* Specs Compartments */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '1px',
              background: 'var(--seam)',
              border: '1px solid var(--hull)',
              marginBottom: 'var(--sp-4)',
              maxWidth: '500px',
            }}
          >
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-2) var(--sp-3)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', textTransform: 'uppercase' }}>
                Edition
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--phosphor)', fontWeight: 600 }}>
                {artwork.listing_type === 'auction' ? 'AUCTION PIECE' : '1-OF-1 UNIQUE'}
              </div>
            </div>

            <div style={{ background: 'var(--plate)', padding: 'var(--sp-2) var(--sp-3)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', textTransform: 'uppercase' }}>
                Valuation
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--term-green)', fontWeight: 600 }}>
                {formatTornCash(artwork.price_torn ?? artwork.current_bid ?? 0)}
              </div>
            </div>

            <div style={{ background: 'var(--plate)', padding: 'var(--sp-2) var(--sp-3)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', textTransform: 'uppercase' }}>
                Provenance
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ghost)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} color="var(--term-green)" weight="bold" />
                VERIFIED
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <Link
              to={`/artwork/${artwork.id}`}
              className="btn btn-industrial btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: 0,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
              }}
            >
              <Eye size={12} weight="bold" />
              INSPECT IN VAULT
            </Link>

            {onRequestSimilar && (
              <button
                type="button"
                onClick={onRequestSimilar}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                }}
              >
                REQUEST SIMILAR COMMISSION <ArrowRight size={10} weight="bold" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

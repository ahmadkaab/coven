import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, ArrowUpRight } from '@phosphor-icons/react';

export interface EditorialHotspotProps {
  x: number; // percentage (e.g. 35)
  y: number; // percentage (e.g. 50)
  title: string;
  artist: string;
  priceCr: number;
  priceXanax: number;
  tag: string;
  artworkId: string;
}

export function EditorialHotspot({
  x,
  y,
  title,
  artist,
  priceCr,
  priceXanax,
  tag,
  artworkId,
}: EditorialHotspotProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="editorial-hotspot-anchor"
      style={{ left: `${x}%`, top: `${y}%` }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="editorial-hotspot-dot"
        onClick={() => setOpen(!open)}
        aria-label={`Inspect ${title}`}
      >
        {open ? <X size={14} weight="bold" /> : <Plus size={14} weight="bold" />}
      </button>

      {open && (
        <div className="editorial-hotspot-popover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{
              fontSize: '0.5625rem',
              fontFamily: 'var(--font-cinzel)',
              color: 'var(--antique-gold)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              {tag}
            </span>
            <span style={{
              fontSize: '0.5625rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--neon-magenta)',
              background: 'rgba(255, 0, 127, 0.12)',
              padding: '1px 6px',
              borderRadius: '3px'
            }}>
              FOCAL PIECE
            </span>
          </div>

          <h4 style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 2px 0',
            lineHeight: 1.2
          }}>
            {title}
          </h4>

          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'var(--ghost)',
            marginBottom: '10px'
          }}>
            By {artist}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(244, 241, 234, 0.08)',
            paddingTop: '8px',
            marginTop: '4px'
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--phosphor)' }}>
                {priceCr.toLocaleString()} <span style={{ fontSize: '0.625rem', color: 'var(--neon-magenta)' }}>CR</span>
              </div>
              <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
                ≈ {priceXanax}x Xanax
              </div>
            </div>

            <Link
              to={`/artwork/${artworkId}`}
              className="btn btn-sm btn-industrial"
              style={{
                fontSize: '0.625rem',
                padding: '4px 10px',
                borderRadius: '4px',
                gap: '4px',
                background: 'var(--neon-magenta)',
                borderColor: 'var(--neon-magenta)',
                color: '#ffffff'
              }}
            >
              Acquire <ArrowUpRight size={10} weight="bold" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

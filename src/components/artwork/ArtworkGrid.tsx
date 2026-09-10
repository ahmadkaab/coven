import { ArtworkCard } from './ArtworkCard';
import type { Artwork } from '../../types';

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--plate)', overflow: 'hidden', border: '1px solid var(--hull)' }}>
      <div className="skeleton" style={{ aspectRatio: '4/3' }} />
      <div style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        <div className="skeleton" style={{ height: 16, width: '65%' }} />
        <div className="skeleton" style={{ height: 12, width: '40%' }} />
      </div>
    </div>
  );
}

export function ArtworkGrid({ artworks, loading = false }: { artworks: Artwork[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="artwork-grid">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div style={{
        padding: 'var(--sp-16)', textAlign: 'center',
        border: '1px solid var(--hull)', background: 'var(--plate)',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '2.5rem',
          textTransform: 'uppercase', letterSpacing: '-0.04em',
          color: 'var(--hull)', marginBottom: 'var(--sp-4)',
        }}>
          EMPTY
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
          color: 'var(--shadow-type)', letterSpacing: '0.15em', textTransform: 'uppercase',
        }}>
          No artworks in this category yet.
        </div>
      </div>
    );
  }

  return (
    <div className="artwork-grid">
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}

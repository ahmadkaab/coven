import { Link } from 'react-router-dom';
import type { Artwork } from '../../types';
import { Countdown } from '../common/Countdown';
import { StarRating } from '../common/StarRating';

interface ArtworkCardProps {
  artwork: Artwork;
  variant?: 'default' | 'auction' | 'compact';
}

export function ArtworkCard({ artwork, variant = 'default' }: ArtworkCardProps) {
  const isAuction = variant === 'auction' || artwork.listing_type === 'auction';

  const badge = () => {
    if (!artwork.status || artwork.status === 'available') return <span className="badge badge-available">AVAIL</span>;
    if (artwork.status === 'sold') return <span className="badge badge-sold">SOLD</span>;
    if (artwork.status === 'reserved') return <span className="badge badge-edition">HOLD</span>;
    return null;
  };

  return (
    <Link to={`/artwork/${artwork.id}`} className="artwork-card" style={{ display: 'block' }}>
      {/* Image */}
      <div className="artwork-img-wrap">
        {artwork.image_url ? (
          <img src={artwork.image_url} alt={artwork.title} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'var(--hull)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: '0.5rem',
            color: 'var(--dead)', letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>
            NO IMAGE
          </div>
        )}
        {/* Badge top-left */}
        <div className="artwork-badge-row" style={{ gap: '1px' }}>
          {badge()}
          {isAuction && <span className="badge badge-live">LIVE</span>}
          {artwork.is_blind && !artwork.revealed && (
            <span className="badge" style={{ background: 'rgba(230, 25, 25, 0.15)', color: 'var(--crimson)', border: '1px solid rgba(230, 25, 25, 0.35)' }}>
              BLIND
            </span>
          )}
          {artwork.is_pinned && (
            <span className="badge" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.35)' }}>
              ⭐ PINNED
            </span>
          )}
          {artwork.is_nsfw && (
            <span className="badge" style={{ background: 'var(--hull)', color: 'var(--shadow-type)' }}>18+</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="artwork-body">
        <div className="artwork-title" style={{ textWrap: 'balance' } as React.CSSProperties}>
          {artwork.title}
        </div>
        <div className="artwork-artist" style={{ color: artwork.is_blind && !artwork.revealed ? 'var(--crimson)' : undefined }}>
          {artwork.is_blind && !artwork.revealed 
            ? (artwork.blind_cipher || 'Masked Artisan') 
            : (artwork.artist?.username ?? 'Independent Artist')}
        </div>
        {artwork.description && (
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.8125rem',
            color: 'var(--ghost)', lineHeight: 1.5, marginBottom: '12px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as React.CSSProperties}>
            {artwork.description}
          </p>
        )}
        {!artwork.is_blind && artwork.artist && (
          <div style={{ marginBottom: '12px' }}>
            <StarRating rating={artwork.artist.average_rating ?? 0} count={artwork.artist.total_reviews ?? 0} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="artwork-footer">
        <div>
          {isAuction && artwork.auction_end_time ? (
            <>
              <div className="artwork-price-label">Bid ends</div>
              <Countdown endTime={artwork.auction_end_time} />
            </>
          ) : (
            <>
              <div className="artwork-price-label">Price</div>
              <div className="artwork-price" style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                {artwork.price_cr != null ? (
                  <>
                    <span>{artwork.price_cr.toLocaleString()} CR</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--antique-gold)', fontWeight: 400 }}>
                      ({(artwork.price_cr / 1000).toLocaleString()} XAN)
                    </span>
                  </>
                ) : artwork.price_torn != null ? (
                  `$${artwork.price_torn.toLocaleString()}`
                ) : (
                  'Open'
                )}
              </div>
            </>
          )}
        </div>
        {isAuction && (artwork.current_bid_cr != null || artwork.current_bid != null) && (
          <div style={{ textAlign: 'right' }}>
            <div className="artwork-price-label">Top bid</div>
            <div className="artwork-price" style={{ color: 'var(--neon-magenta)', display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '6px' }}>
              {artwork.current_bid_cr != null ? (
                <>
                  <span>{artwork.current_bid_cr.toLocaleString()} CR</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--antique-gold)', fontWeight: 400 }}>
                    ({(artwork.current_bid_cr / 1000).toLocaleString()} XAN)
                  </span>
                </>
              ) : (
                `$${artwork.current_bid?.toLocaleString()}`
              )}
            </div>
          </div>
        )}
        {artwork.tags && artwork.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '1px', flexWrap: 'wrap' }}>
            {artwork.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="badge badge-edition">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

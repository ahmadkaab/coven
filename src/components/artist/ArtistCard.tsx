import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Artist } from '../../types';
import { CheckCircle, Star, TrendUp, Broadcast } from '@phosphor-icons/react';
import { useAuthStore } from '../../store/authStore';
import { isFollowing, toggleFollow } from '../../services/followService';

interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const { user } = useAuthStore();
  const userId = user ? String(user.player_id) : 'demo';
  const [isPinned, setIsPinned] = useState(() => isFollowing(userId, artist.id));

  const initials = artist.username.slice(0, 2).toUpperCase();
  const tierBadge = () => {
    if (artist.tier === 'legend')  return <span className="badge badge-legend">LEGEND</span>;
    if (artist.tier === 'master')  return <span className="badge badge-master">MASTER</span>;
    if (artist.tier === 'rising')  return <span className="badge badge-rising">RISING</span>;
    return null;
  };

  return (
    <Link to={`/artist/${artist.id}`} className="artist-card" style={{ display: 'flex', position: 'relative' }}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const next = toggleFollow(userId, { id: artist.id, username: artist.username });
          setIsPinned(next);
        }}
        className={`artist-card-radar-btn${isPinned ? ' pinned' : ''}`}
        title={isPinned ? 'Pinned to Radar (click to unpin)' : 'Pin to Syndicate Radar'}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: isPinned ? 'rgba(0, 255, 100, 0.15)' : 'rgba(8, 8, 8, 0.6)',
          border: `1px solid ${isPinned ? 'var(--term-green)' : 'var(--seam)'}`,
          color: isPinned ? 'var(--term-green)' : 'var(--ghost)',
          borderRadius: '2px',
          padding: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
          zIndex: 4,
        }}
      >
        <Broadcast size={13} weight={isPinned ? 'fill' : 'bold'} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
        {artist.avatar_url ? (
          <img src={artist.avatar_url} alt={artist.username} className="artist-avatar" />
        ) : (
          <div className="artist-avatar-placeholder">{initials}</div>
        )}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div className="artist-name">{artist.username}</div>
            {artist.is_verified && (
              <CheckCircle size={14} color="var(--term-green)" weight="fill" aria-label="Verified" />
            )}
          </div>
          <div className="artist-id">TID #{artist.torn_id ?? '------'}</div>
          <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {tierBadge()}
            {artist.specialization && (
              <span className="badge badge-edition">{artist.specialization}</span>
            )}
          </div>
        </div>
      </div>

      {artist.bio && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.8125rem',
          color: 'var(--ghost)', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', marginBottom: 'var(--sp-4)',
        } as React.CSSProperties}>
          {artist.bio}
        </p>
      )}

      {/* Stats compartmentalized grid */}
      <div className="artist-stats-row" style={{ marginTop: 'auto' }}>
        <div className="artist-stat-cell">
          <div className="artist-stat-val">{artist.portfolio_count ?? 0}</div>
          <div className="artist-stat-lbl">Works</div>
        </div>
        <div className="artist-stat-cell">
          <div className="artist-stat-val" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Star size={12} color="var(--phosphor)" weight="fill" />
            {artist.average_rating?.toFixed(1) ?? '—'}
          </div>
          <div className="artist-stat-lbl">Rating</div>
        </div>
        <div className="artist-stat-cell">
          <div className="artist-stat-val" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <TrendUp size={12} color="var(--term-green)" weight="bold" />
            {artist.total_sales ?? 0}
          </div>
          <div className="artist-stat-lbl">Sales</div>
        </div>
      </div>
    </Link>
  );
}

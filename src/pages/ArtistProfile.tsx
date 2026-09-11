import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle,
  Star,
  TrendUp,
  Palette,
  TerminalWindow,
  Sparkle,
  ChatCircleText,
  Chats,
  Broadcast,
} from '@phosphor-icons/react';
import { useArtist, useArtistReviews, useArtworks } from '../hooks/useData';
import { useArtistStudio } from '../hooks/useStudio';
import { useAuthStore } from '../store/authStore';
import { isFollowing, toggleFollow, getFollowerCount } from '../services/followService';
import { ArtworkCard } from '../components/artwork/ArtworkCard';
import { StarRating } from '../components/common/StarRating';
import { CommissionModal } from '../components/commission/CommissionModal';
import { BBCodeModal } from '../components/common/BBCodeModal';
import { CommissionQueueBoard } from '../components/artist/CommissionQueueBoard';
import { StudioSpotlight } from '../components/artist/StudioSpotlight';
import { ForumShopModal } from '../components/artist/ForumShopModal';
import { generateArtistBBCode } from '../utils/bbcode';
import { generateArtistTornHtml } from '../utils/tornHtml';
import { timeAgo, tierLabel } from '../utils/format';

/* ── Skeleton ─────────────────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <main className="page-content">
      <div style={{ borderBottom: '2px solid var(--red)', background: 'var(--pit)', paddingTop: '24px', paddingBottom: 'var(--sp-8)' }}>
        <div className="container" style={{ paddingTop: 'var(--sp-8)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 240px', gap: 'var(--sp-8)', alignItems: 'center' }}>
            <div className="skeleton" style={{ width: 120, height: 120 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <div className="skeleton" style={{ height: 48, width: '60%' }} />
              <div className="skeleton" style={{ height: 16, width: '40%' }} />
            </div>
            <div className="skeleton" style={{ height: 140 }} />
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Review Card ──────────────────────────────────────────────── */
function ReviewCard({ review }: { review: any }) {
  return (
    <div style={{ background: 'var(--plate)', border: '1px solid var(--hull)', padding: 'var(--sp-5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <div className="artist-avatar-placeholder" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
            {(review.reviewer?.username ?? '?').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--phosphor)' }}>
              {review.reviewer?.username ?? 'Anonymous'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)' }}>
              {timeAgo(review.created_at)}
            </div>
          </div>
        </div>
        <StarRating rating={review.rating} size={11} />
      </div>
      {review.body && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--ghost)', lineHeight: 1.7 }}>
          {review.body}
        </p>
      )}
    </div>
  );
}

/* ── MAIN PAGE ────────────────────────────────────────────────── */
export function ArtistProfile() {
  const { id } = useParams<{ id: string }>();
  const reduce = useReducedMotion();
  const [showCommission, setShowCommission] = useState(false);
  const [showBBCode, setShowBBCode] = useState(false);
  const [showForumShop, setShowForumShop] = useState(false);

  const { user } = useAuthStore();
  const userId = user ? String(user.player_id) : 'demo';

  const [isPinned, setIsPinned] = useState(() => id ? isFollowing(userId, id) : false);
  const [followerCount, setFollowerCount] = useState(() => id ? getFollowerCount(id, userId) : 0);

  const { data: artist, isLoading } = useArtist(id ?? '');
  const { data: reviews = [] } = useArtistReviews(id ?? '');
  const { data: artworksResult } = useArtworks({ artistId: id, status: 'available', perPage: 12 });
  const artworks = artworksResult?.data ?? [];

  const { studio, openSlotCount } = useArtistStudio(id, artist ?? undefined);
  const featuredArt = artworks.find((a) => a.id === studio.featuredArtworkId) || artworks[0];

  if (isLoading) return <ProfileSkeleton />;

  if (!artist) {
    return (
      <main className="page-content">
        <div className="container" style={{ paddingTop: 'var(--sp-20)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--hull)', textTransform: 'uppercase', letterSpacing: '-0.04em' }}>
            ARTIST NOT FOUND
          </div>
          <Link to="/artists" className="btn btn-industrial" style={{ marginTop: 'var(--sp-6)', display: 'inline-flex' }}>
            <ArrowLeft size={12} weight="bold" />Artists
          </Link>
        </div>
      </main>
    );
  }

  const initials = artist.username.slice(0, 2).toUpperCase();

  return (
    <main className="page-content" style={{ paddingBottom: 'var(--sp-20)' }}>

      {/* ── PROFILE HEADER ────────────────────────────────────────── */}
      <div style={{ borderBottom: '2px solid var(--red)', background: 'var(--pit)', paddingTop: '24px' }}>
        <div className="container">
          <Link
            to="/artists"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
              color: 'var(--ghost)', letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: 'var(--sp-6)', marginTop: 'var(--sp-4)',
            }}
          >
            <ArrowLeft size={10} weight="bold" />Artists
          </Link>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 'var(--sp-8)',
            alignItems: 'center',
            paddingBottom: 'var(--sp-8)',
          }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              {artist.avatar_url ? (
                <img src={artist.avatar_url} alt={artist.username} style={{ width: 100, height: 100, objectFit: 'cover', display: 'block' }} />
              ) : (
                <div className="artist-avatar-placeholder" style={{ width: 100, height: 100, fontSize: '2rem' }}>
                  {initials}
                </div>
              )}
              {artist.is_verified && (
                <CheckCircle
                  size={20} color="var(--term-green)" weight="fill"
                  style={{ position: 'absolute', bottom: -4, right: -4 }}
                  aria-label="Verified"
                />
              )}
            </div>

            {/* Name + Studio Branding + Bio */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    color: 'var(--red)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Sparkle size={10} weight="fill" />
                  {studio.studioName}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5625rem',
                    padding: '2px 6px',
                    background: studio.status === 'open' ? 'rgba(0, 255, 100, 0.1)' : 'rgba(230, 25, 25, 0.1)',
                    color: studio.status === 'open' ? 'var(--term-green)' : 'var(--red)',
                    border: `1px solid ${studio.status === 'open' ? 'rgba(0, 255, 100, 0.3)' : 'rgba(230, 25, 25, 0.3)'}`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {studio.status === 'open' ? `● COMMISSIONS OPEN (${openSlotCount} SLOTS)` : `▲ ${studio.status.toUpperCase()}`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)', flexWrap: 'wrap' }}>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 5vw, 4rem)',
                  lineHeight: 0.9, letterSpacing: '-0.04em',
                  textTransform: 'uppercase', color: 'var(--phosphor)',
                }}>
                  {artist.username}
                </h1>
                {artist.tier && (
                  <span className={`badge badge-${artist.tier}`} style={{ fontSize: '0.6875rem' }}>
                    {tierLabel(artist.tier).toUpperCase()}
                  </span>
                )}
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--shadow-type)', letterSpacing: '0.1em', marginBottom: 'var(--sp-2)' }}>
                TID #{artist.torn_id ?? '------'} / {artist.specialization ?? 'General Art'}
              </div>

              {studio.tagline && (
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--phosphor)',
                    marginBottom: 'var(--sp-3)',
                    letterSpacing: '0.04em',
                    lineHeight: 1.4,
                  }}
                >
                  "{studio.tagline}"
                </div>
              )}

              {artist.bio && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--ghost)', lineHeight: 1.8, maxWidth: 520 }}>
                  {artist.bio}
                </p>
              )}
              {artist.specialties && artist.specialties.length > 0 && (
                <div style={{ display: 'flex', gap: '1px', flexWrap: 'wrap', marginTop: 'var(--sp-4)', background: 'var(--seam)' }}>
                  {artist.specialties.map((s) => (
                    <span key={s} className="badge badge-edition">{s}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Stats + CTA block */}
            <div style={{ background: 'var(--void)', border: '1px solid var(--hull)', minWidth: 220 }}>
              {/* Stats compartment */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--seam)' }}>
                {[
                  { icon: <Palette size={10} weight="bold" />, val: artist.portfolio_count ?? artworks.length, lbl: 'Works' },
                  { icon: <TrendUp size={10} weight="bold" color="var(--term-green)" />, val: artist.total_sales ?? 0, lbl: 'Sales' },
                  { icon: <Star size={10} weight="fill" />, val: (artist.average_rating ?? 0).toFixed(1), lbl: 'Rating' },
                  { icon: <Broadcast size={10} weight="bold" color="var(--term-green)" />, val: followerCount, lbl: 'Radar Pins' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--pit)', padding: 'var(--sp-4)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '-0.04em', color: 'var(--phosphor)', lineHeight: 1 }}>
                      {s.val}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {s.icon}{s.lbl}
                    </div>
                  </div>
                ))}
              </div>

              {/* Commission CTA & BBCode Export */}
              <div style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', borderRadius: 0 }}
                  onClick={() => setShowCommission(true)}
                >
                  REQUEST COMMISSION
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${isPinned ? 'btn-industrial' : 'btn-ghost'}`}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    borderRadius: 0,
                    gap: '6px',
                    borderColor: isPinned ? 'var(--term-green)' : 'rgba(255, 255, 255, 0.2)',
                    color: isPinned ? 'var(--term-green)' : 'var(--phosphor)',
                  }}
                  onClick={() => {
                    if (!artist) return;
                    const next = toggleFollow(userId, { id: artist.id, username: artist.username });
                    setIsPinned(next);
                    setFollowerCount(getFollowerCount(artist.id, userId));
                  }}
                  title={isPinned ? 'Unpin from Syndicate Radar' : 'Pin to Syndicate Radar for live drop alerts'}
                >
                  <Broadcast size={13} weight={isPinned ? 'fill' : 'bold'} />
                  {isPinned ? 'PINNED TO RADAR' : '+ PIN TO RADAR'}
                </button>
                <Link
                  to={`/dispatches?artistId=${artist.id}`}
                  className="btn btn-ghost btn-sm"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    borderRadius: 0,
                    gap: '6px',
                    borderColor: 'rgba(0, 255, 100, 0.3)',
                    color: 'var(--phosphor)',
                  }}
                  title="Transmit encrypted direct message on The Wire"
                >
                  <Chats size={12} weight="bold" color="var(--term-green)" />
                  TRANSMIT DISPATCH
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    borderRadius: 0,
                    gap: '6px',
                    borderColor: 'rgba(230, 25, 25, 0.4)',
                    color: 'var(--phosphor)',
                  }}
                  onClick={() => setShowForumShop(true)}
                  title="Generate complete Torn City Graphic & Art forum shop thread"
                >
                  <TerminalWindow size={12} weight="bold" color="var(--red)" />
                  FORUM SHOP BBCODE
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'center', borderRadius: 0, gap: '6px' }}
                  onClick={() => setShowBBCode(true)}
                  title="Export quick artist badge BBCode"
                >
                  <ChatCircleText size={12} weight="bold" />
                  QUICK BADGE BBCODE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STUDIO HUB & COMMISSION QUEUE ──────────────────────────── */}
      <div className="container" style={{ paddingTop: 'var(--sp-8)' }}>
        {featuredArt && (
          <StudioSpotlight
            artwork={featuredArt}
            studioName={studio.studioName}
            onRequestSimilar={() => setShowCommission(true)}
          />
        )}

        <CommissionQueueBoard
          queueSlots={studio.queueSlots}
          studioStatus={studio.status}
          turnaroundDays={studio.turnaroundDays}
          onRequestCommission={() => setShowCommission(true)}
        />
      </div>

      {/* ── PORTFOLIO ─────────────────────────────────────────────── */}
      <motion.div
        className="container"
        style={{ paddingTop: 'var(--sp-12)' }}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--seam)', paddingBottom: 'var(--sp-4)',
        }}>
          <h2 className="section-h2">PORTFOLIO</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
            {artworks.length} work{artworks.length !== 1 ? 's' : ''}
          </span>
        </div>

        {artworks.length === 0 ? (
          <div style={{
            padding: 'var(--sp-16)', textAlign: 'center',
            border: '1px solid var(--hull)', background: 'var(--plate)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '-0.04em', color: 'var(--hull)' }}>
              EMPTY
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', marginTop: '8px' }}>
              No artworks listed yet.
            </div>
          </div>
        ) : (
          <div className="artwork-grid">
            {artworks.map((artwork, i) => (
              <motion.div
                key={artwork.id}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <ArtworkCard artwork={artwork} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── REPUTATION / REVIEWS ──────────────────────────────────── */}
      <motion.div
        className="container"
        style={{ paddingTop: 'var(--sp-12)' }}
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--seam)', paddingBottom: 'var(--sp-4)',
        }}>
          <div>
            <div className="section-label">Buyer Reviews</div>
            <h2 className="section-h2">REPUTATION</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <StarRating rating={artist.average_rating ?? 0} count={reviews.length} />
          </div>
        </div>

        {reviews.length === 0 ? (
          <div style={{
            padding: 'var(--sp-12)', textAlign: 'center',
            border: '1px solid var(--hull)', background: 'var(--plate)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '-0.04em', color: 'var(--hull)' }}>
              NO REVIEWS RECORDED
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', marginTop: '8px' }}>
              Verified buyers can submit a rating and review upon completing a transaction with this artist.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1px', background: 'var(--seam)' }}>
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}
      </motion.div>

      {/* Commission request slide-in modal */}
      {showCommission && (
        <CommissionModal
          artist={artist}
          onClose={() => setShowCommission(false)}
        />
      )}

      {/* Torn Forum Shop Thread BBCode Modal */}
      {showForumShop && (
        <ForumShopModal
          studio={studio}
          artist={artist}
          featuredArt={featuredArt}
          reviews={reviews}
          onClose={() => setShowForumShop(false)}
        />
      )}

      {/* Torn Quick Raw HTML / BBCode Exporter Modal */}
      {showBBCode && (
        <BBCodeModal
          title={`Artist Dossier: ${artist.username}`}
          subtitle="Ready to paste into Torn City Graphic & Art forums or trade threads (600px)"
          bbcode={generateArtistBBCode(artist, window.location.href)}
          rawHtml={generateArtistTornHtml(artist, window.location.href)}
          onClose={() => setShowBBCode(false)}
        />
      )}
    </main>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { MagnifyingGlass, SlidersHorizontal, X, Broadcast } from '@phosphor-icons/react';
import { ArtworkCard } from '../components/artwork/ArtworkCard';
import { useArtworks } from '../hooks/useData';
import { useAuthStore } from '../store/authStore';
import { getFollowedArtistIds } from '../services/followService';
import type { ArtworkFilters, ListingType } from '../types';

const FILTERS = ['All', 'Digital Art', 'Pixel Art', 'Scene Art', 'Logos', 'Portraits', 'Banners', 'Dark Art'];
const SORT_OPTIONS = ['Newest', 'Oldest', 'Price ↑', 'Price ↓'];

const SORT_MAP: Record<string, ArtworkFilters['sort']> = {
  'Newest':  'newest',
  'Oldest':  'oldest',
  'Price ↑': 'price_asc',
  'Price ↓': 'price_desc',
};

const TYPE_TABS: { label: string; value: ListingType | undefined }[] = [
  { label: 'All',      value: undefined },
  { label: 'For Sale', value: 'fixed' },
  { label: 'Auctions', value: 'auction' },
];

export function Browse() {
  const reduce = useReducedMotion();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAuctionsRoute = location.pathname === '/auctions';
  const initialQ = searchParams.get('q') || '';
  const initialTag = searchParams.get('tag') || 'All';
  const initialType = (searchParams.get('type') as ListingType) || (isAuctionsRoute ? 'auction' : undefined);

  const { user } = useAuthStore();
  const userId = user ? String(user.player_id) : 'demo';

  const [search, setSearch]             = useState(initialQ);
  const [activeFilter, setActiveFilter] = useState(initialTag);
  const [activeSort, setActiveSort]     = useState('Newest');
  const [activeType, setActiveType]     = useState<ListingType | undefined>(initialType);
  const [showFilters, setShowFilters]   = useState(false);
  const [debouncedSearch, setDebounced] = useState(initialQ);
  const [radarOnly, setRadarOnly]       = useState(false);
  const [followedIds, setFollowedIds]   = useState(() => getFollowedArtistIds(userId));

  useEffect(() => {
    const handleRadar = () => setFollowedIds(getFollowedArtistIds(userId));
    window.addEventListener('coven:radar_update', handleRadar);
    return () => window.removeEventListener('coven:radar_update', handleRadar);
  }, [userId]);

  // Sync state if URL searchParams change externally
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const tag = searchParams.get('tag') || 'All';
    const type = (searchParams.get('type') as ListingType) || (location.pathname === '/auctions' ? 'auction' : undefined);
    setSearch(q);
    setDebounced(q);
    setActiveFilter(tag);
    setActiveType(type);
  }, [searchParams, location.pathname]);

  // Debounce search typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      // Sync with URL query params
      const params = new URLSearchParams(searchParams);
      if (search.trim()) {
        params.set('q', search.trim());
      } else {
        params.delete('q');
      }
      if (activeFilter !== 'All') {
        params.set('tag', activeFilter);
      } else {
        params.delete('tag');
      }
      if (activeType) {
        params.set('type', activeType);
      } else {
        params.delete('type');
      }
      setSearchParams(params, { replace: true });
    }, 350);

    return () => clearTimeout(timer);
  }, [search, activeFilter, activeType]);

  const filters: ArtworkFilters = {
    status:      'available',
    sort:        SORT_MAP[activeSort],
    listingType: activeType,
    tags:        activeFilter !== 'All' ? [activeFilter] : undefined,
    search:      debouncedSearch || undefined,
    perPage:     24,
  };

  const { data: result, isLoading } = useArtworks(filters);
  const artworks = result?.data ?? [];
  const total    = result?.count ?? 0;

  const displayedArtworks = useMemo(() => {
    if (!radarOnly) return artworks;
    return artworks.filter(a => followedIds.includes(a.artist_id));
  }, [artworks, radarOnly, followedIds]);

  return (
    <main className="page-content" style={{ paddingBottom: 'var(--sp-20)' }}>

      {/* ── RENAISSANCE HEADER ─────────────────────────────────────────── */}
      <div className="renaissance-page-header">
        <div className="container">
          <div>
            <div className="renaissance-chapter-tag">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-magenta)', display: 'inline-block', boxShadow: '0 0 8px var(--neon-magenta)' }} />
              MARKETPLACE &bull; {isLoading ? 'LOADING ARTWORKS...' : `${total} ARTWORKS AVAILABLE`}
            </div>
            <h1 className="renaissance-title">
              Marketplace
            </h1>
            <p className="renaissance-subtitle">
              Explore unique digital art, custom forum signatures, and faction banners. Instant purchases and mystery blind auctions backed by safe Xanax escrow (1 Xanax = 1,000 Credits).
            </p>
          </div>

          {/* Type tabs */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '24px', marginBottom: '16px' }}>
            {TYPE_TABS.map((t) => (
              <button
                key={t.label}
                onClick={() => setActiveType(t.value)}
                className={`renaissance-pill${activeType === t.value ? ' active' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search + filter row */}
          <div style={{
            display: 'flex', gap: '12px', flexWrap: 'wrap',
            alignItems: 'center', marginBottom: '16px'
          }}>
            <div className="renaissance-glass-panel" style={{
              display: 'flex', alignItems: 'center',
              padding: '0 16px',
              borderRadius: '8px',
              flex: '1 1 240px',
              minHeight: '44px'
            }}>
              <span style={{ color: 'var(--antique-gold)', display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                <MagnifyingGlass size={16} weight="bold" />
              </span>
              <input
                className="search-input"
                type="text"
                placeholder="Search by title, artist, or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="browse-search"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '12px 0',
                  color: 'var(--phosphor)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  minWidth: 0
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ghost)',
                    cursor: 'pointer',
                    padding: '0 8px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Clear search"
                >
                  <X size={14} weight="bold" />
                </button>
              )}
            </div>
            <button
              className="btn btn-ghost"
              style={{
                padding: '10px 18px', gap: '8px', borderRadius: '8px',
                border: '1px solid rgba(244, 241, 234, 0.08)',
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                color: showFilters ? 'var(--neon-magenta)' : 'var(--phosphor)',
                background: showFilters ? 'rgba(255, 0, 127, 0.08)' : 'rgba(244, 241, 234, 0.02)',
                minHeight: '44px'
              }}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={14} weight="bold" />
              Filter
            </button>
          </div>

          {/* Tag chips + sort */}
          <div className="no-scrollbar" style={{ padding: 'var(--sp-2) 0 var(--sp-4)', borderTop: '1px solid rgba(244, 241, 234, 0.06)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div className="filter-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`renaissance-pill${activeFilter === f ? ' active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                  style={{ padding: '6px 14px', whiteSpace: 'nowrap', minHeight: '36px' }}
                >
                  {f}
                </button>
              ))}
              <button
                type="button"
                className={`renaissance-pill${radarOnly ? ' active' : ''}`}
                onClick={() => setRadarOnly(!radarOnly)}
                style={{
                  padding: '6px 14px',
                  borderColor: radarOnly ? 'var(--neon-magenta)' : undefined,
                  color: radarOnly ? 'var(--neon-magenta)' : undefined,
                  whiteSpace: 'nowrap',
                  minHeight: '36px'
                }}
                title="Filter to artworks by artists pinned to your Syndicate Radar"
              >
                <Broadcast size={12} weight={radarOnly ? 'fill' : 'bold'} />
                RADAR ({followedIds.length})
              </button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s}
                    className={`chip${activeSort === s ? ' active' : ''}`}
                    onClick={() => setActiveSort(s)}
                    style={{
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      border: activeSort === s ? '1px solid var(--antique-gold)' : '1px solid transparent',
                      background: activeSort === s ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                      color: activeSort === s ? 'var(--antique-gold)' : 'var(--ghost)',
                      minHeight: '36px',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID ───────────────────────────────────────────── */}
      <div className="container section-pad">

        {/* Skeleton loading */}
        {isLoading && (
          <div className="artwork-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: 'var(--plate)', border: '1px solid var(--hull)' }}>
                <div className="skeleton" style={{ aspectRatio: '4/3' }} />
                <div style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  <div className="skeleton" style={{ height: 18, width: '70%' }} />
                  <div className="skeleton" style={{ height: 12, width: '40%' }} />
                  <div className="skeleton" style={{ height: 24, width: '50%', marginTop: 'var(--sp-2)' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && displayedArtworks.length === 0 && (
          <div style={{ padding: 'var(--sp-20) 0', textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '3rem',
              textTransform: 'uppercase', color: 'var(--hull)',
              letterSpacing: '-0.04em', marginBottom: 'var(--sp-4)',
            }}>
              {radarOnly ? 'NO RADAR DROPS' : (debouncedSearch || activeFilter !== 'All' ? 'NO RESULTS' : 'MARKET EMPTY')}
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--shadow-type)', maxWidth: '480px', margin: '0 auto' }}>
              {radarOnly
                ? 'No available pieces from your pinned artists. Pin more artists to your Syndicate Radar.'
                : (debouncedSearch || activeFilter !== 'All'
                  ? 'Try a different search keyword or category filter above.'
                  : 'There are no active artwork listings currently in this view.')}
            </p>
            <div style={{ marginTop: 'var(--sp-6)', display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {user?.player_id === 4295891 ? (
                <Link to="/list-artwork" className="btn btn-industrial">
                  + List New Artwork
                </Link>
              ) : (
                <Link to="/commissions" className="renaissance-btn-gold" style={{ textDecoration: 'none', padding: '10px 18px', fontSize: '0.75rem' }}>
                  Commission Ahmad Directly
                </Link>
              )}
              <Link to="/wallet" className="btn btn-ghost">
                ⚡ Wallet &amp; Escrow
              </Link>
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && displayedArtworks.length > 0 && (
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', marginBottom: 'var(--sp-6)', letterSpacing: '0.1em' }}>
              {displayedArtworks.length} RESULT{displayedArtworks.length !== 1 ? 'S' : ''} / {activeSort.toUpperCase()}{radarOnly ? ' [RADAR FILTER ACTIVE]' : ''}
            </div>
            <div className="artwork-grid">
              {displayedArtworks.map((artwork, i) => (
                <motion.div
                  key={artwork.id}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.4, delay: (i % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ArtworkCard artwork={artwork} />
                </motion.div>
              ))}
            </div>
            {result?.hasMore && (
              <div style={{ textAlign: 'center', marginTop: 'var(--sp-12)' }}>
                <button className="btn btn-industrial">LOAD MORE</button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

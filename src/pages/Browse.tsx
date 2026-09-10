import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
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

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{ borderBottom: '2px solid var(--red)', background: 'var(--pit)', paddingTop: '24px' }}>
        <div className="container">
          <div style={{ padding: 'var(--sp-6) 0 var(--sp-2)' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.5625rem',
              color: 'var(--shadow-type)', letterSpacing: '0.2em',
              textTransform: 'uppercase', marginBottom: 'var(--sp-2)',
            }}>
              [ MARKET — {isLoading ? '—' : total} LISTINGS ]
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 6rem)',
              lineHeight: 0.9, letterSpacing: '-0.04em',
              textTransform: 'uppercase', color: 'var(--phosphor)',
              marginBottom: 'var(--sp-4)',
            }}>
              BROWSE ART
            </h1>
          </div>

          {/* Type tabs */}
          <div style={{ display: 'flex', gap: '1px', background: 'var(--seam)' }}>
            {TYPE_TABS.map((t) => (
              <button
                key={t.label}
                onClick={() => setActiveType(t.value)}
                style={{
                  padding: 'var(--sp-3) var(--sp-5)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: activeType === t.value ? 'var(--void)' : 'var(--plate)',
                  color: activeType === t.value ? 'var(--phosphor)' : 'var(--ghost)',
                  borderBottom: activeType === t.value ? '2px solid var(--red)' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search + filter row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1px', background: 'var(--seam)', marginTop: '1px' }}>
            <div className="search-wrap" style={{ background: 'var(--void)', display: 'flex', alignItems: 'center' }}>
              <span className="search-icon"><MagnifyingGlass size={16} weight="bold" /></span>
              <input
                className="search-input"
                type="text"
                placeholder="SEARCH ARTWORKS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="browse-search"
                style={{ flex: 1 }}
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
                    padding: '0 var(--sp-3)',
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
              className="btn btn-industrial"
              style={{ padding: '0 var(--sp-6)', gap: '8px', borderRadius: 0 }}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={13} weight="bold" />FILTER
            </button>
          </div>

          {/* Tag chips + sort */}
          <div style={{ padding: 'var(--sp-3) 0', borderTop: '1px solid var(--hull)', overflowX: 'auto' }}>
            <div className="filter-row">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`chip${activeFilter === f ? ' active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
              <button
                type="button"
                className={`chip${radarOnly ? ' active' : ''}`}
                onClick={() => setRadarOnly(!radarOnly)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderColor: radarOnly ? 'var(--term-green)' : undefined,
                  color: radarOnly ? 'var(--term-green)' : undefined,
                  background: radarOnly ? 'rgba(0, 255, 100, 0.08)' : undefined,
                }}
                title="Filter to artworks by artists pinned to your Syndicate Radar"
              >
                <Broadcast size={12} weight={radarOnly ? 'fill' : 'bold'} />
                RADAR ONLY ({followedIds.length})
              </button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '1px', background: 'var(--seam)' }}>
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s}
                    className={`chip${activeSort === s ? ' active' : ''}`}
                    onClick={() => setActiveSort(s)}
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
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--shadow-type)' }}>
              {radarOnly
                ? 'No available pieces from your pinned artists. Pin more artists to your Syndicate Radar.'
                : (debouncedSearch || activeFilter !== 'All'
                  ? 'Try a different search or filter'
                  : 'Be the first to list artwork on COVEN')}
            </p>
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

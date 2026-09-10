import { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { ArtistCard } from '../components/artist/ArtistCard';
import { useArtists } from '../hooks/useData';
import type { ArtistFilters } from '../types';

const TIERS = ['All', 'Rising', 'Trusted', 'Master', 'Legend'];
const SPECS = ['All', 'Digital Art', 'Pixel Art', 'Scene Art', 'Logo & Branding', 'Portraits', 'Dark Art', 'Banners'];
const SORT_OPTIONS: { label: string; value: ArtistFilters['sort'] }[] = [
  { label: 'Top Rated',    value: 'rating' },
  { label: 'Most Sales',   value: 'sales' },
  { label: 'Newest',       value: 'newest' },
];

export function Artists() {
  const reduce = useReducedMotion();
  const [search, setSearch]     = useState('');
  const [tier, setTier]         = useState('All');
  const [spec, setSpec]         = useState('All');
  const [sort, setSort]         = useState<ArtistFilters['sort']>('rating');
  const [debouncedSearch, setDebounced] = useState('');

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = (val: string) => {
    setSearch(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebounced(val), 400);
  };

  const filters: ArtistFilters = {
    sort,
    tier:           tier !== 'All' ? tier.toLowerCase() as any : undefined,
    specialization: spec !== 'All' ? spec : undefined,
    search:         debouncedSearch || undefined,
    perPage:        30,
  };

  const { data: result, isLoading } = useArtists(filters);
  const artists = result?.data ?? [];
  const total   = result?.count ?? 0;

  return (
    <main className="page-content" style={{ paddingBottom: 'var(--sp-20)' }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{ borderBottom: '2px solid var(--red)', background: 'var(--pit)', paddingTop: '24px' }}>
        <div className="container">
          <div style={{ padding: 'var(--sp-8) 0 var(--sp-5)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
              [ {isLoading ? '—' : total} REGISTERED ARTISTS ]
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 6rem)',
              lineHeight: 0.9, letterSpacing: '-0.04em',
              textTransform: 'uppercase', color: 'var(--phosphor)',
              marginBottom: 'var(--sp-4)',
            }}>
              THE COVEN
            </h1>
          </div>

          {/* Search */}
          <div style={{ borderTop: '1px solid var(--seam)' }}>
            <div className="search-wrap" style={{ background: 'var(--void)' }}>
              <span className="search-icon"><MagnifyingGlass size={16} weight="bold" /></span>
              <input
                className="search-input"
                type="text"
                placeholder="SEARCH ARTISTS..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                id="artists-search"
              />
            </div>
          </div>

          {/* Tier + spec + sort chips */}
          <div style={{ padding: 'var(--sp-3) 0', borderTop: '1px solid var(--hull)', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div className="filter-row">
                {TIERS.map((t) => (
                  <button key={t} className={`chip${tier === t ? ' active' : ''}`} onClick={() => setTier(t)}>{t}</button>
                ))}
              </div>
              <div className="filter-row">
                {SORT_OPTIONS.map((s) => (
                  <button key={s.label} className={`chip${sort === s.value ? ' active' : ''}`} onClick={() => setSort(s.value)}>{s.label}</button>
                ))}
              </div>
            </div>
            <div className="filter-row" style={{ marginTop: '1px' }}>
              {SPECS.map((s) => (
                <button key={s} className={`chip${spec === s ? ' active' : ''}`} onClick={() => setSpec(s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID ───────────────────────────────────────────── */}
      <div className="container section-pad">

        {/* Skeleton */}
        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'var(--seam)' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: 'var(--plate)', padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
                  <div className="skeleton" style={{ width: 48, height: 48, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                    <div className="skeleton" style={{ height: 20, width: '60%' }} />
                    <div className="skeleton" style={{ height: 12, width: '40%' }} />
                  </div>
                </div>
                <div className="skeleton" style={{ height: 12, width: '90%' }} />
                <div className="skeleton" style={{ height: 12, width: '70%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && artists.length === 0 && (
          <div style={{ padding: 'var(--sp-20) 0', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', textTransform: 'uppercase', color: 'var(--hull)', letterSpacing: '-0.04em', marginBottom: 'var(--sp-4)' }}>
              {debouncedSearch || tier !== 'All' || spec !== 'All' ? 'NO MATCH' : 'NO ARTISTS YET'}
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--shadow-type)' }}>
              {debouncedSearch || tier !== 'All' || spec !== 'All'
                ? 'Adjust your filters'
                : 'Artists are joining — check back soon'}
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && artists.length > 0 && (
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', marginBottom: 'var(--sp-6)', letterSpacing: '0.1em' }}>
              {total} ARTIST{total !== 1 ? 'S' : ''} / {SORT_OPTIONS.find(s => s.value === sort)?.label.toUpperCase()}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'var(--seam)' }}>
              {artists.map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.4, delay: (i % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ArtistCard artist={artist} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

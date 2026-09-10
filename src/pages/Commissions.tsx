import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  PaintBrush, ShieldCheck, CurrencyCircleDollar,
  Star, CheckCircle, CaretRight
} from '@phosphor-icons/react';
import { useArtists } from '../hooks/useData';
import { CommissionModal } from '../components/commission/CommissionModal';
import { tierLabel } from '../utils/format';
import type { Artist } from '../types';

const CATEGORIES = [
  'ALL',
  'FACTION BANNERS',
  'SCENE ART',
  'LOGOS',
  'SIGNATURES',
  'AVATARS',
  'DIGITAL ART'
] as const;

export function Commissions() {
  const reduce = useReducedMotion();
  const { data: artistsResult, isLoading } = useArtists();
  const artists: Artist[] = artistsResult?.data ?? [];
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const filteredArtists = artists.filter((artist: Artist) => {
    if (selectedCategory === 'ALL') return true;
    const cat = selectedCategory.toLowerCase();
    const spec = (artist.specialization || '').toLowerCase();
    const specialties = (artist.specialties || []).map((s: string) => s.toLowerCase());
    return spec.includes(cat) || specialties.some((s: string) => s.includes(cat) || cat.includes(s));
  });

  return (
    <main className="page-content" style={{ paddingBottom: 'var(--sp-20)' }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{ borderBottom: '2px solid var(--red)', background: 'var(--pit)', paddingTop: '24px' }}>
        <div className="container">
          <div style={{ padding: 'var(--sp-6) 0 var(--sp-8)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
              [ BESPOKE TORN COMMISSIONS ]
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              lineHeight: 0.9, letterSpacing: '-0.04em', textTransform: 'uppercase', color: 'var(--phosphor)',
            }}>
              COMMISSION ARTISTS
            </h1>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ghost)',
              lineHeight: 1.8, maxWidth: 620, marginTop: 'var(--sp-4)',
            }}>
              Directly commission verified Torn creators for faction banners, profile scenes, corporate logos, and high-impact signatures. Zero platform fees — 100% peer-to-peer Torn cash settlement.
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--sp-10)' }}>

        {/* ── HOW COMMISSIONS WORK (INDUSTRIAL PROTOCOL) ───── */}
        <div style={{ marginBottom: 'var(--sp-12)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>
            [ WORKFLOW PROTOCOL ]
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: 'var(--seam)' }}>
            {[
              {
                step: '01',
                title: 'SUBMIT BRIEF',
                desc: 'Describe your vision, character references, faction theme, dimensions, and desired budget.',
                icon: <PaintBrush size={20} color="var(--red-hi)" weight="bold" />
              },
              {
                step: '02',
                title: 'CONFIRM SCOPE',
                desc: 'The artist reviews your request in their COVEN dashboard and accepts your timeline.',
                icon: <ShieldCheck size={20} color="var(--term-green)" weight="bold" />
              },
              {
                step: '03',
                title: 'SEND TORN CASH',
                desc: 'Transfer payment directly to the artist on Torn. Verified automatically via API log #4810.',
                icon: <CurrencyCircleDollar size={20} color="var(--phosphor)" weight="bold" />
              },
              {
                step: '04',
                title: 'DELIVERY & REVIEW',
                desc: 'Receive your full-res deliverables, approve completion, and leave a verified review.',
                icon: <CheckCircle size={20} color="var(--term-green)" weight="fill" />
              },
            ].map((p) => (
              <div key={p.step} style={{ background: 'var(--plate)', padding: 'var(--sp-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--red-hi)', letterSpacing: '0.1em' }}>
                    PROTOCOL {p.step}
                  </span>
                  {p.icon}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--phosphor)', marginBottom: 'var(--sp-2)' }}>
                  {p.title}
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', lineHeight: 1.7 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CATEGORY FILTER ──────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
          <div>
            <h2 className="section-h2" style={{ marginBottom: '2px' }}>SELECT AN ARTIST</h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)' }}>
              FILTER BY SPECIALIZATION
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1px', background: 'var(--seam)', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: 'var(--sp-2) var(--sp-4)',
                  background: selectedCategory === cat ? 'var(--void)' : 'var(--plate)',
                  borderBottom: selectedCategory === cat ? '2px solid var(--red)' : '2px solid transparent',
                  fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: selectedCategory === cat ? 'var(--phosphor)' : 'var(--ghost)',
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── ARTIST ROSTER GRID ───────────────────────────── */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'var(--seam)' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} style={{ background: 'var(--plate)', padding: 'var(--sp-6)', height: 260 }} className="skeleton" />
            ))}
          </div>
        ) : filteredArtists.length === 0 ? (
          <div style={{ padding: 'var(--sp-16)', textAlign: 'center', background: 'var(--plate)', border: '1px solid var(--hull)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', textTransform: 'uppercase', color: 'var(--hull)', letterSpacing: '-0.04em', marginBottom: 'var(--sp-3)' }}>
              NO ARTISTS MATCHING CATEGORY
            </div>
            <button onClick={() => setSelectedCategory('ALL')} className="btn btn-industrial">
              View All Artists
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1px', background: 'var(--seam)' }}>
            {filteredArtists.map((artist: Artist) => (
              <motion.div
                key={artist.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'var(--plate)',
                  padding: 'var(--sp-6)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--sp-4)',
                  position: 'relative',
                }}
              >
                {/* Artist Header */}
                <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
                  {artist.avatar_url ? (
                    <img
                      src={artist.avatar_url}
                      alt={artist.username}
                      style={{ width: 56, height: 56, objectFit: 'cover', border: '1px solid var(--hull)' }}
                    />
                  ) : (
                    <div className="artist-avatar-placeholder" style={{ width: 56, height: 56, fontSize: '1.125rem' }}>
                      {artist.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Link
                        to={`/artist/${artist.id}`}
                        style={{
                          fontFamily: 'var(--font-display)', fontSize: '1.25rem',
                          textTransform: 'uppercase', letterSpacing: '-0.02em',
                          color: 'var(--phosphor)', textDecoration: 'none',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}
                      >
                        {artist.username}
                      </Link>
                      {artist.is_verified && (
                        <CheckCircle size={14} color="var(--term-green)" weight="fill" />
                      )}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', marginTop: '2px' }}>
                      TORN ID #{artist.torn_id} · {tierLabel(artist.tier)}
                    </div>
                  </div>
                </div>

                {/* Bio / Specialization */}
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--red-hi)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {artist.specialization || 'General Artist'}
                  </div>
                  {artist.bio ? (
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--ghost)',
                      lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {artist.bio}
                    </p>
                  ) : (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--shadow-type)' }}>
                      Available for bespoke Torn projects.
                    </p>
                  )}
                </div>

                {/* Specialties tags */}
                {artist.specialties && artist.specialties.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {artist.specialties.slice(0, 4).map((s: string) => (
                      <span key={s} className="badge badge-edition" style={{ fontSize: '0.5rem', padding: '2px 6px' }}>
                        #{s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metrics */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px',
                  background: 'var(--seam)', marginTop: 'auto', paddingTop: 'var(--sp-2)',
                }}>
                  <div style={{ background: 'var(--void)', padding: 'var(--sp-3)' }}>
                    <div className="artwork-price-label">RATING</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Star size={12} color="var(--amber)" weight="fill" />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--phosphor)' }}>
                        {artist.average_rating ? artist.average_rating.toFixed(1) : '—'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)' }}>
                        ({artist.total_reviews || 0})
                      </span>
                    </div>
                  </div>
                  <div style={{ background: 'var(--void)', padding: 'var(--sp-3)' }}>
                    <div className="artwork-price-label">COMPLETED SALES</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--phosphor)', marginTop: '2px' }}>
                      {artist.total_sales || 0}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--seam)', marginTop: 'var(--sp-2)' }}>
                  <Link
                    to={`/artist/${artist.id}`}
                    className="btn btn-ghost"
                    style={{ justifyContent: 'center', fontSize: '0.6875rem', padding: 'var(--sp-3)' }}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => setSelectedArtist(artist)}
                    className="btn btn-primary"
                    style={{ justifyContent: 'center', fontSize: '0.6875rem', padding: 'var(--sp-3)' }}
                  >
                    Commission <CaretRight size={12} weight="bold" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Commission Modal ─────────────────────────────── */}
      {selectedArtist && (
        <CommissionModal
          artist={selectedArtist}
          onClose={() => setSelectedArtist(null)}
        />
      )}
    </main>
  );
}

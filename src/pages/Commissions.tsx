import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  PaintBrush, ShieldCheck, CurrencyCircleDollar,
  Star, CheckCircle, CaretRight, Crown, Sparkle, Lightning
} from '@phosphor-icons/react';
import { useArtists } from '../hooks/useData';
import { CommissionAhmadModal } from '../components/commission/CommissionAhmadModal';
import { AHMAD_SOVEREIGN_ARTIST } from '../services/artistService';
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
  const artists: Artist[] = artistsResult?.data ?? [AHMAD_SOVEREIGN_ARTIST];
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAhmadModalOpen, setIsAhmadModalOpen] = useState(false);

  const filteredArtists = artists.filter((artist: Artist) => {
    if (selectedCategory === 'ALL') return true;
    const cat = selectedCategory.toLowerCase();
    const spec = (artist.specialization || '').toLowerCase();
    const specialties = (artist.specialties || []).map((s: string) => s.toLowerCase());
    return spec.includes(cat) || specialties.some((s: string) => s.includes(cat) || cat.includes(s));
  });

  return (
    <main style={{ minHeight: '100vh', background: 'var(--void)', paddingBottom: 'var(--sp-20)' }}>

      {/* ── RENAISSANCE HEADER ───────────────────────────────── */}
      <div className="renaissance-page-header">
        <div className="container">
          <div className="renaissance-chapter-tag">
            <Crown size={13} weight="fill" />
            Custom Artwork &bull; Direct Commissions
          </div>
          <h1 className="renaissance-title">
            Commission Ahmad [4295891]
          </h1>
          <p className="renaissance-subtitle">
            Order custom artwork directly from Torn City&apos;s verified artist <strong>ahmad_kaab [4295891]</strong>.
            Faction war banners, 3D character scenes, profile avatars, and forum signatures. Safe escrow protection with zero platform fees.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsAhmadModalOpen(true)}
              className="renaissance-btn-gold"
              style={{ padding: '10px 24px', fontSize: '0.8125rem' }}
            >
              <Sparkle size={14} weight="fill" /> Request Custom Artwork ⚡
            </button>
            <Link
              to="/wallet"
              className="renaissance-pill"
              style={{ textDecoration: 'none' }}
            >
              Add Escrow Balance &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--sp-10)' }}>

        {/* ── HOW COMMISSIONS WORK ───── */}
        <div style={{ marginBottom: 'var(--sp-12)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>
            [ HOW IT WORKS • 4 EASY STEPS ]
          </div>
          <div className="grid-responsive-4" style={{ gap: '1px', background: 'var(--seam)' }}>
            {[
              {
                step: '01',
                title: 'SUBMIT BRIEF',
                desc: 'Choose your style (banner, scene, avatar, signature) and tell Ahmad your ideas, faction theme, and requirements.',
                icon: <PaintBrush size={20} color="var(--red-hi)" weight="bold" />
              },
              {
                step: '02',
                title: 'AHMAD ACCEPTS',
                desc: 'Ahmad reviews your request in his studio queue and confirms your project timeline and details.',
                icon: <ShieldCheck size={20} color="var(--term-green)" weight="bold" />
              },
              {
                step: '03',
                title: 'ESCROW HOLD',
                desc: 'Your credits are safely held in escrow. Ahmad only receives payment when you approve the final delivery.',
                icon: <CurrencyCircleDollar size={20} color="var(--phosphor)" weight="bold" />
              },
              {
                step: '04',
                title: 'RECEIVE ARTWORK',
                desc: 'Download your high-resolution artwork, approve the final delivery, and leave your verified review.',
                icon: <CheckCircle size={20} color="var(--term-green)" weight="fill" />
              },
            ].map((p) => (
              <div key={p.step} style={{ background: 'var(--plate)', padding: 'var(--sp-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--red-hi)', letterSpacing: '0.1em' }}>
                    STEP {p.step}
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
            <h2 className="section-h2" style={{ marginBottom: '2px' }}>ARTIST SERVICES</h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)' }}>
              FILTER BY ART STYLE
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
                  minHeight: '36px',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── ARTIST ROSTER GRID ───────────────────────────── */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1px', background: 'var(--seam)' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'var(--sp-2)' }}>
                  <Link
                    to={`/artist/${artist.id}`}
                    className="btn btn-ghost"
                    style={{ justifyContent: 'center', fontSize: '0.6875rem', padding: 'var(--sp-3)' }}
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => setIsAhmadModalOpen(true)}
                    className="renaissance-btn-gold"
                    style={{ justifyContent: 'center', fontSize: '0.6875rem', padding: 'var(--sp-3)' }}
                  >
                    Commission Ahmad ⚡
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bespoke Commission Ahmad Modal ───────────────────────── */}
      <CommissionAhmadModal
        isOpen={isAhmadModalOpen}
        onClose={() => setIsAhmadModalOpen(false)}
      />
    </main>
  );
}

import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { 
  ArrowRight, ArrowUpRight, ShieldCheck, LockKey, 
  Sparkle, Lightning, HandCoins, Eye, Coins, Crown 
} from '@phosphor-icons/react';
import { ArtworkCard } from '../components/artwork/ArtworkCard';
import { ArtistCard } from '../components/artist/ArtistCard';
import { EditorialHotspot } from '../components/common/EditorialHotspot';
import { AvatarWithFrame } from '../components/common/AvatarWithFrame';
import { useLiveAuctions, useNewDrops, useTopArtists } from '../hooks/useData';
import { useAuthStore } from '../store/authStore';
import { isUserAdmin, getExecutiveMetrics } from '../services/adminService';
import { getSyndicateProgression } from '../services/achievementService';
import { CR_PER_XANAX, convertCreditsToXanax, TREASURY_OFFICIAL } from '../services/walletService';

export function Home() {
  const reduce = useReducedMotion();
  const { user } = useAuthStore();
  const userIsAdmin = isUserAdmin(user);

  // Real data hooks
  const { data: liveAuctions = [] } = useLiveAuctions(6);
  const { data: newDrops = [] }     = useNewDrops(8);
  const { data: topArtists = [] }   = useTopArtists(6);

  // Active Chapter Scroll Spy
  const [activeChapter, setActiveChapter] = useState('I');
  const [adminMetrics, setAdminMetrics] = useState(() => getExecutiveMetrics());
  const [progression, setProgression] = useState(() => getSyndicateProgression());

  useEffect(() => {
    const handleUpdate = () => {
      setAdminMetrics(getExecutiveMetrics());
      setProgression(getSyndicateProgression());
    };
    window.addEventListener('coven:admin_update', handleUpdate);
    window.addEventListener('coven:progression_update', handleUpdate);
    return () => {
      window.removeEventListener('coven:admin_update', handleUpdate);
      window.removeEventListener('coven:progression_update', handleUpdate);
    };
  }, []);

  // Scroll Spy for Chapters
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id === 'chapter-1') setActiveChapter('I');
            else if (id === 'chapter-2') setActiveChapter('II');
            else if (id === 'chapter-3') setActiveChapter('III');
            else if (id === 'chapter-4') setActiveChapter('IV');
            else if (id === 'chapter-5') setActiveChapter('V');
            else if (id === 'chapter-6') setActiveChapter('VI');
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 }
    );

    const chapterElements = document.querySelectorAll('[id^="chapter-"]');
    chapterElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const chapters = [
    { num: 'I', label: 'Marketplace', id: 'chapter-1' },
    { num: 'II', label: 'Blind Auctions', id: 'chapter-2' },
    { num: 'III', label: 'Wallet & Escrow', id: 'chapter-3' },
    { num: 'IV', label: 'Ahmad Kaab (Artist)', id: 'chapter-4' },
    { num: 'V', label: 'Achievements', id: 'chapter-5' },
    ...(userIsAdmin ? [{ num: 'VI', label: 'Admin Console', id: 'chapter-6' }] : []),
  ];

  // Calculator state
  const [calcXanax, setCalcXanax] = useState(5);
  const calcCredits = calcXanax * CR_PER_XANAX;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--void)' }}>
      {/* ── 1. GRAND RENAISSANCE HERO STAGE (SHOPIFY EDITIONS INSPIRED) ──── */}
      <section className="renaissance-hero-stage">
        {/* Floating Glass Index Card (The Core Reference Element) */}
        <motion.div
          className="renaissance-index-card"
          initial={reduce ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="renaissance-card-the">The</span>
          <h1 className="renaissance-card-title">
            Ren<span className="slashes">///</span>ssance
          </h1>
          <div className="renaissance-card-edition">
            Edition &bull; Winter 2026
          </div>

          <p className="renaissance-card-desc">
            Torn City&apos;s digital art market and custom graphics house.
            Verified artwork drops, blind mystery auctions, and safe escrow backed by Xanax.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {chapters.map((ch) => (
              <a
                key={ch.num}
                href={`#${ch.id}`}
                className="renaissance-chapter-row"
              >
                <span>{ch.label}</span>
                <span className="num">{ch.num}</span>
              </a>
            ))}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/browse"
              className="btn btn-sm btn-industrial"
              style={{
                background: 'var(--neon-magenta)',
                borderColor: 'var(--neon-magenta)',
                color: '#ffffff',
                fontFamily: 'var(--font-cinzel)',
                fontWeight: 700,
                padding: '10px 20px',
                borderRadius: '6px',
                minHeight: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Browse Artworks
            </Link>
            <Link
              to="/wallet"
              className="btn btn-sm btn-ghost"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                padding: '10px 16px',
                borderRadius: '6px',
                border: '1px solid rgba(244, 241, 234, 0.15)',
                minHeight: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ⚡ Wallet &amp; Escrow
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── 2. ASYMMETRIC TWO-COLUMN CHAPTER SPLIT ────────────────────────── */}
      <div className="renaissance-split-wrapper">
        <div className="container">
          <div className="renaissance-split-grid">
            
            {/* Sticky Left Navigation Sidebar */}
            <aside className="renaissance-sticky-sidebar">
              <div className="sidebar-title">
                The Ren<span style={{ color: 'var(--neon-magenta)' }}>///</span>ssance
              </div>
              <div className="sidebar-sub">
                Edition Index
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column' }}>
                {chapters.map((ch) => (
                  <a
                    key={ch.num}
                    href={`#${ch.id}`}
                    className={`sidebar-nav-item${activeChapter === ch.num ? ' active' : ''}`}
                  >
                    <span>{ch.label}</span>
                    <span className="side-num">{ch.num}</span>
                  </a>
                ))}
              </nav>

              <div style={{
                marginTop: '36px',
                padding: '16px',
                background: 'rgba(244, 241, 234, 0.03)',
                border: '1px solid rgba(244, 241, 234, 0.08)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--ghost)'
              }}>
                <div style={{ color: 'var(--antique-gold)', fontWeight: 700, marginBottom: '4px' }}>
                  VAULT PEG STANDARD
                </div>
                <div>1 Xanax = 1,000 CR</div>
                <div style={{ marginTop: '8px', fontSize: '0.6875rem', color: 'var(--phosphor)' }}>
                  Cashier SLA: &lt; 18h
                </div>
              </div>
            </aside>

            {/* Right Dynamic Exhibition Chapters */}
            <main>

              {/* ── CHAPTER I: MARKETPLACE (CURATED DROPS & LOOKBOOK) ────── */}
              <section id="chapter-1" className="renaissance-chapter-section">
                <div className="chapter-badge-tag">
                  <Sparkle size={13} weight="fill" />
                  Chapter I &bull; Curated Artworks
                </div>
                <h2 className="chapter-h2">Marketplace &amp; Featured Works</h2>
                <p className="chapter-desc">
                  Exclusive forum signatures, profile avatars, and faction banners crafted by Ahmad.
                  Inspect pieces via the interactive lookbook below or purchase artworks directly.
                </p>

                {/* Editorial Hero Lookbook Card with Interactive Hotspots */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid rgba(244, 241, 234, 0.12)',
                  marginBottom: '36px',
                  boxShadow: '0 20px 48px rgba(0, 0, 0, 0.7)'
                }}>
                  <img
                    src="/lookbook_merchant.jpg"
                    alt="The Venetian Syndicate Lookbook"
                    style={{ width: '100%', maxHeight: '600px', objectFit: 'cover' }}
                  />

                  {/* Hotspot 1: Xanax Pill */}
                  <EditorialHotspot
                    x={42}
                    y={68}
                    title="Golden Xanax Relic"
                    artist="ahmad_kaab"
                    priceCr={1000}
                    priceXanax={1}
                    tag="Escrow Standard"
                    artworkId="art-1"
                  />

                  {/* Hotspot 2: Tactical Vest */}
                  <EditorialHotspot
                    x={48}
                    y={52}
                    title="Syndicate Body Armor"
                    artist="ahmad_kaab"
                    priceCr={4500}
                    priceXanax={4.5}
                    tag="Faction GFX"
                    artworkId="art-2"
                  />

                  {/* Hotspot 3: Velvet Robe */}
                  <EditorialHotspot
                    x={28}
                    y={60}
                    title="Venetian Velvet Cloak"
                    artist="ahmad_kaab"
                    priceCr={12000}
                    priceXanax={12}
                    tag="Rare Edition"
                    artworkId="art-3"
                  />

                  {/* High-fashion lookbook bottom strip */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '24px 28px',
                    background: 'linear-gradient(180deg, transparent 0%, rgba(10, 13, 12, 0.95) 100%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-magenta)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        EDITORIAL LOOKBOOK
                      </span>
                      <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.4rem', color: '#ffffff', margin: '4px 0 0 0' }}>
                        The Syndicate Merchant
                      </h3>
                    </div>

                    <Link
                      to="/browse"
                      className="btn btn-sm btn-industrial"
                      style={{
                        padding: '8px 16px',
                        background: 'var(--neon-magenta)',
                        borderColor: 'var(--neon-magenta)',
                        color: '#ffffff',
                        fontFamily: 'var(--font-cinzel)',
                        fontWeight: 700
                      }}
                    >
                      Browse Marketplace <ArrowRight size={12} weight="bold" />
                    </Link>
                  </div>
                </div>

                {/* Fresh New Drops Grid */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.1rem', color: '#ffffff', margin: 0 }}>
                    Active Drops
                  </h4>
                  <Link to="/browse" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)' }}>
                    View All {newDrops.length} Works &rarr;
                  </Link>
                </div>

                <div className="artwork-grid">
                  {newDrops.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ghost)', fontFamily: 'var(--font-mono)', gridColumn: '1 / -1' }}>
                      No active drops currently available.
                    </div>
                  ) : (
                    newDrops.slice(0, 4).map((a) => (
                      <ArtworkCard key={a.id} artwork={a} />
                    ))
                  )}
                </div>
              </section>

              {/* ── CHAPTER II: BLIND AUCTIONS (MYSTERY AUCTIONS) ──────── */}
              <section id="chapter-2" className="renaissance-chapter-section">
                <div className="chapter-badge-tag">
                  <LockKey size={13} weight="fill" />
                  Chapter II &bull; Mystery Bidding
                </div>
                <h2 className="chapter-h2">Blind Mystery Auctions</h2>
                <p className="chapter-desc">
                  Artworks where the visual design and final appearance are veiled until auction close.
                  Bid purely based on aesthetic intrigue, style hints, and rarity tier.
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px',
                  alignItems: 'center',
                  background: 'rgba(244, 241, 234, 0.02)',
                  border: '1px solid rgba(244, 241, 234, 0.08)',
                  borderRadius: '10px',
                  padding: '28px'
                }}>
                  <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                    <img
                      src="/blind_vault_angel.jpg"
                      alt="Encrypted Sculpture"
                      style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(255, 0, 127, 0.25)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid var(--neon-magenta)',
                      color: '#ffffff',
                      fontSize: '0.625rem',
                      fontFamily: 'var(--font-cinzel)',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '4px'
                    }}>
                      BLIND CIPHER #8821
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', letterSpacing: '0.1em' }}>
                      CURRENT LIVE DROP
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.6rem', color: '#ffffff', margin: '6px 0 12px 0' }}>
                      The Cyber Seraphim
                    </h3>
                    <p style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-body)', color: 'var(--ghost)', lineHeight: 1.6, marginBottom: '20px' }}>
                      An encrypted classical sculpture rendered in chiseled Carrara marble with holographic street visor overlay. Provenance and artisan identity sealed until auction closure.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                      <div>
                        <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>CURRENT HIGH BID</div>
                        <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--neon-magenta)' }}>
                          3,500 CR
                        </div>
                        <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>≈ 3.5x Xanax</div>
                      </div>
                      <div style={{ width: '1px', background: 'rgba(244, 241, 234, 0.08)' }} />
                      <div>
                        <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>STATUS</div>
                        <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>
                          LIVE AUCTION
                        </div>
                        <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>4 Bids Logged</div>
                      </div>
                    </div>

                    <Link
                      to="/auctions"
                      className="btn btn-md btn-industrial"
                      style={{
                        padding: '10px 20px',
                        background: 'var(--neon-magenta)',
                        borderColor: 'var(--neon-magenta)',
                        color: '#ffffff',
                        fontFamily: 'var(--font-cinzel)',
                        fontWeight: 700,
                        borderRadius: '6px'
                      }}
                    >
                      Explore Blind Auctions <Eye size={14} weight="bold" />
                    </Link>
                  </div>
                </div>
              </section>

              {/* ── CHAPTER III: WALLET & ESCROW ──────────────────────── */}
              <section id="chapter-3" className="renaissance-chapter-section">
                <div className="chapter-badge-tag">
                  <Coins size={13} weight="fill" />
                  Chapter III &bull; Safe Xanax Escrow
                </div>
                <h2 className="chapter-h2">Wallet &amp; Xanax Escrow</h2>
                <p className="chapter-desc">
                  Safe and transparent art trades backed by Torn Xanax.
                  Send Xanax in Torn City to platform escrow and receive instant credit balance.
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px',
                  marginBottom: '28px'
                }}>
                  {/* Interactive Rate Calculator */}
                  <div style={{
                    background: 'rgba(244, 241, 234, 0.03)',
                    border: '1px solid rgba(244, 241, 234, 0.08)',
                    borderRadius: '8px',
                    padding: '24px'
                  }}>
                    <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', marginBottom: '8px' }}>
                      INSTANT VALUE CALCULATOR
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--ghost)', display: 'block', marginBottom: '6px' }}>
                        Xanax to Convert:
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={50}
                        value={calcXanax}
                        onChange={(e) => setCalcXanax(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--neon-magenta)', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.4rem', color: '#ffffff' }}>
                        {calcXanax}x Xanax
                      </span>
                      <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.4rem', color: 'var(--neon-magenta)' }}>
                        = {calcCredits.toLocaleString()} CR
                      </span>
                    </div>
                  </div>

                  {/* Public Escrow Details */}
                  <div style={{
                    background: 'rgba(244, 241, 234, 0.03)',
                    border: '1px solid rgba(244, 241, 234, 0.08)',
                    borderRadius: '8px',
                    padding: '24px'
                  }}>
                    <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', marginBottom: '8px' }}>
                      OFFICIAL ESCROW RECIPIENT
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--neon-magenta)',
                      marginBottom: '8px'
                    }}>
                      {TREASURY_OFFICIAL}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ghost)', lineHeight: 1.5, marginBottom: '14px' }}>
                      Zero memo required. Transfers are automatically parsed and credited to your verified session.
                    </div>
                    <Link
                      to="/wallet"
                      className="btn btn-sm btn-ghost"
                      style={{ fontSize: '0.6875rem', borderRadius: '4px', border: '1px solid rgba(244, 241, 234, 0.15)' }}
                    >
                      Open Escrow Wallet &rarr;
                    </Link>
                  </div>
                </div>
              </section>

              {/* ── CHAPTER IV: FEATURED ARTIST (AHMAD) ─────────── */}
              <section id="chapter-4" className="renaissance-chapter-section">
                <div className="chapter-badge-tag">
                  <Crown size={13} weight="fill" />
                  Chapter IV &bull; Featured Artist
                </div>
                <h2 className="chapter-h2">Meet the Artist: Ahmad Kaab</h2>
                <p className="chapter-desc">
                  Directly commissioned custom graphics by <strong>Ahmad Kaab [4295891]</strong>.
                  High-contrast faction war banners, custom forum signatures, and 3D character avatars.
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px'
                }}>
                  {topArtists.slice(0, 1).map((art) => (
                    <ArtistCard key={art.id} artist={art} />
                  ))}

                  <div style={{
                    background: 'rgba(244, 241, 234, 0.03)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    borderRadius: '8px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', letterSpacing: '0.1em', marginBottom: '8px' }}>
                        ATELIER STATUS &bull; ACTIVE COMMISSIONS
                      </div>
                      <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.25rem', color: '#ffffff', marginBottom: '8px' }}>
                        Custom GFX &amp; Faction Propaganda
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', lineHeight: 1.6, marginBottom: '16px' }}>
                        Guaranteed 72-hour turnaround. Escrow-backed deposits in Xanax or Credits. Client feedback rounds included.
                      </p>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                        <div>
                          <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>QUEUE SLOTS</div>
                          <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.1rem', color: '#10b981', fontWeight: 700 }}>
                            3 / 4 Available
                          </div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(244, 241, 234, 0.08)' }} />
                        <div>
                          <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>ESCROW STANDARD</div>
                          <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.1rem', color: 'var(--antique-gold)', fontWeight: 700 }}>
                            100% Backed
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/commissions"
                      className="btn btn-md btn-industrial"
                      style={{
                        padding: '10px 18px',
                        background: 'linear-gradient(135deg, var(--antique-gold), #b8972e)',
                        borderColor: 'var(--antique-gold)',
                        color: '#0d0c13',
                        fontFamily: 'var(--font-cinzel)',
                        fontWeight: 700,
                        borderRadius: '6px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      Commission Ahmad &rarr;
                    </Link>
                  </div>
                </div>
              </section>

              {/* ── CHAPTER V: PLAYER ACHIEVEMENTS ─────────────── */}
              <section id="chapter-5" className="renaissance-chapter-section">
                <div className="chapter-badge-tag">
                  <Sparkle size={13} weight="fill" />
                  Chapter V &bull; Collector Ranks &amp; Badges
                </div>
                <h2 className="chapter-h2">Player Achievements</h2>
                <p className="chapter-desc">
                  Equip prestige titles, glowing cyber frames, and level up your collector rank through verified art acquisition.
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '32px',
                  flexWrap: 'wrap',
                  background: 'rgba(244, 241, 234, 0.02)',
                  border: '1px solid rgba(244, 241, 234, 0.08)',
                  borderRadius: '10px',
                  padding: '28px'
                }}>
                  <div>
                    <AvatarWithFrame
                      avatarUrl={user?.name ? undefined : 'https://picsum.photos/seed/renaissance-avatar/300/300'}
                      frame={progression.equippedFrame}
                      size="xl"
                      level={progression.level}
                      showLevel={true}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', marginBottom: '4px' }}>
                      YOUR ACTIVE LOADOUT &bull; {progression.equippedTitle?.name || 'SHADOW OPERATIVE'}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.3rem', color: '#ffffff', margin: '0 0 6px 0' }}>
                      Level {progression.level} Collector &bull; {progression.tierTitle}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', lineHeight: 1.5, marginBottom: '16px' }}>
                      {progression.unlockedAchievements} of {progression.totalAchievements} Accolades Claimed &bull; {progression.totalReputation} Prestige XP
                    </p>

                    <Link
                      to="/achievements"
                      className="btn btn-sm btn-industrial"
                      style={{
                        padding: '8px 16px',
                        background: 'var(--neon-magenta)',
                        borderColor: 'var(--neon-magenta)',
                        color: '#ffffff',
                        fontFamily: 'var(--font-cinzel)',
                        fontWeight: 700,
                        borderRadius: '6px'
                      }}
                    >
                      Dressing Room &amp; Vanity Armory <ArrowUpRight size={12} weight="bold" />
                    </Link>
                  </div>
                </div>
              </section>

              {/* ── CHAPTER VI: ADMIN CONSOLE ────────────────── */}
              {userIsAdmin && (
                <section id="chapter-6" className="renaissance-chapter-section" style={{ borderColor: 'rgba(255, 0, 127, 0.25)' }}>
                  <div className="chapter-badge-tag" style={{ color: 'var(--neon-magenta)' }}>
                    <HandCoins size={13} weight="fill" />
                    Chapter VI &bull; Admin &amp; Treasury Console
                  </div>
                  <h2 className="chapter-h2">Admin Operations (Ahmad)</h2>
                  <p className="chapter-desc">
                    Executive controls for Ahmad Kaab [4295891].
                    5% platform marketplace fee, pin management, and automated Xanax cashout fulfillment.
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ background: 'var(--void)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(244, 241, 234, 0.08)' }}>
                      <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>5% MARKETPLACE RAKE</div>
                      <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', color: '#ffffff', fontWeight: 700 }}>
                        {adminMetrics.total_rake_cr.toLocaleString()} CR
                      </div>
                      <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
                        ≈ {adminMetrics.total_rake_xanax}x Xanax
                      </div>
                    </div>

                    <div style={{ background: 'var(--void)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(244, 241, 234, 0.08)' }}>
                      <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>PIN REVENUE (10 XAN/PIN)</div>
                      <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', color: '#ffffff', fontWeight: 700 }}>
                        {adminMetrics.total_pin_fees_cr.toLocaleString()} CR
                      </div>
                      <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
                        ≈ {adminMetrics.total_pin_fees_xanax}x Xanax
                      </div>
                    </div>

                    <div style={{ background: 'var(--void)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(244, 241, 234, 0.08)' }}>
                      <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>PENDING 18H CASHOUTS</div>
                      <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', color: '#fbbf24', fontWeight: 700 }}>
                        {adminMetrics.pending_tickets_count} Tickets
                      </div>
                      <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
                        {adminMetrics.pending_withdrawal_xanax}x Xanax Owed
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/admin"
                    className="btn btn-md btn-industrial"
                    style={{
                      padding: '10px 20px',
                      background: 'var(--neon-magenta)',
                      borderColor: 'var(--neon-magenta)',
                      color: '#ffffff',
                      fontFamily: 'var(--font-cinzel)',
                      fontWeight: 700,
                      borderRadius: '6px'
                    }}
                  >
                    Open Admin Console &rarr;
                  </Link>
                </section>
              )}

            </main>
          </div>
        </div>
      </div>
    </main>
  );
}

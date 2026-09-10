import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react';
import { ArtworkCard } from '../components/artwork/ArtworkCard';
import { ArtistCard } from '../components/artist/ArtistCard';
import { ActivityFeed } from '../components/common/ActivityFeed';
import { useLiveAuctions, useNewDrops, useTopArtists } from '../hooks/useData';

gsap.registerPlugin(ScrollTrigger);

/* Mock data removed — real data hooks used in component */

const MARQUEE_TOKENS = [
  'Digital Art', 'Profile GFX', 'Faction Banners', 'Pixel Art',
  'Scene Art', 'Logos', 'Commissions', 'Signatures', 'Wallpapers',
  'Portrait GFX', 'Pixel Scenes', 'Card Art', 'Forum Avatars',
];

/* ── COUNTER COMPONENT (scroll-triggered) ─────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const obj = { val: 0 };
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: to, duration: 1.8, ease: 'power2.out',
          onUpdate: () => {
            if (ref.current) ref.current.textContent = Math.round(obj.val).toLocaleString() + suffix;
          },
        });
      },
    });
    return () => st.kill();
  }, [to, suffix, reduce]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ── STICKY STACK — canonical from taste skill section 5.A ── */
function StickyStack() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const cards = [
    {
      num: '01',
      head: 'DISCOVER ART',
      body: 'Browse hundreds of pieces from Torn\'s most skilled GFX artists. Filter by style, artist, price, and format.',
      action: { label: 'Browse', href: '/browse' },
      bg: 'var(--pit)',
    },
    {
      num: '02',
      head: 'BID IN AUCTIONS',
      body: 'Real-time auctions with live countdowns. Every bid tracked. Every transaction verified.',
      action: { label: 'View Auctions', href: '/auctions' },
      bg: 'var(--plate)',
    },
    {
      num: '03',
      head: 'COMMISSION ARTISTS',
      body: 'Direct commissions with scope management, delivery tracking, and verified payment system.',
      action: { label: 'Commission', href: '/commissions' },
      bg: 'var(--hull)',
    },
  ];

  useEffect(() => {
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>('.stack-card');
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: 'top top',
          endTrigger: cardEls[cardEls.length - 1],
          end: 'top top',
          pin: true,
          pinSpacing: false,
        });
        gsap.to(card, {
          scale: 0.94,
          opacity: 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        });
      });
      // Recalculate downstream ScrollTrigger positions after pins are created
      ScrollTrigger.refresh();
    }, ref);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        /* 3 cards × 100vh. pinSpacing:false means the DOM height collapses;
           this explicit height keeps downstream content positioned correctly. */
        minHeight: reduce ? 'auto' : '300vh',
      }}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          className="stack-card"
          style={{
            height: '100vh',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1px',
            background: 'var(--seam)',
          }}
        >
          {/* Left — number + copy */}
          <div style={{
            background: card.bg,
            padding: 'var(--sp-16) var(--sp-10)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            borderRight: '1px solid var(--seam)',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.5rem',
              color: 'var(--shadow-type)', letterSpacing: '0.25em',
              textTransform: 'uppercase', marginBottom: 'var(--sp-6)',
            }}>
              [ STEP {card.num} / 03 ]
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, 6rem)',
              lineHeight: 0.9, letterSpacing: '-0.04em',
              textTransform: 'uppercase', color: 'var(--phosphor)',
              marginBottom: 'var(--sp-6)',
            }}>
              {card.head}
            </h3>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.875rem',
              color: 'var(--ghost)', lineHeight: 1.8, maxWidth: '380px',
              marginBottom: 'var(--sp-8)',
            }}>
              {card.body}
            </p>
            <Link to={card.action.href} className="btn btn-industrial" style={{ alignSelf: 'flex-start' }}>
              {card.action.label}
              <ArrowRight size={12} weight="bold" />
            </Link>
          </div>
          {/* Right — visual number */}
          <div style={{
            background: 'var(--void)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(12rem, 25vw, 22rem)',
              lineHeight: 1, letterSpacing: '-0.08em',
              color: 'var(--plate)', userSelect: 'none',
              position: 'absolute',
            }}>
              {card.num}
            </span>
            {/* Red horizontal stripe */}
            <div style={{
              position: 'absolute', bottom: '0', left: '0', right: '0',
              height: '4px', background: 'var(--red)',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── HOME PAGE ──────────────────────────────────────────────── */
export function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Real data hooks
  const { data: liveAuctions = [] } = useLiveAuctions(6);
  const { data: newDrops = [] }     = useNewDrops(8);
  const { data: topArtists = [] }   = useTopArtists(6);

  // Hero entrance — per skill: "entry transitions on hero"
  useEffect(() => {
    if (reduce || !heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.hero-h1', { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.1 });
      gsap.from('.hero-sub', { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.3 });
      gsap.from('.hero-actions', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 });
      gsap.from('.hero-telemetry-cell', { y: 12, opacity: 0, stagger: 0.07, duration: 0.6, ease: 'power2.out', delay: 0.7 });
    }, heroRef);
    setHeroLoaded(true);
    return () => ctx.revert();
  }, [reduce]);

  const tokens = [...MARQUEE_TOKENS, ...MARQUEE_TOKENS];

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────
          4 text elements: h1, sub, actions, [hero-right visual]
          Zero eyebrows. Fits viewport. pt-cap honored.
         ───────────────────────────────────────────────────── */}
      <div ref={heroRef}>
        <section
          className="hero"
          style={{
            opacity: heroLoaded || reduce ? 1 : 0,
            transition: 'opacity 0.4s',
          }}
        >
          {/* LEFT — copy */}
          <div className="hero-left">
            <div className="hero-h1">
              THE<br />
              <span>ART</span>
              MARKET
            </div>
            <p className="hero-sub">
              Torn City's dedicated platform for GFX commissions,
              direct art sales, and live auctions. Verified artists.
              Real transactions.
            </p>
            <div className="hero-actions">
              <Link to="/browse" className="btn btn-md btn-primary">
                Browse Art
                <ArrowRight size={13} weight="bold" />
              </Link>
              <Link to="/login" className="btn btn-md btn-ghost">
                Join COVEN
              </Link>
            </div>
          </div>

          {/* RIGHT — full-bleed image */}
          <div className="hero-right">
            <img
              src="https://picsum.photos/seed/coven-hero-art/900/1200"
              alt="Featured artwork from COVEN"
            />
          </div>

          {/* Telemetry strip — NOT part of the 4-element hero stack */}
          <div className="hero-telemetry" style={{ gridColumn: '1 / -1' }}>
            <div className="hero-telemetry-cell">
              <span className="telemetry-live" aria-hidden="true" />
              <span className="telemetry-label">Status</span>
              <span className="telemetry-value">LIVE</span>
            </div>
            <div className="hero-telemetry-cell">
              <span className="telemetry-label">Artists</span>
              <span className="telemetry-value">247+</span>
            </div>
            <div className="hero-telemetry-cell">
              <span className="telemetry-label">Active Auctions</span>
              <span className="telemetry-value">18</span>
            </div>
            <div className="hero-telemetry-cell">
              <span className="telemetry-label">Volume (30d)</span>
              <span className="telemetry-value">$4.2M</span>
            </div>
          </div>
        </section>
      </div>

      {/* ── MARQUEE — single, motivated: art categories breadth ── */}
      <div className="marquee-strip">
        <div className="marquee-inner" aria-hidden="true">
          {tokens.map((token, i) => (
            <span key={i} className="marquee-token">
              <span className="marquee-slash">/</span>
              {token}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS — compartmentalized I-grid, no eyebrow (section 2 of 8) ── */}
      <motion.section
        style={{ padding: '0' }}
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <div className="stats-grid">
          {[
            { val: 247, suffix: '+', label: 'Verified Artists' },
            { val: 4200, suffix: '', label: 'Artworks Listed' },
            { val: 18, suffix: '', label: 'Live Auctions' },
            { val: 98, suffix: '%', label: 'Satisfaction' },
          ].map((s, i) => (
            <div key={i} className="stats-cell" data-index={String(i + 1).padStart(2, '0')}>
              <div className="stats-num">
                <Counter to={s.val} suffix={s.suffix} />
              </div>
              <div className="stats-label">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── LIVE ACTIVITY FEED — between stats and auctions ── */}
      <ActivityFeed />

      {/* ── LIVE AUCTIONS — section 3, first eyebrow allowed ── */}
      <section style={{ padding: 'var(--sp-20) 0' }}>
        <div className="container">
          <div style={{
            display: 'flex', alignItems: 'flex-end',
            justifyContent: 'space-between', marginBottom: 'var(--sp-6)',
            borderBottom: '1px solid var(--seam)', paddingBottom: 'var(--sp-4)',
          }}>
            <div>
              <div className="section-label">Live Auctions</div>
              <h2 className="section-h2">BIDDING<br />OPEN</h2>
            </div>
            <Link to="/auctions" className="btn btn-md btn-industrial" style={{ marginBottom: '4px' }}>
              All Auctions
              <ArrowUpRight size={12} weight="bold" />
            </Link>
          </div>

          <div className="auction-rail">
            {liveAuctions.length === 0 ? (
              <div style={{ padding: 'var(--sp-12)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--shadow-type)', gridColumn: '1 / -1' }}>
                No live auctions — check back later
              </div>
            ) : liveAuctions.map((a) => (
              <Link key={a.id} to={`/artwork/${a.id}`} className="auction-card" style={{ display: 'block' }}>
                <div className="auction-img">
                  <img src={a.image_url!} alt={a.title} />
                  <span className="badge badge-live" style={{ position: 'absolute', top: 0, left: 0 }}>
                    LIVE
                  </span>
                </div>
                <div className="auction-body">
                  <div className="auction-title">{a.title}</div>
                  <div className="auction-artist">{a.artist?.username}</div>
                  <div className="auction-bid-row">
                    <div>
                      <div className="artwork-price-label">Top bid</div>
                      <div className="bid-price">${a.current_bid?.toLocaleString()}</div>
                    </div>
                    {a.auction_end_time && (
                      <div style={{ textAlign: 'right' }}>
                        <div className="artwork-price-label">Ends</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--red-hi)' }}>
                          LIVE
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <hr className="hr-red" />

      {/* ── STICKY STACK (section 4-6) — 3 cards, canonical GSAP ── */}
      {/* Per skill section 5.A — exact skeleton */}
      <StickyStack />

      <hr className="hr-full" />

      {/* ── ARTWORK GRID — section 7, NO eyebrow (3-section rule) ── */}
      <motion.section
        style={{ padding: 'var(--sp-20) 0' }}
        initial={reduce ? false : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container">
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--seam)', paddingBottom: 'var(--sp-4)',
          }}>
            <h2 className="section-h2">NEW<br />DROPS</h2>
            <Link to="/browse" className="btn btn-md btn-industrial" style={{ marginBottom: '4px' }}>
              Browse All
              <ArrowUpRight size={12} weight="bold" />
            </Link>
          </div>
          <div className="artwork-grid">
            {newDrops.length === 0 ? (
              <div style={{ padding: 'var(--sp-12)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--shadow-type)', gridColumn: '1 / -1' }}>
                No artworks yet — be the first to list
              </div>
            ) : newDrops.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
          </div>
        </div>
      </motion.section>

      <hr className="hr-full" />

      {/* ── ARTISTS — section 8, eyebrow allowed (3rd of 8) ── */}
      <motion.section
        style={{ padding: 'var(--sp-20) 0' }}
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        <div className="container">
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--seam)', paddingBottom: 'var(--sp-4)',
          }}>
            <div>
              <div className="section-label">Top Artists</div>
              <h2 className="section-h2">MEET<br />THE COVEN</h2>
            </div>
            <Link to="/artists" className="btn btn-md btn-industrial" style={{ marginBottom: '4px' }}>
              All Artists
              <ArrowUpRight size={12} weight="bold" />
            </Link>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1px', background: 'var(--seam)',
          }}>
            {topArtists.length === 0 ? (
              <div style={{ padding: 'var(--sp-12)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--shadow-type)', gridColumn: '1 / -1', background: 'var(--plate)' }}>
                Artists are joining — check back soon
              </div>
            ) : topArtists.map((a) => (
              <ArtistCard key={a.id} artist={a} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── CTA — final section, no eyebrow ── */}
      <div className="container" style={{ marginBottom: 'var(--sp-24)' }}>
        <motion.div
          className="cta-block"
          initial={reduce ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <h2 className="cta-h2">YOUR ART.<br />YOUR MARKET.</h2>
            <p className="cta-sub">
              Apply to list on COVEN. No fees for verified artists during beta. Paid directly in Torn currency.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexShrink: 0 }}>
            <Link to="/login" className="btn btn-lg btn-primary">
              Apply Now
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

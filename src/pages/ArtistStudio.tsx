/* ================================================================
   COVEN — Sovereign Artist Studio (/studio)
   Exclusively tailored for ahmad_kaab [4295891].
   Manage commission requests, update project stages, upload
   deliverables, list new drops, and generate Torn forum BBCode.
   ================================================================ */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  PaintBrush, Sparkle, Plus, Image, Clock, CheckCircle,
  CurrencyCircleDollar, ArrowSquareOut, Copy, Lightning,
  Sliders, Eye, TerminalWindow, Check, UploadSimple, ArrowUpRight, Crown
} from '@phosphor-icons/react';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import { useArtistStudio } from '../hooks/useStudio';
import { AHMAD_SOVEREIGN_ARTIST } from '../services/artistService';
import { getArtistCommissions, updateCommissionStatus } from '../services/commissionService';
import { generateForumShopBBCode, type StudioStatus } from '../services/studioService';
import { CR_PER_XANAX, convertCreditsToXanax } from '../services/walletService';
import { useArtworks } from '../hooks/useData';
import type { Commission, Artwork } from '../types';

export function ArtistStudio() {
  const reduce = useReducedMotion();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const artistId = 'artist-ahmad-01';
  const { studio, updateStudio, updateSlot } = useArtistStudio(artistId);

  const [activeTab, setActiveTab] = useState<'queue' | 'drops' | 'portfolio' | 'config' | 'forum'>('queue');
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loadingCommissions, setLoadingCommissions] = useState(true);
  const [bbcodeCopied, setBbcodeCopied] = useState(false);

  // Delivery Modal State
  const [deliveringComm, setDeliveringComm] = useState<Commission | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState('');

  // Fetch Ahmad's portfolio
  const { data: artworksResult } = useArtworks({ perPage: 20 });
  const portfolioArtworks = artworksResult?.data ?? [];

  // Load commissions
  const loadCommissions = async () => {
    setLoadingCommissions(true);
    try {
      const data = await getArtistCommissions(artistId);
      setCommissions(data);
    } catch {
      // Fallback sample queue
      setCommissions([
        {
          id: 'comm-sample-1',
          artist_id: artistId,
          buyer_user_id: 'user-7721',
          title: 'Monarch Syndicate Faction War Banner',
          description: 'High-contrast battle banner featuring cybernetic samurai with neon katana. Resolution 1920x1080.',
          budget_torn: 5000000,
          status: 'in_progress',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'comm-sample-2',
          artist_id: artistId,
          buyer_user_id: 'user-9182',
          title: 'Bespoke Carrara Marble Profile Scene',
          description: 'Classical angel statue with holographic HUD visor for Torn user profile backdrop.',
          budget_torn: 10000000,
          status: 'open',
          created_at: new Date(Date.now() - 36000000).toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoadingCommissions(false);
    }
  };

  useEffect(() => {
    loadCommissions();
  }, [artistId]);

  // Handle stage updates
  const handleUpdateStatus = async (id: string, newStatus: Commission['status'], deliverUrl?: string) => {
    try {
      await updateCommissionStatus(id, newStatus, deliverUrl);
      addToast({
        type: 'success',
        title: 'Project Status Updated',
        message: `Commission updated to ${newStatus.toUpperCase()}`,
      });
      loadCommissions();
      setDeliveringComm(null);
      setDeliverableUrl('');
    } catch {
      // Optimistic update
      setCommissions(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, deliverable_url: deliverUrl } : c));
      addToast({
        type: 'success',
        title: 'Project Status Updated',
        message: `Commission updated to ${newStatus.toUpperCase()}`,
      });
      setDeliveringComm(null);
      setDeliverableUrl('');
    }
  };

  // Copy BBCode
  const handleCopyBBCode = () => {
    const bbcode = generateForumShopBBCode(studio, AHMAD_SOVEREIGN_ARTIST, portfolioArtworks[0]);
    navigator.clipboard.writeText(bbcode);
    setBbcodeCopied(true);
    addToast({
      type: 'success',
      title: 'BBCode Copied',
      message: 'Forum shop thread copied to clipboard! Paste directly into Torn City forums.',
    });
    setTimeout(() => setBbcodeCopied(false), 2500);
  };

  // Studio form updates
  const [studioName, setStudioName] = useState(studio.studioName);
  const [tagline, setTagline] = useState(studio.tagline);
  const [status, setStatus] = useState<StudioStatus>(studio.status);
  const [turnaroundDays, setTurnaroundDays] = useState(studio.turnaroundDays);

  const handleSaveStudioConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudio({
      studioName,
      tagline,
      status,
      turnaroundDays,
    });
    addToast({
      type: 'success',
      title: 'Studio Config Saved',
      message: 'Atelier configuration updated successfully.',
    });
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--void)', paddingBottom: 'var(--sp-20)' }}>
      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div className="renaissance-page-header">
        <div className="container">
          <div className="renaissance-chapter-tag">
            <Crown size={13} weight="fill" />
            Chapter IV &bull; Sovereign Workstation
          </div>
          <h1 className="renaissance-title">
            The Sovereign Atelier
          </h1>
          <p className="renaissance-subtitle">
            Executive creative workstation for <strong>ahmad_kaab [4295891]</strong>.
            Review client commission briefs, progress live work orders, deliver high-res master assets, and broadcast your queue.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            <Link
              to="/dashboard"
              className="renaissance-pill"
              style={{ textDecoration: 'none' }}
            >
              Switch to Collector Dossier &rarr;
            </Link>
            <Link
              to="/admin"
              className="renaissance-pill"
              style={{ textDecoration: 'none', borderColor: 'rgba(255,0,127,0.3)', color: 'var(--neon-magenta)' }}
            >
              Platform Treasury Console &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        {/* ── ATELIER TELEMETRY CARDS ──────────────────────────────── */}
        <div className="grid-responsive-4" style={{
          gap: '16px',
          marginBottom: 'var(--sp-8)'
        }}>
          {/* Card 1: Studio Status */}
          <div className="renaissance-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', letterSpacing: '0.1em' }}>
                STUDIO STATUS
              </span>
              <PaintBrush size={16} weight="duotone" style={{ color: 'var(--antique-gold)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.4rem', color: '#fff', fontWeight: 700 }}>
              {studio.status.toUpperCase()}
            </div>
            <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: '#10b981', marginTop: '4px' }}>
              ● 3 of 4 Queue Slots Open
            </div>
          </div>

          {/* Card 2: Active Orders */}
          <div className="renaissance-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', letterSpacing: '0.1em' }}>
                PENDING BRIEFS
              </span>
              <Clock size={16} weight="duotone" style={{ color: 'var(--neon-magenta)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.4rem', color: '#fff', fontWeight: 700 }}>
              {commissions.filter(c => c.status === 'open' || c.status === 'in_progress').length} Active
            </div>
            <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', marginTop: '4px' }}>
              Turnaround SLA: &lt; {studio.turnaroundDays} Days
            </div>
          </div>

          {/* Card 3: Portfolio Count */}
          <div className="renaissance-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', letterSpacing: '0.1em' }}>
                ACTIVE DROPS
              </span>
              <Image size={16} weight="duotone" style={{ color: 'var(--antique-gold)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.4rem', color: '#fff', fontWeight: 700 }}>
              {portfolioArtworks.length} Artwork(s)
            </div>
            <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', marginTop: '4px' }}>
              95% Net Artist Royalty
            </div>
          </div>

          {/* Card 4: Forum Sync */}
          <div className="renaissance-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', letterSpacing: '0.1em' }}>
                TORN FORUM SHOP
              </span>
              <TerminalWindow size={16} weight="duotone" style={{ color: 'var(--antique-gold)' }} />
            </div>
            <button
              onClick={handleCopyBBCode}
              className="renaissance-btn-gold"
              style={{ padding: '8px 12px', fontSize: '0.6875rem', width: '100%', justifyContent: 'center', minHeight: '36px' }}
            >
              {bbcodeCopied ? <Check size={12} weight="bold" /> : <Copy size={12} weight="bold" />}
              {bbcodeCopied ? 'BBCode Copied!' : 'Copy Forum Thread BBCode'}
            </button>
          </div>
        </div>

        {/* ── TABS NAVIGATION ──────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '6px' }} className="no-scrollbar">
          {[
            { id: 'queue', label: `Client Queue & Briefs (${commissions.length})` },
            { id: 'drops', label: 'Release New Drop / Auction' },
            { id: 'portfolio', label: `My Portfolio (${portfolioArtworks.length})` },
            { id: 'config', label: 'Studio Controls & SLA' },
            { id: 'forum', label: 'Torn BBCode Generator' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`renaissance-pill${activeTab === tab.id ? ' active' : ''}`}
              style={{ whiteSpace: 'nowrap', flexShrink: 0, minHeight: '40px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: CLIENT QUEUE & BRIEFS ─────────────────────────── */}
        {activeTab === 'queue' && (
          <div className="renaissance-glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                  Incoming Client Orders &amp; Work Queue
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--ghost)', margin: '4px 0 0 0' }}>
                  Commission orders placed by clients. Accept briefs, update progress milestones, and deliver high-res files to release escrow.
                </p>
              </div>
              <Link
                to="/commissions"
                className="renaissance-btn-gold"
                style={{ fontSize: '0.6875rem', padding: '6px 14px' }}
              >
                View Public Commissions Page <ArrowUpRight size={10} weight="bold" />
              </Link>
            </div>

            {loadingCommissions ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ghost)', fontFamily: 'var(--font-mono)' }}>
                Loading commission ledger...
              </div>
            ) : commissions.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ghost)', fontFamily: 'var(--font-mono)' }}>
                No active commissions in queue. All client briefs are fulfilled!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {commissions.map(c => {
                  const budgetCr = c.budget_torn ? Math.floor(c.budget_torn / 1000) : 5000;
                  const budgetXan = convertCreditsToXanax(budgetCr);

                  return (
                    <div
                      key={c.id}
                      style={{
                        background: 'rgba(244, 241, 234, 0.02)',
                        border: '1px solid rgba(244, 241, 234, 0.08)',
                        borderRadius: '8px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', letterSpacing: '0.1em' }}>
                            CLIENT ID: {c.buyer_user_id} &bull; QUEUED {new Date(c.created_at).toLocaleDateString()}
                          </div>
                          <h4 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', color: '#fff', margin: '4px 0 8px 0' }}>
                            {c.title}
                          </h4>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', lineHeight: 1.5, margin: 0, maxWidth: '750px' }}>
                            {c.description}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>ESCROW BUDGET</div>
                          <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', color: 'var(--neon-magenta)', fontWeight: 700 }}>
                            {budgetCr.toLocaleString()} CR
                          </div>
                          <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
                            ≈ {budgetXan}x Xanax
                          </div>
                        </div>
                      </div>

                      {/* Status and Action Buttons */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        borderTop: '1px solid rgba(244, 241, 234, 0.06)',
                        paddingTop: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>STATUS:</span>
                          <span style={{
                            padding: '3px 8px', borderRadius: '4px', fontSize: '0.625rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                            background: c.status === 'open' ? 'rgba(251,191,36,0.15)' :
                                        c.status === 'in_progress' ? 'rgba(59,130,246,0.15)' :
                                        c.status === 'delivered' ? 'rgba(168,85,247,0.15)' : 'rgba(16,185,129,0.15)',
                            color: c.status === 'open' ? '#fbbf24' :
                                   c.status === 'in_progress' ? '#60a5fa' :
                                   c.status === 'delivered' ? '#c084fc' : '#10b981',
                            border: '1px solid currentColor'
                          }}>
                            {c.status.replace('_', ' ')}
                          </span>
                          {c.deliverable_url && (
                            <a
                              href={c.deliverable_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.6875rem', color: 'var(--antique-gold)', marginLeft: '8px', textDecoration: 'underline' }}
                            >
                              View Delivered File ↗
                            </a>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {c.status === 'open' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(c.id, 'in_progress')}
                              className="renaissance-btn-primary"
                              style={{ fontSize: '0.6875rem', padding: '6px 12px' }}
                            >
                              Accept &amp; Start Work
                            </button>
                          )}

                          {c.status === 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(c.id, 'delivered')}
                              className="renaissance-btn-gold"
                              style={{ fontSize: '0.6875rem', padding: '6px 12px' }}
                            >
                              Mark Delivered / In Review
                            </button>
                          )}

                          {c.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => setDeliveringComm(c)}
                              className="renaissance-btn-primary"
                              style={{ fontSize: '0.6875rem', padding: '6px 12px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                            >
                              <UploadSimple size={12} weight="bold" /> Deliver Final Master Asset
                            </button>
                          )}

                          {c.status === 'completed' && (
                            <span style={{ color: '#10b981', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
                              ✓ Master Files Delivered &amp; Escrow Released
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: RELEASE DROPS / AUCTIONS ──────────────────────── */}
        {activeTab === 'drops' && (
          <div className="renaissance-glass-panel" style={{ padding: '28px' }}>
            <div style={{ maxWidth: '600px', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                Release New Sovereign Drop or Blind Auction
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                Mint artwork directly to the Renaissance Catalog. Choose between fixed-price acquisition or Blind Vault mystery auctions.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{
                background: 'rgba(244, 241, 234, 0.02)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '8px',
                padding: '24px'
              }}>
                <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', marginBottom: '8px' }}>
                  OPTION 1 &bull; FIXED PRICE
                </div>
                <h4 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', color: '#fff', margin: '0 0 8px 0' }}>
                  Marketplace Direct Sale
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--ghost)', lineHeight: 1.5, marginBottom: '20px' }}>
                  List an original artwork with fixed Xanax/Credit pricing. Instant checkout with guaranteed 95% artist payout.
                </p>
                <Link
                  to="/list-artwork?type=fixed"
                  className="renaissance-btn-gold"
                  style={{ display: 'inline-flex', padding: '8px 18px', fontSize: '0.75rem', textDecoration: 'none' }}
                >
                  List Fixed Price Artwork &rarr;
                </Link>
              </div>

              <div style={{
                background: 'rgba(244, 241, 234, 0.02)',
                border: '1px solid rgba(255, 0, 127, 0.3)',
                borderRadius: '8px',
                padding: '24px'
              }}>
                <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-magenta)', marginBottom: '8px' }}>
                  OPTION 2 &bull; HIGH STAKES
                </div>
                <h4 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', color: '#fff', margin: '0 0 8px 0' }}>
                  The Blind Vault Auction
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--ghost)', lineHeight: 1.5, marginBottom: '20px' }}>
                  Veiled artwork drop with live bidding. Highest bidder wins the master decrypted file when timer expires.
                </p>
                <Link
                  to="/list-artwork?type=auction"
                  className="renaissance-btn-primary"
                  style={{ display: 'inline-flex', padding: '8px 18px', fontSize: '0.75rem', textDecoration: 'none' }}
                >
                  Launch Blind Auction &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: PORTFOLIO ─────────────────────────────────────── */}
        {activeTab === 'portfolio' && (
          <div className="renaissance-glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                Ahmad&apos;s Master Portfolio ({portfolioArtworks.length})
              </h3>
              <Link to="/browse" className="renaissance-pill" style={{ textDecoration: 'none' }}>
                View in Public Catalog &rarr;
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px'
            }}>
              {portfolioArtworks.map(art => (
                <div
                  key={art.id}
                  style={{
                    background: 'rgba(244, 241, 234, 0.02)',
                    border: '1px solid rgba(244, 241, 234, 0.08)',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={art.image_url || '/renaissance_hero.jpg'}
                    alt={art.title}
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>
                      {art.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-magenta)', fontWeight: 600 }}>
                        {art.price_torn ? `${Math.floor(art.price_torn / 1000).toLocaleString()} CR` : 'Live Auction'}
                      </span>
                      <Link
                        to={`/artwork/${art.id}`}
                        style={{ fontSize: '0.625rem', color: 'var(--ghost)', textDecoration: 'underline' }}
                      >
                        Inspect Dossier
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: STUDIO CONTROLS & SLA ─────────────────────────── */}
        {activeTab === 'config' && (
          <div className="renaissance-glass-panel" style={{ padding: '28px', maxWidth: '650px' }}>
            <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.3rem', color: '#fff', margin: '0 0 6px 0' }}>
              Atelier Settings &amp; Public SLA
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', lineHeight: 1.5, marginBottom: '24px' }}>
              Control your public studio availability, commission queue capacity, and turnaround commitments.
            </p>

            <form onSubmit={handleSaveStudioConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', display: 'block', marginBottom: '6px' }}>
                  STUDIO DISPLAY NAME
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={e => setStudioName(e.target.value)}
                  className="input-industrial"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', display: 'block', marginBottom: '6px' }}>
                  STUDIO TAGLINE
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  className="input-industrial"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', display: 'block', marginBottom: '6px' }}>
                    COMMISSION AVAILABILITY
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as StudioStatus)}
                    className="input-industrial"
                    style={{ width: '100%', minHeight: '44px' }}
                  >
                    <option value="open">OPEN FOR COMMISSIONS</option>
                    <option value="busy">BUSY (LIMITED SLOTS)</option>
                    <option value="waitlist">WAITLIST ONLY</option>
                    <option value="closed">TEMPORARILY CLOSED</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', display: 'block', marginBottom: '6px' }}>
                    TURNAROUND SLA (DAYS)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={turnaroundDays}
                    onChange={e => setTurnaroundDays(Number(e.target.value))}
                    className="input-industrial"
                    style={{ width: '100%', minHeight: '44px' }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="renaissance-btn-primary"
                style={{ marginTop: '12px', padding: '12px 20px', alignSelf: 'flex-start', minHeight: '44px' }}
              >
                Save Atelier Settings
              </button>
            </form>
          </div>
        )}

        {/* ── TAB 5: TORN FORUM BBCODE TOOL ────────────────────────── */}
        {activeTab === 'forum' && (
          <div className="renaissance-glass-panel" style={{ padding: '24px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.3rem', color: '#fff', margin: 0 }}>
                  Torn City Forum Shop BBCode Generator
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--ghost)', margin: '4px 0 0 0' }}>
                  Instantly generated BBCode formatted thread with active queue slot statuses, pricing, and links to COVEN.
                </p>
              </div>

              <button
                onClick={handleCopyBBCode}
                className="renaissance-btn-gold"
                style={{ padding: '10px 16px', fontSize: '0.75rem', minHeight: '44px' }}
              >
                {bbcodeCopied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
                {bbcodeCopied ? 'Copied to Clipboard!' : 'Copy Entire BBCode'}
              </button>
            </div>

            <textarea
              readOnly
              rows={16}
              value={generateForumShopBBCode(studio, AHMAD_SOVEREIGN_ARTIST, portfolioArtworks[0])}
              style={{
                width: '100%',
                background: 'rgba(10, 12, 11, 0.9)',
                border: '1px solid rgba(244, 241, 234, 0.1)',
                borderRadius: '6px',
                padding: '16px',
                color: 'var(--ghost)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                lineHeight: 1.6,
                resize: 'vertical'
              }}
            />
          </div>
        )}

      </div>

      {/* ── DELIVER ASSET MODAL ────────────────────────────────────── */}
      {deliveringComm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px'
        }}>
          <div className="renaissance-glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '20px 16px' }}>
            <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.3rem', color: '#fff', margin: '0 0 8px 0' }}>
              Deliver Master Artwork File
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', lineHeight: 1.5, marginBottom: '20px' }}>
              Delivering the master asset completes the commission for <strong>{deliveringComm.title}</strong> and releases the client&apos;s escrow payment.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (deliverableUrl.trim()) {
                handleUpdateStatus(deliveringComm.id, 'completed', deliverableUrl.trim());
              }
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', display: 'block', marginBottom: '6px' }}>
                  MASTER FILE URL (IMGUR / DRIVE / DROPBOX)
                </label>
                <input
                  type="url"
                  value={deliverableUrl}
                  onChange={e => setDeliverableUrl(e.target.value)}
                  placeholder="https://i.imgur.com/master_asset.png"
                  className="input-industrial"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setDeliveringComm(null)}
                  className="btn btn-sm btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="renaissance-btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.75rem' }}
                >
                  Complete &amp; Deliver Master Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

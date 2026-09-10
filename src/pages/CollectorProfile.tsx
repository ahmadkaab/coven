/* ================================================================
   COVEN — The Syndicate Dossier (Collector Profile Page)
   Public collector showcase with Trophy Vault & Syndicate Radar.
   ================================================================ */

import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Crown,
  LockKey,
  Lightning,
  Broadcast,
  Chats,
  ShareNetwork,
  CheckCircle,
  Certificate,
  ArrowSquareOut,
  Palette,
  Sparkle,
  TrendUp,
} from '@phosphor-icons/react';
import { useAuthStore } from '../store/authStore';
import { getCollectorProfile, getFollowedArtistIds } from '../services/followService';
import { getSyndicateProgression } from '../services/achievementService';
import { SEED_ARTISTS, SEED_ARTWORKS } from '../data/seed';
import { formatTornCash, timeAgo } from '../utils/format';
import { useToast } from '../context/ToastContext';

export function CollectorProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const currentUserId = user ? String(user.player_id) : 'demo';
  const profileId = id || currentUserId;

  const profile = useMemo(() => getCollectorProfile(profileId, user), [profileId, user]);
  const followedArtistIds = useMemo(() => getFollowedArtistIds(profileId), [profileId]);

  const [activeTab, setActiveTab] = useState<'vault' | 'radar' | 'badges'>('vault');
  const [copied, setCopied] = useState(false);
  const [progression, setProgression] = useState(getSyndicateProgression());

  useEffect(() => {
    const handleUpdate = () => setProgression(getSyndicateProgression());
    window.addEventListener('coven:progression_update', handleUpdate);
    return () => window.removeEventListener('coven:progression_update', handleUpdate);
  }, []);

  // Owned pieces in collector trophy vault
  const ownedArtworks = useMemo(() => {
    return SEED_ARTWORKS.slice(0, profile.artworks_owned_count);
  }, [profile.artworks_owned_count]);

  // Followed artists
  const followedArtists = useMemo(() => {
    return SEED_ARTISTS.filter(a => followedArtistIds.includes(a.id));
  }, [followedArtistIds]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Dossier Link Copied', 'Encrypted profile URL copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="page-content collector-page">
      {/* ── TOP BREADCRUMB TELEMETRY ──────────────────────────── */}
      <div className="container" style={{ paddingTop: 'var(--sp-6)', paddingBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <Link
            to="/browse"
            className="navbar-link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem' }}
          >
            <ArrowLeft size={14} weight="bold" /> RETURN TO MARKET
          </Link>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', letterSpacing: '0.12em' }}>
            [ CITIZEN DOSSIER // COVEN ACCREDITATION #TORN-{profile.player_id} ]
          </div>
        </div>
      </div>

      {/* ── HERO DOSSIER COMPARTMENT ──────────────────────────── */}
      <div className="container">
        <div className="collector-hero-card">
          {/* Avatar with faction frame & cosmetic underworld frame */}
          <div className="collector-avatar-wrap">
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className={`collector-avatar-img ${progression.equippedFrame?.cssClass || 'frame-operative'}`}
            />
            <span className="collector-level-tag">LVL {progression.level}</span>
          </div>

          {/* Profile Details */}
          <div className="collector-hero-info">
            <div className="collector-badges-row">
              <span className="collector-tier-pill">
                <Crown size={12} weight="fill" /> {profile.collector_tier.toUpperCase()} PATRON
              </span>
              {profile.faction && (
                <span
                  className="collector-faction-tag"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  [{profile.faction.tag}] {profile.faction.name.toUpperCase()}
                </span>
              )}
              <span className="collector-status-pill">● ACTIVE SYNDICATE</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h1 className="collector-title" style={{ margin: 0 }}>{profile.username}</h1>
              {progression.equippedTitle && (
                <span
                  className={`syndicate-title-flair ${progression.equippedTitle.id.replace('title_', 'title-')}`}
                  title={progression.equippedTitle.lore}
                  style={{ transform: 'translateY(-2px)' }}
                >
                  {progression.equippedTitle.tag}
                </span>
              )}
            </div>

            <div className="collector-meta-line">
              <span>TORN CITIZEN #{profile.player_id}</span>
              <span className="collector-sep">·</span>
              <span>{profile.rank}</span>
              <span className="collector-sep">·</span>
              <span>ACCREDITED {timeAgo(profile.joined_coven).toUpperCase()}</span>
            </div>


            {profile.motto && (
              <p className="collector-motto">"{profile.motto}"</p>
            )}

            {profile.favorite_specialization && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)' }}>PRIMARY INTEREST:</span>
                <span className="badge badge-edition">{profile.favorite_specialization}</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="collector-hero-actions">
            <Link
              to="/dispatches"
              className="btn btn-primary btn-sm"
              style={{ justifyContent: 'center', gap: '6px', width: '100%' }}
            >
              <Chats size={14} weight="bold" /> THE WIRE
            </Link>

            <button
              type="button"
              onClick={handleCopyLink}
              className="btn btn-ghost btn-sm"
              style={{ justifyContent: 'center', gap: '6px', width: '100%' }}
            >
              <ShareNetwork size={14} weight="bold" /> {copied ? 'COPIED!' : 'SHARE DOSSIER'}
            </button>
          </div>
        </div>
      </div>

      {/* ── SYNDICATE FINANCIAL MATRIX ────────────────────────── */}
      <div className="container" style={{ marginTop: 'var(--sp-6)' }}>
        <div className="collector-metrics-grid">
          <div className="collector-metric-card">
            <div className="collector-metric-lbl">Total GFX Invested</div>
            <div className="collector-metric-val phosphor">{formatTornCash(profile.total_invested_torn)}</div>
            <div className="collector-metric-sub">TORN CITY CASH FLOW</div>
          </div>

          <div className="collector-metric-card">
            <div className="collector-metric-lbl">Private Trophy Vault</div>
            <div className="collector-metric-val">{profile.artworks_owned_count} MASTER ASSETS</div>
            <div className="collector-metric-sub">AUTHENTICATED ON-LEDGER</div>
          </div>

          <div className="collector-metric-card">
            <div className="collector-metric-lbl">Commissions Funded</div>
            <div className="collector-metric-val">{profile.commissions_funded_count} DELIVERED</div>
            <div className="collector-metric-sub">BESPOKE WORK CONTRACTS</div>
          </div>

          <div className="collector-metric-card">
            <div className="collector-metric-lbl">Radar Following</div>
            <div className="collector-metric-val green">{followedArtistIds.length} ARTISTS</div>
            <div className="collector-metric-sub">SYNDICATE RADAR PINS</div>
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION ───────────────────────────────────── */}
      <div className="container" style={{ marginTop: 'var(--sp-8)' }}>
        <div className="collector-tabs-nav">
          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`collector-tab-btn${activeTab === 'vault' ? ' active' : ''}`}
          >
            <LockKey size={14} /> TROPHY VAULT ({ownedArtworks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`collector-tab-btn${activeTab === 'radar' ? ' active' : ''}`}
          >
            <Broadcast size={14} /> SYNDICATE RADAR ({followedArtists.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`collector-tab-btn${activeTab === 'badges' ? ' active' : ''}`}
          >
            <ShieldCheck size={14} /> ACCREDITATIONS & BADGES ({profile.badges.length})
          </button>
        </div>

        {/* ── TAB 1: TROPHY VAULT ──────────────────────────────── */}
        {activeTab === 'vault' && (
          <div className="collector-tab-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: 'var(--sp-4)' }}>
              <div>
                <span className="section-label">EXHIBITION SPACE</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textTransform: 'uppercase', color: 'var(--phosphor)', margin: 0 }}>
                  PRIVATE MASTER COLLECTION
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                <span
                  className="badge badge-edition"
                  style={{ color: 'var(--term-green)', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                >
                  <ShieldCheck size={12} weight="bold" /> COVEN VERIFIED VAULT
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  ● CERTIFIED DELIVERABLES
                </span>
              </div>
            </div>

            {ownedArtworks.length === 0 ? (
              <div
                className="card-industrial"
                style={{
                  padding: 'var(--sp-12)',
                  textAlign: 'center',
                  background: 'var(--pit)',
                  border: '1px solid var(--wire)',
                }}
              >
                <LockKey size={36} color="var(--ghost)" style={{ marginBottom: '12px' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--chalk)', marginBottom: '6px' }}>
                  PRIVATE TROPHY VAULT EMPTY
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', maxWidth: '420px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                  You do not currently hold any unwatermarked master deliverables in your private vault. Win live auctions or acquire direct sales to store certified artwork here.
                </p>
                <Link
                  to="/browse"
                  className="btn btn-industrial"
                  style={{ background: 'var(--red)', color: '#fff', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  EXPLORE MARKETPLACE
                </Link>
              </div>
            ) : (
              <div className="collector-vault-grid">
                {ownedArtworks.map((art) => (
                  <div key={art.id} className="collector-art-card">
                    <div className="collector-art-thumb-wrap">
                      <img src={art.image_url} alt={art.title} className="collector-art-thumb" />
                      <span className="collector-art-verified-badge">
                        <Certificate size={11} weight="fill" /> VERIFIED MASTER
                      </span>
                    </div>

                    <div className="collector-art-info">
                      <div className="collector-art-meta">
                        <span>BY {(art.artist?.username || 'ARTIST').toUpperCase()}</span>
                        <span className="collector-art-price">
                          {formatTornCash(art.listing_type === 'auction' ? art.current_bid ?? 0 : art.price_torn ?? 0)}
                        </span>
                      </div>

                      <h3 className="collector-art-title">{art.title}</h3>

                      <div className="collector-art-footer" style={{ display: 'flex', gap: '6px' }}>
                        <Link to={`/artwork/${art.id}`} className="collector-art-inspect-btn" style={{ flex: 1 }}>
                          INSPECT <ArrowSquareOut size={12} />
                        </Link>
                        <Link
                          to="/trade"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '6px 8px', fontSize: '0.625rem', borderColor: 'var(--wire)', color: 'var(--ghost)', textDecoration: 'none' }}
                          title="Propose a trade swap with this artwork"
                        >
                          SWAP
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: SYNDICATE RADAR ───────────────────────────── */}
        {activeTab === 'radar' && (
          <div className="collector-tab-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
              <div>
                <span className="section-label">ARTIST TRACKING</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textTransform: 'uppercase', color: 'var(--phosphor)' }}>
                  PINNED SYNDICATE ARTISTS
                </h2>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)' }}>
                ACTIVE MONITORING: {followedArtists.length} ARTISTS
              </span>
            </div>

            {followedArtists.length === 0 ? (
              <div
                className="card-industrial"
                style={{
                  padding: 'var(--sp-12)',
                  textAlign: 'center',
                  background: 'var(--pit)',
                  border: '1px solid var(--wire)',
                }}
              >
                <Palette size={36} color="var(--ghost)" style={{ marginBottom: '12px' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--chalk)', marginBottom: '6px' }}>
                  NO ARTISTS CURRENTLY PINNED
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', maxWidth: '420px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                  Follow verified Torn creators from their public profiles to receive real-time alerts when they drop new artworks or open custom commission slots.
                </p>
                <Link
                  to="/artists"
                  className="btn btn-industrial"
                  style={{ background: 'var(--red)', color: '#fff', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  DISCOVER ARTISTS
                </Link>
              </div>
            ) : (
              <div className="collector-vault-grid">
                {followedArtists.map((artist) => (
                  <div key={artist.id} className="collector-art-card">
                    <div style={{ padding: 'var(--sp-4)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <img src={artist.avatar_url} alt={artist.username} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--phosphor)' }}>{artist.username}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--term-green)' }}>
                            {artist.is_verified ? 'VERIFIED CREATOR' : 'SYNDICATE ARTIST'}
                          </div>
                        </div>
                      </div>
                      <Link to={`/artist/${artist.id}`} className="collector-art-inspect-btn" style={{ width: '100%', justifyContent: 'center' }}>
                        VIEW PROFILE <ArrowSquareOut size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: ACCREDITATIONS & BADGES ──────────────────── */}
        {activeTab === 'badges' && (
          <div className="collector-tab-panel">
            {/* Underworld Mastery Syndicate Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(24, 24, 28, 0.9), rgba(16, 16, 20, 0.95))',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderLeft: '4px solid #F59E0B',
              padding: 'var(--sp-4) var(--sp-5)',
              marginBottom: 'var(--sp-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              borderRadius: '4px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#FCD34D', fontWeight: 700, letterSpacing: '0.08em' }}>
                    UNDERWORLD MASTERY: LEVEL {progression.level} · {progression.tierTitle.toUpperCase()}
                  </span>
                  <span className="badge badge-edition" style={{ color: 'var(--term-green)', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.08)' }}>
                    -{(progression.feeRebatePercent).toFixed(1)}% ESCROW FEE REBATE
                  </span>
                  {progression.equippedTitle && (
                    <span className={`syndicate-title-flair ${progression.equippedTitle.id.replace('title_', 'title-')}`}>
                      {progression.equippedTitle.tag}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)', letterSpacing: '0.04em' }}>
                  {progression.unlockedAchievements} / {progression.totalAchievements} Underworld Accreditations Unlocked · Reputation: <span style={{ color: '#FDE68A', fontWeight: 600 }}>{progression.totalReputation.toLocaleString()} PTS</span>
                </div>
              </div>

              <Link
                to="/achievements"
                className="btn btn-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.35))',
                  color: '#FDE68A',
                  border: '1px solid #F59E0B',
                  borderRadius: '3px',
                  boxShadow: '0 0 14px rgba(245, 158, 11, 0.25)',
                  gap: '6px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '8px 16px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Sparkle size={14} weight="fill" /> UNDERWORLD ACCREDITATIONS & ARMORY →
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
              <div>
                <span className="section-label">PROVENANCE & HONORS</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textTransform: 'uppercase', color: 'var(--phosphor)' }}>
                  SYNDICATE ACCREDITATION SEALS
                </h2>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--term-green)' }}>
                ● 5 / 5 UNLOCKED
              </span>
            </div>

            <div className="collector-badges-grid">
              {profile.badges.map((badge) => (
                <div key={badge.id} className={`collector-badge-card ${badge.rarity}`}>
                  <div className="collector-badge-header">
                    <div className="collector-badge-icon-box">
                      {badge.icon === 'Crown' && <Crown size={20} weight="fill" />}
                      {badge.icon === 'LockKey' && <LockKey size={20} weight="fill" />}
                      {badge.icon === 'Lightning' && <Lightning size={20} weight="fill" />}
                      {badge.icon === 'ShieldCheck' && <ShieldCheck size={20} weight="fill" />}
                      {badge.icon === 'Radar' && <Broadcast size={20} weight="fill" />}
                    </div>
                    <span className="collector-badge-rarity">{badge.rarity.toUpperCase()}</span>
                  </div>

                  <h3 className="collector-badge-title">{badge.title}</h3>
                  <p className="collector-badge-desc">{badge.description}</p>
                  <span className="collector-badge-unlocked">
                    ACCREDITED {timeAgo(badge.unlocked_at).toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ================================================================
   COVEN — Underworld Achievements, Accolades & Title Progression Page
   Prestige leveling, title flairs, cosmetic frames, and fee rebates.
   ================================================================ */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Crown,
  ShieldCheck,
  ShieldPlus,
  LockKey,
  Crosshair,
  Sword,
  Ghost,
  ArrowsLeftRight,
  Coins,
  Scales,
  Bank,
  Palette,
  Gavel,
  EyeSlash,
  Sparkle,
  CheckCircle,
  Percent,
  Check,
} from '@phosphor-icons/react';
import {
  getAchievements,
  getTitles,
  getAvatarFrames,
  getSyndicateProgression,
  claimAchievementReward,
  equipTitle,
  equipAvatarFrame,
} from '../services/achievementService';
import type {
  Achievement,
  AchievementCategory,
  SyndicateTitle,
  AvatarFrame,
  SyndicateProgression,
} from '../types/achievement';
import { useToast } from '../context/ToastContext';
import { useAuthStore } from '../store/authStore';
import { AvatarWithFrame } from '../components/common/AvatarWithFrame';

export function AchievementsHub() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const avatarUrl = user?.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
  const username = user?.name || 'Syndicate Operative';

  const [activeTab, setActiveTab] = useState<'accreditations' | 'armory'>('accreditations');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'ALL' | 'UNCLAIMED'>('ALL');

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [titles, setTitles] = useState<SyndicateTitle[]>([]);
  const [frames, setFrames] = useState<AvatarFrame[]>([]);
  const [progression, setProgression] = useState<SyndicateProgression | null>(null);

  const refreshState = useCallback(() => {
    setAchievements(getAchievements());
    setTitles(getTitles());
    setFrames(getAvatarFrames());
    setProgression(getSyndicateProgression());
  }, []);

  useEffect(() => {
    refreshState();
    const handleUpdate = () => refreshState();
    window.addEventListener('coven:progression_update', handleUpdate);
    window.addEventListener('coven:achievement_claimed', handleUpdate);
    return () => {
      window.removeEventListener('coven:progression_update', handleUpdate);
      window.removeEventListener('coven:achievement_claimed', handleUpdate);
    };
  }, [refreshState]);

  // Unclaimed rewards count
  const unclaimedCount = useMemo(() => {
    return achievements.filter(a => a.unlocked && !a.claimed).length;
  }, [achievements]);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter(a => {
      if (selectedCategory === 'ALL') return true;
      if (selectedCategory === 'UNCLAIMED') return a.unlocked && !a.claimed;
      return a.category === selectedCategory;
    });
  }, [achievements, selectedCategory]);

  // Handle claiming an achievement
  const handleClaim = (ach: Achievement) => {
    try {
      const res = claimAchievementReward(ach.id);
      if (res.success) {
        toast.success(
          `Accreditation Claimed!`,
          `Unlocked: ${res.reward.label}. Syndicate standing upgraded.`
        );
        refreshState();
      }
    } catch {
      toast.error('Claim Failed', 'Could not process reward claim.');
    }
  };

  // Handle equipping title
  const handleEquipTitle = (t: SyndicateTitle) => {
    if (!t.unlocked) return;
    equipTitle(t.id);
    toast.success('Title Equipped', `Your active title is now ${t.tag}`);
    refreshState();
  };

  // Handle equipping avatar frame
  const handleEquipFrame = (f: AvatarFrame) => {
    if (!f.unlocked) return;
    equipAvatarFrame(f.id);
    toast.success('Frame Equipped', `Applied ${f.name} avatar border.`);
    refreshState();
  };

  // Helper to render icon for achievement
  const renderAchievementIcon = (iconName: string, size = 20) => {
    switch (iconName) {
      case 'Crosshair': return <Crosshair size={size} weight="bold" />;
      case 'Sword': return <Sword size={size} weight="bold" />;
      case 'Ghost': return <Ghost size={size} weight="bold" />;
      case 'ShieldPlus': return <ShieldPlus size={size} weight="bold" />;
      case 'ShieldCheck': return <ShieldCheck size={size} weight="bold" />;
      case 'LockKey': return <LockKey size={size} weight="bold" />;
      case 'Crown': return <Crown size={size} weight="fill" />;
      case 'ArrowsLeftRight': return <ArrowsLeftRight size={size} weight="bold" />;
      case 'Coins': return <Coins size={size} weight="fill" />;
      case 'Scales': return <Scales size={size} weight="bold" />;
      case 'Bank': return <Bank size={size} weight="fill" />;
      case 'Broadcast': return <BroadcastIcon size={size} />;
      case 'Palette': return <Palette size={size} weight="bold" />;
      case 'Gavel': return <Gavel size={size} weight="fill" />;
      case 'EyeSlash': return <EyeSlash size={size} weight="bold" />;
      case 'Sparkle': return <Sparkle size={size} weight="fill" />;
      default: return <CheckCircle size={size} weight="bold" />;
    }
  };

  function BroadcastIcon({ size }: { size: number }) {
    return (
      <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
        <path d="M128,140a12,12,0,1,0,12,12A12,12,0,0,0,128,140Zm72.77-51.23a8,8,0,0,0-11.31,11.31,74.69,74.69,0,0,1,0,105.84,8,8,0,0,0,11.31,11.31,90.69,90.69,0,0,0,0-128.46ZM66.54,88.77a8,8,0,0,0-11.31,0,90.69,90.69,0,0,0,0,128.46,8,8,0,0,0,11.31-11.31,74.69,74.69,0,0,1,0-105.84A8,8,0,0,0,66.54,88.77Zm104.9,28.46a8,8,0,0,0-11.31,11.31,34.69,34.69,0,0,1,0,49.23,8,8,0,0,0,11.31,11.31,50.69,50.69,0,0,0,0-71.85ZM95.87,117.23a8,8,0,0,0-11.31,11.31,50.69,50.69,0,0,0,0,71.85,8,8,0,0,0,11.31-11.31,34.69,34.69,0,0,1,0-49.23A8,8,0,0,0,95.87,117.23Z" />
      </svg>
    );
  }

  if (!progression) return null;

  return (
    <main className="page-content achievements-page" style={{ minHeight: '100vh', background: 'var(--void)' }}>
      {/* ── RENAISSANCE TOP HEADER ──────────────────────────── */}
      <div className="renaissance-page-header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="renaissance-chapter-tag">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-magenta)', display: 'inline-block', boxShadow: '0 0 8px var(--neon-magenta)' }} />
                CHAPTER V &bull; UNDERWORLD ACCOLADES &bull; PRESTIGE RANKING
              </div>

              <h1 className="renaissance-title">
                Underworld Accolades
              </h1>
              <p className="renaissance-subtitle">
                Ascend the syndicate ranks. Complete high-stakes market operations, claim exclusive cosmetic titles, and forge legendary avatar frames.
              </p>
            </div>

            {/* Return Link */}
            <Link
              to="/browse"
              className="renaissance-btn-gold"
              style={{ fontSize: '0.6875rem', padding: '8px 16px' }}
            >
              <ArrowLeft size={12} weight="bold" /> Return to Exhibition
            </Link>
          </div>
        </div>
      </div>

      {/* ── HERO SYNDICATE PRESTIGE MATRIX ────────────────────── */}
      <div className="container">
        <div className="renaissance-glass-panel" style={{ padding: '28px', marginBottom: 'var(--sp-8)' }}>
          <div className="achievements-telemetry-row">
            {/* Level & Rank Display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
              <div style={{
                background: 'rgba(255, 0, 127, 0.1)',
                border: '1px solid var(--neon-magenta)',
                borderRadius: '8px',
                padding: '12px 18px',
                textAlign: 'center',
                boxShadow: '0 0 20px rgba(255, 0, 127, 0.2)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--antique-gold)', letterSpacing: '0.12em' }}>
                    SYNDICATE MASTERY
                  </span>
                  <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.8rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
                    LVL {progression.level}
                  </div>
                </div>
              </div>

              <div style={{ borderLeft: '1px solid rgba(244, 241, 234, 0.08)', paddingLeft: 'var(--sp-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.35rem', color: 'var(--phosphor)', fontWeight: 600 }}>
                    {progression.tierTitle}
                  </span>
                  {progression.equippedTitle && (
                    <span className={`syndicate-title-flair ${progression.equippedTitle.id.replace('title_', 'title-')}`}>
                      {progression.equippedTitle.tag}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                  REPUTATION SCORE: <span style={{ color: 'var(--antique-gold)', fontWeight: 700 }}>{progression.totalReputation.toLocaleString()} PTS</span>
                  <span style={{ margin: '0 8px', color: 'rgba(244, 241, 234, 0.2)' }}>&bull;</span>
                  UNLOCKED: <span style={{ color: 'var(--neon-magenta)', fontWeight: 700 }}>{progression.unlockedAchievements} / {progression.totalAchievements}</span>
                </div>
              </div>
            </div>

            {/* Quick Vanity Preview */}
            <div className="vanity-preview-box" style={{ background: 'rgba(10, 13, 12, 0.6)', border: '1px solid rgba(244, 241, 234, 0.08)' }}>
              <AvatarWithFrame
                size="lg"
                avatarUrl={avatarUrl}
                frame={progression.equippedFrame}
                alt={username}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--antique-gold)' }}>
                  ACTIVE VANITY LOADOUT
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--phosphor)', fontWeight: 700 }}>
                  {progression.equippedFrame?.name || 'Standard Operative'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('armory')}
                  className="renaissance-btn-gold"
                  style={{ fontSize: '0.5625rem', padding: '3px 8px', marginTop: '4px', alignSelf: 'flex-start' }}
                >
                  CUSTOMIZE LOADOUT &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--ghost)' }}>
                EXPERIENCE TO LEVEL {progression.level + 1}
              </span>
              <span style={{ color: 'var(--antique-gold)' }}>
                {progression.currentExp} / {progression.nextLevelExp} EXP ({Math.round((progression.currentExp / progression.nextLevelExp) * 100)}%)
              </span>
            </div>
            <div className="achievements-exp-track" style={{ background: 'rgba(244, 241, 234, 0.05)' }}>
              <div
                className="achievements-exp-fill"
                style={{ width: `${(progression.currentExp / progression.nextLevelExp) * 100}%`, background: 'linear-gradient(90deg, var(--neon-magenta), var(--antique-gold))' }}
              />
            </div>
          </div>

          {/* Active Syndicate Perks Strip */}
          <div className="achievements-perks-strip">
            <div className="achievements-perk-card">
              <Percent className="achievements-perk-icon" weight="bold" />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)' }}>
                  MARKETPLACE ESCROW FEE
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--term-green)', fontWeight: 700 }}>
                  -{(progression.feeRebatePercent).toFixed(1)}% REBATE ({(5.0 - progression.feeRebatePercent).toFixed(1)}% NET)
                </div>
              </div>
            </div>

            <div className="achievements-perk-card">
              <ShieldPlus className="achievements-perk-icon" weight="bold" />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)' }}>
                  VAULT DEFENSE FORTIFICATION
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: '#60a5fa', fontWeight: 700 }}>
                  +5% PASSIVE BREACH RESISTANCE
                </div>
              </div>
            </div>

            <div className="achievements-perk-card">
              <Crown className="achievements-perk-icon" weight="fill" />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)' }}>
                  UNDERWORLD CITIZEN STANDING
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: '#fbbf24', fontWeight: 700 }}>
                  HIGH ROLLER VIP ARCHON
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN TABS NAVIGATION ──────────────────────────────── */}
      <div className="container" style={{ marginTop: 'var(--sp-8)' }}>
        <div className="collector-tabs-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('accreditations')}
              className={`renaissance-pill${activeTab === 'accreditations' ? ' active' : ''}`}
            >
              <ShieldCheck size={14} /> UNDERWORLD ACCREDITATIONS ({achievements.length})
              {unclaimedCount > 0 && (
                <span style={{ background: 'var(--antique-gold)', color: '#000', padding: '1px 6px', fontSize: '0.5625rem', borderRadius: '4px', fontWeight: 700, marginLeft: '4px' }}>
                  {unclaimedCount} READY
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('armory')}
              className={`renaissance-pill${activeTab === 'armory' ? ' active' : ''}`}
            >
              <Sparkle size={14} /> VANITY ARMORY ({titles.length + frames.length})
            </button>
          </div>

          <Link
            to="/trade"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.625rem', gap: '4px' }}
          >
            <ArrowsLeftRight size={12} weight="bold" /> ESCROW TRADES →
          </Link>
        </div>

        {/* ── TAB 1: ACCREDITATIONS ───────────────────────────── */}
        {activeTab === 'accreditations' && (
          <div className="collector-tab-panel">
            {/* Category Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--sp-4)' }}>
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`btn btn-sm ${selectedCategory === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.625rem' }}
              >
                ALL ACCREDITATIONS ({achievements.length})
              </button>

              {unclaimedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('UNCLAIMED')}
                  className={`btn btn-sm ${selectedCategory === 'UNCLAIMED' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.625rem', color: selectedCategory !== 'UNCLAIMED' ? '#fbbf24' : undefined, borderColor: '#fbbf24' }}
                >
                  ⚡ REWARDS READY ({unclaimedCount})
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedCategory('BLACK_MARKET')}
                className={`btn btn-sm ${selectedCategory === 'BLACK_MARKET' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.625rem' }}
              >
                BLACK MARKET & ESCROW
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('SYNDICATE_PATRON')}
                className={`btn btn-sm ${selectedCategory === 'SYNDICATE_PATRON' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.625rem' }}
              >
                SYNDICATE PATRON
              </button>
            </div>

            {/* Achievements Cards Grid */}
            <div className="achievements-grid">
              {filteredAchievements.map((ach) => {
                const isUnclaimed = ach.unlocked && !ach.claimed;
                const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

                return (
                  <div
                    key={ach.id}
                    className={`achievement-card ${ach.rarity}${isUnclaimed ? ' unlocked-unclaimed' : ''}`}
                  >
                    <div className="achievement-card-header">
                      <span className={`achievement-rarity-pill ${ach.rarity}`}>
                        {ach.rarity}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)' }}>
                        {ach.trackTag}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: ach.unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--hull)',
                        color: ach.unlocked ? 'var(--term-green)' : 'var(--ghost)',
                        flexShrink: 0,
                      }}>
                        {renderAchievementIcon(ach.icon, 20)}
                      </div>

                      <div>
                        <h3 className="achievement-title">
                          {ach.secret && !ach.unlocked ? 'SECRET ACHIEVEMENT' : ach.title}
                        </h3>
                        <p className="achievement-desc">
                          {ach.secret && !ach.unlocked ? (ach.hint || 'Hidden secret objective. Complete special actions to unlock.') : ach.description}
                        </p>
                      </div>
                    </div>

                    {/* Reward Tag */}
                    <div>
                      <div className="achievement-reward-tag">
                        <Sparkle size={12} weight="fill" />
                        <span>REWARD: {ach.reward.label}</span>
                      </div>
                    </div>

                    {/* Progress & Actions */}
                    <div className="achievement-progress-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)' }}>
                        <span>STATUS: {ach.unlocked ? 'ACCREDITED' : 'IN PROGRESS'}</span>
                        <span>
                          {typeof ach.progress === 'number' && ach.progress > 10000
                            ? `$${(ach.progress / 1000000).toFixed(0)}M / $${(ach.maxProgress / 1000000).toFixed(0)}M`
                            : `${ach.progress} / ${ach.maxProgress}`} ({percent}%)
                        </span>
                      </div>

                      <div className="achievement-progress-track">
                        <div
                          className="achievement-progress-fill"
                          style={{
                            width: `${percent}%`,
                            background: ach.unlocked
                              ? 'linear-gradient(90deg, #10B981, #059669)'
                              : 'linear-gradient(90deg, #38BDF8, #818CF8)',
                            boxShadow: ach.unlocked
                              ? '0 0 10px rgba(16, 185, 129, 0.4)'
                              : '0 0 8px rgba(56, 189, 248, 0.3)',
                          }}
                        />
                      </div>

                      {/* Claim Button / Claimed Stamp */}
                      <div style={{ marginTop: '8px' }}>
                        {isUnclaimed ? (
                          <button
                            type="button"
                            onClick={() => handleClaim(ach)}
                            className="achievement-claim-btn"
                            style={{ width: '100%' }}
                          >
                            <Sparkle size={14} weight="fill" /> CLAIM REWARD
                          </button>
                        ) : ach.claimed ? (
                          <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.625rem',
                            color: 'var(--term-green)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 0',
                          }}>
                            <Check size={12} weight="bold" /> REWARD VERIFIED & APPLIED
                          </div>
                        ) : (
                          <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.5625rem',
                            color: 'var(--shadow-type)',
                            padding: '4px 0',
                          }}>
                            LOCKED // COMPLETE OBJECTIVE TO CLAIM
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: VANITY ARMORY (TITLES & FRAMES) ───────────── */}
        {activeTab === 'armory' && (
          <div className="collector-tab-panel">
            {/* Live Customizer Preview Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(30,30,30,0.85))',
              border: '1px solid var(--hull)',
              padding: 'var(--sp-6)',
              marginBottom: 'var(--sp-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--sp-6)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
                <AvatarWithFrame
                  size="xl"
                  avatarUrl={avatarUrl}
                  frame={progression.equippedFrame}
                  showLevel
                  level={progression.level}
                  alt={username}
                />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', textTransform: 'uppercase', color: 'var(--phosphor)' }}>
                      {username}
                    </h2>
                    {progression.equippedTitle && (
                      <span className={`syndicate-title-flair ${progression.equippedTitle.id.replace('title_', 'title-')}`}>
                        {progression.equippedTitle.tag}
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                    FRAME: <span style={{ color: '#fbbf24' }}>{progression.equippedFrame?.name || 'Standard Operative'}</span>
                    <span style={{ margin: '0 8px', color: 'var(--seam)' }}>·</span>
                    PERK: <span style={{ color: 'var(--term-green)' }}>{progression.equippedTitle?.bonusPerk || 'None'}</span>
                  </div>
                </div>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', textAlign: 'right' }}>
                CHANGES ARE PERSISTED DIRECTLY TO YOUR
                <br />
                COVEN CITIZEN DOSSIER & THE WIRE DISPATCHES
              </div>
            </div>

            {/* Sub-Section 1: Unlockable Titles */}
            <div style={{ marginBottom: 'var(--sp-8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
                <div>
                  <span className="section-label">HONORARY NOMENCLATURE</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', textTransform: 'uppercase', color: 'var(--phosphor)' }}>
                    UNDERWORLD SYNDICATE TITLES ({titles.filter(t => t.unlocked).length} / {titles.length} UNLOCKED)
                  </h3>
                </div>
              </div>

              <div className="armory-grid">
                {titles.map((t) => (
                  <div key={t.id} className={`vanity-item-card${t.equipped ? ' equipped' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className={`syndicate-title-flair ${t.id.replace('title_', 'title-')}`}>
                        {t.tag}
                      </span>
                      <span className={`achievement-rarity-pill ${t.rarity}`}>
                        {t.rarity}
                      </span>
                    </div>

                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--ghost)', lineHeight: 1.4 }}>
                      {t.lore}
                    </p>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--term-green)' }}>
                      PERK: {t.bonusPerk}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                      {t.equipped ? (
                        <button
                          type="button"
                          disabled
                          className="btn btn-sm btn-ghost"
                          style={{ width: '100%', borderColor: '#fbbf24', color: '#fbbf24', cursor: 'default' }}
                        >
                          <Check size={14} weight="bold" /> CURRENTLY EQUIPPED
                        </button>
                      ) : t.unlocked ? (
                        <button
                          type="button"
                          onClick={() => handleEquipTitle(t)}
                          className="btn btn-sm btn-primary"
                          style={{ width: '100%' }}
                        >
                          EQUIP TITLE
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="btn btn-sm btn-ghost"
                          style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}
                        >
                          LOCKED
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-Section 2: Unlockable Avatar Frames */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
                <div>
                  <span className="section-label">COSMETIC PROFILE TRIMS</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', textTransform: 'uppercase', color: 'var(--phosphor)' }}>
                    TACTICAL AVATAR FRAMES ({frames.filter(f => f.unlocked).length} / {frames.length} UNLOCKED)
                  </h3>
                </div>
              </div>

              <div className="armory-grid">
                {frames.map((f) => (
                  <div key={f.id} className={`vanity-item-card${f.equipped ? ' equipped' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <AvatarWithFrame
                        size="md"
                        avatarUrl={avatarUrl}
                        frame={f}
                        alt={f.name}
                      />
                      <div>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', textTransform: 'uppercase', color: 'var(--phosphor)', margin: 0 }}>
                          {f.name}
                        </h4>
                        <span className={`achievement-rarity-pill ${f.rarity}`} style={{ display: 'inline-block', marginTop: '2px' }}>
                          {f.rarity}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--ghost)', lineHeight: 1.4 }}>
                      {f.description}
                    </p>

                    <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                      {f.equipped ? (
                        <button
                          type="button"
                          disabled
                          className="btn btn-sm btn-ghost"
                          style={{ width: '100%', borderColor: '#fbbf24', color: '#fbbf24', cursor: 'default' }}
                        >
                          <Check size={14} weight="bold" /> CURRENTLY EQUIPPED
                        </button>
                      ) : f.unlocked ? (
                        <button
                          type="button"
                          onClick={() => handleEquipFrame(f)}
                          className="btn btn-sm btn-primary"
                          style={{ width: '100%' }}
                        >
                          APPLY FRAME
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="btn btn-sm btn-ghost"
                          style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}
                        >
                          LOCKED
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

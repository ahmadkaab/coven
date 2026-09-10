/* ================================================================
   COVEN — Underworld Achievements, Accolades & Title Progression Service
   Prestige progression, title flairs, avatar frames, and fee rebates.
   ================================================================ */

import type {
  Achievement,
  SyndicateTitle,
  AvatarFrame,
  SyndicateProgression,
  AchievementCategory,
} from '../types/achievement';
import { dispatchNotification } from './notificationService';

const ACHIEVEMENTS_KEY = 'coven_achievements_v1';
const TITLES_KEY = 'coven_titles_v1';
const FRAMES_KEY = 'coven_frames_v1';
const PROGRESSION_KEY = 'coven_progression_v1';

/* ── DEFAULT TITLES ─────────────────────────────────────────── */
const SEED_TITLES: SyndicateTitle[] = [
  {
    id: 'title_broker',
    name: 'Black Market Broker',
    tag: '[BLACK MARKET BROKER]',
    lore: 'Awarded to master negotiators who settle high-stakes P2P artwork swaps via atomic escrow.',
    rarity: 'STANDARD',
    glowColor: '#f59e0b',
    gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
    unlocked: true,
    equipped: false,
    sourceAchievementId: 'trade_first_swap',
    bonusPerk: '-0.5% Escrow Transaction Fee',
  },
  {
    id: 'title_curator',
    name: 'Grand Curator',
    tag: '[GRAND CURATOR]',
    lore: 'Awarded to master collectors who curate and archive an expansive private collection of verified Torn artworks.',
    rarity: 'COVERT',
    glowColor: '#06b6d4',
    gradient: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
    unlocked: true,
    equipped: false,
    sourceAchievementId: 'patron_grand_curator',
    bonusPerk: '+5% Marketplace Reputation',
  },
  {
    id: 'title_patron',
    name: 'Underworld Patron',
    tag: '[SYNDICATE PATRON]',
    lore: 'Granted to esteemed art patrons who fund and support independent Torn City digital creators.',
    rarity: 'MYTHIC',
    glowColor: '#10b981',
    gradient: 'linear-gradient(90deg, #10b981, #fbbf24)',
    unlocked: true,
    equipped: false,
    sourceAchievementId: 'patron_titan',
    bonusPerk: 'Priority Commission Queue Access',
  },
  {
    id: 'title_archon',
    name: 'Archon of Torn City',
    tag: '[ARCHON OF TORN]',
    lore: 'The absolute pinnacle of underworld prestige. Sovereign patron of fine arts and master collector.',
    rarity: 'ARCHON',
    glowColor: '#e61919',
    gradient: 'linear-gradient(90deg, #e61919, #fbbf24, #f43f5e)',
    unlocked: true,
    equipped: true,
    sourceAchievementId: 'archon_supreme',
    bonusPerk: '-2.0% Escrow Fee Rebate & Mythic Corona Aura',
  },
];

/* ── DEFAULT AVATAR FRAMES ──────────────────────────────────── */
const SEED_FRAMES: AvatarFrame[] = [
  {
    id: 'frame_operative',
    name: 'Standard Operative',
    description: 'Clean dark carbon-fiber chamfered border with subdued matte corner tabs.',
    rarity: 'STANDARD',
    glowColor: '#52525b',
    cssClass: 'frame-operative',
    unlocked: true,
    equipped: false,
    sourceAchievementId: 'trade_first_swap',
  },
  {
    id: 'frame_cyber_pulse',
    name: 'Cyber Neon Circuit',
    description: 'Electrified cyan and neon green data pulses running along subterranean circuit traces.',
    rarity: 'COVERT',
    glowColor: '#06b6d4',
    cssClass: 'frame-cyber-pulse',
    unlocked: true,
    equipped: false,
    sourceAchievementId: 'secret_midnight_syndicate',
  },
  {
    id: 'frame_monarch_gold',
    name: 'Monarch High-Roller',
    description: 'Gilded high-roller frame with polished gold leaf edging and subtle metallic sheen.',
    rarity: 'MYTHIC',
    glowColor: '#fbbf24',
    cssClass: 'frame-monarch-gold',
    unlocked: true,
    equipped: false,
    sourceAchievementId: 'patron_titan',
  },
  {
    id: 'frame_archon_void',
    name: 'Archon Void Corona',
    description: 'Pulsing mythic underworld corona with shifting crimson, gold, and violet energy field.',
    rarity: 'ARCHON',
    glowColor: '#e61919',
    cssClass: 'frame-archon-void',
    unlocked: true,
    equipped: true,
    sourceAchievementId: 'archon_supreme',
  },
];

/* ── DEFAULT ACHIEVEMENTS ───────────────────────────────────── */
const SEED_ACHIEVEMENTS: Achievement[] = [

  // ── Black Market & Escrow
  {
    id: 'trade_first_swap',
    title: 'Black Market Broker',
    description: 'Settle your first peer-to-peer artwork swap through verified atomic escrow.',
    category: 'BLACK_MARKET',
    rarity: 'STANDARD',
    icon: 'ArrowsLeftRight',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
    claimed: true,
    reward: { type: 'TITLE', value: 'title_broker', label: 'Title: [BLACK MARKET BROKER]' },
    trackTag: '[P2P SWAP]',
  },
  {
    id: 'trade_sweetener_king',
    title: 'High-Stakes Sweetener',
    description: 'Pledge over $15,000,000 in cash sweeteners to successfully close an atomic swap deal.',
    category: 'BLACK_MARKET',
    rarity: 'COVERT',
    icon: 'Coins',
    progress: 25000000,
    maxProgress: 15000000,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    claimed: false, // Ready to claim!
    reward: { type: 'FEE_DISCOUNT', value: 0.5, label: '+0.5% Permanent Fee Rebate' },
    trackTag: '[CASH ESCROW]',
  },
  {
    id: 'trade_triad_arbitrage',
    title: 'Triad Arbitrage',
    description: 'Exchange authenticated artworks across 3 distinct Torn faction syndicates.',
    category: 'BLACK_MARKET',
    rarity: 'CLASSIFIED',
    icon: 'Scales',
    progress: 2,
    maxProgress: 3,
    unlocked: false,
    claimed: false,
    reward: { type: 'EXP', value: 800, label: '+800 Syndicate EXP' },
    trackTag: '[ARBITRAGE]',
  },

  // ── Syndicate Patron
  {
    id: 'patron_titan',
    title: 'Titan of the Underworld',
    description: 'Invest over $50,000,000 Torn Cash into independent underground digital artists.',
    category: 'SYNDICATE_PATRON',
    rarity: 'MYTHIC',
    icon: 'Bank',
    progress: 74500000,
    maxProgress: 50000000,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 14 * 86400_000).toISOString(),
    claimed: true,
    reward: { type: 'AVATAR_FRAME', value: 'frame_monarch_gold', label: 'Frame: Monarch High-Roller' },
    trackTag: '[INVESTOR]',
  },
  {
    id: 'patron_scout',
    title: 'Syndicate Scout',
    description: 'Pin 3 or more independent underground creators to your real-time syndicate radar.',
    category: 'SYNDICATE_PATRON',
    rarity: 'STANDARD',
    icon: 'Broadcast',
    progress: 3,
    maxProgress: 3,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 7 * 86400_000).toISOString(),
    claimed: true,
    reward: { type: 'EXP', value: 350, label: '+350 Syndicate EXP' },
    trackTag: '[RADAR WIRE]',
  },
  {
    id: 'patron_grand_curator',
    title: 'Grand Curator',
    description: 'Acquire and securely archive 5 or more master artworks in your private Trophy Vault.',
    category: 'SYNDICATE_PATRON',
    rarity: 'COVERT',
    icon: 'Palette',
    progress: 6,
    maxProgress: 5,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 4 * 86400_000).toISOString(),
    claimed: false, // Ready to claim!
    reward: { type: 'FEE_DISCOUNT', value: 0.5, label: '+0.5% Permanent Fee Rebate' },
    trackTag: '[TROPHY VAULT]',
  },

  // ── Market Tycoon & Classified Mythics
  {
    id: 'tycoon_reserve_breaker',
    title: 'Reserve Breaker',
    description: 'Win an intense live auction battle at or above the artist\'s reserve price.',
    category: 'MARKET_TYCOON',
    rarity: 'COVERT',
    icon: 'Gavel',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 10 * 86400_000).toISOString(),
    claimed: true,
    reward: { type: 'EXP', value: 450, label: '+450 Syndicate EXP' },
    trackTag: '[AUCTIONS]',
  },
  {
    id: 'secret_midnight_syndicate',
    title: 'Midnight Shadow Protocol',
    description: 'Execute transactions across both the Black Market Escrow and Artist Commission Desks.',
    category: 'MARKET_TYCOON',
    rarity: 'CLASSIFIED',
    icon: 'EyeSlash',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 1 * 86400_000).toISOString(),
    claimed: false, // Ready to claim!
    secret: true,
    hint: 'Operate within covert syndicate channels under the cover of digital blackout.',
    reward: { type: 'AVATAR_FRAME', value: 'frame_cyber_pulse', label: 'Frame: Cyber Neon Circuit' },
    trackTag: '[SECRET PROTOCOL]',
  },
  {
    id: 'archon_supreme',
    title: 'Archon of Torn City',
    description: 'Achieve supreme underworld standing by unlocking 10 master syndicate accreditations.',
    category: 'MARKET_TYCOON',
    rarity: 'ARCHON',
    icon: 'Sparkle',
    progress: 10,
    maxProgress: 10,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 1 * 86400_000).toISOString(),
    claimed: true,
    reward: { type: 'TITLE', value: 'title_archon', label: 'Title: [ARCHON OF TORN] & Archon Corona Frame' },
    trackTag: '[PRESTIGE MASTERY]',
  },
];

/* ── STORAGE HELPERS ────────────────────────────────────────── */
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
}

function writeStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

/* ── GETTERS ────────────────────────────────────────────────── */
export function getAchievements(): Achievement[] {
  return readStorage<Achievement[]>(ACHIEVEMENTS_KEY, SEED_ACHIEVEMENTS);
}

export function getTitles(): SyndicateTitle[] {
  return readStorage<SyndicateTitle[]>(TITLES_KEY, SEED_TITLES);
}

export function getAvatarFrames(): AvatarFrame[] {
  return readStorage<AvatarFrame[]>(FRAMES_KEY, SEED_FRAMES);
}

export function getSyndicateProgression(): SyndicateProgression {
  const achievements = getAchievements();
  const titles = getTitles();
  const frames = getAvatarFrames();

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const equippedTitle = titles.find(t => t.equipped) || null;
  const equippedFrame = frames.find(f => f.equipped) || null;

  // Calculate fee rebate from claimed fee_discount rewards
  let totalRebate = 0.5; // Base 0.5% rebate for accredited citizen
  achievements.forEach(a => {
    if (a.claimed && a.reward.type === 'FEE_DISCOUNT') {
      totalRebate += Number(a.reward.value);
    }
  });
  if (equippedTitle?.id === 'title_archon') {
    totalRebate += 1.0; // Archon Title bonus
  }

  // Cap rebate at 3.0% (meaning minimum net escrow fee is 2.0%)
  const feeRebatePercent = Math.min(3.0, Number(totalRebate.toFixed(1)));

  // Calculate Level & EXP based on unlocked achievements
  const baseExp = 7850;
  const level = Math.min(20, Math.floor(baseExp / 750) + 1); // Level 11
  const currentExp = baseExp % 1000;
  const nextLevelExp = 1000;

  return {
    level,
    tierTitle: level >= 15 ? 'Archon Sovereign' : level >= 10 ? 'Syndicate Kingpin' : 'Operative',
    currentExp,
    nextLevelExp,
    totalReputation: 14200 + (unlockedCount * 350),
    feeRebatePercent,
    equippedTitle,
    equippedFrame,
    unlockedAchievements: unlockedCount,
    totalAchievements: achievements.length,
  };
}

/* ── CLAIM ACHIEVEMENT REWARD ───────────────────────────────── */
export function claimAchievementReward(achievementId: string): {
  success: boolean;
  reward: Achievement['reward'];
  achievement: Achievement;
} {
  const achievements = getAchievements();
  const achIndex = achievements.findIndex(a => a.id === achievementId);
  if (achIndex === -1) throw new Error('Achievement not found');

  const ach = achievements[achIndex];
  if (!ach.unlocked || ach.claimed) {
    return { success: false, reward: ach.reward, achievement: ach };
  }

  ach.claimed = true;
  writeStorage(ACHIEVEMENTS_KEY, achievements);

  // If reward is TITLE, unlock that title
  if (ach.reward.type === 'TITLE') {
    const titles = getTitles();
    const title = titles.find(t => t.id === ach.reward.value);
    if (title) {
      title.unlocked = true;
      writeStorage(TITLES_KEY, titles);
    }
  }

  // If reward is AVATAR_FRAME, unlock that frame
  if (ach.reward.type === 'AVATAR_FRAME') {
    const frames = getAvatarFrames();
    const frame = frames.find(f => f.id === ach.reward.value);
    if (frame) {
      frame.unlocked = true;
      writeStorage(FRAMES_KEY, frames);
    }
  }

  // Dispatch toast / notification
  dispatchNotification('current_user', {
    type: 'system',
    title: `Accreditation Claimed: ${ach.title}`,
    message: `Unlocked reward: ${ach.reward.label}. Syndicate standing upgraded.`,
    link: '/achievements',
  });

  window.dispatchEvent(new CustomEvent('coven:achievement_claimed', { detail: ach }));
  window.dispatchEvent(new CustomEvent('coven:progression_update'));

  return { success: true, reward: ach.reward, achievement: ach };
}

/* ── EQUIP TITLE ────────────────────────────────────────────── */
export function equipTitle(titleId: string): SyndicateTitle {
  const titles = getTitles();
  const target = titles.find(t => t.id === titleId);
  if (!target || !target.unlocked) throw new Error('Title locked or invalid');

  titles.forEach(t => {
    t.equipped = t.id === titleId;
  });

  writeStorage(TITLES_KEY, titles);
  window.dispatchEvent(new CustomEvent('coven:progression_update'));

  return target;
}

/* ── EQUIP AVATAR FRAME ─────────────────────────────────────── */
export function equipAvatarFrame(frameId: string): AvatarFrame {
  const frames = getAvatarFrames();
  const target = frames.find(f => f.id === frameId);
  if (!target || !target.unlocked) throw new Error('Frame locked or invalid');

  frames.forEach(f => {
    f.equipped = f.id === frameId;
  });

  writeStorage(FRAMES_KEY, frames);
  window.dispatchEvent(new CustomEvent('coven:progression_update'));

  return target;
}

/* ── SYNC ENGINE ────────────────────────────────────────────── */
export function syncUnderworldAccreditations(): void {
  // Can be called on mount to ensure real localStorage stats align
  window.dispatchEvent(new CustomEvent('coven:progression_update'));
}

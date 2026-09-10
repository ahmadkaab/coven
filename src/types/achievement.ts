/* ================================================================
   COVEN — Underworld Achievements, Accolades & Title Progression Types
   Prestige, badges, vanity titles, frames, and fee rebates.
   ================================================================ */

export type AchievementCategory =
  | 'BLACK_MARKET'
  | 'SYNDICATE_PATRON'
  | 'MARKET_TYCOON';

export type AchievementRarity =
  | 'STANDARD'
  | 'COVERT'
  | 'CLASSIFIED'
  | 'MYTHIC'
  | 'ARCHON';

export type AchievementRewardType =
  | 'TITLE'
  | 'AVATAR_FRAME'
  | 'FEE_DISCOUNT'
  | 'EXP'
  | 'TORN_RESPECT';

export interface AchievementReward {
  type: AchievementRewardType;
  value: string | number;
  label: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string; // Phosphor icon name
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  claimed: boolean;
  reward: AchievementReward;
  trackTag: string; // e.g. [CRIME 2.0], [ESCROW], [PATRON]
  secret?: boolean;
  hint?: string;
}

export interface SyndicateTitle {
  id: string;
  name: string;
  tag: string; // e.g. "[SHADOW OPERATIVE]"
  lore: string;
  rarity: AchievementRarity;
  glowColor: string;
  gradient: string;
  unlocked: boolean;
  equipped: boolean;
  sourceAchievementId: string;
  bonusPerk: string;
}

export interface AvatarFrame {
  id: string;
  name: string;
  description: string;
  rarity: AchievementRarity;
  glowColor: string;
  cssClass: string;
  unlocked: boolean;
  equipped: boolean;
  sourceAchievementId: string;
}

export interface SyndicateProgression {
  level: number;
  tierTitle: string;
  currentExp: number;
  nextLevelExp: number;
  totalReputation: number;
  feeRebatePercent: number; // e.g. 2.0% rebate off 5.0% standard escrow fee = 3.0% net
  equippedTitle: SyndicateTitle | null;
  equippedFrame: AvatarFrame | null;
  unlockedAchievements: number;
  totalAchievements: number;
}

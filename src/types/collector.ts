/* ================================================================
   COVEN — Collector Dossier & Syndicate Radar Types
   ================================================================ */

export type CollectorTier = 'patron' | 'curator' | 'high_roller' | 'whale';
export type BadgeRarity = 'common' | 'rare' | 'legendary';

export interface CollectorBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  unlocked_at: string;
}

export interface CollectorProfile {
  player_id: string;
  username: string;
  avatar_url: string;
  rank: string;
  level: number;
  faction?: {
    id: number;
    name: string;
    tag: string;
  };
  motto?: string;
  joined_coven: string;
  total_invested_torn: number;
  artworks_owned_count: number;
  commissions_funded_count: number;
  collector_tier: CollectorTier;
  badges: CollectorBadge[];
  favorite_specialization?: string;
}

export interface FollowRecord {
  id: string;
  user_id: string;
  artist_id: string;
  artist_name: string;
  created_at: string;
}

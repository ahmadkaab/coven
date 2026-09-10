/* ================================================================
   COVEN — Syndicate Radar & Collector Service
   localStorage-backed artist following and collector dossiers.
   ================================================================ */

import type { CollectorProfile, CollectorBadge } from '../types/collector';
import type { TornUser } from '../types';
import { dispatchNotification } from './notificationService';

const RADAR_KEY = (uid: string) => `coven_radar_follows_${uid}`;

/* ── BASE FOLLOWER COUNTS FOR SEED ARTISTS ─────────────────── */
const BASE_FOLLOWER_COUNTS: Record<string, number> = {
  'artist-1': 342, // SINTEX
  'artist-2': 189, // Nyx
  'artist-3': 94,  // CyberKitsune
  'artist-4': 61,
  'artist-5': 48,
  'artist-6': 29,
};

function readFollows(userId: string): string[] {
  try {
    const raw = localStorage.getItem(RADAR_KEY(userId));
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default: start with SINTEX pinned to radar
  const defaults = ['artist-1'];
  try {
    localStorage.setItem(RADAR_KEY(userId), JSON.stringify(defaults));
  } catch {}
  return defaults;
}

function writeFollows(userId: string, ids: string[]): void {
  try {
    localStorage.setItem(RADAR_KEY(userId), JSON.stringify(ids));
  } catch {}
  window.dispatchEvent(new CustomEvent('coven:radar_update'));
}

export function getFollowedArtistIds(userId: string): string[] {
  return readFollows(userId);
}

export function isFollowing(userId: string, artistId: string): boolean {
  const follows = readFollows(userId);
  return follows.includes(artistId);
}

export function toggleFollow(userId: string, artist: { id: string; username: string }): boolean {
  const follows = readFollows(userId);
  const exists = follows.includes(artist.id);
  let updated: string[];

  if (exists) {
    updated = follows.filter(id => id !== artist.id);
    writeFollows(userId, updated);
    return false;
  } else {
    updated = [...follows, artist.id];
    writeFollows(userId, updated);

    // Notify user
    dispatchNotification(userId, {
      type: 'new_follower',
      title: 'Syndicate Radar Synced',
      message: `Artist "${artist.username}" pinned to your radar. You will receive drop alerts.`,
      link: `/artists/${artist.id}`,
    });

    return true;
  }
}

export function getFollowerCount(artistId: string, currentUserId?: string): number {
  const base = BASE_FOLLOWER_COUNTS[artistId] ?? 12;
  const isSelf = currentUserId ? isFollowing(currentUserId, artistId) : false;
  // If SINTEX (default followed), base already includes user
  if (artistId === 'artist-1') {
    return isSelf ? base : base - 1;
  }
  return isSelf ? base + 1 : base;
}

export function getCollectorProfile(
  userId: string,
  currentUser?: TornUser | null
): CollectorProfile {
  const badges: CollectorBadge[] = [
    {
      id: 'whale_patron',
      title: 'Whale Patron',
      description: 'Invested over $50,000,000 Torn Cash into underground GFX creators.',
      icon: 'Crown',
      rarity: 'legendary',
      unlocked_at: new Date(Date.now() - 14 * 86400_000).toISOString(),
    },
    {
      id: 'vault_master',
      title: 'Vault Master',
      description: 'Acquired encrypted unwatermarked master deliverables directly to private vault.',
      icon: 'LockKey',
      rarity: 'rare',
      unlocked_at: new Date(Date.now() - 8 * 86400_000).toISOString(),
    },
    {
      id: 'first_blood',
      title: 'First Blood',
      description: 'Fought on the live auction block and claimed winning bid at reserve.',
      icon: 'Lightning',
      rarity: 'rare',
      unlocked_at: new Date(Date.now() - 25 * 86400_000).toISOString(),
    },
    {
      id: 'syndicate_benefactor',
      title: 'Syndicate Benefactor',
      description: 'Funded 5+ custom faction banners and forum signature sets.',
      icon: 'ShieldCheck',
      rarity: 'legendary',
      unlocked_at: new Date(Date.now() - 40 * 86400_000).toISOString(),
    },
    {
      id: 'radar_pioneer',
      title: 'Radar Scout',
      description: 'Actively tracking top independent digital artists on the syndicate wire.',
      icon: 'Radar',
      rarity: 'common',
      unlocked_at: new Date(Date.now() - 3 * 86400_000).toISOString(),
    },
  ];

  const isSelf = currentUser && (String(currentUser.player_id) === userId || userId === 'demo' || !userId);
  const resolvedId = isSelf && currentUser ? String(currentUser.player_id) : (userId === 'demo' || !userId ? '4295891' : userId);
  const username = isSelf && currentUser ? currentUser.name : (resolvedId === '4295891' ? 'ahmad_kaab' : `Operative_${resolvedId}`);
  const avatar = isSelf && currentUser?.profile_image ? currentUser.profile_image : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
  const rank = isSelf && currentUser?.rank ? currentUser.rank : 'Syndicate Operative';
  const level = isSelf && currentUser?.level ? currentUser.level : 65;

  return {
    player_id: resolvedId,
    username,
    avatar_url: avatar,
    rank,
    level,
    faction: currentUser?.faction ? {
      id: currentUser.faction.faction_id || 0,
      name: currentUser.faction.faction_name || '',
      tag: currentUser.faction.faction_name ? currentUser.faction.faction_name.slice(0, 4).toUpperCase() : 'COVEN',
    } : undefined,
    motto: 'Reputation is the true currency of Torn City.',
    joined_coven: new Date().toISOString(),
    total_invested_torn: 0,
    artworks_owned_count: 0,
    commissions_funded_count: 0,
    collector_tier: 'patron',
    badges,
    favorite_specialization: 'Custom Graphics & Forum Art',
  };
}

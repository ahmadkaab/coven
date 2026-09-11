/* ================================================================
   COVEN — Syndicate Radar & Collector Service
   localStorage-backed artist following and authentic collector dossiers.
   ================================================================ */

import type { CollectorProfile } from '../types/collector';
import type { TornUser } from '../types';
import { dispatchNotification } from './notificationService';

const RADAR_KEY = (uid: string) => `coven_radar_follows_${uid}`;

function readFollows(userId: string): string[] {
  try {
    const raw = localStorage.getItem(RADAR_KEY(userId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
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
  const isSelf = currentUserId ? isFollowing(currentUserId, artistId) : false;
  return isSelf ? 1 : 0;
}

export function getCollectorProfile(
  userId: string,
  currentUser?: TornUser | null
): CollectorProfile {
  const isSelf = currentUser && (String(currentUser.player_id) === userId || !userId || userId === 'current');
  const resolvedId = isSelf && currentUser ? String(currentUser.player_id) : (userId || '4295891');
  const username = isSelf && currentUser ? currentUser.name : (resolvedId === '4295891' ? 'ahmad_kaab' : `Citizen_${resolvedId}`);
  const avatar = isSelf && currentUser?.profile_image ? currentUser.profile_image : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
  const rank = isSelf && currentUser?.rank ? currentUser.rank : 'Collector';
  const level = isSelf && currentUser?.level ? currentUser.level : 1;

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
    motto: 'Fine art on the blockchain of Torn City.',
    joined_coven: new Date().toISOString(),
    total_invested_torn: 0,
    artworks_owned_count: 0,
    commissions_funded_count: 0,
    collector_tier: 'patron',
    badges: [],
    favorite_specialization: 'Custom Graphics & Fine Art',
  };
}


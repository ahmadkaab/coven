/* ================================================================
   COVEN — Notification Service
   localStorage-backed notification store with event dispatch.
   ================================================================ */

import type { Notification, NotificationType, NotificationCategory } from '../types/notification';

/* ── HELPERS ───────────────────────────────────────────────── */
const STORAGE_KEY = (uid: string) => `coven_notifications_${uid}`;

let _uuid = 0;
function uid(): string {
  return `notif_${Date.now()}_${++_uuid}_${Math.random().toString(36).slice(2, 6)}`;
}

function categoryFor(type: NotificationType): NotificationCategory {
  switch (type) {
    case 'bid_received':
    case 'bid_outbid':
    case 'auction_won':
    case 'auction_ending':
      return 'bids';
    case 'sale_completed':
    case 'price_alert':
      return 'sales';
    case 'commission_request':
    case 'commission_update':
      return 'commissions';
    case 'review_received':
    case 'new_follower':
    case 'system':
    default:
      return 'system';
  }
}

/* ── READ / WRITE ──────────────────────────────────────────── */
function readStore(userId: string): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStore(userId: string, notifications: Notification[]): void {
  localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(notifications));
}

/* ── PUBLIC API ────────────────────────────────────────────── */

export function getNotifications(userId: string): Notification[] {
  let notifs = readStore(userId);
  if (notifs.length === 0) {
    notifs = generateDemoNotifications(userId);
    writeStore(userId, notifs);
  }
  return notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getUnreadCount(userId: string): number {
  return readStore(userId).filter(n => !n.read).length;
}

export function markAsRead(userId: string, notifId: string): Notification[] {
  const notifs = readStore(userId).map(n =>
    n.id === notifId ? { ...n, read: true } : n
  );
  writeStore(userId, notifs);
  dispatchUpdate();
  return notifs;
}

export function markAllRead(userId: string): Notification[] {
  const notifs = readStore(userId).map(n => ({ ...n, read: true }));
  writeStore(userId, notifs);
  dispatchUpdate();
  return notifs;
}

export function clearAll(userId: string): void {
  writeStore(userId, []);
  dispatchUpdate();
}

export function deleteNotification(userId: string, notifId: string): Notification[] {
  const notifs = readStore(userId).filter(n => n.id !== notifId);
  writeStore(userId, notifs);
  dispatchUpdate();
  return notifs;
}

/** Push a new notification into the store and trigger UI update */
export function dispatchNotification(userId: string, partial: Omit<Notification, 'id' | 'category' | 'read' | 'timestamp'>): void {
  const notif: Notification = {
    ...partial,
    id: uid(),
    category: categoryFor(partial.type),
    read: false,
    timestamp: new Date().toISOString(),
  };
  const notifs = readStore(userId);
  notifs.unshift(notif);
  writeStore(userId, notifs);
  dispatchUpdate();
}

/* ── DOM EVENT DISPATCH ────────────────────────────────────── */
function dispatchUpdate(): void {
  window.dispatchEvent(new CustomEvent('coven:notification'));
}

/* ── DEMO DATA ─────────────────────────────────────────────── */
const ARTISTS = ['DarkViper', 'xShadow', 'NeonKat', 'PixelWitch', 'Crimson_FX', 'GlitchArtist'];
const ARTWORKS = [
  'Neon Reaper', 'Crimson Tide', 'Shadow Protocol', 'Digital Vortex',
  'Pixel Warfare', 'Void Eclipse', 'Chrome Skull', 'Faction Fury',
  'Night Ops Banner', 'Toxic Haze', 'Neural Link', 'Cyber Samurai',
];

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

function generateDemoNotifications(userId: string): Notification[] {
  void userId;
  const notifs: Notification[] = [
    // Bids
    {
      id: uid(), type: 'bid_received', category: 'bids',
      title: 'New Bid Received',
      message: `${rnd(ARTISTS)} placed a $${(15000 + Math.floor(Math.random() * 50000)).toLocaleString()} bid on "${rnd(ARTWORKS)}"`,
      link: '/artwork/a1', read: false, timestamp: hoursAgo(0.2),
    },
    {
      id: uid(), type: 'bid_received', category: 'bids',
      title: 'New Bid Received',
      message: `${rnd(ARTISTS)} placed a $${(8000 + Math.floor(Math.random() * 30000)).toLocaleString()} bid on "${rnd(ARTWORKS)}"`,
      link: '/artwork/a2', read: false, timestamp: hoursAgo(1.5),
    },
    {
      id: uid(), type: 'bid_outbid', category: 'bids',
      title: 'You Were Outbid',
      message: `Someone outbid you on "${rnd(ARTWORKS)}". Current bid: $${(20000 + Math.floor(Math.random() * 40000)).toLocaleString()}`,
      link: '/artwork/a3', read: false, timestamp: hoursAgo(3),
    },
    {
      id: uid(), type: 'auction_ending', category: 'bids',
      title: 'Auction Ending Soon',
      message: `Your auction for "${rnd(ARTWORKS)}" ends in 2 hours`,
      link: '/artwork/a4', read: true, timestamp: hoursAgo(5),
    },
    {
      id: uid(), type: 'auction_won', category: 'bids',
      title: 'Auction Won!',
      message: `Congratulations! You won "${rnd(ARTWORKS)}" for $${(25000 + Math.floor(Math.random() * 75000)).toLocaleString()}`,
      link: '/artwork/a5', read: true, timestamp: hoursAgo(18),
    },
    // Sales
    {
      id: uid(), type: 'sale_completed', category: 'sales',
      title: 'Sale Completed',
      message: `"${rnd(ARTWORKS)}" sold to ${rnd(ARTISTS)} for $${(10000 + Math.floor(Math.random() * 60000)).toLocaleString()}`,
      link: '/dashboard', read: false, timestamp: hoursAgo(2),
    },
    {
      id: uid(), type: 'price_alert', category: 'sales',
      title: 'Price Alert',
      message: `"${rnd(ARTWORKS)}" on your watchlist dropped below your target price`,
      link: '/browse', read: true, timestamp: hoursAgo(12),
    },
    // Commissions
    {
      id: uid(), type: 'commission_request', category: 'commissions',
      title: 'New Commission Request',
      message: `${rnd(ARTISTS)} requested a custom faction banner commission — Budget: $${(20000 + Math.floor(Math.random() * 30000)).toLocaleString()}`,
      link: '/commissions', read: false, timestamp: hoursAgo(4),
    },
    {
      id: uid(), type: 'commission_update', category: 'commissions',
      title: 'Commission Update',
      message: `Your commission with ${rnd(ARTISTS)} has been marked as "Delivered"`,
      link: '/commissions', read: true, timestamp: hoursAgo(24),
    },
    // System
    {
      id: uid(), type: 'review_received', category: 'system',
      title: 'New Review',
      message: `${rnd(ARTISTS)} left a ★★★★★ review: "Incredible detail and fast delivery!"`,
      link: '/dashboard', read: false, timestamp: hoursAgo(6),
    },
    {
      id: uid(), type: 'new_follower', category: 'system',
      title: 'New Follower',
      message: `${rnd(ARTISTS)} started following your profile`,
      link: '/dashboard', read: true, timestamp: hoursAgo(14),
    },
    {
      id: uid(), type: 'system', category: 'system',
      title: 'COVEN Platform Update',
      message: 'Market Pulse analytics and Studio Hub features are now live. Check your dashboard!',
      link: '/market-pulse', read: true, timestamp: hoursAgo(48),
    },
  ];
  return notifs;
}

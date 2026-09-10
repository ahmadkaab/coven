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
    notifs = getInitialNotifications(userId);
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

/* ── INITIAL NOTIFICATIONS ───────────────────────────────── */
function getInitialNotifications(userId: string): Notification[] {
  void userId;
  return [
    {
      id: uid(),
      type: 'system',
      category: 'system',
      title: 'Welcome to COVEN Syndicate',
      message: 'Your cryptographic identity is initialized. Connect with artists, bid on authentic Torn artwork, and install the official UserScript.',
      link: '/userscript',
      read: false,
      timestamp: new Date().toISOString(),
    },
  ];
}

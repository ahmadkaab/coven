/* ================================================================
   COVEN — Notification & Activity Types
   ================================================================ */

/* ── NOTIFICATION ──────────────────────────────────────────── */
export type NotificationType =
  | 'bid_received'
  | 'bid_outbid'
  | 'auction_won'
  | 'auction_ending'
  | 'commission_request'
  | 'commission_update'
  | 'sale_completed'
  | 'review_received'
  | 'new_follower'
  | 'price_alert'
  | 'system';

export type NotificationCategory = 'bids' | 'sales' | 'commissions' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  link?: string;           // route to navigate on click
  icon?: string;           // phosphor icon name hint
  read: boolean;
  timestamp: string;       // ISO date
  metadata?: Record<string, unknown>;
}

/* ── ACTIVITY EVENT (public feed) ──────────────────────────── */
export type ActivityEventType =
  | 'new_listing'
  | 'bid_placed'
  | 'auction_won'
  | 'sale_completed'
  | 'review_posted'
  | 'artist_joined'
  | 'commission_opened';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  actor: {
    username: string;
    avatar_url?: string;
  };
  action: string;          // human-readable action text
  target?: string;         // artwork name, artist name, etc.
  targetLink?: string;     // route
  timestamp: string;
  metadata?: Record<string, unknown>;
}

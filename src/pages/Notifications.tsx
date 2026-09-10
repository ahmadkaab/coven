import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  Bell, BellRinging, CheckCircle, Trash, Funnel,
  Lightning, CurrencyCircleDollar, PenNib, Megaphone,
  Gavel, Star, UserPlus, WarningCircle, ArrowUpRight,
} from '@phosphor-icons/react';
import { useAuth } from '../hooks/useAuth';
import {
  getNotifications,
  markAsRead,
  markAllRead,
  clearAll,
  deleteNotification,
} from '../services/notificationService';
import type { Notification, NotificationCategory } from '../types/notification';

/* ── FILTER CONFIG ─────────────────────────────────────────── */
const FILTERS: { key: 'all' | NotificationCategory; label: string; icon: typeof Bell }[] = [
  { key: 'all',         label: 'All',         icon: Bell },
  { key: 'bids',        label: 'Bids',        icon: Gavel },
  { key: 'sales',       label: 'Sales',       icon: CurrencyCircleDollar },
  { key: 'commissions', label: 'Commissions', icon: PenNib },
  { key: 'system',      label: 'System',      icon: Megaphone },
];

/* ── ICON FOR NOTIFICATION TYPE ────────────────────────────── */
function NotifIcon({ type }: { type: Notification['type'] }) {
  const s = 16;
  switch (type) {
    case 'bid_received':       return <Lightning size={s} weight="fill" style={{ color: 'var(--term-green)' }} />;
    case 'bid_outbid':         return <WarningCircle size={s} weight="fill" style={{ color: 'var(--red)' }} />;
    case 'auction_won':        return <Gavel size={s} weight="fill" style={{ color: '#fbbf24' }} />;
    case 'auction_ending':     return <BellRinging size={s} weight="fill" style={{ color: 'var(--red-hi)' }} />;
    case 'sale_completed':     return <CurrencyCircleDollar size={s} weight="fill" style={{ color: 'var(--term-green)' }} />;
    case 'commission_request': return <PenNib size={s} weight="fill" style={{ color: '#818cf8' }} />;
    case 'commission_update':  return <PenNib size={s} weight="fill" style={{ color: '#60a5fa' }} />;
    case 'review_received':    return <Star size={s} weight="fill" style={{ color: '#fbbf24' }} />;
    case 'new_follower':       return <UserPlus size={s} weight="fill" style={{ color: '#f472b6' }} />;
    case 'price_alert':        return <Lightning size={s} weight="fill" style={{ color: 'var(--red)' }} />;
    case 'system':
    default:                   return <Megaphone size={s} weight="fill" style={{ color: 'var(--ghost)' }} />;
  }
}

/* ── RELATIVE TIME ─────────────────────────────────────────── */
function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

/* ── CATEGORY BADGE ────────────────────────────────────────── */
function CatBadge({ cat }: { cat: NotificationCategory }) {
  const colors: Record<NotificationCategory, string> = {
    bids: 'var(--term-green)',
    sales: '#fbbf24',
    commissions: '#818cf8',
    system: 'var(--ghost)',
  };
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '0.5rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: colors[cat],
      border: `1px solid ${colors[cat]}30`,
      padding: '1px 6px',
      borderRadius: '2px',
    }}>
      {cat}
    </span>
  );
}

/* ── PAGE ──────────────────────────────────────────────────── */
export function Notifications() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const uid = userId ?? 'demo';

  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | NotificationCategory>('all');

  const refresh = useCallback(() => {
    setNotifs(getNotifications(uid));
  }, [uid]);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = filter === 'all' ? notifs : notifs.filter(n => n.category === filter);
  const unreadCount = notifs.filter(n => !n.read).length;

  const handleRead = (id: string) => {
    markAsRead(uid, id);
    refresh();
  };
  const handleMarkAll = () => {
    markAllRead(uid);
    refresh();
  };
  const handleClear = () => {
    clearAll(uid);
    refresh();
  };
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(uid, id);
    refresh();
  };
  const handleClick = (n: Notification) => {
    handleRead(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <main className="page-content">
      <div className="container" style={{ paddingTop: 'var(--sp-12)', paddingBottom: 'var(--sp-20)' }}>
        {/* Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--seam)',
            paddingBottom: 'var(--sp-4)',
          }}>
            <div>
              <div className="section-label">Command Center</div>
              <h1 className="section-h2" style={{ margin: 0 }}>
                NOTIFI<br />CATIONS
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: '4px' }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="btn btn-sm btn-ghost"
                >
                  <CheckCircle size={12} weight="bold" />
                  Mark All Read
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-sm btn-ghost"
                style={{ color: 'var(--red)' }}
              >
                <Trash size={12} weight="bold" />
                Clear All
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          className="notif-page-filters"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Funnel size={13} weight="bold" style={{ color: 'var(--shadow-type)' }} />
          {FILTERS.map(f => {
            const Icon = f.icon;
            const count = f.key === 'all'
              ? notifs.filter(n => !n.read).length
              : notifs.filter(n => n.category === f.key && !n.read).length;
            return (
              <button
                key={f.key}
                type="button"
                className={`notif-filter-btn${filter === f.key ? ' active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                <Icon size={12} weight="bold" />
                {f.label}
                {count > 0 && <span className="notif-filter-count">{count}</span>}
              </button>
            );
          })}
        </motion.div>

        {/* Notification List */}
        <motion.div
          className="notif-page-list"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          {filtered.length === 0 ? (
            <div className="notif-page-empty">
              <Bell size={48} weight="thin" style={{ color: 'var(--plate)', marginBottom: 'var(--sp-4)' }} />
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                textTransform: 'uppercase', letterSpacing: '-0.03em',
                color: 'var(--plate)', marginBottom: 'var(--sp-2)',
              }}>
                ALL CAUGHT UP
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                color: 'var(--shadow-type)', letterSpacing: '0.1em',
              }}>
                [ NO NOTIFICATIONS IN THIS CATEGORY ]
              </div>
            </div>
          ) : filtered.map((n, i) => (
            <motion.div
              key={n.id}
              className={`notif-page-card${n.read ? '' : ' unread'}`}
              onClick={() => handleClick(n)}
              initial={reduce ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              role="button"
              tabIndex={0}
            >
              <div className="notif-page-card-icon">
                <NotifIcon type={n.type} />
              </div>
              <div className="notif-page-card-body">
                <div className="notif-page-card-top">
                  <span className="notif-page-card-title">{n.title}</span>
                  <CatBadge cat={n.category} />
                </div>
                <div className="notif-page-card-msg">{n.message}</div>
              </div>
              <div className="notif-page-card-meta">
                <span className="notif-page-card-time">{relTime(n.timestamp)}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {n.link && (
                    <span className="notif-page-card-action" title="Go to">
                      <ArrowUpRight size={11} weight="bold" />
                    </span>
                  )}
                  <button
                    type="button"
                    className="notif-page-card-action"
                    onClick={(e) => handleDelete(n.id, e)}
                    title="Delete"
                  >
                    <Trash size={11} weight="bold" />
                  </button>
                </div>
              </div>
              {!n.read && <span className="notif-page-card-unread-bar" />}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}

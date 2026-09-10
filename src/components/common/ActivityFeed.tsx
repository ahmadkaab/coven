import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Lightning, ShoppingCart, Gavel, Star, UserPlus, PenNib, ArrowUpRight, Image,
} from '@phosphor-icons/react';
import { getActivityFeed } from '../../services/activityService';
import type { ActivityEvent, ActivityEventType } from '../../types/notification';

/* ── Event type icon ──────────────────────────────────────── */
function eventIcon(type: ActivityEventType) {
  const s = 12;
  switch (type) {
    case 'new_listing':       return <Image size={s} weight="fill" style={{ color: '#60a5fa' }} />;
    case 'bid_placed':        return <Lightning size={s} weight="fill" style={{ color: 'var(--term-green)' }} />;
    case 'auction_won':       return <Gavel size={s} weight="fill" style={{ color: '#fbbf24' }} />;
    case 'sale_completed':    return <ShoppingCart size={s} weight="fill" style={{ color: 'var(--term-green)' }} />;
    case 'review_posted':     return <Star size={s} weight="fill" style={{ color: '#fbbf24' }} />;
    case 'artist_joined':     return <UserPlus size={s} weight="fill" style={{ color: '#f472b6' }} />;
    case 'commission_opened': return <PenNib size={s} weight="fill" style={{ color: '#818cf8' }} />;
    default:                  return <Lightning size={s} weight="fill" style={{ color: 'var(--ghost)' }} />;
  }
}

/* ── Relative time ────────────────────────────────────────── */
function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h`;
}

/* ── ACTIVITY FEED ─────────────────────────────────────────── */
export function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [paused, setPaused] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<number>(0);

  useEffect(() => {
    setEvents(getActivityFeed(15));
  }, []);

  /* Auto-scroll effect */
  useEffect(() => {
    if (paused || !listRef.current) return;
    const el = listRef.current;
    const interval = setInterval(() => {
      scrollRef.current += 1;
      el.scrollTop = scrollRef.current;
      // Reset when scrolled to bottom
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
        scrollRef.current = 0;
        el.scrollTop = 0;
      }
    }, 50);
    return () => clearInterval(interval);
  }, [paused, events]);

  /* Sync scroll position when user interacts */
  const handleMouseEnter = () => {
    setPaused(true);
  };
  const handleMouseLeave = () => {
    if (listRef.current) {
      scrollRef.current = listRef.current.scrollTop;
    }
    setPaused(false);
  };

  if (events.length === 0) return null;

  return (
    <section className="activity-feed-section">
      <div className="container">
        <div className="activity-feed-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="activity-feed-live-dot" />
            <span className="activity-feed-label">LIVE FEED</span>
          </div>
          <Link to="/browse" className="activity-feed-view-all">
            View Marketplace
            <ArrowUpRight size={10} weight="bold" />
          </Link>
        </div>

        <div
          ref={listRef}
          className="activity-feed-list"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {events.map(ev => (
            <Link
              key={ev.id}
              to={ev.targetLink || '/browse'}
              className="activity-feed-item"
            >
              <span className="activity-feed-time">{relTime(ev.timestamp)}</span>
              <span className="activity-feed-icon">{eventIcon(ev.type)}</span>
              <span className="activity-feed-actor">{ev.actor.username}</span>
              <span className="activity-feed-action">{ev.action}</span>
            </Link>
          ))}
          {/* Duplicate for seamless loop */}
          {events.map(ev => (
            <Link
              key={`dup-${ev.id}`}
              to={ev.targetLink || '/browse'}
              className="activity-feed-item"
              aria-hidden="true"
            >
              <span className="activity-feed-time">{relTime(ev.timestamp)}</span>
              <span className="activity-feed-icon">{eventIcon(ev.type)}</span>
              <span className="activity-feed-actor">{ev.actor.username}</span>
              <span className="activity-feed-action">{ev.action}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

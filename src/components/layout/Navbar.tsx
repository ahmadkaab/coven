import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { List, X, User, MagnifyingGlass, Bell, BellRinging, CheckCircle, ArrowRight, Chats } from '@phosphor-icons/react';
import { useAuthStore } from '../../store/authStore';
import { getNotifications, getUnreadCount, markAsRead, markAllRead } from '../../services/notificationService';
import { getUnreadDispatchCount } from '../../services/dispatchService';
import type { Notification } from '../../types/notification';

/* ── Relative time helper ─────────────────────────────────── */
function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/* ── Notification icon color ──────────────────────────────── */
function notifColor(type: Notification['type']): string {
  switch (type) {
    case 'bid_received': return 'var(--term-green)';
    case 'bid_outbid': return 'var(--red)';
    case 'auction_won': return '#fbbf24';
    case 'auction_ending': return 'var(--red-hi)';
    case 'sale_completed': return 'var(--term-green)';
    case 'commission_request': return '#818cf8';
    case 'commission_update': return '#60a5fa';
    case 'review_received': return '#fbbf24';
    case 'new_follower': return '#f472b6';
    case 'price_alert': return 'var(--red)';
    case 'system': return 'var(--ghost)';
    default: return 'var(--ghost)';
  }
}

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userId = user ? String(user.player_id) : null;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Notification state
  const [bellOpen, setBellOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [bellRing, setBellRing] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Wire / Dispatch state
  const [unreadDispatches, setUnreadDispatches] = useState(0);

  /* Fetch notifications & dispatches */
  const refreshNotifs = useCallback(() => {
    if (!userId) return;
    setNotifs(getNotifications(userId).slice(0, 8));
    setUnread(getUnreadCount(userId));
    setUnreadDispatches(getUnreadDispatchCount(userId));
  }, [userId]);

  useEffect(() => { refreshNotifs(); }, [refreshNotifs]);

  /* Listen for real-time notification & dispatch events */
  useEffect(() => {
    const handler = () => {
      refreshNotifs();
      setBellRing(true);
      setTimeout(() => setBellRing(false), 1200);
    };
    const dispatchHandler = () => {
      if (userId) {
        setUnreadDispatches(getUnreadDispatchCount(userId));
      }
    };
    window.addEventListener('coven:notification', handler);
    window.addEventListener('coven:dispatch', dispatchHandler);
    return () => {
      window.removeEventListener('coven:notification', handler);
      window.removeEventListener('coven:dispatch', dispatchHandler);
    };
  }, [refreshNotifs, userId]);

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bellOpen]);

  /* Close dropdown on route change */
  useEffect(() => { setBellOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const isActive = (path: string) => location.pathname === path;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/browse?q=${encodeURIComponent(navSearch.trim())}`);
      setSearchOpen(false);
      setNavSearch('');
    }
  };

  const handleMarkRead = (id: string) => {
    if (!userId) return;
    markAsRead(userId, id);
    refreshNotifs();
  };

  const handleMarkAllRead = () => {
    if (!userId) return;
    markAllRead(userId);
    refreshNotifs();
  };

  const handleNotifClick = (n: Notification) => {
    handleMarkRead(n.id);
    setBellOpen(false);
    if (n.link) navigate(n.link);
  };

  const links: { href: string; label: string; live?: boolean; badge?: string }[] = [
    { href: '/browse', label: 'Browse' },
    { href: '/artists', label: 'Artists' },
    { href: '/auctions', label: 'Auctions' },
    { href: '/commissions', label: 'Commissions' },
    { href: '/trade', label: 'Trade' },
    { href: '/heist', label: 'Heists' },
    { href: '/achievements', label: 'Accolades' },
    { href: '/market-pulse', label: 'Pulse', live: true },
    { href: '/userscript', label: 'Script', badge: 'EXT' },
  ];

  return (
    <>
      <nav className="navbar" style={{ transition: 'top 0.3s' }}>
        <div
          className="navbar-pill"
          style={{
            boxShadow: scrolled
              ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 16px 48px rgba(0,0,0,0.9)'
              : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.6)',
            transition: 'box-shadow 0.4s',
          }}
        >
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-mark" aria-hidden="true" />
            COVEN
          </Link>

          {/* Center links */}
          <div className="navbar-links">
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`navbar-link${isActive(l.href) ? ' active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                {l.label}
                {l.live && (
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: 'var(--term-green)',
                      boxShadow: '0 0 6px var(--term-green)',
                      display: 'inline-block',
                    }}
                  />
                )}
                {l.badge && (
                  <span
                    style={{
                      fontSize: '0.5rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(230, 25, 25, 0.15)',
                      color: 'var(--crimson)',
                      border: '1px solid rgba(230, 25, 25, 0.35)',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      letterSpacing: '0.04em',
                      lineHeight: 1,
                    }}
                  >
                    {l.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right CTAs */}
          <div className="navbar-cta-area" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="SEARCH ARTWORKS..."
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchOpen(false);
                      setNavSearch('');
                    }
                  }}
                  style={{
                    background: 'var(--void)',
                    border: '1px solid var(--red)',
                    color: 'var(--phosphor)',
                    fontSize: '0.625rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '4px 24px 4px 8px',
                    borderRadius: '2px',
                    width: '160px',
                    outline: 'none',
                    letterSpacing: '0.05em',
                  }}
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setNavSearch(''); }}
                  style={{
                    position: 'absolute',
                    right: 4,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ghost)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  title="Close search"
                >
                  <X size={12} weight="bold" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="navbar-link"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                aria-label="Search artworks"
                title="Search artworks"
              >
                <MagnifyingGlass size={14} weight="bold" />
              </button>
            )}

            {/* ── THE WIRE (ENCRYPTED DISPATCHES) ───────── */}
            {user && (
              <Link
                to="/dispatches"
                className={`notif-bell-btn${isActive('/dispatches') ? ' active' : ''}`}
                aria-label={`The Wire${unreadDispatches > 0 ? ` (${unreadDispatches} unread)` : ''}`}
                title="The Wire // Encrypted Dispatches"
                style={{ textDecoration: 'none', position: 'relative' }}
              >
                <Chats size={16} weight={unreadDispatches > 0 ? 'fill' : 'bold'} />
                {unreadDispatches > 0 && (
                  <span
                    className="notif-bell-badge"
                    style={{
                      background: 'var(--phosphor)',
                      color: '#080808',
                      boxShadow: '0 0 8px rgba(238,238,238,0.4)',
                    }}
                  >
                    {unreadDispatches > 9 ? '9+' : unreadDispatches}
                  </span>
                )}
              </Link>
            )}

            {/* ── NOTIFICATION BELL ──────────────────────── */}
            {user && (
              <div ref={bellRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setBellOpen(!bellOpen)}
                  className={`notif-bell-btn${bellRing ? ' notif-bell-ring' : ''}`}
                  aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
                  title="Notifications"
                >
                  {unread > 0 ? (
                    <BellRinging size={16} weight="fill" />
                  ) : (
                    <Bell size={16} weight="bold" />
                  )}
                  {unread > 0 && (
                    <span className="notif-bell-badge">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {bellOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-dropdown-header">
                      <span className="notif-dropdown-title">Notifications</span>
                      {unread > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="notif-dropdown-mark-all"
                        >
                          <CheckCircle size={11} weight="bold" />
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="notif-dropdown-list">
                      {notifs.length === 0 ? (
                        <div className="notif-dropdown-empty">
                          All caught up — no notifications
                        </div>
                      ) : notifs.map(n => (
                        <button
                          key={n.id}
                          type="button"
                          className={`notif-dropdown-item${n.read ? '' : ' unread'}`}
                          onClick={() => handleNotifClick(n)}
                        >
                          <span
                            className="notif-dropdown-dot"
                            style={{ background: n.read ? 'transparent' : notifColor(n.type) }}
                          />
                          <div className="notif-dropdown-content">
                            <div className="notif-dropdown-item-title">{n.title}</div>
                            <div className="notif-dropdown-item-msg">{n.message}</div>
                          </div>
                          <span className="notif-dropdown-time">{relTime(n.timestamp)}</span>
                        </button>
                      ))}
                    </div>
                    <Link
                      to="/notifications"
                      className="notif-dropdown-viewall"
                      onClick={() => setBellOpen(false)}
                    >
                      View All Notifications
                      <ArrowRight size={11} weight="bold" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <Link
                  to={`/collector/${userId}`}
                  className="btn btn-sm btn-ghost"
                  style={{ gap: '4px', fontSize: '0.625rem', padding: '5px 12px', flexShrink: 0, whiteSpace: 'nowrap' }}
                  title="View Public Syndicate Collector Dossier"
                >
                  <User size={12} weight="bold" />
                  Dossier
                </Link>
                <Link
                  to="/dashboard"
                  className="btn btn-sm btn-ghost"
                  style={{ fontSize: '0.625rem', padding: '5px 12px', flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                  Account
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-ghost">Login</Link>
                <Link to="/login" className="btn btn-sm btn-primary">Join</Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="navbar-link"
              style={{ display: 'none', padding: '6px 10px' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              id="navbar-mobile-toggle"
            >
              {mobileOpen ? <X size={16} weight="bold" /> : <List size={16} weight="bold" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 800,
            background: 'rgba(8,8,8,0.97)',
            backdropFilter: 'blur(24px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '4px',
          }}
        >
          {links.map((l, i) => (
            <Link
              key={l.href}
              to={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 8vw, 3.5rem)',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                color: isActive(l.href) ? 'var(--red)' : 'var(--ghost)',
                padding: '8px 24px',
                animationDelay: `${i * 80}ms`,
              }}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <Link
              to="/dispatches"
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 8vw, 3.5rem)',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                color: isActive('/dispatches') ? 'var(--red)' : 'var(--ghost)',
                padding: '8px 24px',
              }}
            >
              The Wire {unreadDispatches > 0 ? `[${unreadDispatches}]` : ''}
            </Link>
          )}
          {user && (
            <Link
              to={`/collector/${userId}`}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 8vw, 3.5rem)',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                color: isActive('/collector') ? 'var(--red)' : 'var(--ghost)',
                padding: '8px 24px',
              }}
            >
              My Dossier
            </Link>
          )}
          <div style={{ marginTop: '40px', display: 'flex', gap: '8px' }}>
            <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-md btn-ghost">Login</Link>
            <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-md btn-primary">Join</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          #navbar-mobile-toggle { display: flex !important; }
          .navbar-links, .navbar-cta-area > a:not(#navbar-mobile-toggle) { display: none !important; }
        }
      `}</style>
    </>
  );
}

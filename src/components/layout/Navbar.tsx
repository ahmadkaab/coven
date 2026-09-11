import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { List, X, User, MagnifyingGlass, Bell, BellRinging, CheckCircle, ArrowRight, Chats, Lightning } from '@phosphor-icons/react';
import { useAuthStore } from '../../store/authStore';
import { getNotifications, getUnreadCount, markAsRead, markAllRead } from '../../services/notificationService';
import { getUnreadDispatchCount } from '../../services/dispatchService';
import { getWallet, convertCreditsToXanax } from '../../services/walletService';
import { getSyndicateProgression } from '../../services/achievementService';
import { isUserAdmin } from '../../services/adminService';
import { CovenLogo } from '../common/CovenLogo';
import { AvatarWithFrame } from '../common/AvatarWithFrame';
import type { Wallet } from '../../types';
import type { Notification } from '../../types/notification';
import type { SyndicateProgression } from '../../types/achievement';

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
  const { user, logout } = useAuthStore();
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

  // Syndicate Progression & Vanity state
  const [progression, setProgression] = useState<SyndicateProgression>(() => getSyndicateProgression());

  useEffect(() => {
    const handleProgression = () => setProgression(getSyndicateProgression());
    window.addEventListener('coven:progression_update', handleProgression);
    return () => window.removeEventListener('coven:progression_update', handleProgression);
  }, []);

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

  // Escrow Wallet state
  const [wallet, setWallet] = useState<Wallet | null>(() =>
    userId ? getWallet(userId, userId) : null
  );

  useEffect(() => {
    if (userId) {
      setWallet(getWallet(userId, userId));
    } else {
      setWallet(null);
    }
    const handleWallet = () => {
      if (userId) setWallet(getWallet(userId, userId));
    };
    window.addEventListener('coven:wallet_update', handleWallet);
    return () => window.removeEventListener('coven:wallet_update', handleWallet);
  }, [userId]);

  const [chaptersOpen, setChaptersOpen] = useState(false);
  const chaptersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chaptersOpen) return;
    const handler = (e: MouseEvent) => {
      if (chaptersRef.current && !chaptersRef.current.contains(e.target as Node)) {
        setChaptersOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [chaptersOpen]);

  const userIsAdmin = isUserAdmin(user);
  const isAhmad = userIsAdmin || user?.player_id === 4295891 || user?.name === 'ahmad_kaab';

  const chapters = [
    { num: 'I', label: 'Marketplace', href: '/#chapter-1' },
    { num: 'II', label: 'Blind Auctions', href: '/#chapter-2' },
    { num: 'III', label: 'Wallet & Escrow', href: '/#chapter-3' },
    { num: 'IV', label: 'Ahmad Kaab (Artist)', href: '/#chapter-4' },
    { num: 'V', label: 'Achievements', href: '/#chapter-5' },
    ...(isAhmad ? [{ num: 'VI', label: 'Admin Console', href: '/#chapter-6' }] : []),
  ];

  const links: { href: string; label: string; live?: boolean; badge?: string }[] = isAhmad ? [
    { href: '/browse', label: 'Marketplace' },
    { href: '/auctions', label: 'Blind Auctions', badge: 'BLIND' },
    { href: '/wallet', label: 'Wallet & Escrow' },
    { href: '/studio', label: 'Ahmad Studio', badge: 'ARTIST' },
    { href: '/admin', label: 'Admin Console', badge: 'ADMIN' },
  ] : [
    { href: '/browse', label: 'Marketplace' },
    { href: '/commissions', label: 'Commission Ahmad', badge: 'CUSTOM' },
    { href: '/auctions', label: 'Blind Auctions', badge: 'BLIND' },
    { href: '/wallet', label: 'Wallet & Escrow' },
    { href: '/dashboard', label: 'My Account' },
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
          {/* ── DESKTOP CONTENT (>= 1025px) ── */}
          <div className="navbar-desktop-only">
          {/* Bespoke Logo + Edition Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CovenLogo size="sm" />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.5625rem',
              color: 'var(--neon-magenta)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'rgba(255, 0, 127, 0.08)',
              border: '1px solid rgba(255, 0, 127, 0.28)',
              padding: '2px 6px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              lineHeight: 1.2
            }}>
              'WINTER 26
            </span>
          </div>

          {/* Chapters Dropdown Trigger */}
          <div ref={chaptersRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setChaptersOpen(!chaptersOpen)}
              className="navbar-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontFamily: 'var(--font-cinzel)',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: chaptersOpen ? 'var(--neon-magenta)' : 'var(--phosphor)',
                padding: '4px 10px',
                background: 'rgba(244, 241, 234, 0.04)',
                border: '1px solid rgba(244, 241, 234, 0.08)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Chapters ▾
            </button>

            {chaptersOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                left: 0,
                width: '240px',
                background: 'rgba(16, 20, 18, 0.95)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(244, 241, 234, 0.14)',
                borderRadius: '8px',
                padding: '8px',
                boxShadow: '0 20px 48px rgba(0, 0, 0, 0.85)',
                zIndex: 100
              }}>
                <div style={{
                  fontSize: '0.5625rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--ghost)',
                  padding: '6px 10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid rgba(244, 241, 234, 0.06)',
                  marginBottom: '4px'
                }}>
                  THE RENAISSANCE EDITION
                </div>
                {chapters.map(c => (
                  <a
                    key={c.num}
                    href={c.href}
                    onClick={() => setChaptersOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--phosphor)',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(244, 241, 234, 0.08)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--neon-magenta)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--phosphor)';
                    }}
                  >
                    <span>{c.label}</span>
                    <span style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700, color: 'var(--antique-gold)', fontSize: '0.6875rem' }}>
                      {c.num}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

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
                      background: 'var(--neon-magenta)',
                      boxShadow: '0 0 6px var(--neon-magenta)',
                      display: 'inline-block',
                    }}
                  />
                )}
                {l.badge && (
                  <span
                    style={{
                      fontSize: '0.5rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(255, 0, 127, 0.12)',
                      color: 'var(--neon-magenta)',
                      border: '1px solid rgba(255, 0, 127, 0.3)',
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
            {/* Real-time Escrow Peg Badge */}
            <span style={{
              fontSize: '0.625rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--antique-gold)',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              padding: '3px 8px',
              borderRadius: '4px',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--antique-gold)' }} />
              1 XAN = 1K CR
            </span>
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
                {wallet && (
                  <Link
                    to="/wallet"
                    className="btn btn-sm"
                    style={{
                      background: 'rgba(230, 25, 25, 0.08)',
                      border: '1px solid rgba(230, 25, 25, 0.35)',
                      color: 'var(--phosphor)',
                      fontSize: '0.625rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '4px 10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      letterSpacing: '0.04em',
                      borderRadius: '2px',
                    }}
                    title={`Available: ${wallet.balance_cr.toLocaleString()} CR (~${(wallet.balance_cr / 1000).toFixed(1)} Xanax)`}
                  >
                    <Lightning size={12} weight="fill" style={{ color: 'var(--crimson)' }} />
                    <span style={{ fontWeight: 600 }}>{wallet.balance_cr.toLocaleString()} CR</span>
                  </Link>
                )}

                {/* Equipped Prestige Title Flair */}
                {progression.equippedTitle && (
                  <Link
                    to="/achievements"
                    title={`Equipped Title: ${progression.equippedTitle.name} (${progression.equippedTitle.bonusPerk})`}
                    className={`syndicate-title-flair ${progression.equippedTitle.id.replace('title_', 'title-')}`}
                    style={{
                      fontSize: '0.5625rem',
                      padding: '3px 7px',
                      textDecoration: 'none',
                    }}
                  >
                    {progression.equippedTitle.tag}
                  </Link>
                )}

                {/* Equipped Avatar Frame & Link to Dossier */}
                <Link
                  to={`/collector/${userId}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    marginLeft: '2px',
                  }}
                  title={`View Dossier: ${user.name} (LVL ${progression.level})`}
                >
                  <AvatarWithFrame
                    size="xs"
                    avatarUrl={user.profile_image}
                    frame={progression.equippedFrame}
                    alt={user.name}
                  />
                </Link>

                {isAhmad ? (
                  <>
                    <Link
                      to="/studio"
                      className="btn btn-sm btn-ghost"
                      style={{ fontSize: '0.625rem', padding: '5px 10px', flexShrink: 0, whiteSpace: 'nowrap', color: 'var(--antique-gold)', borderColor: 'rgba(212, 175, 55, 0.4)' }}
                    >
                      Ahmad Studio
                    </Link>
                    <Link
                      to="/admin"
                      className="btn btn-sm btn-ghost"
                      style={{ fontSize: '0.625rem', padding: '5px 10px', flexShrink: 0, whiteSpace: 'nowrap', color: 'var(--neon-magenta)', borderColor: 'rgba(255, 0, 127, 0.4)' }}
                    >
                      Admin
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/commissions"
                      className="renaissance-btn-gold"
                      style={{ fontSize: '0.625rem', padding: '4px 10px', flexShrink: 0, whiteSpace: 'nowrap', textDecoration: 'none' }}
                    >
                      Commission Ahmad
                    </Link>
                    <Link
                      to="/dashboard"
                      className="btn btn-sm btn-ghost"
                      style={{ fontSize: '0.625rem', padding: '5px 10px', flexShrink: 0, whiteSpace: 'nowrap' }}
                    >
                      My Account
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-ghost">Login</Link>
                <Link to="/login" className="btn btn-sm btn-primary">Join</Link>
              </>
            )}

            </div>
          </div>

          {/* ── MOBILE BAR (< 1025px) ── */}
          <div className="navbar-mobile-bar">
            {/* Left: Brand Logo + Edition */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <CovenLogo size="sm" />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5625rem',
                color: 'var(--neon-magenta)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'rgba(255, 0, 127, 0.08)',
                border: '1px solid rgba(255, 0, 127, 0.28)',
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                lineHeight: 1.2
              }}>
                'W26
              </span>
            </Link>

            {/* Right: Balance + Notification + Hamburger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {wallet && (
                <Link
                  to="/wallet"
                  style={{
                    background: 'rgba(255, 0, 127, 0.08)',
                    border: '1px solid rgba(255, 0, 127, 0.28)',
                    color: 'var(--phosphor)',
                    fontSize: '0.625rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '5px 8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                  title="Treasury Escrow Balance"
                >
                  <Lightning size={12} weight="fill" color="var(--neon-magenta)" />
                  <span>{wallet.balance_cr.toLocaleString()} CR</span>
                </Link>
              )}

              {user && unread > 0 && (
                <Link
                  to="/notifications"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'rgba(255,0,127,0.12)',
                    color: 'var(--neon-magenta)'
                  }}
                  aria-label="Notifications"
                >
                  <BellRinging size={15} weight="fill" />
                </Link>
              )}

              {/* Hamburger Button (Min 44x44px Touch Target) */}
              <button
                type="button"
                className="mobile-hamburger-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open Navigation Menu"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  borderRadius: '6px',
                  background: 'rgba(244, 241, 234, 0.06)',
                  border: '1px solid rgba(244, 241, 234, 0.12)',
                  color: 'var(--phosphor)',
                  cursor: 'pointer'
                }}
              >
                <List size={20} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── RENAISSANCE MOBILE NAVIGATION DRAWER ── */}
      {mobileOpen && (
        <div
          className="renaissance-mobile-drawer"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(10, 13, 12, 0.98)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
            padding: '16px 20px 48px',
          }}
        >
          {/* Drawer Top Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingBottom: '16px', borderBottom: '1px solid rgba(244, 241, 234, 0.08)',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CovenLogo size="sm" />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--neon-magenta)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                background: 'rgba(255, 0, 127, 0.08)',
                border: '1px solid rgba(255, 0, 127, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                THE RENAISSANCE EDITION
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              style={{
                width: '44px', height: '44px',
                borderRadius: '50%',
                background: 'rgba(244, 241, 234, 0.06)',
                border: '1px solid rgba(244, 241, 234, 0.12)',
                color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} weight="bold" />
            </button>
          </div>

          {/* User Dossier Card */}
          {user ? (
            <div style={{
              background: 'rgba(244, 241, 234, 0.03)',
              border: '1px solid rgba(244, 241, 234, 0.08)',
              borderRadius: '8px',
              padding: '14px 16px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AvatarWithFrame size="sm" avatarUrl={user.profile_image} frame={progression.equippedFrame} alt={user.name} />
                <div>
                  <div style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700, fontSize: '0.9375rem', color: '#fff' }}>
                    {user.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)' }}>
                    Torn ID #{user.player_id} &bull; LVL {user.level}
                  </div>
                </div>
              </div>

              {wallet && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1rem', color: 'var(--neon-magenta)', fontWeight: 700 }}>
                    {wallet.balance_cr.toLocaleString()} CR
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--antique-gold)' }}>
                    ≈ {convertCreditsToXanax(wallet.balance_cr)} Xanax
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="renaissance-btn-primary"
                style={{ flex: 1, textDecoration: 'none', minHeight: '44px' }}
              >
                Authenticate Torn Key
              </Link>
            </div>
          )}

          {/* Sovereign Management Links (If Admin / Ahmad) */}
          {isAhmad && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--antique-gold)',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px'
              }}>
                ◈ SOVEREIGN COMMAND (AHMAD)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Link
                  to="/studio"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: '6px', minHeight: '44px',
                    background: 'rgba(212, 175, 55, 0.08)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: 'var(--antique-gold)',
                    fontFamily: 'var(--font-cinzel)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textDecoration: 'none'
                  }}
                >
                  <span>Ahmad's Artist Studio</span>
                  <span style={{ fontSize: '0.5625rem', fontFamily: 'var(--font-mono)', background: 'var(--antique-gold)', color: '#000', padding: '2px 6px', borderRadius: '3px' }}>
                    ARTIST
                  </span>
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: '6px', minHeight: '44px',
                    background: 'rgba(255, 0, 127, 0.06)',
                    border: '1px solid rgba(255, 0, 127, 0.25)',
                    color: 'var(--neon-magenta)',
                    fontFamily: 'var(--font-cinzel)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textDecoration: 'none'
                  }}
                >
                  <span>Admin & Treasury Console</span>
                  <span style={{ fontSize: '0.5625rem', fontFamily: 'var(--font-mono)', background: 'var(--neon-magenta)', color: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
                    ADMIN
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* Primary Navigation Links */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)',
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px'
            }}>
              ◈ ART MARKETPLACE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { label: 'Marketplace (All Artworks)', href: '/browse', badge: 'AVAILABLE' },
                { label: 'Commission Ahmad Directly', href: '/commissions', badge: 'CUSTOM ⚡', highlight: true },
                { label: 'Blind Mystery Auctions', href: '/auctions', badge: 'BLIND' },
                { label: 'Wallet & Xanax Escrow', href: '/wallet', badge: 'ESCROW' },
                { label: 'My Account & Collection', href: '/dashboard' },
                { label: 'Player Achievements', href: '/achievements', badge: 'RANKS' },
                { label: 'Torn City Script (HUD)', href: '/userscript', badge: 'SCRIPT' },
              ].map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: '6px',
                    minHeight: '44px',
                    background: isActive(item.href) ? 'rgba(255, 0, 127, 0.12)' : 'rgba(244, 241, 234, 0.02)',
                    border: isActive(item.href) ? '1px solid var(--neon-magenta)' : '1px solid rgba(244, 241, 234, 0.05)',
                    color: item.highlight ? 'var(--neon-magenta)' : '#fff',
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      fontSize: '0.5625rem', fontFamily: 'var(--font-mono)',
                      color: item.highlight ? 'var(--neon-magenta)' : 'var(--antique-gold)',
                      background: 'rgba(244, 241, 234, 0.05)',
                      padding: '2px 6px', borderRadius: '3px'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Chapters Jump List */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)',
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px'
            }}>
              ◈ CHAPTERS (RENAISSANCE EDITION)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {chapters.map(c => (
                <a
                  key={c.num}
                  href={c.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 10px', borderRadius: '5px', minHeight: '40px',
                    background: 'rgba(244, 241, 234, 0.02)',
                    border: '1px solid rgba(244, 241, 234, 0.06)',
                    fontSize: '0.6875rem', fontFamily: 'var(--font-body)',
                    color: 'var(--phosphor)', textDecoration: 'none'
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700, color: 'var(--antique-gold)', marginLeft: '4px' }}>{c.num}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Telemetry & Secondary Links */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: '16px', borderTop: '1px solid rgba(244, 241, 234, 0.08)',
            marginTop: 'auto'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--antique-gold)' }}>
              ⚡ 1 XAN = 1,000 CR
            </div>
            {user ? (
              <button
                type="button"
                onClick={() => { logout(); setMobileOpen(false); }}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                  color: 'var(--red-hi)', cursor: 'pointer',
                  padding: '10px 14px', minHeight: '44px',
                  display: 'inline-flex', alignItems: 'center'
                }}
              >
                Disconnect Session
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                  color: 'var(--neon-magenta)', textDecoration: 'underline',
                  padding: '10px 14px', minHeight: '44px',
                  display: 'inline-flex', alignItems: 'center'
                }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        .navbar-desktop-only {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .navbar-mobile-bar {
          display: none;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        @media (max-width: 1024px) {
          .navbar-desktop-only { display: none !important; }
          .navbar-mobile-bar { display: flex !important; }
          .navbar-pill { padding: 8px 14px !important; }
        }
      `}</style>
    </>
  );
}

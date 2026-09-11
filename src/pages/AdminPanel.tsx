import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, ShieldWarning, Vault, ArrowSquareOut, CheckCircle,
  Clock, Coins, UserPlus, Trash, Sparkle, Eye, LockKey, Broadcast,
  ArrowsClockwise, Check, WarningCircle, Lightning
} from '@phosphor-icons/react';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import { 
  getExecutiveMetrics, 
  getAdminSettings, 
  sweepPlatformProfit, 
  toggleEscrowFreeze, 
  updateAnnouncementBanner, 
  addBanker, 
  removeBanker,
  isUserAdmin
} from '../services/adminService';
import { 
  claimWithdrawalTicket, 
  fulfillWithdrawalTicket, 
  convertCreditsToXanax, 
  TREASURY_OFFICIAL,
  TREASURY_TORN_ID 
} from '../services/walletService';
import { 
  syncTornWithdrawals, 
  simulateOutboundXanaxSend, 
  getLastWithdrawalSyncTime 
} from '../services/withdrawalSyncService';
import { getArtworks } from '../services/artworkService';
import type { Artwork } from '../types';

export function AdminPanel() {
  const { user, apiKey } = useAuthStore();
  const { addToast } = useToast();

  const [metrics, setMetrics] = useState(() => getExecutiveMetrics());
  const [settings, setSettings] = useState(() => getAdminSettings());
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'artworks' | 'bankers' | 'settings'>('withdrawals');

  // Input states
  const [newBankerId, setNewBankerId] = useState('');
  const [newBankerName, setNewBankerName] = useState('');
  const [announcementText, setAnnouncementText] = useState(settings.announcement_banner);
  const [unmaskedArtworks, setUnmaskedArtworks] = useState<Record<string, boolean>>({});
  const [isAutoChecking, setIsAutoChecking] = useState(false);
  const [lastWithdrawalSync, setLastWithdrawalSync] = useState<string | null>(() => getLastWithdrawalSyncTime());

  const refresh = () => {
    setMetrics(getExecutiveMetrics());
    setSettings(getAdminSettings());
  };

  useEffect(() => {
    refresh();
    getArtworks().then(res => setArtworks(res.data));
    window.addEventListener('coven:admin_update', refresh);
    window.addEventListener('coven:wallet_update', refresh);
    window.addEventListener('coven:banker_tickets_update', refresh);
    return () => {
      window.removeEventListener('coven:admin_update', refresh);
      window.removeEventListener('coven:wallet_update', refresh);
      window.removeEventListener('coven:banker_tickets_update', refresh);
    };
  }, []);

  // Automatic background withdrawal check every 45s when viewing admin panel
  useEffect(() => {
    if (!apiKey) return;
    const interval = setInterval(async () => {
      try {
        const res = await syncTornWithdrawals(apiKey);
        if (res.autoFulfilledCount > 0) {
          addToast({
            type: 'success',
            title: 'Auto-Dispatched Cashout',
            message: res.message,
          });
          refresh();
        }
      } catch {}
    }, 45000);
    return () => clearInterval(interval);
  }, [apiKey]);

  const handleSweep = () => {
    try {
      const res = sweepPlatformProfit(user?.name || 'ahmad_kaab');
      addToast({
        type: 'success',
        title: 'Platform Earnings Withdrawn',
        message: `Transferred +${res.swept_xanax}x Xanax (${res.swept_cr.toLocaleString()} Credits) to ${TREASURY_OFFICIAL}.`,
      });
      refresh();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Withdrawal Failed', message: err.message });
    }
  };

  const handleToggleFreeze = () => {
    const frozen = toggleEscrowFreeze();
    addToast({
      type: frozen ? 'error' : 'success',
      title: frozen ? 'OPERATIONS PAUSED' : 'Operations Resumed',
      message: frozen ? 'All withdrawal dispatches and deposit crediting are paused.' : 'Escrow pool and cashout queues are active.',
    });
    refresh();
  };

  const handleAutoCheckDispatches = async () => {
    setIsAutoChecking(true);
    try {
      const res = await syncTornWithdrawals(apiKey || undefined);
      addToast({
        type: res.autoFulfilledCount > 0 ? 'success' : 'info',
        title: 'Auto-Check Cashouts',
        message: res.message,
      });
      setLastWithdrawalSync(res.lastCheckedAt);
      refresh();
    } catch {
      addToast({ type: 'error', title: 'Check Failed', message: 'Could not connect to Torn API event stream.' });
    } finally {
      setIsAutoChecking(false);
    }
  };

  const handleSimulateOutboundSend = (ticket: any) => {
    const res = simulateOutboundXanaxSend({
      recipientTornId: ticket.torn_id,
      xanaxCount: convertCreditsToXanax(ticket.amount_cr),
    });
    addToast({
      type: res.success ? 'success' : 'error',
      title: res.success ? 'Auto-Fulfill Match!' : 'Simulation Failed',
      message: res.message,
    });
    refresh();
  };

  const handleClaimTicket = (ticketId: string) => {
    try {
      claimWithdrawalTicket(ticketId, user?.name || 'ahmad_kaab');
      addToast({ type: 'success', title: 'Ticket Claimed', message: 'You have claimed this ticket for dispatch.' });
      refresh();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Claim Failed', message: err.message });
    }
  };

  const handleFulfillTicket = (ticketId: string) => {
    try {
      fulfillWithdrawalTicket(ticketId, user?.name || 'ahmad_kaab');
      addToast({ type: 'success', title: 'Withdrawal Fulfilled', message: 'Marked delivered. User received credits release.' });
      refresh();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Fulfillment Failed', message: err.message });
    }
  };

  const handleAddBanker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankerId.trim() || !newBankerName.trim()) return;
    try {
      addBanker(newBankerId.trim(), newBankerName.trim());
      addToast({ type: 'success', title: 'Banker Added', message: `Authorized [${newBankerId}] to process cashouts.` });
      setNewBankerId('');
      setNewBankerName('');
      refresh();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleRemoveBanker = (id: string) => {
    try {
      removeBanker(id);
      addToast({ type: 'success', title: 'Banker Removed', message: 'Revoked dispatch permissions.' });
      refresh();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleSaveAnnouncement = () => {
    updateAnnouncementBanner(announcementText);
    addToast({ type: 'success', title: 'Announcement Broadcasted', message: 'Website header ticker updated.' });
    refresh();
  };

  const toggleUnmask = (artId: string) => {
    setUnmaskedArtworks(prev => ({ ...prev, [artId]: !prev[artId] }));
  };

  return (
    <main className="page-content" style={{ minHeight: '100vh', background: 'var(--void)' }}>
      {/* ── TOP OPERATIONAL HEADER ───────────────────────── */}
      <div className="renaissance-page-header">
        <div className="container" style={{ maxWidth: '1280px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            flexWrap: 'wrap', gap: '20px'
          }}>
            <div>
              <div className="renaissance-chapter-tag">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: settings.is_escrow_frozen ? '#f87171' : 'var(--neon-magenta)', display: 'inline-block', boxShadow: `0 0 8px ${settings.is_escrow_frozen ? '#f87171' : 'var(--neon-magenta)'}` }} />
                ADMIN CONSOLE &bull; {settings.is_escrow_frozen ? 'OPERATIONS PAUSED' : 'SYSTEM HEALTHY'} &bull; PRIMARY: {TREASURY_OFFICIAL}
              </div>

              <h1 className="renaissance-title">
                Admin Console & Cashouts
              </h1>
              <p className="renaissance-subtitle">
                Manage live player Xanax deposits, automatically check and fulfill 18-hour withdrawals, collect platform fees, and manage website announcements.
              </p>
            </div>

            {/* Top Actions: Freeze Toggle & Fast Trade Link */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://www.torn.com/trade.php"
                target="_blank"
                rel="noreferrer"
                className="renaissance-btn-gold"
                style={{ fontSize: '0.6875rem', padding: '8px 16px' }}
              >
                Open Torn Trades <ArrowSquareOut size={14} weight="bold" />
              </a>

              <button
                type="button"
                onClick={handleToggleFreeze}
                className="btn btn-sm"
                style={{
                  background: settings.is_escrow_frozen ? 'var(--term-green)' : 'rgba(239, 68, 68, 0.15)',
                  color: settings.is_escrow_frozen ? '#000' : '#f87171',
                  border: `1px solid ${settings.is_escrow_frozen ? 'var(--term-green)' : 'rgba(239, 68, 68, 0.4)'}`,
                  fontSize: '0.75rem',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {settings.is_escrow_frozen ? (
                  <>Resume Operations</>
                ) : (
                  <><ShieldWarning size={14} weight="bold" /> Pause Operations</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 'var(--sp-24)', maxWidth: '1280px' }}>
        {/* ── METRICS GRID ─────────────────────────────────────────── */}
        <div className="grid-responsive-4" style={{ marginBottom: 'var(--sp-8)' }}>
          {/* Card 1: Available Platform Earnings (Sweeper) */}
          <div className="renaissance-glass-panel" style={{
            padding: '24px', position: 'relative',
            borderColor: 'rgba(255, 0, 127, 0.35)',
            background: 'linear-gradient(135deg, rgba(255, 0, 127, 0.08) 0%, rgba(14, 18, 17, 0.85) 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Platform Earnings (Unclaimed)
              </span>
              <Coins size={18} weight="duotone" style={{ color: 'var(--neon-magenta)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '2.2rem', color: '#fff', lineHeight: 1, marginBottom: '6px' }}>
              {metrics.available_profit_xanax} <span style={{ fontSize: '1rem', color: 'var(--neon-magenta)', fontFamily: 'var(--font-mono)' }}>XAN</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', marginBottom: '16px' }}>
              ≈ {metrics.available_profit_cr.toLocaleString()} Credits (From Sales Fees + Pinned Drops)
            </div>
            <button
              type="button"
              onClick={handleSweep}
              disabled={metrics.available_profit_xanax <= 0}
              className="renaissance-btn-primary"
              style={{ width: '100%', fontSize: '0.6875rem', padding: '10px', minHeight: '44px' }}
            >
              Withdraw Earnings to Treasury
            </button>
          </div>

          {/* Card 2: Pending 18h Cashouts */}
          <div className="renaissance-glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Pending Player Cashouts
              </span>
              <Clock size={18} weight="duotone" style={{ color: 'var(--antique-gold)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '2.2rem', color: '#fff', lineHeight: 1, marginBottom: '6px' }}>
              {metrics.pending_tickets_count} <span style={{ fontSize: '1rem', color: 'var(--antique-gold)', fontFamily: 'var(--font-mono)' }}>REQUESTS</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
              Total: {metrics.pending_withdrawal_xanax} Xanax ({metrics.pending_withdrawal_cr.toLocaleString()} Credits)
            </div>
          </div>

          {/* Card 3: 5% Marketplace Rake */}
          <div className="renaissance-glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                5% Sales Commission Yield
              </span>
              <Lightning size={18} weight="fill" style={{ color: 'var(--antique-gold)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '2.2rem', color: '#fff', lineHeight: 1, marginBottom: '6px' }}>
              +{metrics.total_rake_xanax} <span style={{ fontSize: '1rem', color: 'var(--antique-gold)', fontFamily: 'var(--font-mono)' }}>XAN</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
              From completed auctions and store sales
            </div>
          </div>

          {/* Card 4: Pin Fees Accrued */}
          <div className="renaissance-glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Featured Promotion Fees
              </span>
              <Sparkle size={18} weight="fill" style={{ color: 'var(--antique-gold)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '2.2rem', color: '#fff', lineHeight: 1, marginBottom: '6px' }}>
              +{metrics.total_pin_fees_xanax} <span style={{ fontSize: '1rem', color: 'var(--antique-gold)', fontFamily: 'var(--font-mono)' }}>XAN</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
              From 72-hour front-page featured promotions
            </div>
          </div>
        </div>

        {/* ── TABS NAVIGATION ──────────────────────────────────────── */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
          {[
            { id: 'withdrawals', label: `Pending Withdrawals (${metrics.pending_tickets_count})` },
            { id: 'artworks', label: `Artwork Listings (${artworks.length})` },
            { id: 'bankers', label: `Cashier Staff (${settings.bankers.length})` },
            { id: 'settings', label: 'Announcement Ticker' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`renaissance-pill${activeTab === tab.id ? ' active' : ''}`}
              style={{ whiteSpace: 'nowrap', minHeight: '40px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: 18h SLA WITHDRAWAL QUEUE ───────────────────────── */}
        {activeTab === 'withdrawals' && (
          <div style={{
            background: 'var(--plate)', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px', overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
                  Pending Player Cashouts (18-Hour Delivery Promise)
                </div>
                <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', marginTop: '2px' }}>
                  When you send Xanax to the player in Torn City, click Auto-Check or let the automatic scanner match and fulfill the ticket.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleAutoCheckDispatches}
                  disabled={isAutoChecking}
                  className="btn btn-sm btn-ghost"
                  style={{
                    fontSize: '0.6875rem',
                    padding: '6px 12px',
                    borderColor: 'rgba(212, 175, 55, 0.4)',
                    color: 'var(--antique-gold)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  title="Check Torn API for outbound Xanax transfers sent by you"
                >
                  <ArrowsClockwise size={13} weight="bold" className={isAutoChecking ? 'animate-spin' : ''} />
                  {isAutoChecking ? 'Scanning Torn API...' : '⚡ Auto-Check Dispatches'}
                </button>
              </div>
            </div>

            {metrics.all_tickets.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ghost)', fontFamily: 'var(--font-mono)' }}>
                No withdrawal requests in queue. All player cashouts are completely fulfilled!
              </div>
            ) : (
              <div className="table-scroll-container">
                <table style={{ minWidth: '680px', width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <th style={{ padding: '12px 16px', color: 'var(--ghost)' }}>TIME REQUESTED</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ghost)' }}>PLAYER</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ghost)' }}>XANAX TO SEND</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ghost)' }}>STATUS</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ghost)', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.all_tickets.map(t => {
                      const xanaxAmount = convertCreditsToXanax(t.amount_cr);
                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '12px 16px', color: 'var(--ghost)' }}>
                            {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <a
                              href={`https://www.torn.com/profiles.php?XID=${t.torn_id}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--red-hi)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              Torn ID: {t.torn_id} <ArrowSquareOut size={12} />
                            </a>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 600 }}>
                            {xanaxAmount}x Xanax <span style={{ fontSize: '0.6875rem', color: 'var(--ghost)' }}>({t.amount_cr.toLocaleString()} Credits)</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: '3px', fontSize: '0.625rem', textTransform: 'uppercase',
                              background: t.status === 'pending' ? 'rgba(251, 191, 36, 0.15)' :
                                          t.status === 'claimed' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                              color: t.status === 'pending' ? '#fbbf24' :
                                     t.status === 'claimed' ? '#60a5fa' : 'var(--term-green)',
                            }}>
                              {t.status === 'claimed' ? `Claimed by ${t.claimed_by}` : t.status === 'pending' ? 'Pending' : 'Delivered'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            {t.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleClaimTicket(t.id)}
                                className="btn btn-sm btn-ghost"
                                style={{ fontSize: '0.6875rem', marginRight: '6px' }}
                              >
                                Claim Ticket
                              </button>
                            )}
                            {t.status !== 'fulfilled' && (
                              <>
                                <a
                                  href={`https://www.torn.com/trade.php`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-sm btn-ghost"
                                  style={{
                                    fontSize: '0.6875rem',
                                    marginRight: '6px',
                                    color: 'var(--antique-gold)',
                                    borderColor: 'rgba(212, 175, 55, 0.4)',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="Send trade or item in Torn City"
                                >
                                  <ArrowSquareOut size={12} weight="bold" /> Send in Torn ↗
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleSimulateOutboundSend(t)}
                                  className="btn btn-sm btn-ghost"
                                  style={{ fontSize: '0.6875rem', marginRight: '6px', color: 'var(--term-green)', borderColor: 'rgba(34, 197, 94, 0.3)' }}
                                  title="Test automatic fulfillment without real Torn items"
                                >
                                  ⚡ Test Auto-Fulfill
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFulfillTicket(t.id)}
                                  className="btn btn-sm btn-primary"
                                  style={{ fontSize: '0.6875rem' }}
                                >
                                  <Check size={12} weight="bold" /> Fulfill
                                </button>
                              </>
                            )}
                            {t.status === 'fulfilled' && (
                              <span style={{ color: 'var(--term-green)', fontSize: '0.6875rem' }}>✓ Settled</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: ARTWORKS & BLIND CIPHERS ──────────────────────── */}
        {activeTab === 'artworks' && (
          <div style={{
            background: 'var(--plate)', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px', overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
                All Artwork Listings & Secret Artist Ciphers
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--ghost)', margin: 0, marginTop: '2px' }}>
                Feature artworks on the front page, inspect listings, and reveal secret artists in blind auctions.
              </p>
            </div>

            {artworks.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ghost)', fontFamily: 'var(--font-mono)' }}>
                No active artwork listings on the floor.
              </div>
            ) : (
              <div className="table-scroll-container">
                <table style={{ minWidth: '580px', width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <th style={{ padding: '12px 16px', color: 'var(--ghost)' }}>ARTWORK</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ghost)' }}>AUCTION MODE</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ghost)' }}>ARTIST</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ghost)', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artworks.map(art => {
                      const isUnmasked = !!unmaskedArtworks[art.id];
                      return (
                        <tr key={art.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <Link to={`/art/${art.id}`} style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
                              {art.title}
                            </Link>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {art.is_blind ? (
                              <span style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.12)', padding: '2px 6px', borderRadius: '3px', fontSize: '0.625rem' }}>
                                🔒 BLIND AUCTION
                              </span>
                            ) : (
                              <span style={{ color: 'var(--ghost)' }}>STANDARD</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {art.is_blind && !isUnmasked ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: 'var(--ghost)' }}>[Hidden in Auction]</span>
                                <button
                                  type="button"
                                  onClick={() => toggleUnmask(art.id)}
                                  className="btn btn-sm btn-ghost"
                                  style={{ fontSize: '0.5625rem', padding: '2px 6px' }}
                                >
                                  <Eye size={10} /> Reveal Artist
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--term-green)' }}>
                                {art.artist?.username || 'Unknown'} [{art.artist?.torn_id || 'Torn ID'}]
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <Link
                              to={`/art/${art.id}`}
                              className="btn btn-sm btn-ghost"
                              style={{ fontSize: '0.6875rem' }}
                            >
                              View Artwork <ArrowSquareOut size={12} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: STAFF BANKERS ─────────────────────────────────── */}
        {activeTab === 'bankers' && (
          <div style={{
            background: 'var(--plate)', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px', padding: '20px'
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: 0, marginBottom: '6px' }}>
              Authorized Cashier Staff (Bankers)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--ghost)', marginBottom: '20px' }}>
              Appoint trusted assistants or faction treasurers to claim and fulfill player cashout tickets during your offline hours.
            </p>

            {/* Add Banker Form */}
            <form onSubmit={handleAddBanker} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Torn Player ID (e.g. 4295891)"
                value={newBankerId}
                onChange={e => setNewBankerId(e.target.value)}
                style={{
                  background: 'var(--pit)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', padding: '10px 14px', borderRadius: '4px', fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)', flex: '1 1 200px', minHeight: '44px'
                }}
              />
              <input
                type="text"
                placeholder="Player Name / Call-sign"
                value={newBankerName}
                onChange={e => setNewBankerName(e.target.value)}
                style={{
                  background: 'var(--pit)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', padding: '10px 14px', borderRadius: '4px', fontSize: '0.75rem',
                  fontFamily: 'var(--font-body)', flex: '1 1 200px', minHeight: '44px'
                }}
              />
              <button type="submit" className="btn btn-sm btn-primary" style={{ minHeight: '44px', padding: '0 18px' }}>
                <UserPlus size={14} weight="bold" /> Authorize Banker
              </button>
            </form>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {settings.bankers.map(b => (
                <div key={b.torn_id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--pit)', border: '1px solid rgba(255,255,255,0.06)',
                  padding: '12px 16px', borderRadius: '4px'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#fff', marginRight: '10px' }}>{b.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                      [ID: {b.torn_id}]
                    </span>
                  </div>
                  {b.torn_id !== TREASURY_TORN_ID ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveBanker(b.torn_id)}
                      className="btn btn-sm btn-ghost"
                      style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                      <Trash size={12} /> Revoke
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--term-green)' }}>
                      SOVEREIGN OWNER
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: BROADCAST & CONTROLS ──────────────────────────── */}
        {activeTab === 'settings' && (
          <div style={{
            background: 'var(--plate)', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px', padding: '24px'
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: 0, marginBottom: '6px' }}>
              Global Broadcast Marquee Ticker
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--ghost)', marginBottom: '16px' }}>
              Live notification text rendered across the header of COVEN for all collectors and artists.
            </p>

            <textarea
              rows={3}
              value={announcementText}
              onChange={e => setAnnouncementText(e.target.value)}
              style={{
                width: '100%', background: 'var(--pit)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', padding: '12px', borderRadius: '4px', fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)', marginBottom: '14px', resize: 'vertical'
              }}
            />

            <button
              type="button"
              onClick={handleSaveAnnouncement}
              className="btn btn-sm btn-primary"
            >
              <Broadcast size={14} weight="bold" /> Update Broadcast
            </button>
          </div>
        )}

      </div>
    </main>
  );
}

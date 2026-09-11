import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  Plus, Image, ArrowUpRight, Lightning, Clock, CheckCircle, PaperPlaneRight,
  ArrowSquareOut, CurrencyCircleDollar, ShieldCheck, Warning, XCircle, ArrowsCounterClockwise,
  Star, Heart, Receipt, ChartBar, DownloadSimple, Certificate,
  TerminalWindow, PenNib, Sliders, Eye
} from '@phosphor-icons/react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { useArtworks } from '../hooks/useData';
import { useRevenueStats, useArtworkPerformance, useAudienceInsights } from '../hooks/useAnalytics';
import { useArtistStudio } from '../hooks/useStudio';
import { type StudioStatus } from '../services/studioService';
import { CommissionQueueBoard } from '../components/artist/CommissionQueueBoard';
import { ForumShopModal } from '../components/artist/ForumShopModal';
import { MetricCard } from '../components/analytics/MetricCard';
import { RevenueChart } from '../components/analytics/RevenueChart';
import { PerformanceTable } from '../components/analytics/PerformanceTable';
import { AudiencePanel } from '../components/analytics/AudiencePanel';
import { getArtistCommissions, getBuyerCommissions } from '../services/commissionService';
import { getUserWatchlist, removeFromWatchlist } from '../services/watchlistService';
import {
  getUserTransactions,
  verifyTransactionViaApi,
  manualVerifyTransaction,
  cancelTransaction,
  type ExtendedTransaction,
} from '../services/transactionService';
import { ArtworkCard } from '../components/artwork/ArtworkCard';
import { ReviewModal } from '../components/common/ReviewModal';
import { TransactionReceiptModal } from '../components/common/TransactionReceiptModal';
import { CommissionDetailModal } from '../components/commission/CommissionDetailModal';
import { VaultUnlockModal } from '../components/artwork/VaultUnlockModal';
import { ProvenanceCertificateModal } from '../components/artwork/ProvenanceCertificateModal';
import { buildProvenanceCertificate } from '../services/vaultService';
import { getWallet } from '../services/walletService';
import { formatTornCash, timeAgo } from '../utils/format';
import type { Commission } from '../types';

const COLLECTOR_TABS = ['Overview', 'My Collection', 'My Commissions', 'Transactions', 'Watchlist'] as const;
const ARTIST_TABS = ['Overview', 'My Listings', 'Studio', 'Analytics', 'Commissions', 'Transactions', 'Watchlist'] as const;
type Tab = 'Overview' | 'My Collection' | 'My Listings' | 'Studio' | 'Analytics' | 'Commissions' | 'My Commissions' | 'Transactions' | 'Watchlist';

export function Dashboard() {
  const { user, apiKey, userId, artistId, isArtist, logout } = useAuth();
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const isAhmadUser = isArtist || user?.player_id === 4295891 || user?.name === 'ahmad_kaab';
  const TABS = useMemo(() => isAhmadUser ? ARTIST_TABS : COLLECTOR_TABS, [isAhmadUser]);

  // Escrow Wallet
  const [wallet, setWallet] = useState(() => userId ? getWallet(userId, userId) : null);
  useEffect(() => {
    if (userId) setWallet(getWallet(userId, userId));
  }, [userId]);

  // Analytics data (only fetched when artist + tab is active)
  const { data: revenueStats, isLoading: revenueLoading } = useRevenueStats(
    isAhmadUser && activeTab === 'Analytics' ? (artistId || 'artist-ahmad-01') : undefined
  );
  const { data: artworkPerf, isLoading: perfLoading } = useArtworkPerformance(
    isAhmadUser && activeTab === 'Analytics' ? (artistId || 'artist-ahmad-01') : undefined
  );
  const { data: audienceData, isLoading: audienceLoading } = useAudienceInsights(
    isAhmadUser && activeTab === 'Analytics' ? (artistId || 'artist-ahmad-01') : undefined
  );

  // If artist, fetch their artworks
  const { data: artworksResult, isLoading: artworksLoading } = useArtworks({
    artistId: artistId ?? undefined,
    perPage: 20,
  });
  const myArtworks = artworksResult?.data ?? [];

  // Commissions — both sent (as buyer) and received (as artist)
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [commissionsLoading, setCommissionsLoading] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);

  // Transactions — both purchases (buyer) and sales (seller)
  const [transactions, setTransactions] = useState<ExtendedTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'sales' | 'purchases' | 'pending' | 'verified'>('all');
  const [verifyingTxId, setVerifyingTxId] = useState<string | null>(null);
  const [txActionMessage, setTxActionMessage] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);
  const [reviewTarget, setReviewTarget] = useState<ExtendedTransaction | null>(null);
  const [receiptTarget, setReceiptTarget] = useState<ExtendedTransaction | null>(null);
  const [vaultTarget, setVaultTarget] = useState<ExtendedTransaction | null>(null);
  const [certTarget, setCertTarget] = useState<ExtendedTransaction | null>(null);

  // Watchlist
  const [watchlist, setWatchlist] = useState<import('../types').Artwork[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Collector purchases (for My Collection)
  const myPurchases = useMemo(() => {
    return transactions.filter(t => 
      (t.buyer_user_id === userId || (t.buyer?.torn_id && t.buyer.torn_id === String(user?.player_id))) && 
      t.status === 'verified'
    );
  }, [transactions, userId, user?.player_id]);

  // Artist Studio Hub
  const { studio, updateStudio, updateSlot } = useArtistStudio(artistId || 'artist-ahmad-01');
  const [showDashboardForumShop, setShowDashboardForumShop] = useState(false);
  const [studioFormData, setStudioFormData] = useState<{
    studioName: string;
    tagline: string;
    status: StudioStatus;
    turnaroundDays: number;
    featuredArtworkId: string;
    termsOfService: string;
  }>({
    studioName: '',
    tagline: '',
    status: 'open',
    turnaroundDays: 3,
    featuredArtworkId: '',
    termsOfService: '',
  });

  useEffect(() => {
    if (studio) {
      setStudioFormData({
        studioName: studio.studioName,
        tagline: studio.tagline,
        status: studio.status,
        turnaroundDays: studio.turnaroundDays,
        featuredArtworkId: studio.featuredArtworkId || '',
        termsOfService: studio.termsOfService,
      });
    }
  }, [studio]);

  const handleSaveStudio = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudio(studioFormData);
    toast.success('Studio Updated', 'Custom branding, SLA and status saved.');
  };

  const loadTransactions = async () => {
    if (!userId) return;
    setTxLoading(true);
    try {
      const list = await getUserTransactions(userId);
      setTransactions(list);
    } catch { /* silent */ }
    setTxLoading(false);
  };

  const loadCommissions = async () => {
    if (!user) return;
    setCommissionsLoading(true);
    try {
      const [sent, received] = await Promise.all([
        getBuyerCommissions(userId ?? ''),
        artistId ? getArtistCommissions(artistId) : Promise.resolve([]),
      ]);
      // Merge and deduplicate
      const all = [...received, ...sent];
      const seen = new Set<string>();
      setCommissions(all.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; }));
    } catch { /* silent */ }
    setCommissionsLoading(false);
  };

  useEffect(() => {
    loadCommissions();
  }, [user, userId, artistId]);

  useEffect(() => {
    if (userId) {
      loadTransactions();
    }
  }, [userId]);

  // Load watchlist
  useEffect(() => {
    if (!userId) return;
    if (activeTab !== 'Watchlist') return;
    setWatchlistLoading(true);
    getUserWatchlist(userId)
      .then(setWatchlist)
      .catch(() => {})
      .finally(() => setWatchlistLoading(false));
  }, [userId, activeTab]);

  const handleVerifyViaApi = async (tx: ExtendedTransaction) => {
    if (!apiKey) {
      setTxActionMessage({ id: tx.id, type: 'error', text: 'Torn API key is required to check payment logs.' });
      return;
    }
    const buyerTornId = tx.buyer?.torn_id ? parseInt(tx.buyer.torn_id, 10) : undefined;
    if (!buyerTornId) {
      setTxActionMessage({ id: tx.id, type: 'error', text: 'Buyer Torn ID missing from transaction.' });
      return;
    }
    setVerifyingTxId(tx.id);
    setTxActionMessage(null);
    try {
      const res = await verifyTransactionViaApi({
        transactionId: tx.id,
        sellerApiKey: apiKey,
        buyerTornId,
        amount: tx.amount,
        artworkId: tx.artwork_id,
        sellerUserId: tx.seller_user_id,
      });
      if (res.verified) {
        toast.success('Payment Verified!', `Torn log #${res.logId} confirmed transfer.`);
        setTxActionMessage({ id: tx.id, type: 'success', text: `Payment verified via Torn Log #${res.logId}!` });
        await loadTransactions();
      } else {
        toast.error('Verification Failed', res.message || 'Transfer not found in log 4810.');
        setTxActionMessage({ id: tx.id, type: 'error', text: res.message || 'Verification failed — transfer not found in log 4810.' });
      }
    } catch (e: any) {
      setTxActionMessage({ id: tx.id, type: 'error', text: e.message || 'Verification error' });
    } finally {
      setVerifyingTxId(null);
    }
  };

  const handleManualVerify = async (tx: ExtendedTransaction) => {
    setVerifyingTxId(tx.id);
    try {
      await manualVerifyTransaction({
        transactionId: tx.id,
        artworkId: tx.artwork_id,
        sellerUserId: tx.seller_user_id,
      });
      setTxActionMessage({ id: tx.id, type: 'success', text: 'Transaction marked as verified manually.' });
      await loadTransactions();
    } catch (e: any) {
      setTxActionMessage({ id: tx.id, type: 'error', text: e.message });
    } finally {
      setVerifyingTxId(null);
    }
  };

  const handleCancelTx = async (tx: ExtendedTransaction) => {
    if (!confirm('Are you sure you want to cancel this transaction? The artwork will be restored to available.')) return;
    setVerifyingTxId(tx.id);
    try {
      await cancelTransaction(tx.id, tx.artwork_id);
      setTxActionMessage({ id: tx.id, type: 'success', text: 'Transaction cancelled and artwork restored.' });
      await loadTransactions();
    } catch (e: any) {
      setTxActionMessage({ id: tx.id, type: 'error', text: e.message });
    } finally {
      setVerifyingTxId(null);
    }
  };

  if (!user) return null;

  return (
    <main className="page-content" style={{ paddingBottom: 'var(--sp-20)' }}>

      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <div style={{ borderBottom: '2px solid var(--red)', background: 'var(--pit)', paddingTop: '24px' }}>
        <div className="container">
          <div style={{ padding: 'var(--sp-6) 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: isAhmadUser ? 'var(--antique-gold)' : 'var(--neon-magenta)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
                {isAhmadUser ? '◈ SOVEREIGN ARTIST // PLATFORM COMMAND' : '◈ MY ACCOUNT // COLLECTOR VAULT'}
              </div>
              <h1 style={{
                fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: 1, letterSpacing: '0.02em', color: '#fff', margin: 0,
              }}>
                {user.name}
              </h1>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', marginTop: 'var(--sp-2)' }}>
                TID #{user.player_id} &bull; Level {user.level} &bull; {user.rank}
                {isAhmadUser && <span style={{ marginLeft: '12px', color: 'var(--antique-gold)', fontWeight: 700 }}>◈ SOVEREIGN ARTIST</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--sp-4)' }}>
              {isAhmadUser ? (
                <>
                  <Link to="/studio" className="renaissance-btn-gold" style={{ fontSize: '0.6875rem', padding: '7px 14px', textDecoration: 'none' }}>
                    Open Artist Studio ↗
                  </Link>
                  <Link to="/admin" className="renaissance-btn-primary" style={{ fontSize: '0.6875rem', padding: '7px 14px', textDecoration: 'none' }}>
                    Executive Console ↗
                  </Link>
                </>
              ) : (
                <Link to="/commissions" className="renaissance-btn-gold" style={{ fontSize: '0.6875rem', padding: '7px 14px', textDecoration: 'none' }}>
                  Commission Ahmad ⚡
                </Link>
              )}
              <Link to="/wallet" className="btn btn-sm btn-ghost" style={{ fontSize: '0.6875rem' }}>
                Wallet & Escrow
              </Link>
              <button onClick={logout} className="btn btn-ghost btn-sm" style={{ fontSize: '0.6875rem' }}>Logout</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="no-scrollbar" style={{ display: 'flex', gap: '1px', background: 'var(--seam)', marginTop: 'var(--sp-4)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: 'var(--sp-3) var(--sp-5)',
                  background: activeTab === tab ? 'var(--void)' : 'var(--plate)',
                  color: activeTab === tab ? 'var(--phosphor)' : 'var(--ghost)',
                  borderBottom: activeTab === tab ? '2px solid var(--red)' : '2px solid transparent',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  minHeight: '40px',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────────── */}
      <div className="container section-pad">

        {/* OVERVIEW */}
        {activeTab === 'Overview' && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Ahmad Sovereign Master Banner */}
            {isAhmadUser && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(0, 0, 0, 0.5))',
                border: '1px solid var(--antique-gold)',
                borderRadius: '6px',
                padding: '18px 24px',
                marginBottom: 'var(--sp-8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700, color: 'var(--antique-gold)', fontSize: '1.05rem', marginBottom: '4px' }}>
                    👑 Master Artist Command Active
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', margin: 0, maxWidth: '650px', lineHeight: 1.5 }}>
                    You are logged in as Sovereign Master Ahmad [4295891]. You have full control over art listings, client commission queues, and platform escrow payouts.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link to="/studio" className="renaissance-btn-gold" style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '10px 18px' }}>
                    Open Artist Studio ↗
                  </Link>
                  <Link to="/admin" className="renaissance-btn-primary" style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '10px 18px' }}>
                    Executive Console ↗
                  </Link>
                </div>
              </div>
            )}

            {/* Stats cells */}
            <div className="grid-responsive-4" style={{ gap: '1px', background: 'var(--seam)', marginBottom: 'var(--sp-8)' }}>
              {isAhmadUser ? [
                { label: 'Artworks Listed', val: myArtworks.length, icon: <Image size={14} weight="bold" /> },
                { label: 'Active Auctions', val: myArtworks.filter(a => a.listing_type === 'auction' && a.status === 'available').length, icon: <Lightning size={14} weight="fill" color="var(--red)" /> },
                { label: 'Total Sales',     val: transactions.filter(t => t.seller_user_id === userId && t.status === 'verified').length, icon: <CheckCircle size={14} weight="fill" color="var(--term-green)" /> },
                { label: 'Pending Payouts', val: transactions.filter(t => t.status === 'pending').length, icon: <Clock size={14} weight="bold" /> },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--plate)', padding: 'var(--sp-5) var(--sp-6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {s.label}
                    </div>
                    {s.icon}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--phosphor)' }}>
                    {s.val}
                  </div>
                </div>
              )) : [
                { label: 'Artworks Owned', val: myPurchases.length, icon: <Image size={14} weight="bold" /> },
                { label: 'Active Commissions', val: commissions.filter(c => c.status !== 'completed' && c.status !== 'cancelled').length, icon: <Lightning size={14} weight="fill" color="var(--antique-gold)" /> },
                { label: 'Escrow Balance', val: `${wallet?.balance_cr?.toLocaleString() ?? 0} CR`, icon: <ShieldCheck size={14} weight="bold" color="var(--term-green)" /> },
                { label: 'Saved Watchlist', val: watchlist.length, icon: <Heart size={14} weight="fill" color="var(--crimson)" /> },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--plate)', padding: 'var(--sp-5) var(--sp-6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {s.label}
                    </div>
                    {s.icon}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--phosphor)' }}>
                    {s.val}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid-responsive-2" style={{ gap: '1px', background: 'var(--seam)' }}>
              {isAhmadUser ? (
                <>
                  <Link
                    to="/list-artwork"
                    style={{
                      background: 'var(--plate)', padding: 'var(--sp-8)',
                      display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)',
                      borderLeft: '4px solid var(--red)',
                      textDecoration: 'none',
                      transition: 'background 0.15s',
                    }}
                  >
                    <Plus size={24} color="var(--red)" weight="bold" />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--phosphor)', marginBottom: '6px' }}>
                        List Artwork
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                        Upload and list a new masterpiece for sale or blind auction
                      </div>
                    </div>
                    <ArrowUpRight size={14} color="var(--ghost)" weight="bold" style={{ marginTop: 'auto', alignSelf: 'flex-end' }} />
                  </Link>

                  <Link
                    to="/studio"
                    style={{
                      background: 'var(--plate)', padding: 'var(--sp-8)',
                      display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)',
                      borderLeft: '4px solid var(--antique-gold)',
                      textDecoration: 'none',
                    }}
                  >
                    <PenNib size={24} color="var(--antique-gold)" weight="bold" />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--phosphor)', marginBottom: '6px' }}>
                        Artist Studio & Orders
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                        Manage commission requests, update progress, and generate forum BBCode
                      </div>
                    </div>
                    <ArrowUpRight size={14} color="var(--ghost)" weight="bold" style={{ marginTop: 'auto', alignSelf: 'flex-end' }} />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/browse"
                    style={{
                      background: 'var(--plate)', padding: 'var(--sp-8)',
                      display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)',
                      borderLeft: '4px solid var(--neon-magenta)',
                      textDecoration: 'none',
                    }}
                  >
                    <Image size={24} color="var(--neon-magenta)" weight="bold" />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--phosphor)', marginBottom: '6px' }}>
                        Browse Marketplace
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                        Explore authentic artworks available for instant purchase or auction
                      </div>
                    </div>
                    <ArrowUpRight size={14} color="var(--ghost)" weight="bold" style={{ marginTop: 'auto', alignSelf: 'flex-end' }} />
                  </Link>

                  <Link
                    to="/commissions"
                    style={{
                      background: 'var(--plate)', padding: 'var(--sp-8)',
                      display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)',
                      borderLeft: '4px solid var(--antique-gold)',
                      textDecoration: 'none',
                    }}
                  >
                    <Lightning size={24} color="var(--antique-gold)" weight="fill" />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--phosphor)', marginBottom: '6px' }}>
                        Commission Ahmad
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                        Order a custom Torn profile signature, avatar, or faction graphic
                      </div>
                    </div>
                    <ArrowUpRight size={14} color="var(--ghost)" weight="bold" style={{ marginTop: 'auto', alignSelf: 'flex-end' }} />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* MY COLLECTION (COLLECTORS) */}
        {activeTab === 'My Collection' && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--seam)', paddingBottom: 'var(--sp-4)', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="section-h2" style={{ margin: 0 }}>MY ARTWORK COLLECTION</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--ghost)', margin: 0, marginTop: '4px' }}>
                  Authenticated pieces you own. Download master vault files and official Certificates of Provenance.
                </p>
              </div>
              <Link to="/browse" className="btn btn-sm btn-ghost" style={{ fontSize: '0.6875rem' }}>
                Find More Art <ArrowSquareOut size={12} />
              </Link>
            </div>

            {myPurchases.length === 0 ? (
              <div style={{ padding: 'var(--sp-16)', textAlign: 'center', border: '1px solid var(--hull)', background: 'var(--plate)', borderRadius: '6px' }}>
                <Image size={44} color="var(--ghost)" weight="light" style={{ marginBottom: '12px' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textTransform: 'uppercase', color: '#fff', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  NO ARTWORKS IN YOUR COLLECTION YET
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                  When you purchase an artwork on the marketplace or win an auction, it will appear here with full master vault download access and BBCode forum badges.
                </p>
                <Link to="/browse" className="renaissance-btn-gold" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '0.75rem' }}>
                  Explore Marketplace
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {myPurchases.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      background: 'var(--plate)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', overflow: 'hidden' }}>
                      <img
                        src={tx.artwork?.image_url || tx.artwork?.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
                        alt={tx.artwork?.title || 'Purchased Artwork'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'rgba(16, 185, 129, 0.9)', color: '#000',
                        fontWeight: 700, fontSize: '0.625rem', padding: '2px 8px', borderRadius: '3px',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        ✓ OWNED & PROVEN
                      </div>
                    </div>

                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
                          {tx.artwork?.title || 'Bespoke Commission Piece'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', marginTop: '2px' }}>
                          Artist: Ahmad Kaab [4295891] &bull; Paid: {formatTornCash(tx.amount)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {tx.artwork && (
                          <>
                            <button
                              onClick={() => setVaultTarget(tx)}
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.6875rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <DownloadSimple size={12} weight="bold" /> Download Vault
                            </button>
                            <button
                              onClick={() => setCertTarget(tx)}
                              className="btn btn-industrial btn-sm"
                              style={{ fontSize: '0.6875rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Certificate size={12} color="var(--term-green)" /> Certificate
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setReceiptTarget(tx)}
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.6875rem', padding: '6px 10px', color: 'var(--ghost)' }}
                        >
                          <Receipt size={12} /> Receipt
                        </button>
                        <button
                          onClick={() => setReviewTarget(tx)}
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.6875rem', padding: '6px 10px', color: 'var(--amber)' }}
                        >
                          <Star size={12} weight="fill" /> Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* MY LISTINGS */}
        {activeTab === 'My Listings' && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--seam)', paddingBottom: 'var(--sp-4)' }}>
              <h2 className="section-h2">MY LISTINGS</h2>
              <Link to="/list-artwork" className="btn btn-primary btn-sm">
                <Plus size={11} weight="bold" />New Listing
              </Link>
            </div>
            {artworksLoading ? (
              <div className="artwork-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ background: 'var(--plate)', border: '1px solid var(--hull)' }}>
                    <div className="skeleton" style={{ aspectRatio: '4/3' }} />
                    <div style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                      <div className="skeleton" style={{ height: 16, width: '70%' }} />
                      <div className="skeleton" style={{ height: 12, width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : myArtworks.length === 0 ? (
              <div style={{ padding: 'var(--sp-16)', textAlign: 'center', border: '1px solid var(--hull)', background: 'var(--plate)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', textTransform: 'uppercase', color: 'var(--hull)', letterSpacing: '-0.04em', marginBottom: 'var(--sp-4)' }}>
                  NO LISTINGS YET
                </div>
                <Link to="/list-artwork" className="btn btn-primary btn-sm">
                  <Plus size={11} weight="bold" />Create First Listing
                </Link>
              </div>
            ) : (
              <div className="artwork-grid">
                {myArtworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {(activeTab === 'Commissions' || activeTab === 'My Commissions') && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--seam)', paddingBottom: 'var(--sp-4)', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="section-h2" style={{ margin: 0 }}>
                  {isAhmadUser ? 'COMMISSION ORDERS RECEIVED' : 'MY CUSTOM COMMISSIONS'}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--ghost)', margin: 0, marginTop: '4px' }}>
                  {isAhmadUser
                    ? 'Custom art orders sent to you by Torn collectors. Manage stages, delivery, and payments.'
                    : 'Custom artworks and graphics you ordered from Ahmad. Track progress, review drafts, and download finals.'}
                </p>
              </div>
              {!isAhmadUser && (
                <Link to="/commissions" className="renaissance-btn-gold" style={{ textDecoration: 'none', padding: '6px 14px', fontSize: '0.6875rem' }}>
                  New Commission +
                </Link>
              )}
            </div>

            {commissionsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--seam)' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ background: 'var(--plate)', padding: 'var(--sp-6)', display: 'flex', gap: 'var(--sp-4)' }}>
                    <div className="skeleton" style={{ width: 48, height: 48 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                      <div className="skeleton" style={{ height: 18, width: '60%' }} />
                      <div className="skeleton" style={{ height: 12, width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : commissions.length === 0 ? (
              <div style={{ padding: 'var(--sp-16)', textAlign: 'center', border: '1px solid var(--hull)', background: 'var(--plate)', borderRadius: '6px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textTransform: 'uppercase', color: '#fff', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  {isAhmadUser ? 'NO ORDERS RECEIVED YET' : 'NO CUSTOM COMMISSIONS YET'}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ghost)', maxWidth: '420px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                  {isAhmadUser
                    ? 'Orders placed by collectors through your studio or shop will appear here.'
                    : 'You have not commissioned any custom art yet. Need a forum signature, profile art, or faction banner?'}
                </div>
                {!isAhmadUser && (
                  <Link to="/commissions" className="renaissance-btn-gold" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '0.75rem' }}>
                    Commission Ahmad Directly
                  </Link>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--seam)' }}>
                {commissions.map((c) => {
                  const isReceived = c.artist_id === artistId;
                  const statusColor: Record<string, string> = {
                    open: 'var(--term-green)', in_progress: 'var(--red-hi)',
                    delivered: '#a78bfa', completed: 'var(--ghost)', cancelled: 'var(--shadow-type)',
                  };
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCommission(c)}
                      style={{
                        background: 'var(--plate)',
                        padding: 'var(--sp-5) var(--sp-6)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--sp-5)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--pit)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--plate)')}
                    >
                      {/* Direction indicator */}
                      <div style={{
                        width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--pit)', border: '1px solid var(--hull)', flexShrink: 0,
                      }}>
                        {isReceived ? (
                          <Lightning size={16} color="var(--red-hi)" weight="fill" />
                        ) : (
                          <PaperPlaneRight size={16} color="var(--ghost)" weight="bold" />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--phosphor)', marginBottom: '2px' }}>
                          {c.title}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <span>{isReceived ? 'From buyer' : `To ${c.artist?.username ?? 'artist'}`}</span>
                          {c.budget_torn && <span>${c.budget_torn.toLocaleString()}</span>}
                          <span>{timeAgo(c.created_at)}</span>
                        </div>
                      </div>

                      {/* Status badge & manage */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--sp-4)',
                        borderLeft: '1px solid var(--hull)', paddingLeft: 'var(--sp-4)', flexShrink: 0,
                      }}>
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.5625rem',
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                          color: statusColor[c.status] ?? 'var(--ghost)',
                          display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                          {c.status === 'completed' && <CheckCircle size={12} weight="fill" />}
                          {c.status.replace('_', ' ')}
                        </div>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 10px', fontSize: '0.625rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCommission(c);
                          }}
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Commission Detail & Action Modal */}
            {selectedCommission && userId && (
              <CommissionDetailModal
                commission={selectedCommission}
                isArtist={selectedCommission.artist_id === artistId}
                userId={userId}
                onClose={() => setSelectedCommission(null)}
                onUpdated={loadCommissions}
              />
            )}
          </motion.div>
        )}

        {/* TRANSACTIONS */}
        {activeTab === 'Transactions' && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--sp-6)', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
              <div>
                <h2 className="section-h2" style={{ marginBottom: '4px' }}>TRANSACTION LOG</h2>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)' }}>
                  PEER-TO-PEER TORN PAYMENTS & LOG #4810 VERIFICATION
                </div>
              </div>
              <button
                onClick={loadTransactions}
                className="btn btn-ghost btn-sm"
                disabled={txLoading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowsCounterClockwise size={12} className={txLoading ? 'spin' : ''} />
                Refresh
              </button>
            </div>

            {/* Notification alert */}
            {txActionMessage && (
              <div style={{
                marginBottom: 'var(--sp-6)', padding: 'var(--sp-4) var(--sp-5)',
                borderLeft: `3px solid ${txActionMessage.type === 'success' ? 'var(--term-green)' : 'var(--red)'}`,
                background: txActionMessage.type === 'success' ? 'rgba(0,255,100,0.05)' : 'rgba(230,25,25,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {txActionMessage.type === 'success' ? (
                    <CheckCircle size={16} color="var(--term-green)" weight="fill" />
                  ) : (
                    <Warning size={16} color="var(--red-hi)" weight="fill" />
                  )}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: txActionMessage.type === 'success' ? 'var(--term-green)' : 'var(--red-hi)' }}>
                    {txActionMessage.text}
                  </span>
                </div>
                <button
                  onClick={() => setTxActionMessage(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--ghost)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}
                >
                  [DISMISS]
                </button>
              </div>
            )}

            {/* Metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--seam)', marginBottom: 'var(--sp-6)' }}>
              {[
                {
                  label: 'TOTAL VOLUME',
                  val: `$${transactions.filter(t => t.status === 'verified').reduce((acc, t) => acc + (t.amount || 0), 0).toLocaleString()}`,
                  desc: 'Verified transactions'
                },
                {
                  label: 'COMPLETED SALES',
                  val: transactions.filter(t => t.seller_user_id === userId && t.status === 'verified').length,
                  desc: 'Verified as artist'
                },
                {
                  label: 'PENDING VERIFICATION',
                  val: transactions.filter(t => t.status === 'pending').length,
                  desc: 'Awaiting Torn cash check'
                },
              ].map((stat) => (
                <div key={stat.label} style={{ background: 'var(--plate)', padding: 'var(--sp-5)' }}>
                  <div className="artwork-price-label">{stat.label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--phosphor)', letterSpacing: '-0.03em', margin: '4px 0 2px' }}>
                    {stat.val}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)' }}>
                    {stat.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1px', background: 'var(--seam)', marginBottom: 'var(--sp-6)', flexWrap: 'wrap' }}>
              {(['all', 'sales', 'purchases', 'pending', 'verified'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setTxFilter(filterKey)}
                  style={{
                    padding: 'var(--sp-3) var(--sp-4)',
                    background: txFilter === filterKey ? 'var(--void)' : 'var(--plate)',
                    borderBottom: txFilter === filterKey ? '2px solid var(--red)' : '2px solid transparent',
                    fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: txFilter === filterKey ? 'var(--phosphor)' : 'var(--ghost)',
                    cursor: 'pointer',
                  }}
                >
                  {filterKey} {filterKey === 'pending' ? `(${transactions.filter(t => t.status === 'pending').length})` : ''}
                </button>
              ))}
            </div>

            {/* List */}
            {txLoading ? (
              <div style={{ padding: 'var(--sp-12)', textAlign: 'center', background: 'var(--plate)', border: '1px solid var(--hull)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ghost)' }}>
                  LOADING TRANSACTIONS...
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ padding: 'var(--sp-16)', textAlign: 'center', border: '1px solid var(--hull)', background: 'var(--plate)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', textTransform: 'uppercase', color: 'var(--hull)', letterSpacing: '-0.04em', marginBottom: 'var(--sp-4)' }}>
                  NO TRANSACTIONS RECORDED
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', maxWidth: 400, margin: '0 auto var(--sp-6)' }}>
                  Purchases of fixed price artworks and auction settlements will automatically generate transaction records here.
                </div>
                <Link to="/browse" className="btn btn-industrial">Browse Marketplace</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--seam)' }}>
                {transactions
                  .filter((t) => {
                    if (txFilter === 'sales') return t.seller_user_id === userId;
                    if (txFilter === 'purchases') return t.buyer_user_id === userId;
                    if (txFilter === 'pending') return t.status === 'pending';
                    if (txFilter === 'verified') return t.status === 'verified';
                    return true;
                  })
                  .map((tx) => {
                    const isSeller = tx.seller_user_id === userId;
                    const isBuyer = tx.buyer_user_id === userId;
                    const counterparty = isSeller ? tx.buyer : tx.seller;
                    const counterpartyRole = isSeller ? 'Buyer' : 'Seller';
                    const isPending = tx.status === 'pending';
                    const isVerified = tx.status === 'verified';
                    const tornProfileLink = counterparty?.torn_id
                      ? `https://www.torn.com/profiles.php?XID=${counterparty.torn_id}`
                      : 'https://www.torn.com';

                    return (
                      <div
                        key={tx.id}
                        style={{
                          background: 'var(--plate)',
                          padding: 'var(--sp-5) var(--sp-6)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--sp-5)',
                          flexWrap: 'wrap',
                          borderLeft: isVerified
                            ? '3px solid var(--term-green)'
                            : isPending
                            ? '3px solid var(--amber)'
                            : '3px solid var(--hull)',
                        }}
                      >
                        {/* Artwork Thumbnail */}
                        {tx.artwork ? (
                          <Link to={`/artwork/${tx.artwork.id}`}>
                            <img
                              src={tx.artwork.thumbnail_url || tx.artwork.image_url}
                              alt={tx.artwork.title}
                              style={{ width: 64, height: 64, objectFit: 'cover', border: '1px solid var(--hull)' }}
                            />
                          </Link>
                        ) : (
                          <div style={{ width: 64, height: 64, background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--hull)' }}>
                            <CurrencyCircleDollar size={24} color="var(--ghost)" />
                          </div>
                        )}

                        {/* Title & Details */}
                        <div style={{ flex: '1 1 240px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)', fontSize: '0.5rem',
                                padding: '2px 6px',
                                background: isSeller ? 'rgba(230,25,25,0.1)' : 'rgba(0,255,100,0.1)',
                                color: isSeller ? 'var(--red-hi)' : 'var(--term-green)',
                                border: `1px solid ${isSeller ? 'var(--red)' : 'var(--term-green)'}`,
                                textTransform: 'uppercase', letterSpacing: '0.1em'
                              }}
                            >
                              {isSeller ? 'SALE' : 'PURCHASE'}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)' }}>
                              TX #{tx.id.slice(0, 8).toUpperCase()} · {timeAgo(tx.created_at)}
                            </span>
                          </div>

                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', textTransform: 'uppercase', color: 'var(--phosphor)', letterSpacing: '-0.02em' }}>
                            {tx.artwork?.title ?? 'Direct Transaction'}
                          </div>

                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <span>
                              {counterpartyRole}:{' '}
                              <a
                                href={tornProfileLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--phosphor)', textDecoration: 'underline' }}
                              >
                                {counterparty?.username ?? 'Torn Player'} [TID #{counterparty?.torn_id ?? '?'}]
                              </a>
                            </span>
                            {tx.notes && (
                              <span style={{ color: 'var(--shadow-type)' }}>Note: {tx.notes}</span>
                            )}
                          </div>
                        </div>

                        {/* Amount */}
                        <div style={{ textAlign: 'right', minWidth: 120 }}>
                          <div className="artwork-price-label">AMOUNT</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--phosphor)' }}>
                            {formatTornCash(tx.amount)}
                          </div>
                          {isVerified && tx.torn_log_id && (
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--term-green)', marginTop: '2px' }}>
                              LOG #{tx.torn_log_id}
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div style={{ minWidth: 140, textAlign: 'center' }}>
                          {isVerified ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--term-green)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', padding: '4px 8px', background: 'rgba(0,255,100,0.06)', border: '1px solid var(--term-green)' }}>
                              <CheckCircle size={12} weight="fill" /> VERIFIED
                            </div>
                          ) : isPending ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', padding: '4px 8px', background: 'rgba(255,180,0,0.06)', border: '1px solid var(--amber)' }}>
                              <Clock size={12} weight="bold" /> PENDING
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--red-hi)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', padding: '4px 8px', background: 'rgba(230,25,25,0.06)', border: '1px solid var(--red)' }}>
                              <XCircle size={12} weight="fill" /> CANCELLED
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                          {isSeller && isPending && (
                            <>
                              <button
                                onClick={() => handleVerifyViaApi(tx)}
                                disabled={verifyingTxId === tx.id}
                                className="btn btn-primary btn-sm"
                                title="Check Torn API log category 4810 for buyer cash transfer"
                                style={{ fontSize: '0.625rem', padding: '6px 12px' }}
                              >
                                <ShieldCheck size={14} weight="bold" />
                                {verifyingTxId === tx.id ? 'CHECKING TORN...' : 'VERIFY VIA TORN API'}
                              </button>
                              <button
                                onClick={() => handleManualVerify(tx)}
                                disabled={verifyingTxId === tx.id}
                                className="btn btn-ghost btn-sm"
                                title="Manually mark as received"
                                style={{ fontSize: '0.625rem', padding: '6px 10px' }}
                              >
                                Manual Confirm
                              </button>
                              <button
                                onClick={() => handleCancelTx(tx)}
                                disabled={verifyingTxId === tx.id}
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: '0.625rem', padding: '6px 10px', color: 'var(--red-hi)' }}
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {isBuyer && isPending && (
                            <a
                              href={tornProfileLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-industrial btn-sm"
                              style={{ fontSize: '0.625rem', padding: '6px 12px' }}
                            >
                              Send Cash on Torn <ArrowSquareOut size={12} />
                            </a>
                          )}

                          {isVerified && (
                            <>
                              {tx.artwork && (
                                <>
                                  <button
                                    onClick={() => setVaultTarget(tx)}
                                    className="btn btn-primary btn-sm"
                                    style={{ fontSize: '0.625rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    title="Access unwatermarked master high-res asset in the COVEN Vault"
                                  >
                                    <DownloadSimple size={12} weight="bold" /> Vault
                                  </button>
                                  <button
                                    onClick={() => setCertTarget(tx)}
                                    className="btn btn-industrial btn-sm"
                                    style={{ fontSize: '0.625rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    title="View official Certificate of Authenticity and copy BBCode badge"
                                  >
                                    <Certificate size={12} color="var(--term-green)" /> Certificate
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setReceiptTarget(tx)}
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: '0.625rem', padding: '6px 12px', color: 'var(--term-green)', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="View verified settlement slip and copy Torn forum BBCode"
                              >
                                <Receipt size={12} weight="bold" /> Receipt
                              </button>
                            </>
                          )}

                          {isBuyer && isVerified && (
                            <button
                              onClick={() => setReviewTarget(tx)}
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: '0.625rem', padding: '6px 12px', color: 'var(--amber)' }}
                            >
                              <Star size={12} weight="fill" /> Leave Review
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
            {/* Review Modal */}
            {reviewTarget && userId && (
              <ReviewModal
                transaction={reviewTarget}
                userId={userId}
                onClose={() => setReviewTarget(null)}
                onSuccess={() => {
                  toast.success('Review Submitted!', 'Your review and rating have been recorded.');
                  setTxActionMessage({ id: reviewTarget.id, type: 'success', text: 'Review submitted successfully!' });
                  setReviewTarget(null);
                }}
              />
            )}
            {/* Transaction Receipt Modal */}
            {receiptTarget && (
              <TransactionReceiptModal
                transaction={receiptTarget}
                onClose={() => setReceiptTarget(null)}
              />
            )}
            {/* Vault Master Modal */}
            {vaultTarget && vaultTarget.artwork && (
              <VaultUnlockModal
                artwork={{
                  id: vaultTarget.artwork.id,
                  title: vaultTarget.artwork.title,
                  image_url: vaultTarget.artwork.image_url,
                  thumbnail_url: vaultTarget.artwork.thumbnail_url,
                  listing_type: (vaultTarget.artwork.listing_type as any) || 'fixed',
                  price_torn: vaultTarget.artwork.price_torn || vaultTarget.amount,
                  artist_id: vaultTarget.artwork.artist_id || vaultTarget.seller_user_id,
                  status: 'sold',
                  created_at: vaultTarget.created_at,
                  updated_at: vaultTarget.created_at,
                  artist: vaultTarget.seller ? {
                    id: vaultTarget.seller.id,
                    username: vaultTarget.seller.username,
                    torn_id: vaultTarget.seller.torn_id,
                    avatar_url: vaultTarget.seller.avatar_url,
                    created_at: vaultTarget.created_at,
                    updated_at: vaultTarget.created_at,
                  } : undefined,
                }}
                certificate={buildProvenanceCertificate(
                  {
                    id: vaultTarget.artwork.id,
                    title: vaultTarget.artwork.title,
                    image_url: vaultTarget.artwork.image_url,
                    thumbnail_url: vaultTarget.artwork.thumbnail_url,
                    listing_type: (vaultTarget.artwork.listing_type as any) || 'fixed',
                    price_torn: vaultTarget.artwork.price_torn || vaultTarget.amount,
                    artist_id: vaultTarget.artwork.artist_id || vaultTarget.seller_user_id,
                    status: 'sold',
                    created_at: vaultTarget.created_at,
                    updated_at: vaultTarget.created_at,
                    artist: vaultTarget.seller ? {
                      id: vaultTarget.seller.id,
                      username: vaultTarget.seller.username,
                      torn_id: vaultTarget.seller.torn_id,
                      avatar_url: vaultTarget.seller.avatar_url,
                      created_at: vaultTarget.created_at,
                      updated_at: vaultTarget.created_at,
                    } : undefined,
                  },
                  vaultTarget,
                  userId
                )}
                onClose={() => setVaultTarget(null)}
              />
            )}
            {/* Provenance Certificate Modal */}
            {certTarget && certTarget.artwork && (
              <ProvenanceCertificateModal
                certificate={buildProvenanceCertificate(
                  {
                    id: certTarget.artwork.id,
                    title: certTarget.artwork.title,
                    image_url: certTarget.artwork.image_url,
                    thumbnail_url: certTarget.artwork.thumbnail_url,
                    listing_type: (certTarget.artwork.listing_type as any) || 'fixed',
                    price_torn: certTarget.artwork.price_torn || certTarget.amount,
                    artist_id: certTarget.artwork.artist_id || certTarget.seller_user_id,
                    status: 'sold',
                    created_at: certTarget.created_at,
                    updated_at: certTarget.created_at,
                    artist: certTarget.seller ? {
                      id: certTarget.seller.id,
                      username: certTarget.seller.username,
                      torn_id: certTarget.seller.torn_id,
                      avatar_url: certTarget.seller.avatar_url,
                      created_at: certTarget.created_at,
                      updated_at: certTarget.created_at,
                    } : undefined,
                  },
                  certTarget,
                  userId
                )}
                artworkImageUrl={certTarget.artwork.image_url}
                onClose={() => setCertTarget(null)}
              />
            )}
          </motion.div>
        )}

        {/* WATCHLIST */}
        {activeTab === 'Watchlist' && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--seam)', paddingBottom: 'var(--sp-4)',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  [ SAVED ARTWORKS ]
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '-0.04em', color: 'var(--phosphor)', marginTop: '4px' }}>
                  WATCHLIST ({watchlist.length})
                </div>
              </div>
            </div>

            {watchlistLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'var(--seam)' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ aspectRatio: '4/3' }} />
                ))}
              </div>
            ) : watchlist.length === 0 ? (
              <div style={{
                padding: 'var(--sp-16)', textAlign: 'center',
                border: '1px solid var(--hull)', background: 'var(--plate)',
              }}>
                <Heart size={48} color="var(--dead)" weight="bold" style={{ marginBottom: 'var(--sp-4)' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '-0.04em', color: 'var(--hull)' }}>
                  EMPTY
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', marginTop: '8px' }}>
                  Save artworks from the detail page to see them here.
                </div>
                <Link to="/browse" className="btn btn-primary" style={{ marginTop: 'var(--sp-6)', display: 'inline-flex' }}>
                  Browse Artwork
                </Link>
              </div>
            ) : (
              <div className="artwork-grid">
                {watchlist.map((art) => (
                  <div key={art.id} style={{ position: 'relative' }}>
                    <ArtworkCard artwork={art} />
                    <button
                      onClick={async () => {
                        if (!userId) return;
                        await removeFromWatchlist(userId, art.id);
                        setWatchlist((prev) => prev.filter((a) => a.id !== art.id));
                        toast.info('Removed from Watchlist', `"${art.title}" removed from your saved list.`);
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'rgba(8,8,8,0.8)', backdropFilter: 'blur(4px)',
                        color: 'var(--red-hi)', padding: '4px 8px', fontSize: '0.5rem',
                        border: '1px solid var(--red)',
                      }}
                      title="Remove from watchlist"
                    >
                      <Heart size={10} weight="fill" /> Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ANALYTICS (artist-only) */}
        {activeTab === 'Analytics' && isArtist && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Section header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
              marginBottom: 'var(--sp-6)',
              paddingBottom: 'var(--sp-3)',
              borderBottom: '1px solid var(--seam)',
            }}>
              <ChartBar size={16} weight="bold" style={{ color: 'var(--red)' }} />
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.5625rem',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--shadow-type)',
              }}>
                [ ARTIST ANALYTICS // PERFORMANCE INTELLIGENCE ]
              </div>
            </div>

            {/* Metric cards row */}
            <div className="analytics-metrics-grid">
              <MetricCard
                label="Total Revenue"
                value={revenueStats?.totalRevenue ?? 0}
                prefix="$"
                index="01"
                trend={revenueStats?.revenueGrowth}
              />
              <MetricCard
                label="Artworks Sold"
                value={revenueStats?.totalSales ?? 0}
                index="02"
              />
              <MetricCard
                label="Avg Sale Price"
                value={revenueStats?.avgSalePrice ?? 0}
                prefix="$"
                index="03"
              />
              <MetricCard
                label="Conversion Rate"
                value={artworkPerf && artworkPerf.length > 0
                  ? Math.round(artworkPerf.reduce((s, a) => s + a.conversionRate, 0) / artworkPerf.length * 10) / 10
                  : 0
                }
                suffix="%"
                index="04"
              />
            </div>

            {/* Revenue chart */}
            {revenueStats && (
              <div style={{ marginBottom: 'var(--sp-6)' }}>
                <RevenueChart data={revenueStats.monthlyRevenue} />
              </div>
            )}

            {/* Bottom row: Performance table + Audience panel */}
            <div className="analytics-bottom-grid">
              <div className="analytics-bottom-left">
                <PerformanceTable data={artworkPerf ?? []} />
              </div>
              <div className="analytics-bottom-right">
                <AudiencePanel data={audienceData ?? {
                  totalBuyers: 0,
                  repeatBuyers: 0,
                  repeatRate: 0,
                  topBuyers: [],
                  activityByDay: [0, 0, 0, 0, 0, 0, 0],
                }} />
              </div>
            </div>

            {/* Loading overlay */}
            {(revenueLoading || perfLoading || audienceLoading) && (
              <div style={{
                position: 'fixed', bottom: 'var(--sp-6)', right: 'var(--sp-6)',
                padding: 'var(--sp-3) var(--sp-5)',
                background: 'var(--plate)', border: '1px solid var(--seam)',
                fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                color: 'var(--term-green)', letterSpacing: '0.1em',
                zIndex: 100,
              }}>
                ◈ LOADING ANALYTICS DATA...
              </div>
            )}
          </motion.div>
        )}

        {/* STUDIO HUB (artist-only) */}
        {activeTab === 'Studio' && isArtist && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 'var(--sp-6)',
              paddingBottom: 'var(--sp-4)',
              borderBottom: '1px solid var(--seam)',
              flexWrap: 'wrap',
              gap: 'var(--sp-4)',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.5625rem',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'var(--shadow-type)', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <PenNib size={14} color="var(--red)" weight="bold" />
                  [ ARTIST STUDIO HUB // FORUM SHOP & COMMISSION WORKROOM ]
                </div>
                <h2 className="section-h2" style={{ marginTop: '2px' }}>
                  STUDIO CONTROL CENTER
                </h2>
              </div>

              <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowDashboardForumShop(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: 0 }}
                >
                  <TerminalWindow size={14} weight="bold" />
                  FORUM SHOP BBCODE
                </button>
                <Link
                  to={`/artist/${artistId || 'artist-ahmad-01'}`}
                  className="btn btn-industrial btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: 0 }}
                >
                  <Eye size={14} weight="bold" />
                  VIEW PUBLIC PROFILE
                </Link>
              </div>
            </div>

            {/* Studio Settings & Queue Editor Two-Column Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: 'var(--sp-6)',
              marginBottom: 'var(--sp-8)',
            }}>
              {/* Column 1: Studio Branding Form */}
              <div style={{ background: 'var(--plate)', border: '1px solid var(--hull)', padding: 'var(--sp-6)' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--red)',
                  letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--sp-4)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <Sliders size={14} weight="bold" />
                  STUDIO BRANDING & SLA CONFIG
                </div>

                <form onSubmit={handleSaveStudio} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Studio Display Name
                    </label>
                    <input
                      type="text"
                      className="input-industrial"
                      value={studioFormData.studioName}
                      onChange={(e) => setStudioFormData({ ...studioFormData, studioName: e.target.value })}
                      placeholder="e.g. AHMAD_KAAB // RENAISSANCE ATELIER"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Studio Tagline
                    </label>
                    <input
                      type="text"
                      className="input-industrial"
                      value={studioFormData.tagline}
                      onChange={(e) => setStudioFormData({ ...studioFormData, tagline: e.target.value })}
                      placeholder="e.g. HIGH-FRAME RATE FACTION PROPAGANDA & DYNAMIC 60FPS FORUM SIGNATURES"
                      required
                    />
                  </div>

                  <div className="grid-responsive-2" style={{ gap: 'var(--sp-4)' }}>
                    <div>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Studio Status
                      </label>
                      <select
                        className="input-industrial"
                        value={studioFormData.status}
                        onChange={(e) => setStudioFormData({ ...studioFormData, status: e.target.value as StudioStatus })}
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="open">OPEN (Accepting)</option>
                        <option value="busy">BUSY (High Workload)</option>
                        <option value="waitlist">WAITLIST ONLY</option>
                        <option value="closed">CLOSED</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Typical SLA (Days)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        className="input-industrial"
                        value={studioFormData.turnaroundDays}
                        onChange={(e) => setStudioFormData({ ...studioFormData, turnaroundDays: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Pinned Flagship Masterpiece
                    </label>
                    <select
                      className="input-industrial"
                      value={studioFormData.featuredArtworkId}
                      onChange={(e) => setStudioFormData({ ...studioFormData, featuredArtworkId: e.target.value })}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">-- First Portfolio Artwork (Default) --</option>
                      {myArtworks.map((art) => (
                        <option key={art.id} value={art.id}>
                          {art.title} (${(art.price_torn ?? art.current_bid)?.toLocaleString() ?? 0})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Studio Terms of Service
                    </label>
                    <textarea
                      rows={3}
                      className="input-industrial"
                      value={studioFormData.termsOfService}
                      onChange={(e) => setStudioFormData({ ...studioFormData, termsOfService: e.target.value })}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ marginTop: 'var(--sp-2)', borderRadius: 0, justifyContent: 'center' }}
                  >
                    SAVE STUDIO CONFIGURATION
                  </button>
                </form>
              </div>

              {/* Column 2: Live Queue Controller */}
              <div style={{ background: 'var(--plate)', border: '1px solid var(--hull)', padding: 'var(--sp-6)' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--sp-4)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--red)',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <Lightning size={14} weight="fill" />
                    LIVE COMMISSION SLOTS MANAGER
                  </div>

                  {studio.queueSlots.length < 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newSlot = {
                          id: `slot-${studio.queueSlots.length + 1}`,
                          slotNumber: studio.queueSlots.length + 1,
                          status: 'open' as const,
                        };
                        updateStudio({ queueSlots: [...studio.queueSlots, newSlot] });
                        toast.success('Slot Added', `Queue slot #${newSlot.slotNumber} added.`);
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.625rem', padding: '2px 8px' }}
                    >
                      + ADD SLOT
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', maxHeight: '520px', overflowY: 'auto' }}>
                  {studio.queueSlots.map((slot) => {
                    const isOpen = slot.status === 'open';

                    return (
                      <div
                        key={slot.id}
                        style={{
                          background: 'var(--pit)',
                          border: '1px solid var(--hull)',
                          borderLeft: isOpen ? '3px solid var(--term-green)' : '3px solid var(--red)',
                          padding: 'var(--sp-3) var(--sp-4)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', color: 'var(--phosphor)' }}>
                            SLOT #{slot.slotNumber}
                          </span>

                          <select
                            value={slot.status}
                            onChange={(e) => updateSlot(slot.id, { status: e.target.value as any })}
                            style={{
                              background: 'var(--void)',
                              border: '1px solid var(--hull)',
                              color: slot.status === 'open' ? 'var(--term-green)' : 'var(--red)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.625rem',
                              padding: '2px 6px',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="open">OPEN</option>
                            <option value="in_progress">IN PROGRESS</option>
                            <option value="review">REVIEW</option>
                            <option value="completed">COMPLETED</option>
                          </select>
                        </div>

                        {!isOpen && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <input
                              type="text"
                              className="input-industrial"
                              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                              placeholder="Project Title (e.g. Animated Forum Sig)"
                              value={slot.projectTitle || ''}
                              onChange={(e) => updateSlot(slot.id, { projectTitle: e.target.value })}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                              <input
                                type="text"
                                className="input-industrial"
                                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                placeholder="Client Username"
                                value={slot.clientUsername || ''}
                                onChange={(e) => updateSlot(slot.id, { clientUsername: e.target.value })}
                              />
                              <input
                                type="text"
                                className="input-industrial"
                                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                placeholder="Client Torn ID"
                                value={slot.clientTornId || ''}
                                onChange={(e) => updateSlot(slot.id, { clientTornId: e.target.value })}
                              />
                            </div>

                            {/* Progress slider */}
                            <div style={{ marginTop: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', marginBottom: '2px' }}>
                                <span>Progress</span>
                                <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>{slot.progressPct ?? 50}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={slot.progressPct ?? 50}
                                onChange={(e) => updateSlot(slot.id, { progressPct: Number(e.target.value) })}
                                style={{ width: '100%', accentColor: 'var(--red)', cursor: 'pointer' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Client Preview of Queue Board */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--sp-4)',
                fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                <Eye size={14} color="var(--red)" weight="bold" />
                LIVE CLIENT-FACING QUEUE BOARD PREVIEW
              </div>
              <CommissionQueueBoard
                queueSlots={studio.queueSlots}
                studioStatus={studio.status}
                turnaroundDays={studio.turnaroundDays}
                onRequestCommission={() => toast.info('Client Preview Mode', 'This button opens the commission modal on your public profile.')}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Torn Forum Shop Thread Modal from Dashboard */}
      {showDashboardForumShop && (
        <ForumShopModal
          studio={studio}
          artist={{
            id: artistId || 'artist-ahmad-01',
            username: user?.name || 'Artist',
            torn_id: user?.player_id ? String(user.player_id) : undefined,
            avatar_url: user?.profile_image,
            is_verified: true,
            tier: 'master',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }}
          featuredArt={myArtworks.find((a) => a.id === studio.featuredArtworkId) || myArtworks[0]}
          onClose={() => setShowDashboardForumShop(false)}
        />
      )}
    </main>
  );
}

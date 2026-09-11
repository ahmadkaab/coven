import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft, CheckCircle, Lightning, Heart, ShareNetwork, Clock, X, MagnifyingGlassPlus, TerminalWindow,
  LockKey, ArrowsLeftRight, Certificate, Sparkle, DownloadSimple, Chats
} from '@phosphor-icons/react';
import { useArtwork, useBidHistory, usePlaceBid, queryKeys } from '../hooks/useData';
import { subscribeToAuction } from '../services/artworkService';
import { subscribeToBids, placeBid as placeBidService } from '../services/bidService';
import { getWallet, convertCreditsToXanax } from '../services/walletService';
import { addToWatchlist, removeFromWatchlist, isWatchlisted } from '../services/watchlistService';
import { getUserTransactions, type ExtendedTransaction } from '../services/transactionService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Countdown } from '../components/common/Countdown';
import { StarRating } from '../components/common/StarRating';
import { PurchaseModal } from '../components/artwork/PurchaseModal';
import { BBCodeModal } from '../components/common/BBCodeModal';
import { WatermarkOverlay } from '../components/artwork/WatermarkOverlay';
import { SplitViewSlider } from '../components/artwork/SplitViewSlider';
import { ProvenanceCertificateModal } from '../components/artwork/ProvenanceCertificateModal';
import { VaultUnlockModal } from '../components/artwork/VaultUnlockModal';
import { useVaultClearance, useProvenance, useWatermarkSettings } from '../hooks/useVault';
import { generateArtworkBBCode } from '../utils/bbcode';
import { generateArtworkTornHtml } from '../utils/tornHtml';
import { formatTornCash, timeAgo } from '../utils/format';
import type { Artwork } from '../types';

/* ── Skeleton ──────────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <main className="page-content">
      <div className="container" style={{ paddingTop: 'var(--sp-8)' }}>
        <div className="artwork-detail-layout">
          <div className="skeleton" style={{ aspectRatio: '4/3' }} />
          <div style={{ background: 'var(--plate)', padding: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            <div className="skeleton" style={{ height: 40, width: '80%' }} />
            <div className="skeleton" style={{ height: 20, width: '50%' }} />
            <div className="skeleton" style={{ height: 100 }} />
            <div className="skeleton" style={{ height: 48 }} />
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Bid Row ───────────────────────────────────────────────── */
function BidRow({ amount, username, time, isTop }: { amount: number; username: string; time: string; isTop: boolean }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto auto',
      gap: 'var(--sp-4)', padding: 'var(--sp-3) var(--sp-4)',
      background: isTop ? 'rgba(230,25,25,0.06)' : 'var(--void)',
      borderLeft: isTop ? '2px solid var(--red)' : '2px solid transparent',
      alignItems: 'center',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ghost)' }}>
        {username}
      </span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: isTop ? 'var(--red-hi)' : 'var(--phosphor)', letterSpacing: '-0.02em' }}>
        {formatTornCash(amount)}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)' }}>
        {timeAgo(time)}
      </span>
    </div>
  );
}

/* ── Buy Panel ─────────────────────────────────────────────── */
function BuyPanel({
  artwork,
  userId,
  onStatusChange,
}: {
  artwork: Artwork;
  userId: string | null;
  onStatusChange?: (status: Artwork['status']) => void;
}) {
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError]   = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const tornId = userId || '4295891';
  const wallet = userId ? getWallet(userId, tornId) : null;

  const isAuction   = artwork.listing_type === 'auction';
  const isAvailable = artwork.status === 'available';
  const isReserved  = artwork.status === 'reserved';
  const isSold      = artwork.status === 'sold';
  const isBlind     = !!artwork.is_blind && !artwork.revealed;

  const currentCr   = artwork.current_bid_cr || (artwork.price_cr ?? (artwork.current_bid ? Math.round(artwork.current_bid / 835) : 1000));
  const minBidCr    = artwork.current_bid_cr ? artwork.current_bid_cr + 100 : currentCr;

  const handleBid = async () => {
    const amount = parseInt(bidAmount.replace(/\D/g, ''), 10);
    if (!userId) { navigate('/login'); return; }
    if (!amount || amount < minBidCr) {
      setBidError(`Min bid: ${minBidCr.toLocaleString()} CR (${convertCreditsToXanax(minBidCr)} XAN)`);
      return;
    }

    if (wallet && wallet.balance_cr < amount) {
      setBidError(`Insufficient Escrow Credits (${wallet.balance_cr.toLocaleString()} CR available). Deposit Xanax in Treasury to bid.`);
      return;
    }

    setBidError('');
    setSubmittingBid(true);
    try {
      await placeBidService({
        artworkId: artwork.id,
        bidderId: userId,
        bidderTornId: tornId,
        bidderUsername: 'Collector',
        amountCr: amount,
        isBlind: artwork.is_blind,
        artworkTitle: artwork.title,
      });
      toast.success('Escrow Bid Placed!', `Locked ${amount.toLocaleString()} CR in Escrow for your bid.`);
      setBidAmount('');
    } catch (e: any) {
      setBidError(e.message);
      toast.error('Bid Failed', e.message);
    } finally {
      setSubmittingBid(false);
    }
  };

  if (isSold) {
    return (
      <div style={{ padding: 'var(--sp-8)', textAlign: 'center', background: 'var(--plate)', border: '1px solid var(--hull)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', textTransform: 'uppercase', color: 'var(--hull)', letterSpacing: '-0.04em' }}>SOLD</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', marginTop: '8px' }}>This artwork has been sold</div>
      </div>
    );
  }

  if (isReserved) {
    return (
      <div style={{ padding: 'var(--sp-8)', textAlign: 'center', background: 'var(--plate)', border: '1px solid var(--amber)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', textTransform: 'uppercase', color: 'var(--amber)', letterSpacing: '-0.04em' }}>
          RESERVED / PENDING
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)', marginTop: '8px' }}>
          This artwork is currently reserved pending settlement
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--plate)', border: '1px solid var(--hull)' }}>
      {/* Price / bid header */}
      <div style={{ padding: 'var(--sp-5) var(--sp-6)', borderBottom: '1px solid var(--seam)', background: 'var(--pit)' }}>
        {isAuction ? (
          <div>
            {isBlind && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '0.5625rem', fontFamily: 'var(--font-mono)',
                color: 'var(--crimson)', background: 'rgba(230,25,25,0.1)',
                border: '1px solid rgba(230,25,25,0.3)', padding: '2px 6px',
                borderRadius: '2px', marginBottom: '8px', letterSpacing: '0.08em'
              }}>
                ● SEALED BLIND AUCTION
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--seam)' }}>
              <div style={{ background: 'var(--pit)', padding: 'var(--sp-4)' }}>
                <div className="artwork-price-label">Current Bid</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)', lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--phosphor)' }}>
                  {currentCr.toLocaleString()} <span style={{ fontSize: '0.875rem', color: 'var(--crimson)', fontFamily: 'var(--font-mono)' }}>CR</span>
                </div>
                <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', marginTop: '4px' }}>
                  ≈ {convertCreditsToXanax(currentCr)} Xanax (5% platform fee)
                </div>
              </div>
              <div style={{ background: 'var(--pit)', padding: 'var(--sp-4)' }}>
                <div className="artwork-price-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={10} weight="bold" />Ends in
                </div>
                {artwork.auction_end_time ? (
                  <Countdown endTime={artwork.auction_end_time} />
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ghost)', fontSize: '0.875rem' }}>—</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: 'var(--sp-4)' }}>
            <div className="artwork-price-label">Fixed Price</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--phosphor)' }}>
              {artwork.price_cr ? `${artwork.price_cr.toLocaleString()} CR` : artwork.price_torn ? formatTornCash(artwork.price_torn) : 'Contact Artist'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', marginTop: '4px' }}>
              {artwork.price_cr ? `≈ ${convertCreditsToXanax(artwork.price_cr)} XANAX STANDARD` : 'TORN CASH'}
            </div>
          </div>
        )}
      </div>

      {/* Action area */}
      <div style={{ padding: 'var(--sp-6)' }}>
        {isAuction && isAvailable && (
          <div style={{ marginBottom: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label htmlFor="bid-input" className="form-label" style={{ margin: 0 }}>
                Your Bid in CR (min {minBidCr.toLocaleString()} CR)
              </label>
              {wallet && (
                <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
                  Balance: {wallet.balance_cr.toLocaleString()} CR
                </span>
              )}
            </div>
            <input
              id="bid-input"
              type="text"
              className="form-input"
              placeholder={`${minBidCr.toLocaleString()}`}
              value={bidAmount}
              onChange={(e) => { setBidAmount(e.target.value); setBidError(''); }}
            />
            {bidError && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--red-hi)', marginTop: '6px' }}>
                ✗ {bidError}
              </div>
            )}
            {wallet && wallet.balance_cr < minBidCr && (
              <div style={{ marginTop: '8px' }}>
                <Link
                  to="/wallet"
                  className="btn btn-sm btn-industrial"
                  style={{ width: '100%', fontSize: '0.625rem', padding: '6px', justifyContent: 'center' }}
                >
                  ⚡ Deposit Xanax in Escrow Treasury
                </Link>
              </div>
            )}
          </div>
        )}

        {isAvailable && (
          <button
            className="renaissance-btn-primary"
            style={{ width: '100%', justifyContent: 'center', borderRadius: '6px', padding: '14px', fontSize: '0.8125rem' }}
            onClick={() => {
              if (isAuction) {
                handleBid();
              } else {
                if (!userId) { navigate('/login'); return; }
                setShowPurchase(true);
              }
            }}
            disabled={submittingBid}
          >
            {submittingBid ? 'LOCKING ESCROW...' : isAuction ? (
              <><Lightning size={16} weight="fill" />PLACE ESCROW BID ({currentCr.toLocaleString()} CR &bull; {currentCr / 1000} XAN)</>
            ) : (
              artwork.price_cr ? `BUY NOW — ${artwork.price_cr.toLocaleString()} CR (${(artwork.price_cr / 1000).toLocaleString()} XAN)` : artwork.price_torn ? `BUY NOW — ${formatTornCash(artwork.price_torn)}` : 'BUY NOW'
            )}
          </button>
        )}

        {artwork.artist && (
          <button
            type="button"
            className="btn btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'center',
              borderRadius: 0,
              padding: 'var(--sp-3)',
              marginTop: 'var(--sp-2)',
              gap: '6px',
              fontSize: '0.6875rem',
              borderColor: 'rgba(0, 255, 100, 0.3)',
              color: 'var(--phosphor)',
            }}
            onClick={() => {
              if (!userId) { navigate('/login'); return; }
              navigate(`/dispatches?artistId=${artwork.artist?.id}&artworkId=${artwork.id}`);
            }}
            title="Open direct encrypted inquiry with the artist on The Wire"
          >
            <Chats size={14} weight="bold" color="var(--term-green)" />
            MESSAGE ARTIST
          </button>
        )}

        <button
          type="button"
          className="btn btn-ghost"
          style={{
            width: '100%',
            justifyContent: 'center',
            borderRadius: 0,
            padding: 'var(--sp-3)',
            marginTop: 'var(--sp-2)',
            gap: '6px',
            fontSize: '0.6875rem',
            borderColor: 'rgba(225, 29, 72, 0.3)',
            color: 'var(--phosphor)',
          }}
          onClick={() => {
            navigate('/trade');
          }}
          title="Propose an artwork or credit trade"
        >
          <ArrowsLeftRight size={14} weight="bold" color="var(--red)" />
          PROPOSE TRADE SWAP
        </button>

        {/* Torn verification note */}
        <div style={{
          marginTop: 'var(--sp-4)', padding: 'var(--sp-3) var(--sp-4)',
          borderLeft: '2px solid var(--term-green)',
          background: 'rgba(0,255,100,0.03)',
        }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
            <CheckCircle size={12} color="var(--term-green)" weight="fill" style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', lineHeight: 1.6 }}>
              Payments sent via Torn. Transaction verified through Torn API logs. No third-party escrow.
            </span>
          </div>
        </div>
      </div>

      {showPurchase && (
        <PurchaseModal
          artwork={artwork}
          onClose={() => setShowPurchase(false)}
          onSuccess={() => {
            if (onStatusChange) onStatusChange('reserved');
          }}
        />
      )}
    </div>
  );
}

/* ── MAIN PAGE ─────────────────────────────────────────────── */
export function ArtworkDetail() {
  const { id } = useParams<{ id: string }>();
  const { userId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const queryClient = useQueryClient();
  const [liveArtwork, setLiveArtwork] = useState<Partial<Artwork>>({});
  const [showBBCode, setShowBBCode] = useState(false);
  const [viewMode, setViewMode] = useState<'watermark' | 'split' | 'clean'>('watermark');
  const [showCertificate, setShowCertificate] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [userTransactions, setUserTransactions] = useState<ExtendedTransaction[]>([]);

  const { data: artwork, isLoading, error } = useArtwork(id ?? '');
  const { data: bids = [] } = useBidHistory(id ?? '');

  // Vault & Provenance clearance hooks
  const clearance = useVaultClearance(artwork ?? null, userId, userTransactions);
  const provenance = useProvenance(artwork ?? null, null, userId);
  const watermark = useWatermarkSettings('MATRIX_GRID');

  // Load user transactions to verify buyer ownership
  useEffect(() => {
    if (userId) {
      getUserTransactions(userId).then(setUserTransactions).catch(() => {});
    }
  }, [userId]);

  // Watchlist & Lightbox state
  const [saved, setSaved] = useState(false);
  const [savingWatch, setSavingWatch] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen]);

  useEffect(() => {
    if (!userId || !id) return;
    isWatchlisted(userId, id).then(setSaved);
  }, [userId, id]);

  // Real-time auction & bids subscription with live outbid alerts
  useEffect(() => {
    if (!id || !artwork?.listing_type || artwork.listing_type !== 'auction') return;

    const auctionChannel = subscribeToAuction(id, (update) => setLiveArtwork(update));

    const bidChannel = subscribeToBids(id, (newBid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bids(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.artwork(id) });

      setLiveArtwork((prev) => ({
        ...prev,
        current_bid: newBid.amount,
        bid_count: (prev?.bid_count ?? artwork?.bid_count ?? 0) + 1,
      }));

      // Check if current user is involved
      const userHasBid = bids.some((b) => b.bidder_id === userId);
      const isMyBid = newBid.bidder_id === userId;

      if (!isMyBid) {
        if (userHasBid) {
          toast.warning(
            'OUTBID ALERT!',
            `A higher bid of ${formatTornCash(newBid.amount)} was placed on this artwork!`
          );
        } else {
          toast.info(
            'New Bid Placed',
            `Auction received a bid of ${formatTornCash(newBid.amount)}.`
          );
        }
      }
    });

    return () => {
      auctionChannel.unsubscribe();
      bidChannel.unsubscribe();
    };
  }, [id, artwork?.listing_type, artwork?.bid_count, bids, userId, queryClient, toast]);

  // Merged artwork with live updates
  const merged: Artwork | null = artwork ? { ...artwork, ...liveArtwork } : null;

  if (isLoading) return <DetailSkeleton />;

  if (error || !merged) {
    return (
      <main className="page-content">
        <div className="container" style={{ paddingTop: 'var(--sp-20)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--hull)', textTransform: 'uppercase', letterSpacing: '-0.04em' }}>
            NOT FOUND
          </div>
          <Link to="/browse" className="btn btn-industrial" style={{ marginTop: 'var(--sp-6)', display: 'inline-flex' }}>
            <ArrowLeft size={12} weight="bold" />Browse
          </Link>
        </div>
      </main>
    );
  }

  const tags = merged.tags ?? [];

  return (
    <main className="page-content" style={{ paddingBottom: 'var(--sp-20)' }}>
      <div className="container" style={{ paddingTop: 'var(--sp-8)' }}>
        {/* Renaissance Rubric Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)', flexWrap: 'wrap', gap: '12px' }}>
          <Link
            to="/browse"
            className="renaissance-btn-gold"
            style={{
              fontSize: '0.6875rem', padding: '6px 14px', gap: '6px'
            }}
          >
            <ArrowLeft size={12} weight="bold" /> Return to Marketplace
          </Link>
          <div className="renaissance-chapter-tag" style={{ margin: 0 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-magenta)', display: 'inline-block', boxShadow: '0 0 8px var(--neon-magenta)' }} />
            ARTWORK DETAILS &bull; VERIFIED PROVENANCE
          </div>
        </div>

        {/* Main grid: image | sidebar */}
        <motion.div
          className="artwork-detail-layout"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* LEFT — image + details below */}
          <div style={{ background: 'var(--void)', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {/* Protection & Inspection Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: 'var(--pit)',
              borderBottom: '1px solid var(--seam)',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              {/* Left: View Mode Toggle */}
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', marginRight: '6px', textTransform: 'uppercase' }}>
                  VIEW:
                </span>
                <button
                  type="button"
                  onClick={() => setViewMode('watermark')}
                  className="btn btn-sm"
                  style={{
                    background: viewMode === 'watermark' ? 'var(--red)' : 'var(--plate)',
                    color: viewMode === 'watermark' ? '#fff' : 'var(--ghost)',
                    padding: '3px 8px',
                    fontSize: '0.625rem',
                    borderRadius: 0,
                    border: '1px solid var(--seam)',
                  }}
                  title="Show watermarked preview"
                >
                  <LockKey size={11} weight="bold" /> PROTECTED
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className="btn btn-sm"
                  style={{
                    background: viewMode === 'split' ? 'var(--red)' : 'var(--plate)',
                    color: viewMode === 'split' ? '#fff' : 'var(--ghost)',
                    padding: '3px 8px',
                    fontSize: '0.625rem',
                    borderRadius: 0,
                    border: '1px solid var(--seam)',
                  }}
                  title="Interactive split-slider before/after inspection"
                >
                  <ArrowsLeftRight size={11} weight="bold" /> SPLIT SLIDER
                </button>
                {clearance.hasAccess && (
                  <button
                    type="button"
                    onClick={() => setViewMode('clean')}
                    className="btn btn-sm"
                    style={{
                      background: viewMode === 'clean' ? 'var(--term-green)' : 'var(--plate)',
                      color: viewMode === 'clean' ? '#000' : 'var(--term-green)',
                      padding: '3px 8px',
                      fontSize: '0.625rem',
                      borderRadius: 0,
                      border: '1px solid var(--term-green)',
                      fontWeight: 600,
                    }}
                    title="View unwatermarked clean master"
                  >
                    <Sparkle size={11} weight="fill" /> CLEAN MASTER
                  </button>
                )}
              </div>

              {/* Right: Watermark Preset Cycler */}
              {viewMode !== 'clean' && (
                <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', marginRight: '4px' }}>
                    STENCIL:
                  </span>
                  {(['MATRIX_GRID', 'SECTOR_STENCIL', 'SECURITY_CREST'] as const).map((pst) => (
                    <button
                      key={pst}
                      type="button"
                      onClick={() => watermark.setStyle(pst)}
                      style={{
                        background: watermark.style === pst ? 'var(--hull)' : 'transparent',
                        color: watermark.style === pst ? 'var(--phosphor)' : 'var(--ghost)',
                        border: '1px solid var(--seam)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.5rem',
                        padding: '2px 6px',
                        cursor: 'pointer',
                      }}
                    >
                      {pst === 'MATRIX_GRID' ? 'GRID' : pst === 'SECTOR_STENCIL' ? 'STENCIL' : 'CREST'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Image / Inspection Display */}
            {viewMode === 'split' && merged.image_url ? (
              <SplitViewSlider
                imageUrl={merged.image_url}
                title={merged.title}
                artistName={merged.artist?.username}
                artistTornId={merged.artist?.torn_id}
                artworkId={merged.id}
                watermarkStyle={watermark.style}
                isUnlocked={clearance.hasAccess}
              />
            ) : (
              <div
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  aspectRatio: '4/3',
                  cursor: merged.image_url ? 'zoom-in' : 'default',
                }}
                onClick={() => { if (merged.image_url) setLightboxOpen(true); }}
                title={merged.image_url ? 'Click to inspect high-resolution artwork' : undefined}
              >
                {merged.image_url ? (
                  <img src={merged.image_url} alt={merged.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--hull)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--dead)', textTransform: 'uppercase' }}>NO IMAGE</span>
                  </div>
                )}

                {/* Watermark Overlay (active when viewMode is 'watermark') */}
                {viewMode === 'watermark' && merged.image_url && (
                  <WatermarkOverlay
                    style={watermark.style}
                    artistName={merged.artist?.username}
                    artistTornId={merged.artist?.torn_id}
                    artworkId={merged.id}
                    opacity={watermark.activePreset.opacity}
                  />
                )}

                {/* Expand badge */}
                {merged.image_url && (
                  <div style={{
                    position: 'absolute', bottom: 8, right: 8,
                    background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(4px)',
                    border: '1px solid var(--hull)', color: 'var(--ghost)',
                    padding: '4px 8px', fontSize: '0.5625rem', fontFamily: 'var(--font-mono)',
                    display: 'flex', alignItems: 'center', gap: '4px', pointerEvents: 'none',
                    zIndex: 6,
                  }}>
                    <MagnifyingGlassPlus size={12} weight="bold" /> EXPAND
                  </div>
                )}
                {/* Status badge */}
                <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', gap: '1px', zIndex: 6 }}>
                  {merged.status === 'available' && merged.listing_type === 'auction' && (
                    <span className="badge badge-live" style={{ padding: '6px 10px' }}>
                      <Lightning size={10} weight="fill" />LIVE
                    </span>
                  )}
                  {merged.status === 'sold' && <span className="badge badge-sold" style={{ padding: '6px 10px' }}>SOLD</span>}
                </div>
              </div>
            )}

            {/* Details row */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-5) var(--sp-6)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--sp-4)' }}>
                [ ARTWORK DETAILS ]
              </div>
              <div className="grid-responsive-4" style={{ gap: '1px', background: 'var(--seam)' }}>
                {[
                  { label: 'Listing',  value: merged.listing_type?.toUpperCase() },
                  { label: 'Views',    value: (merged.view_count ?? 0).toLocaleString() },
                  { label: 'Listed',   value: timeAgo(merged.created_at) },
                  { label: 'NSFW',     value: merged.is_nsfw ? 'YES' : 'CLEAN' },
                ].map((d) => (
                  <div key={d.label} style={{ background: 'var(--pit)', padding: 'var(--sp-3) var(--sp-4)' }}>
                    <div className="artwork-price-label">{d.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--phosphor)', marginTop: '4px' }}>{d.value}</div>
                  </div>
                ))}
              </div>
              {tags.length > 0 && (
                <div style={{ display: 'flex', gap: '1px', flexWrap: 'wrap', marginTop: 'var(--sp-4)', background: 'var(--seam)' }}>
                  {tags.map((t) => <span key={t} className="badge badge-edition">#{t}</span>)}
                </div>
              )}
            </div>

            {/* Bid history (auction only) */}
            {merged.listing_type === 'auction' && bids.length > 0 && (
              <div style={{ background: 'var(--plate)' }}>
                <div style={{ padding: 'var(--sp-4) var(--sp-6)', borderBottom: '1px solid var(--seam)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    [ BID HISTORY — {bids.length} BIDS ]
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--seam)' }}>
                  {bids.map((bid, i) => (
                    <BidRow
                      key={bid.id}
                      amount={bid.amount}
                      username={merged.is_blind && !merged.revealed
                        ? (bid.blind_alias || `Collector #${i + 1}`)
                        : ((bid.bidder as any)?.username ?? 'Anonymous')}
                      time={bid.created_at}
                      isTop={i === 0}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — sidebar */}
          <div className="artwork-detail-sidebar">
            {/* Title + artist */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-6)' }}>
              <h1 style={{
                fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.5rem, 3vw, 2.4rem)',
                lineHeight: 1.1, letterSpacing: '0.02em',
                color: 'var(--phosphor)', marginBottom: 'var(--sp-4)',
              }}>
                {merged.title}
              </h1>

              {merged.is_blind && !merged.revealed ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                  padding: '12px 14px', background: 'rgba(230, 25, 25, 0.05)',
                  border: '1px dashed rgba(230, 25, 25, 0.35)', borderRadius: '3px'
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '3px', background: 'var(--void)',
                    border: '1px solid var(--crimson)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--crimson)', fontWeight: 700
                  }}>
                    ?
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--crimson)' }}>
                      {merged.blind_cipher || 'Masked Artisan'}
                    </div>
                    <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
                      SEALED BLIND ARTIST · ZERO BIAS
                    </div>
                  </div>
                  <span style={{
                    marginLeft: 'auto', fontSize: '0.5625rem', fontFamily: 'var(--font-mono)',
                    background: 'rgba(230, 25, 25, 0.15)', color: 'var(--crimson)', border: '1px solid rgba(230, 25, 25, 0.35)',
                    padding: '2px 6px', borderRadius: '2px', letterSpacing: '0.06em'
                  }}>
                    MASKED
                  </span>
                </div>
              ) : (
                merged.artist && (
                  <Link
                    to={`/artist/${merged.artist.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', textDecoration: 'none' }}
                  >
                    {merged.artist.avatar_url ? (
                      <img src={merged.artist.avatar_url} alt={merged.artist.username} style={{ width: 40, height: 40, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div className="artist-avatar-placeholder" style={{ width: 40, height: 40, fontSize: '0.875rem' }}>
                        {merged.artist.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--phosphor)' }}>
                        {merged.artist.username}
                      </div>
                      <StarRating rating={merged.artist.average_rating ?? 0} count={merged.artist.total_reviews ?? 0} size={10} />
                    </div>
                    {merged.artist.tier && (
                      <span className={`badge badge-${merged.artist.tier}`} style={{ marginLeft: 'auto' }}>
                        {merged.artist.tier.toUpperCase()}
                      </span>
                    )}
                  </Link>
                )
              )}
            </div>

            {/* Buy/Bid panel */}
            <BuyPanel
              artwork={merged}
              userId={userId}
              onStatusChange={(newStatus) => setLiveArtwork((prev) => ({ ...prev, status: newStatus }))}
            />

            {/* COVEN Art Vault & Provenance Card */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-5) var(--sp-6)', borderTop: '1px solid var(--seam)' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5625rem',
                color: 'var(--shadow-type)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 'var(--sp-4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span>[ VAULT ACCESS &amp; PROVENANCE ]</span>
                {clearance.hasAccess ? (
                  <span style={{ color: 'var(--term-green)', fontWeight: 'bold' }}>● UNLOCKED</span>
                ) : (
                  <span style={{ color: 'var(--red-hi)' }}>○ LOCKED (BUY TO UNLOCK)</span>
                )}
              </div>

              {/* Vault status box */}
              <div style={{
                background: 'var(--pit)',
                border: clearance.hasAccess ? '1px solid var(--term-green)' : '1px solid var(--seam)',
                padding: '12px',
                marginBottom: 'var(--sp-3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {clearance.hasAccess ? (
                      <Sparkle size={14} color="var(--term-green)" weight="fill" />
                    ) : (
                      <LockKey size={14} color="var(--red-hi)" weight="bold" />
                    )}
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      letterSpacing: '0.08em',
                      color: clearance.hasAccess ? 'var(--term-green)' : 'var(--phosphor)',
                      fontWeight: 600,
                    }}>
                      {clearance.hasAccess ? 'VAULT ACCESS UNLOCKED' : 'ORIGINAL HIGH-RES LOCKED'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={clearance.toggleDemo}
                    style={{
                      background: 'transparent',
                      border: '1px dashed var(--seam)',
                      color: clearance.isDemoUnlocked ? 'var(--red-hi)' : 'var(--ghost)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.5rem',
                      padding: '2px 6px',
                      cursor: 'pointer',
                    }}
                    title="Toggle demo unlock mode for testing"
                  >
                    {clearance.isDemoUnlocked ? 'LOCK VAULT' : '⚡ DEMO UNLOCK'}
                  </button>
                </div>

                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  color: 'var(--ghost)',
                  lineHeight: 1.5,
                  marginBottom: clearance.hasAccess ? '10px' : '0',
                }}>
                  {clearance.hasAccess
                    ? 'Full resolution master asset unwatermarked. Ready for forum BBCode export and download.'
                    : 'Unwatermarked original resolution asset is protected in the COVEN vault until purchased.'}
                </div>

                {clearance.hasAccess && (
                  <button
                    type="button"
                    onClick={() => setShowVaultModal(true)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center', gap: '6px', borderRadius: 0 }}
                  >
                    <DownloadSimple size={13} weight="bold" /> DOWNLOAD MASTER ARTWORK
                  </button>
                )}
              </div>

              {/* Provenance Certificate Trigger Card */}
              {provenance && (
                <div style={{
                  background: 'var(--pit)',
                  border: '1px solid var(--seam)',
                  padding: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)' }}>
                      CERTIFICATE #{provenance.serialNumber.slice(-8)}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--term-green)' }}>
                      AUTHENTIC_VERIFIED
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    color: 'var(--phosphor)',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    HASH: {provenance.sha256Hash}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCertificate(true)}
                    className="btn btn-industrial btn-sm"
                    style={{ width: '100%', justifyContent: 'center', gap: '6px', borderRadius: 0 }}
                  >
                    <Certificate size={13} color="var(--term-green)" /> VIEW CERTIFICATE OF AUTHENTICITY
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            {merged.description && (
              <div style={{ background: 'var(--plate)', padding: 'var(--sp-5) var(--sp-6)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>
                  [ ABOUT THIS PIECE ]
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--ghost)', lineHeight: 1.8 }}>
                  {merged.description}
                </p>
              </div>
            )}

            {/* Share */}
            {/* Action buttons: Share | Forum BBCode | Save */}
            <div style={{ background: 'var(--plate)', padding: 'var(--sp-4) var(--sp-6)', display: 'flex', gap: 'var(--sp-3)' }}>
              <button
                className="btn btn-ghost btn-sm"
                style={{
                  flex: 1, justifyContent: 'center', gap: '6px',
                  color: copied ? 'var(--term-green)' : undefined,
                  borderColor: copied ? 'var(--term-green)' : undefined,
                }}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  toast.success('Link Copied!', 'Artwork URL copied to your clipboard.');
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                <ShareNetwork size={12} weight="bold" />{copied ? 'Copied Link!' : 'Share'}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ flex: 1, justifyContent: 'center', gap: '6px' }}
                onClick={() => setShowBBCode(true)}
                title="Export formatted Raw HTML / BBCode for Torn City forums"
              >
                <TerminalWindow size={12} weight="bold" />Torn HTML
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{
                  flex: 1, justifyContent: 'center', gap: '6px',
                  color: saved ? 'var(--red-hi)' : undefined,
                  borderColor: saved ? 'var(--red)' : undefined,
                }}
                disabled={savingWatch}
                onClick={async () => {
                  if (!userId) { navigate('/login'); return; }
                  if (!id) return;
                  setSavingWatch(true);
                  try {
                    if (saved) {
                      await removeFromWatchlist(userId, id);
                      setSaved(false);
                      toast.info('Removed from Watchlist', `"${merged.title}" removed from your saved list.`);
                    } else {
                      await addToWatchlist(userId, id);
                      setSaved(true);
                      toast.success('Saved to Watchlist', `"${merged.title}" saved to your Watchlist.`);
                    }
                  } catch {
                    toast.error('Watchlist Error', 'Could not update watchlist.');
                  }
                  setSavingWatch(false);
                }}
              >
                <Heart size={12} weight={saved ? 'fill' : 'bold'} />{saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* High-Resolution Lightbox Modal */}
        {lightboxOpen && merged.image_url && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(5,5,5,0.96)', backdropFilter: 'blur(12px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: 'var(--sp-6)',
            }}
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              style={{
                position: 'absolute', top: 24, right: 24,
                background: 'var(--void)', border: '1px solid var(--seam)',
                color: 'var(--phosphor)', padding: '8px 14px',
                fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <X size={14} weight="bold" /> CLOSE [ESC]
            </button>
            <div
              style={{ maxWidth: '90vw', maxHeight: '80vh', position: 'relative' }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={merged.image_url}
                alt={merged.title}
                style={{
                  maxWidth: '100%', maxHeight: '80vh',
                  objectFit: 'contain',
                  border: '1px solid var(--seam)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.9)',
                }}
              />
              <div style={{
                marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)',
              }}>
                <span style={{ textTransform: 'uppercase', color: 'var(--phosphor)', fontWeight: 600 }}>{merged.title}</span>
                <span>{merged.artist?.username ? `BY ${merged.artist.username.toUpperCase()}` : ''}</span>
              </div>
            </div>
          </div>
        )}

        {/* Provenance Certificate of Authenticity Modal */}
        {showCertificate && provenance && (
          <ProvenanceCertificateModal
            certificate={provenance}
            artworkImageUrl={merged.image_url}
            onClose={() => setShowCertificate(false)}
          />
        )}

        {/* Master Asset Vault Decryption Modal */}
        {showVaultModal && (
          <VaultUnlockModal
            artwork={merged}
            certificate={provenance}
            onClose={() => setShowVaultModal(false)}
            onOpenCertificate={() => setShowCertificate(true)}
          />
        )}

        {/* Torn City Forum Raw HTML / BBCode Modal */}
        {showBBCode && (
          <BBCodeModal
            title={`FORUM CARD // ${merged.title.toUpperCase()}`}
            subtitle="Formatted for Torn City Graphic & Art Design forums (600px)"
            bbcode={generateArtworkBBCode(merged)}
            rawHtml={generateArtworkTornHtml(merged)}
            onClose={() => setShowBBCode(false)}
          />
        )}
      </div>
    </main>
  );
}

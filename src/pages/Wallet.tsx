import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Lightning, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  Clock, CheckCircle, WarningCircle, Coins, LockKey, 
  IdentificationCard, ArrowsLeftRight, HandCoins
} from '@phosphor-icons/react';
import { useAuthStore } from '../store/authStore';
import { 
  getWallet, submitDeposit, requestWithdrawal, 
  getWalletTransactions, convertCreditsToXanax, 
  TREASURY_OFFICIAL, TREASURY_TORN_ID, CR_PER_XANAX
} from '../services/walletService';
import { syncTornDeposits, simulateIncomingTornTransfer, getLastSyncTime } from '../services/tornDepositSync';
import { useToast } from '../context/ToastContext';
import { BankerDeskModal } from '../components/wallet/BankerDeskModal';
import type { Wallet as WalletType, WalletTransaction } from '../types';

export function Wallet() {
  const { user, apiKey } = useAuthStore();
  const { addToast } = useToast();

  const userId = user ? String(user.player_id) : 'demo-collector';
  const tornId = user ? String(user.player_id) : '4295891';
  const username = user ? user.name : 'ahmad_kaab';

  const [wallet, setWallet] = useState<WalletType | null>(() => getWallet(userId, tornId));
  const [txs, setTxs] = useState<WalletTransaction[]>(() => getWalletTransactions(userId));
  const [withdrawCr, setWithdrawCr] = useState('');
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [bankerDeskOpen, setBankerDeskOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(() => getLastSyncTime());

  // Sync wallet state on changes
  useEffect(() => {
    const refresh = () => {
      setWallet(getWallet(userId, tornId));
      setTxs(getWalletTransactions(userId));
      setLastSync(getLastSyncTime());
    };
    refresh();
    window.addEventListener('coven:wallet_update', refresh);
    window.addEventListener('coven:deposit_sync_complete', refresh);
    return () => {
      window.removeEventListener('coven:wallet_update', refresh);
      window.removeEventListener('coven:deposit_sync_complete', refresh);
    };
  }, [userId, tornId]);

  const handleSyncTorn = async () => {
    setIsSyncing(true);
    try {
      const res = await syncTornDeposits(apiKey || undefined, userId);
      addToast({
        type: res.newDepositsCount > 0 ? 'success' : 'info',
        title: 'Torn Transfer Sync',
        message: res.message,
      });
      setLastSync(res.lastSyncAt);
    } catch {
      addToast({ type: 'error', title: 'Sync Error', message: 'Could not connect to Torn API event stream.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSimulateTestDeposit = () => {
    const res = simulateIncomingTornTransfer({
      senderTornId: tornId,
      senderName: username,
      xanaxCount: 5,
      userId,
    });
    addToast({
      type: 'success',
      title: 'Transfer Auto-Credited',
      message: res.message,
    });
  };

  /* ── Withdrawal Request ───────────────────────────────────── */
  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(withdrawCr, 10);
    if (!amount || isNaN(amount) || amount <= 0) {
      addToast({ type: 'error', title: 'Invalid Amount', message: 'Please enter a valid credit amount.' });
      return;
    }

    if (!wallet) {
      addToast({ type: 'error', title: 'Authentication Required', message: 'Please log in with your Torn account to withdraw.' });
      return;
    }

    if (amount > wallet.balance_cr) {
      addToast({ type: 'error', title: 'Insufficient Credits', message: `You have ${wallet.balance_cr.toLocaleString()} CR available.` });
      return;
    }

    if (amount < CR_PER_XANAX) {
      addToast({ type: 'error', title: 'Minimum Withdrawal', message: `Minimum withdrawal is 1,000 CR (1x Xanax).` });
      return;
    }

    setLoadingWithdraw(true);
    try {
      requestWithdrawal(userId, tornId, amount);
      addToast({
        type: 'success',
        title: 'Withdrawal Queued',
        message: `Requested ${convertCreditsToXanax(amount)}x Xanax. Queued for banker dispatch within 18 hours (0% fee).`,
      });
      setWithdrawCr('');
      setWallet(getWallet(userId, tornId));
      setTxs(getWalletTransactions(userId));
    } catch (err: any) {
      addToast({ type: 'error', title: 'Withdrawal Failed', message: err.message });
    } finally {
      setLoadingWithdraw(false);
    }
  };

  const withdrawXanaxEquivalent = withdrawCr ? convertCreditsToXanax(parseInt(withdrawCr, 10) || 0) : 0;

  return (
    <main className="page-content" style={{ minHeight: '100vh', background: 'var(--void)' }}>
      <div className="container" style={{ paddingTop: 'var(--sp-12)', paddingBottom: 'var(--sp-24)', maxWidth: '1100px' }}>
        
        {/* ── RENAISSANCE TOP HEADER ──────────────────────────── */}
        <div className="renaissance-page-header" style={{ paddingTop: 0, background: 'transparent', borderBottom: 'none', marginBottom: 'var(--sp-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="renaissance-chapter-tag">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-magenta)', display: 'inline-block', boxShadow: '0 0 8px var(--neon-magenta)' }} />
                CHAPTER III &bull; WALLET &amp; ESCROW &bull; 100% SECURE
              </div>

              <h1 className="renaissance-title">
                Wallet &amp; Escrow Balance
              </h1>
              <p className="renaissance-subtitle">
                Your safe art trading balance. 0% withdrawal fees, instant Xanax deposit matching (1 Xanax = 1,000 Credits), and guaranteed fast payouts sent directly to your Torn account.
              </p>
            </div>

            {/* Cashier Desk Button (Open for staff / bankers) */}
            <button
              type="button"
              onClick={() => setBankerDeskOpen(true)}
              className="renaissance-btn-gold"
              style={{ fontSize: '0.6875rem', padding: '8px 16px' }}
            >
              <HandCoins size={14} weight="bold" />
              Banker Payout Desk
            </button>
          </div>
        </div>

        {/* ── Unauthenticated Notice Banner ──────────────────── */}
        {!user && (
          <div className="renaissance-glass-panel" style={{
            padding: '24px 28px',
            marginBottom: 'var(--sp-8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            borderColor: 'rgba(255, 0, 127, 0.3)',
            background: 'linear-gradient(135deg, rgba(255, 0, 127, 0.08) 0%, rgba(14, 18, 17, 0.8) 100%)'
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                color: 'var(--neon-magenta)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px'
              }}>
                LOG IN TO VIEW YOUR WALLET &amp; BALANCE
              </div>
              <p style={{
                margin: 0, fontSize: '0.8125rem', color: 'var(--ghost)', fontFamily: 'var(--font-body)'
              }}>
                Connect your Torn account to view your balance, make zero-fee withdrawals, and receive automatic deposit credits.
              </p>
            </div>
            <a
              href="/login"
              className="renaissance-btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.75rem' }}
            >
              Log In With Torn Key <ArrowUpRight size={12} weight="bold" />
            </a>
          </div>
        )}

        {/* ── Balance Cards Grid ───────────────────────────────── */}
        <div className="grid-responsive-3" style={{
          marginBottom: 'var(--sp-10)'
        }}>
          {/* Card 1: Available Credits */}
          <div className="renaissance-glass-panel" style={{
            padding: '26px', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
              background: 'linear-gradient(90deg, var(--neon-magenta), var(--antique-gold), transparent)'
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Available Balance
              </span>
              <Lightning size={16} weight="fill" style={{ color: 'var(--neon-magenta)' }} />
            </div>
            <div style={{
              fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(2.2rem, 4vw, 3rem)',
              color: 'var(--phosphor)', lineHeight: 1, letterSpacing: '0.02em', marginBottom: '8px'
            }}>
              {(wallet?.balance_cr ?? 0).toLocaleString()} <span style={{ fontSize: '1.1rem', color: 'var(--neon-magenta)', fontFamily: 'var(--font-mono)' }}>CR</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
              ≈ <span style={{ color: 'var(--antique-gold)', fontWeight: 600 }}>{convertCreditsToXanax(wallet?.balance_cr ?? 0)}</span> Xanax
              <span style={{ margin: '0 6px', opacity: 0.4 }}>•</span>
              ≈ <span style={{ color: 'var(--phosphor)' }}>${((convertCreditsToXanax(wallet?.balance_cr ?? 0) * 835000) / 1000000).toFixed(2)}M</span> Cash
            </div>
          </div>

          {/* Card 2: Escrow Locked (Active Bids & Payouts) */}
          <div className="renaissance-glass-panel" style={{
            padding: '26px', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Held in Active Bids &amp; Orders
              </span>
              <LockKey size={16} weight="bold" style={{ color: 'var(--antique-gold)' }} />
            </div>
            <div style={{
              fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(2.2rem, 4vw, 3rem)',
              color: 'var(--phosphor)', lineHeight: 1, letterSpacing: '0.02em', marginBottom: '8px'
            }}>
              {(wallet?.locked_cr ?? 0).toLocaleString()} <span style={{ fontSize: '1.1rem', color: 'var(--antique-gold)', fontFamily: 'var(--font-mono)' }}>CR</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
              Safely held for active auction bids or pending withdrawals
            </div>
          </div>

          {/* Card 3: Lifetime Volume */}
          <div className="renaissance-glass-panel" style={{
            padding: '26px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Lifetime Activity
              </span>
              <ArrowsLeftRight size={16} weight="bold" style={{ color: 'var(--antique-gold)' }} />
            </div>
            <div style={{ display: 'flex', gap: '24px', marginTop: '14px' }}>
              <div>
                <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', marginBottom: '4px' }}>TOTAL DEPOSITED</div>
                <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.3rem', color: 'var(--antique-gold)', fontWeight: 600 }}>
                  +{wallet?.total_deposited_xanax ?? 0} <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>XAN</span>
                </div>
              </div>
              <div style={{ width: '1px', background: 'rgba(244, 241, 234, 0.08)' }} />
              <div>
                <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', marginBottom: '4px' }}>TOTAL WITHDRAWN</div>
                <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.3rem', color: 'var(--phosphor)', fontWeight: 600 }}>
                  {wallet?.total_withdrawn_xanax ?? 0} <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>XAN</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action Modules Grid: Deposit & Withdraw ─────────── */}
        <div className="grid-responsive-2" style={{
          gap: '24px', marginBottom: 'var(--sp-12)'
        }}>

          {/* 1. DEPOSIT SECTION */}
          <div className="renaissance-glass-panel" style={{
            padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '6px',
                  background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--antique-gold)'
                }}>
                  <ArrowDownLeft size={16} weight="bold" />
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-cinzel)', fontSize: '1.25rem',
                  letterSpacing: '0.02em', margin: 0, color: 'var(--phosphor)'
                }}>
                  Deposit Xanax
                </h3>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', lineHeight: 1.5, marginBottom: '20px' }}>
                Send Xanax in Torn City directly to our escrow account. Zero memo codes required — incoming transfers are automatically matched to your session Torn ID:
              </p>

              {/* Recipient Card */}
              <div style={{
                background: 'rgba(10, 13, 12, 0.75)', border: '1px solid rgba(212, 175, 55, 0.25)',
                padding: '16px', borderRadius: '8px', marginBottom: '20px'
              }}>
                <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--antique-gold)', letterSpacing: '0.1em', marginBottom: '4px' }}>
                  SEND XANAX TO THIS TORN ACCOUNT:
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-cinzel)', fontSize: '1.1rem',
                    color: 'var(--neon-magenta)', fontWeight: 700, letterSpacing: '0.02em'
                  }}>
                    {TREASURY_OFFICIAL}
                  </span>
                  <a
                    href="https://www.torn.com/trade.php"
                    target="_blank"
                    rel="noreferrer"
                    className="renaissance-btn-gold"
                    style={{ fontSize: '0.6875rem', padding: '6px 12px', gap: '4px' }}
                  >
                    Open Torn <ArrowUpRight size={10} weight="bold" />
                  </a>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 0, 127, 0.05)', border: '1px dashed rgba(255, 0, 127, 0.25)',
                padding: '12px 14px', borderRadius: '6px', marginBottom: '24px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)'
              }}>
                ⚡ <span style={{ color: 'var(--phosphor)' }}>1x Xanax = 1,000 Credits</span>. Your credits appear in your balance immediately when detected.
              </div>
            </div>

            {/* Live Escrow Ingestion Monitor & Manual Sync */}
            <div style={{ borderTop: '1px solid rgba(244, 241, 234, 0.06)', paddingTop: '16px' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: 'rgba(244, 241, 234, 0.02)',
                border: '1px solid rgba(244, 241, 234, 0.06)',
                borderRadius: '6px',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} weight="duotone" style={{ color: 'var(--antique-gold)' }} />
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--phosphor)', fontWeight: 600 }}>
                      Automatic Transfer Checker
                    </span>
                  </div>
                  <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '3px' }}>
                    ● AUTOMATIC CHECK
                  </span>
                </div>
                
                <p style={{ fontSize: '0.6875rem', color: 'var(--ghost)', margin: 0, lineHeight: 1.4 }}>
                  Whenever you send Xanax to <strong>{TREASURY_OFFICIAL}</strong> on Torn, our system automatically detects it and credits your balance.
                  {lastSync && <span style={{ display: 'block', color: 'var(--antique-gold)', marginTop: '2px' }}>Last checked: {new Date(lastSync).toLocaleTimeString()}</span>}
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={handleSyncTorn}
                    disabled={isSyncing}
                    className="renaissance-btn-gold"
                    style={{ fontSize: '0.6875rem', padding: '6px 14px', cursor: 'pointer' }}
                  >
                    {isSyncing ? 'Checking Torn...' : 'Check For New Transfers ⚡'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateTestDeposit}
                    className="renaissance-btn-primary"
                    style={{ fontSize: '0.6875rem', padding: '6px 14px', cursor: 'pointer' }}
                  >
                    Simulate 5x Xanax Deposit (+5,000 CR)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. ZERO-FEE WITHDRAWAL SECTION */}
          <div className="renaissance-glass-panel" style={{
            padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            {!user ? (
              <div style={{ padding: '32px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <LockKey size={36} weight="thin" style={{ color: 'var(--ghost)', marginBottom: '16px' }} />
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--phosphor)', margin: '0 0 8px 0' }}>
                  LOG IN TO WITHDRAW
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', fontFamily: 'var(--font-body)', maxWidth: '320px', lineHeight: 1.5, marginBottom: '20px' }}>
                  Please log in with your Torn City account to request zero-fee Xanax withdrawals sent straight to you.
                </p>
                <a href="/login" className="btn btn-sm btn-industrial" style={{ borderRadius: '6px', padding: '8px 18px' }}>
                  Log In With Torn Key
                </a>
              </div>
            ) : (
              <form onSubmit={handleWithdraw}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '6px',
                    background: 'rgba(255, 77, 54, 0.1)', border: '1px solid rgba(255, 77, 54, 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)'
                  }}>
                    <ArrowUpRight size={16} weight="bold" />
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.25rem',
                    letterSpacing: '-0.02em', margin: 0, color: 'var(--phosphor)'
                  }}>
                    Withdraw Xanax (Zero Fee)
                  </h3>
                </div>

                {/* Locked Recipient Box */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block', fontSize: '0.625rem', fontFamily: 'var(--font-mono)',
                    color: 'var(--ghost)', letterSpacing: '0.08em', marginBottom: '6px'
                  }}>
                    DESTINATION TORN ACCOUNT (LOCKED)
                  </label>
                  <div style={{
                    background: 'var(--void)', border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '10px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px'
                  }}>
                    <IdentificationCard size={18} weight="bold" style={{ color: 'var(--term-green)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--phosphor)' }}>
                      {username} [#{tornId}]
                    </span>
                    <span style={{
                      marginLeft: 'auto', fontSize: '0.5625rem', fontFamily: 'var(--font-mono)',
                      color: 'var(--term-green)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px'
                    }}>
                      VERIFIED
                    </span>
                  </div>
                </div>

                {/* Amount Input */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', letterSpacing: '0.08em' }}>
                      AMOUNT TO WITHDRAW (IN CR)
                    </label>
                    <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
                      Max: {(wallet?.balance_cr ?? 0).toLocaleString()} CR
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      placeholder="e.g. 5000"
                      value={withdrawCr}
                      onChange={(e) => setWithdrawCr(e.target.value)}
                      style={{
                        width: '100%', background: 'var(--void)', border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '10px 48px 10px 12px', color: 'var(--phosphor)', fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem', borderRadius: '6px', outline: 'none'
                      }}
                    />
                    <span style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--red)'
                    }}>
                      CR
                    </span>
                  </div>

                  {/* Quick Chips */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setWithdrawCr('1000')}
                      className="btn btn-sm btn-ghost"
                      style={{ fontSize: '0.625rem', padding: '3px 8px', borderRadius: '4px' }}
                    >
                      1 XAN (1,000 CR)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawCr('5000')}
                      className="btn btn-sm btn-ghost"
                      style={{ fontSize: '0.625rem', padding: '3px 8px', borderRadius: '4px' }}
                    >
                      5 XAN (5,000 CR)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawCr(String(wallet?.balance_cr ?? 0))}
                      className="btn btn-sm btn-ghost"
                      style={{ fontSize: '0.625rem', padding: '3px 8px', borderRadius: '4px' }}
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Conversion Preview & SLA */}
                <div style={{
                  background: 'var(--void)', border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '12px 14px', borderRadius: '6px', marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--ghost)' }}>You will receive:</span>
                    <span style={{ color: 'var(--phosphor)', fontWeight: 600 }}>{withdrawXanaxEquivalent}x Xanax</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--ghost)' }}>Cashier Fee:</span>
                    <span style={{ color: 'var(--term-green)' }}>0% (FREE)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', color: 'var(--ghost)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                    <Clock size={12} style={{ color: '#fbbf24' }} />
                    <span>Delivery: Sent within 18 hours (usually 15 mins – 2 hours)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingWithdraw || !withdrawCr || parseInt(withdrawCr, 10) <= 0}
                  className="renaissance-btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '0.75rem', borderRadius: '6px' }}
                >
                  {loadingWithdraw ? 'Submitting Request...' : `Request ${withdrawXanaxEquivalent}x Xanax Withdrawal`}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Transaction Ledger ─────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.25rem',
              letterSpacing: '-0.02em', margin: 0, color: 'var(--phosphor)'
            }}>
              Transaction History
            </h3>
            <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
              {txs.length} Recorded Entries
            </span>
          </div>

          <div style={{
            background: 'var(--plate)', border: '1px solid rgba(255, 255, 255, 0.065)',
            borderRadius: '8px', overflow: 'hidden'
          }}>
            {txs.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <Coins size={32} weight="thin" style={{ color: 'var(--ghost)', margin: '0 auto 12px' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ghost)' }}>
                  NO TRANSACTIONS YET
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--ghost)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  {user 
                    ? 'Deposit Xanax or bid in an auction to see your activity here.'
                    : 'Log in with your Torn account to view your past transactions.'}
                </p>
              </div>
            ) : (
              <div className="table-scroll-container">
                <table style={{ minWidth: '520px', width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <th style={{ padding: '12px 16px', color: 'var(--ghost)', fontWeight: 500 }}>TIME</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ghost)', fontWeight: 500 }}>TYPE</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ghost)', fontWeight: 500 }}>DESCRIPTION</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ghost)', fontWeight: 500, textAlign: 'right' }}>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txs.map(tx => {
                      const isPositive = tx.type === 'deposit' || tx.type === 'bid_refund' || tx.type === 'sale_payout';
                      return (
                        <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '12px 16px', color: 'var(--ghost)', whiteSpace: 'nowrap' }}>
                            {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              fontSize: '0.625rem', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase',
                              background: tx.type === 'deposit' ? 'rgba(16, 185, 129, 0.15)' :
                                          tx.type === 'withdrawal' ? 'rgba(255, 77, 54, 0.15)' :
                                          tx.type === 'bid_hold' ? 'rgba(251, 191, 36, 0.15)' :
                                          tx.type === 'sale_payout' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.08)',
                              color: tx.type === 'deposit' ? 'var(--term-green)' :
                                     tx.type === 'withdrawal' ? 'var(--red)' :
                                     tx.type === 'bid_hold' ? '#fbbf24' :
                                     tx.type === 'sale_payout' ? 'var(--term-green)' : 'var(--ghost)',
                            }}>
                              {tx.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--phosphor)' }}>
                            {tx.description}
                          </td>
                          <td style={{
                            padding: '12px 16px', textAlign: 'right', fontWeight: 600,
                            color: isPositive ? 'var(--term-green)' : 'var(--red)'
                          }}>
                            {isPositive ? '+' : '-'}{tx.amount_cr.toLocaleString()} CR
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Banker Desk Modal */}
      {bankerDeskOpen && (
        <BankerDeskModal onClose={() => setBankerDeskOpen(false)} />
      )}
    </main>
  );
}

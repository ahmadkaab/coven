import { useState, useEffect } from 'react';
import { X, HandCoins, ArrowUpRight, CheckCircle, Clock, IdentificationCard, ShieldCheck, Lightning } from '@phosphor-icons/react';
import { 
  getWithdrawalTickets, claimWithdrawalTicket, 
  fulfillWithdrawalTicket, TREASURY_OFFICIAL 
} from '../../services/walletService';
import { syncTornWithdrawals, simulateOutboundXanaxSend } from '../../services/withdrawalSyncService';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import type { WithdrawalTicket } from '../../types';

interface Props {
  onClose: () => void;
}

export function BankerDeskModal({ onClose }: Props) {
  const { user, apiKey } = useAuthStore();
  const { addToast } = useToast();
  const bankerTornId = user ? String(user.player_id) : '4295891';

  const [tickets, setTickets] = useState<WithdrawalTicket[]>(() => getWithdrawalTickets());
  const [proofInput, setProofInput] = useState<Record<string, string>>({});
  const [isAutoChecking, setIsAutoChecking] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setTickets(getWithdrawalTickets());
    window.addEventListener('coven:banker_tickets_update', handleUpdate);
    return () => window.removeEventListener('coven:banker_tickets_update', handleUpdate);
  }, []);

  const handleAutoCheck = async () => {
    setIsAutoChecking(true);
    try {
      const res = await syncTornWithdrawals(apiKey || undefined);
      addToast({
        type: res.autoFulfilledCount > 0 ? 'success' : 'info',
        title: 'Auto-Check Complete',
        message: res.message,
      });
      setTickets(getWithdrawalTickets());
    } catch {
      addToast({ type: 'error', title: 'Check Error', message: 'Could not connect to Torn API log stream.' });
    } finally {
      setIsAutoChecking(false);
    }
  };

  const handleClaim = (ticketId: string) => {
    try {
      claimWithdrawalTicket(ticketId, bankerTornId);
      addToast({ type: 'success', title: 'Ticket Claimed', message: `You are now handling ticket #${ticketId.slice(-6)}` });
      setTickets(getWithdrawalTickets());
    } catch (err: any) {
      addToast({ type: 'error', title: 'Claim Failed', message: err.message });
    }
  };

  const handleFulfill = (ticketId: string) => {
    try {
      const proof = proofInput[ticketId] || 'Torn in-game transfer completed';
      fulfillWithdrawalTicket(ticketId, bankerTornId, proof);
      addToast({
        type: 'success',
        title: 'Dispatch Confirmed',
        message: `Payout completed for ticket #${ticketId.slice(-6)}. Credits permanently settled.`,
      });
      setTickets(getWithdrawalTickets());
    } catch (err: any) {
      addToast({ type: 'error', title: 'Fulfill Failed', message: err.message });
    }
  };

  const pendingTickets = tickets.filter(t => t.status === 'pending' || t.status === 'claimed');
  const fulfilledTickets = tickets.filter(t => t.status === 'fulfilled');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(5, 5, 5, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: 'var(--pit)', border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '4px', width: '100%', maxWidth: '780px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.8)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '4px',
              background: 'rgba(230, 25, 25, 0.12)', border: '1px solid rgba(230, 25, 25, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--crimson)'
            }}>
              <HandCoins size={18} weight="bold" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.25rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                Banker Withdrawal Desk
              </h3>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
                Send Xanax Payouts · Head Cashier: {TREASURY_OFFICIAL}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost"
            style={{ padding: '4px', color: 'var(--ghost)' }}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '16px' }}>
            <div style={{
              flex: 1, background: 'var(--void)', border: '1px solid rgba(255,255,255,0.06)',
              padding: '12px 16px', borderRadius: '3px'
            }}>
              <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>ACTIVE TICKETS</div>
              <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--phosphor)' }}>
                {pendingTickets.length}
              </div>
            </div>
            <div style={{
              flex: 1, background: 'var(--void)', border: '1px solid rgba(255,255,255,0.06)',
              padding: '12px 16px', borderRadius: '3px'
            }}>
              <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>PENDING XANAX</div>
              <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fbbf24' }}>
                {pendingTickets.reduce((acc, t) => acc + t.amount_xanax, 0)} XAN
              </div>
            </div>
            <div style={{
              flex: 1, background: 'var(--void)', border: '1px solid rgba(255,255,255,0.06)',
              padding: '12px 16px', borderRadius: '3px'
            }}>
              <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>COMPLETED PAYOUTS</div>
              <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--term-green)' }}>
                {fulfilledTickets.length}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <h4 style={{
              fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)',
              letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0
            }}>
              Pending Payout Requests
            </h4>
            <button
              type="button"
              onClick={handleAutoCheck}
              disabled={isAutoChecking}
              className="btn btn-sm btn-gold"
              style={{ fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Lightning size={12} weight="fill" />
              {isAutoChecking ? 'Checking Torn Logs...' : '⚡ Auto-Check Sent Xanax'}
            </button>
          </div>

          {pendingTickets.length === 0 ? (
            <div style={{
              padding: '36px 20px', textAlign: 'center', background: 'var(--void)',
              border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '3px', marginBottom: '24px'
            }}>
              <CheckCircle size={28} weight="duotone" style={{ color: 'var(--term-green)', margin: '0 auto 8px' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--ghost)' }}>
                Queue Clear — No Pending Withdrawals
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {pendingTickets.map(ticket => (
                <div
                  key={ticket.id}
                  style={{
                    background: 'var(--void)', border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '3px', padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IdentificationCard size={16} weight="bold" style={{ color: 'var(--ghost)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--phosphor)' }}>
                          Torn ID #{ticket.torn_id}
                        </span>
                        <span style={{
                          fontSize: '0.5625rem', fontFamily: 'var(--font-mono)',
                          padding: '1px 5px', borderRadius: '2px', textTransform: 'uppercase',
                          background: ticket.status === 'claimed' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(230, 25, 25, 0.15)',
                          color: ticket.status === 'claimed' ? '#fbbf24' : 'var(--crimson)'
                        }}>
                          {ticket.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)', marginTop: '4px' }}>
                        Requested: {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                        Amount: <strong style={{ color: 'var(--phosphor)' }}>{ticket.amount_cr.toLocaleString()} CR</strong> ({ticket.amount_xanax}x Xanax)
                      </div>
                    </div>

                    <a
                      href={`https://www.torn.com/profiles.php?XID=${ticket.torn_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-ghost"
                      style={{ fontSize: '0.625rem', gap: '4px' }}
                    >
                      View Profile <ArrowUpRight size={10} weight="bold" />
                    </a>
                  </div>

                  {/* Actions */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {ticket.status === 'pending' ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(ticket.id)}
                        className="btn btn-sm btn-industrial"
                        style={{ fontSize: '0.6875rem' }}
                      >
                        Claim Ticket
                      </button>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Optional: Torn Log / Proof URL"
                          value={proofInput[ticket.id] || ''}
                          onChange={(e) => setProofInput({ ...proofInput, [ticket.id]: e.target.value })}
                          style={{
                            flex: 1, background: 'var(--pit)', border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '6px 10px', borderRadius: '2px', color: 'var(--phosphor)',
                            fontSize: '0.6875rem', fontFamily: 'var(--font-mono)'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleFulfill(ticket.id)}
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: '0.6875rem', whiteSpace: 'nowrap' }}
                        >
                          Confirm Xanax Sent
                        </button>
                        <button
                          type="button"
                          title="Simulate Ahmad sending Xanax on Torn to test auto-fulfillment"
                          onClick={() => {
                            const res = simulateOutboundXanaxSend({
                              recipientTornId: ticket.torn_id,
                              xanaxCount: ticket.amount_xanax,
                            });
                            addToast({
                              type: res.success ? 'success' : 'error',
                              title: res.success ? 'Auto-Fulfill Match!' : 'Simulation Failed',
                              message: res.message,
                            });
                            setTickets(getWithdrawalTickets());
                          }}
                          className="btn btn-sm btn-ghost"
                          style={{ fontSize: '0.625rem', whiteSpace: 'nowrap', border: '1px dashed rgba(255,255,255,0.2)' }}
                        >
                          ⚡ Test Auto-Send
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '14px', borderRadius: '3px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)'
          }}>
            🛡️ <strong>Banker Rules:</strong> Only confirm dispatch after sending the exact Xanax count via in-game Torn Trade or Item Send. All settlements are immutable.
          </div>
        </div>
      </div>
    </div>
  );
}

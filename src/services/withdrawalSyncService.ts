/* ================================================================
   COVEN — Automated Withdrawal Verification & Fulfillment Service
   Monitors outbound Xanax transfers sent by ahmad_kaab [4295891]
   via the Torn City API (user -> events & user -> log).
   Automatically fulfills matching pending withdrawal tickets!
   ================================================================ */

import { 
  getWithdrawalTickets, 
  fulfillWithdrawalTicket, 
  claimWithdrawalTicket 
} from './walletService';
import type { WithdrawalTicket } from '../types';
import { dispatchNotification } from './notificationService';

const TORN_API_BASE = 'https://api.torn.com';
const PROCESSED_DISPATCHES_KEY = 'coven_processed_dispatches_v1';
const LAST_WITHDRAWAL_SYNC_KEY = 'coven_last_withdrawal_sync_v1';

export interface OutboundTransferEvent {
  id: string;
  recipientTornId: string;
  recipientName: string;
  xanaxCount: number;
  timestamp: number;
}

export interface SyncWithdrawalsResult {
  success: boolean;
  message: string;
  autoFulfilledCount: number;
  fulfilledTickets: WithdrawalTicket[];
  lastCheckedAt: string;
}

/* ── Storage Helpers ─────────────────────────────────────────── */
function getProcessedDispatchIds(): Set<string> {
  try {
    const raw = localStorage.getItem(PROCESSED_DISPATCHES_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveProcessedDispatchId(id: string): void {
  try {
    const set = getProcessedDispatchIds();
    set.add(id);
    localStorage.setItem(PROCESSED_DISPATCHES_KEY, JSON.stringify(Array.from(set).slice(-500)));
  } catch {}
}

export function getLastWithdrawalSyncTime(): string | null {
  try {
    return localStorage.getItem(LAST_WITHDRAWAL_SYNC_KEY);
  } catch {
    return null;
  }
}

function saveLastWithdrawalSyncTime(): void {
  try {
    localStorage.setItem(LAST_WITHDRAWAL_SYNC_KEY, new Date().toISOString());
  } catch {}
}

/* ── Outbound Event Parser ───────────────────────────────────── */
export function parseOutboundXanaxEvent(eventText: string, eventId: string, timestamp: number): OutboundTransferEvent | null {
  // e.g., "You sent 5x Xanax to <a href=\"profiles.php?XID=12345\">PlayerName</a> with the message: ..."
  // or "You sent 5x Xanax to PlayerName [12345]"
  const sendRegex = /You sent (\d+)x Xanax to (?:<a href="[^"]*XID=(\d+)">([^<]+)<\/a>|([a-zA-Z0-9_\-]+)\s*(?:\[(\d+)\])?)/i;
  const match = eventText.match(sendRegex);

  if (match) {
    const count = parseInt(match[1], 10);
    const tornId = match[2] || match[5] || 'unknown';
    const name = match[3] || match[4] || 'Player';
    return {
      id: eventId,
      recipientTornId: tornId.trim(),
      recipientName: name.trim(),
      xanaxCount: count,
      timestamp,
    };
  }

  // Also check trade completion with Xanax:
  // e.g. "Trade between you and <a href=\"profiles.php?XID=12345\">PlayerName</a> was accepted"
  // (In Torn trade completions, items are in the trade log)
  return null;
}

/* ── Auto-Sync Outbound Dispatches ───────────────────────────── */
export async function syncTornWithdrawals(apiKey?: string): Promise<SyncWithdrawalsResult> {
  const tickets = getWithdrawalTickets();
  const pendingOrClaimed = tickets.filter(t => t.status === 'pending' || t.status === 'claimed');

  if (pendingOrClaimed.length === 0) {
    saveLastWithdrawalSyncTime();
    return {
      success: true,
      message: 'No pending withdrawal tickets in queue.',
      autoFulfilledCount: 0,
      fulfilledTickets: [],
      lastCheckedAt: new Date().toISOString(),
    };
  }

  const processed = getProcessedDispatchIds();
  const fulfilledTickets: WithdrawalTicket[] = [];

  if (apiKey && apiKey.trim().length >= 16) {
    try {
      // Query Torn events for user
      const res = await fetch(`${TORN_API_BASE}/user/?selections=events&key=${apiKey.trim()}`);
      const data = await res.json();

      if (data.events && typeof data.events === 'object') {
        const entries = Object.entries(data.events) as [string, { event: string; timestamp: number }][];

        for (const [id, item] of entries) {
          if (processed.has(id)) continue;

          const parsed = parseOutboundXanaxEvent(item.event, id, item.timestamp);
          if (parsed && parsed.xanaxCount > 0 && parsed.recipientTornId !== 'unknown') {
            // Find matching ticket for this recipient
            const matchTicket = pendingOrClaimed.find(
              t => t.torn_id === parsed.recipientTornId && 
                   t.amount_xanax === parsed.xanaxCount &&
                   t.status !== 'fulfilled'
            );

            if (matchTicket) {
              // Auto-claim and fulfill!
              if (matchTicket.status === 'pending') {
                claimWithdrawalTicket(matchTicket.id, 'ahmad_kaab');
              }
              const fulfilled = fulfillWithdrawalTicket(
                matchTicket.id, 
                'ahmad_kaab', 
                `https://www.torn.com/profiles.php?XID=${parsed.recipientTornId}`
              );
              saveProcessedDispatchId(id);
              fulfilledTickets.push(fulfilled);

              // Dispatch notification to user
              dispatchNotification(matchTicket.user_id || matchTicket.torn_id, {
                type: 'system',
                title: 'Withdrawal Dispatched in Torn!',
                message: `Ahmad Kaab sent your ${parsed.xanaxCount}x Xanax directly in Torn City. Check your inventory!`,
                link: '/wallet',
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Torn withdrawal sync error:', err);
    }
  }

  saveLastWithdrawalSyncTime();

  return {
    success: true,
    message: fulfilledTickets.length > 0 
      ? `Auto-verified & fulfilled ${fulfilledTickets.length} cashout dispatch(es)!`
      : 'Scanned Torn events. No new matching outbound Xanax transfers detected yet.',
    autoFulfilledCount: fulfilledTickets.length,
    fulfilledTickets,
    lastCheckedAt: new Date().toISOString(),
  };
}

/* ── Test Simulator for Testing Without Live Items ───────────── */
export function simulateOutboundXanaxSend({
  recipientTornId,
  xanaxCount,
}: {
  recipientTornId: string;
  xanaxCount: number;
}): { success: boolean; message: string; ticket?: WithdrawalTicket } {
  const tickets = getWithdrawalTickets();
  const match = tickets.find(
    t => t.torn_id === recipientTornId && 
         (t.status === 'pending' || t.status === 'claimed') &&
         t.amount_xanax === xanaxCount
  );

  if (!match) {
    return {
      success: false,
      message: `No active withdrawal ticket found for Torn ID [${recipientTornId}] requesting ${xanaxCount}x Xanax.`,
    };
  }

  if (match.status === 'pending') {
    claimWithdrawalTicket(match.id, 'ahmad_kaab');
  }

  const fulfilled = fulfillWithdrawalTicket(
    match.id,
    'ahmad_kaab',
    `https://www.torn.com/profiles.php?XID=${recipientTornId}`
  );

  dispatchNotification(match.user_id || match.torn_id, {
    type: 'system',
    title: 'Withdrawal Delivered in Torn!',
    message: `Ahmad Kaab sent ${xanaxCount}x Xanax to your Torn inventory. Cashout complete!`,
    link: '/wallet',
  });

  return {
    success: true,
    message: `Matched & auto-fulfilled ticket for Torn ID [${recipientTornId}]: +${xanaxCount}x Xanax delivered!`,
    ticket: fulfilled,
  };
}

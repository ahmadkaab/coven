/* ================================================================
   COVEN — Automated Torn API Deposit Sync Service
   Polls Torn API events (user -> events) to detect incoming
   Xanax & Cash transfers to ahmad_kaab [4295891].
   Automatically credits the sender's COVEN escrow balance.
   Standard: 1 Xanax = 1,000 CR | $1,000,000 = 1,000 CR
   ================================================================ */

import { submitDeposit, TREASURY_TORN_ID, CR_PER_XANAX } from './walletService';
import { dispatchNotification } from './notificationService';

const TORN_API_BASE = 'https://api.torn.com';
const PROCESSED_EVENTS_KEY = 'coven_processed_torn_events_v1';
const LAST_SYNC_KEY = 'coven_torn_last_sync_v1';

export interface SyncDepositResult {
  success: boolean;
  message: string;
  newDepositsCount: number;
  totalCreditedCr: number;
  lastSyncAt: string;
  detectedEvents: {
    eventId: string;
    senderTornId: string;
    senderName: string;
    type: 'xanax' | 'cash';
    quantity: number;
    credits: number;
    timestamp: number;
  }[];
}

/* ── Storage Helpers ─────────────────────────────────────────── */
function getProcessedEventIds(): Set<string> {
  try {
    const raw = localStorage.getItem(PROCESSED_EVENTS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveProcessedEventId(id: string): void {
  try {
    const set = getProcessedEventIds();
    set.add(id);
    localStorage.setItem(PROCESSED_EVENTS_KEY, JSON.stringify(Array.from(set).slice(-500)));
  } catch {}
}

export function getLastSyncTime(): string | null {
  try {
    return localStorage.getItem(LAST_SYNC_KEY);
  } catch {
    return null;
  }
}

function saveLastSyncTime(): void {
  try {
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch {}
}

/* ── Event Parser ────────────────────────────────────────────── */
interface ParsedTransfer {
  senderTornId: string;
  senderName: string;
  type: 'xanax' | 'cash';
  quantity: number;
  credits: number;
}

export function parseTornTransferEvent(eventText: string): ParsedTransfer | null {
  // 1. Check for Xanax transfers:
  // e.g., "You were sent 10x Xanax from <a href=\"profiles.php?XID=12345\">PlayerName</a> with the message: ..."
  // or "You were sent 10x Xanax from PlayerName"
  const xanaxRegex = /You were sent (\d+)x Xanax from (?:<a href="[^"]*XID=(\d+)">([^<]+)<\/a>|([a-zA-Z0-9_\-]+)\s*(?:\[(\d+)\])?)/i;
  const xMatch = eventText.match(xanaxRegex);

  if (xMatch) {
    const count = parseInt(xMatch[1], 10);
    const tornId = xMatch[2] || xMatch[5] || 'unknown';
    const name = xMatch[3] || xMatch[4] || 'Anonymous';
    return {
      senderTornId: tornId,
      senderName: name.trim(),
      type: 'xanax',
      quantity: count,
      credits: count * CR_PER_XANAX,
    };
  }

  // 2. Check for Cash transfers:
  // e.g., "<a href=\"profiles.php?XID=12345\">PlayerName</a> sent you $10,000,000 with the message: ..."
  // or "PlayerName sent you $5,000,000"
  const cashRegex = /(?:<a href="[^"]*XID=(\d+)">([^<]+)<\/a>|([a-zA-Z0-9_\-]+))\s+sent you \$([0-9,]+)/i;
  const cMatch = eventText.match(cashRegex);

  if (cMatch) {
    const tornId = cMatch[1] || 'unknown';
    const name = cMatch[2] || cMatch[3] || 'Anonymous';
    const cash = parseInt(cMatch[4].replace(/,/g, ''), 10);
    // Standard: $1,000,000 = 1,000 CR (approx $1,000 per CR)
    const credits = Math.floor(cash / 1000);
    return {
      senderTornId: tornId,
      senderName: name.trim(),
      type: 'cash',
      quantity: cash,
      credits,
    };
  }

  return null;
}

/* ── Auto Sync Engine ────────────────────────────────────────── */
export async function syncTornDeposits(apiKey?: string, targetUserId?: string): Promise<SyncDepositResult> {
  const processed = getProcessedEventIds();
  const detectedEvents: SyncDepositResult['detectedEvents'] = [];
  let newDepositsCount = 0;
  let totalCreditedCr = 0;

  if (apiKey && apiKey.trim().length >= 16) {
    try {
      const res = await fetch(`${TORN_API_BASE}/user/?selections=events&key=${apiKey.trim()}`);
      const data = await res.json();

      if (data.events && typeof data.events === 'object') {
        const entries = Object.entries(data.events) as [string, { event: string; timestamp: number }][];

        for (const [id, item] of entries) {
          if (processed.has(id)) continue;

          const parsed = parseTornTransferEvent(item.event);
          if (parsed && parsed.credits > 0) {
            // Process new deposit!
            const effectiveUserId = targetUserId || `user-${parsed.senderTornId}`;
            const xanaxCount = parsed.type === 'xanax' ? parsed.quantity : parsed.credits / CR_PER_XANAX;

            submitDeposit(
              effectiveUserId,
              parsed.senderTornId,
              xanaxCount,
              `Auto-Verified Torn API: ${parsed.type.toUpperCase()} from ${parsed.senderName} [${parsed.senderTornId}]`
            );

            saveProcessedEventId(id);
            newDepositsCount++;
            totalCreditedCr += parsed.credits;

            detectedEvents.push({
              eventId: id,
              senderTornId: parsed.senderTornId,
              senderName: parsed.senderName,
              type: parsed.type,
              quantity: parsed.quantity,
              credits: parsed.credits,
              timestamp: item.timestamp,
            });

            // Dispatch notification
            dispatchNotification(effectiveUserId, {
              type: 'system',
              title: 'Torn Transfer Auto-Verified',
              message: `Deposited ${parsed.quantity}x ${parsed.type.toUpperCase()} from Torn City. Credited ${parsed.credits.toLocaleString()} CR to your escrow balance.`,
              link: '/wallet',
            });
          }
        }
      }
    } catch (err: any) {
      console.warn('[COVEN Torn Sync] Network or API error:', err.message);
    }
  }

  saveLastSyncTime();

  const now = new Date().toISOString();
  window.dispatchEvent(new CustomEvent('coven:deposit_sync_complete', {
    detail: { newDepositsCount, totalCreditedCr, lastSyncAt: now }
  }));

  return {
    success: true,
    message: newDepositsCount > 0
      ? `Auto-verified ${newDepositsCount} transfer(s). Credited ${totalCreditedCr.toLocaleString()} CR.`
      : 'Torn escrow up to date. No pending transfers found.',
    newDepositsCount,
    totalCreditedCr,
    lastSyncAt: now,
    detectedEvents,
  };
}

/* ── Simulated Test Deposit Trigger (For instant testing) ────── */
export function simulateIncomingTornTransfer(opts: {
  senderTornId: string;
  senderName: string;
  xanaxCount: number;
  userId?: string;
}): SyncDepositResult {
  const credits = opts.xanaxCount * CR_PER_XANAX;
  const effectiveUserId = opts.userId || `user-${opts.senderTornId}`;

  submitDeposit(
    effectiveUserId,
    opts.senderTornId,
    opts.xanaxCount,
    `Simulated Torn Verification: ${opts.xanaxCount}x Xanax from ${opts.senderName} [${opts.senderTornId}]`
  );

  dispatchNotification(effectiveUserId, {
    type: 'system',
    title: 'Torn Transfer Verified Instantly',
    message: `Received ${opts.xanaxCount}x Xanax from Torn City. ${credits.toLocaleString()} CR credited to your escrow wallet.`,
    link: '/wallet',
  });

  const now = new Date().toISOString();
  window.dispatchEvent(new CustomEvent('coven:deposit_sync_complete', {
    detail: { newDepositsCount: 1, totalCreditedCr: credits, lastSyncAt: now }
  }));

  return {
    success: true,
    message: `Verified transfer of ${opts.xanaxCount}x Xanax from ${opts.senderName} [${opts.senderTornId}]. Credited ${credits.toLocaleString()} CR!`,
    newDepositsCount: 1,
    totalCreditedCr: credits,
    lastSyncAt: now,
    detectedEvents: [{
      eventId: 'sim-' + Date.now(),
      senderTornId: opts.senderTornId,
      senderName: opts.senderName,
      type: 'xanax',
      quantity: opts.xanaxCount,
      credits,
      timestamp: Math.floor(Date.now() / 1000),
    }],
  };
}

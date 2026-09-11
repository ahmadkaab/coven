/* ================================================================
   COVEN — Bid Service (Escrow-Backed with Blind Auction Support)
   ================================================================ */
import { supabase } from '../config/supabase';
import { getWallet, lockBidCredits, releaseBidCredits } from './walletService';
import type { Bid, Artwork } from '../types';

const BIDS_STORAGE_PREFIX = 'coven_bids_';

/** Fetch local or cached bid history */
export function getLocalBids(artworkId: string): Bid[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`${BIDS_STORAGE_PREFIX}${artworkId}`);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalBid(artworkId: string, bid: Bid): void {
  const bids = getLocalBids(artworkId);
  bids.unshift(bid);
  localStorage.setItem(`${BIDS_STORAGE_PREFIX}${artworkId}`, JSON.stringify(bids.slice(0, 50)));
}

/** Place an escrow-backed bid */
export async function placeBid(opts: {
  artworkId: string;
  bidderId: string;
  bidderTornId: string;
  bidderUsername: string;
  amountCr: number;
  isBlind?: boolean;
  artworkTitle?: string;
}): Promise<Bid> {
  const title = opts.artworkTitle || 'Artwork Auction';

  // 1. Check Escrow Wallet Balance
  const wallet = getWallet(opts.bidderId, opts.bidderTornId);
  if (wallet.balance_cr < opts.amountCr) {
    throw new Error(
      `Insufficient Escrow Credits. Required: ${opts.amountCr.toLocaleString()} CR | Available: ${wallet.balance_cr.toLocaleString()} CR. Please deposit Xanax via Treasury.`
    );
  }

  // 2. Check previous highest bid and release previous bidder's funds
  const existingBids = getLocalBids(opts.artworkId);
  const highestPreviousBid = existingBids[0];

  if (highestPreviousBid && opts.amountCr <= (highestPreviousBid.amount_cr || 0)) {
    throw new Error(`Bid must exceed current highest bid of ${(highestPreviousBid.amount_cr || 0).toLocaleString()} CR`);
  }

  // 3. Lock new bidder's credits in escrow
  const locked = lockBidCredits(opts.bidderId, opts.bidderTornId, opts.amountCr, title);
  if (!locked) {
    throw new Error('Failed to lock credits in escrow.');
  }

  // 4. If previous bidder was someone else, release their hold immediately
  if (highestPreviousBid && highestPreviousBid.bidder_id !== opts.bidderId) {
    const prevTornId = highestPreviousBid.bidder?.torn_id || highestPreviousBid.bidder_id;
    releaseBidCredits(
      highestPreviousBid.bidder_id,
      prevTornId,
      highestPreviousBid.amount_cr || 0,
      title
    );
  }

  // 5. Generate blind alias if auction is blind
  const blindAlias = opts.isBlind 
    ? `Collector #${Math.floor(100 + Math.random() * 900)}` 
    : undefined;

  const newBid: Bid = {
    id: 'bid-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    artwork_id: opts.artworkId,
    bidder_id: opts.bidderId,
    amount: opts.amountCr * 835, // cash equivalent (~$835 per CR)
    amount_cr: opts.amountCr,
    blind_alias: blindAlias,
    created_at: new Date().toISOString(),
    bidder: {
      id: opts.bidderId,
      torn_id: opts.bidderTornId,
      username: opts.isBlind ? (blindAlias || 'Anonymous Collector') : opts.bidderUsername,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  saveLocalBid(opts.artworkId, newBid);

  // Sync to Supabase if connected
  try {
    await supabase.from('bids').insert({
      artwork_id: opts.artworkId,
      bidder_id: opts.bidderId,
      amount: opts.amountCr,
    });
  } catch {
    /* silent local fallback */
  }

  window.dispatchEvent(new CustomEvent('coven:bid_placed', { detail: newBid }));
  return newBid;
}

/** Fetch bid history for an artwork */
export async function getBidHistory(artworkId: string): Promise<Bid[]> {
  const local = getLocalBids(artworkId);
  if (local.length > 0) return local;

  try {
    const { data, error } = await supabase
      .from('bids')
      .select(`
        id, amount, created_at,
        bidder:users!bidder_id (username, avatar_url)
      `)
      .eq('artwork_id', artworkId)
      .order('amount', { ascending: false })
      .limit(20);

    if (!error && data) {
      return (data ?? []) as unknown as Bid[];
    }
  } catch {
    /* fallback to local */
  }

  return local;
}

/** Subscribe to real-time bid updates */
export function subscribeToBids(
  artworkId: string,
  onNewBid: (bid: Bid) => void
) {
  const handler = (e: any) => {
    if (e.detail && e.detail.artwork_id === artworkId) {
      onNewBid(e.detail);
    }
  };
  window.addEventListener('coven:bid_placed', handler);

  const sub = supabase
    .channel(`bids:${artworkId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bids',
        filter: `artwork_id=eq.${artworkId}`,
      },
      (payload) => onNewBid(payload.new as Bid)
    )
    .subscribe();

  return {
    unsubscribe: () => {
      window.removeEventListener('coven:bid_placed', handler);
      sub.unsubscribe();
    },
  };
}

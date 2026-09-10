/* ================================================================
   COVEN — Bid Service
   Handles placing bids and fetching bid history for auctions.
   ================================================================ */
import { supabase } from '../config/supabase';
import type { Bid } from '../types';

/** Place a bid — server validates it's higher than current */
export async function placeBid(opts: {
  artworkId: string;
  bidderId: string;
  amount: number;
}): Promise<void> {
  // First check current bid
  const { data: artwork } = await supabase
    .from('artworks')
    .select('current_bid, auction_end_time, status')
    .eq('id', opts.artworkId)
    .single();

  if (!artwork) throw new Error('Artwork not found');
  if (artwork.status !== 'available') throw new Error('Auction is not active');
  if (new Date(artwork.auction_end_time) < new Date()) throw new Error('Auction has ended');
  if (artwork.current_bid && opts.amount <= artwork.current_bid) {
    throw new Error(`Bid must exceed current bid of $${artwork.current_bid.toLocaleString()}`);
  }

  const { error } = await supabase.from('bids').insert({
    artwork_id: opts.artworkId,
    bidder_id:  opts.bidderId,
    amount:     opts.amount,
  });

  if (error) throw new Error(error.message);
  // Trigger fires automatically to update artworks.current_bid
}

/** Fetch bid history for an artwork */
export async function getBidHistory(artworkId: string): Promise<Bid[]> {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      id, amount, created_at,
      bidder:users!bidder_id (username, avatar_url)
    `)
    .eq('artwork_id', artworkId)
    .order('amount', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Bid[];
}

/** Subscribe to real-time bid updates */
export function subscribeToBids(
  artworkId: string,
  onNewBid: (bid: Bid) => void
) {
  return supabase
    .channel(`bids:${artworkId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'bids',
        filter: `artwork_id=eq.${artworkId}`,
      },
      (payload) => onNewBid(payload.new as Bid)
    )
    .subscribe();
}

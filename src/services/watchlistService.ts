/* ================================================================
   COVEN — Watchlist Service
   Save / unsave artworks, fetch user's saved list.
   ================================================================ */
import { supabase } from '../config/supabase';
import type { Artwork } from '../types';

/** Add artwork to user's watchlist */
export async function addToWatchlist(userId: string, artworkId: string): Promise<void> {
  const { error } = await supabase
    .from('watchlist')
    .upsert({ user_id: userId, artwork_id: artworkId }, { onConflict: 'user_id,artwork_id' });
  if (error) throw new Error(error.message);
}

/** Remove artwork from user's watchlist */
export async function removeFromWatchlist(userId: string, artworkId: string): Promise<void> {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', userId)
    .eq('artwork_id', artworkId);
  if (error) throw new Error(error.message);
}

/** Check if an artwork is in user's watchlist */
export async function isWatchlisted(userId: string, artworkId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('watchlist')
    .select('user_id')
    .eq('user_id', userId)
    .eq('artwork_id', artworkId)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

/** Fetch user's full watchlist with artwork + artist data */
export async function getUserWatchlist(userId: string): Promise<Artwork[]> {
  const { data, error } = await supabase
    .from('watchlist')
    .select(`
      artwork:artworks (
        id, title, description, image_url, thumbnail_url,
        listing_type, price_torn, status, tags,
        current_bid, bid_count, view_count,
        auction_end_time, created_at, updated_at,
        artist_id,
        artist:artists (
          id, username, torn_id, avatar_url, tier, is_verified,
          specialization, average_rating, total_reviews
        )
      )
    `)
    .eq('user_id', userId)
    .order('added_at', { ascending: false });

  if (error) throw new Error(error.message);

  // Flatten the joined data
  return (data ?? [])
    .map((row: any) => row.artwork)
    .filter(Boolean) as Artwork[];
}

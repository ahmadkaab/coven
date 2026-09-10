/* ================================================================
   COVEN — Artist Service
   ================================================================ */
import { supabase } from '../config/supabase';
import type { Artist, ArtistFilters, PaginatedResult, Review } from '../types';

const ARTIST_SELECT = `
  id, torn_id, username, avatar_url, banner_url, bio,
  specialization, specialties, tier, is_verified,
  total_sales, average_rating, total_reviews, portfolio_count,
  created_at, updated_at
`;

/** Fetch paginated artist list */
export async function getArtists(
  filters: ArtistFilters = {}
): Promise<PaginatedResult<Artist>> {
  const {
    tier, specialization, isVerified, search,
    sort = 'rating', page = 1, perPage = 24,
  } = filters;

  let query = supabase
    .from('artists')
    .select(ARTIST_SELECT, { count: 'exact' })
    .eq('is_active', true);

  if (tier)           query = query.eq('tier', tier);
  if (specialization) query = query.eq('specialization', specialization);
  if (isVerified)     query = query.eq('is_verified', true);
  if (search)         query = query.ilike('username', `%${search}%`);

  const col = sort === 'sales' ? 'total_sales' : sort === 'newest' ? 'created_at' : 'average_rating';
  query = query.order(col, { ascending: false });

  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    data: (data ?? []) as Artist[],
    count: count ?? 0,
    page,
    perPage,
    hasMore: (count ?? 0) > page * perPage,
  };
}

/** Fetch single artist profile by ID */
export async function getArtist(id: string): Promise<Artist | null> {
  const { data, error } = await supabase
    .from('artists')
    .select(ARTIST_SELECT)
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Artist;
}

/** Fetch top artists for homepage */
export async function getTopArtists(limit = 6): Promise<Artist[]> {
  const { data, error } = await supabase
    .from('artists')
    .select(ARTIST_SELECT)
    .eq('is_active', true)
    .order('average_rating', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as Artist[];
}

/** Fetch reviews for an artist */
export async function getArtistReviews(artistId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id, rating, body, created_at, transaction_id,
      reviewer:users!reviewer_user_id (username, avatar_url)
    `)
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Review[];
}

/** Submit a review (requires prior transaction) */
export async function submitReview(payload: {
  artistId: string;
  reviewerUserId: string;
  rating: number;
  body?: string;
  transactionId?: string;
}): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    artist_id:          payload.artistId,
    reviewer_user_id:   payload.reviewerUserId,
    rating:             payload.rating,
    body:               payload.body,
    transaction_id:     payload.transactionId,
  });
  if (error) throw new Error(error.message);
}

/** Register a new artist profile (called after auth) */
export async function registerArtist(payload: {
  userId: string;
  tornId: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  specialization?: string;
}): Promise<Artist> {
  const { data, error } = await supabase
    .from('artists')
    .insert({
      user_id:        payload.userId,
      torn_id:        payload.tornId,
      username:       payload.username,
      avatar_url:     payload.avatarUrl,
      bio:            payload.bio,
      specialization: payload.specialization,
      tier:           'rising',
    })
    .select(ARTIST_SELECT)
    .single();

  if (error) throw new Error(error.message);

  // Update user record to mark as artist
  await supabase
    .from('users')
    .update({ is_artist: true })
    .eq('id', payload.userId);

  return data as Artist;
}

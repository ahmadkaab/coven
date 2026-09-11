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

/* ── Purge legacy mock data (Bell_Queen / coven-artist-01) ── */
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('coven_studio_coven-artist-01');
    localStorage.removeItem('coven_studio_bell_queen');
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.toLowerCase().includes('bell_queen') || k.toLowerCase().includes('coven-artist-01'))) {
        localStorage.removeItem(k);
      }
    }
  } catch {}
}

export const AHMAD_SOVEREIGN_ARTIST: Artist = {
  id: 'artist-ahmad-01',
  user_id: 'ahmad-sovereign-uuid',
  torn_id: '4295891',
  username: 'ahmad_kaab',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  banner_url: '/renaissance_hero.jpg',
  bio: 'Lead Artist & Platform Founder. Creator of custom faction banners, profile pictures, 3D renders, and animated forum signatures for Torn City players.',
  specialization: 'Custom Graphics, 3D Renders & Forum Signatures',
  specialties: ['Faction Banners', 'Forum Signatures', 'Avatars', 'Logos', '3D Graphics', 'Digital Art'],
  tier: 'legend',
  is_verified: true,
  total_sales: 128,
  average_rating: 5.0,
  total_reviews: 42,
  portfolio_count: 16,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
};

/** Fetch paginated artist list */
export async function getArtists(
  filters: ArtistFilters = {}
): Promise<PaginatedResult<Artist>> {
  const {
    tier, specialization, isVerified, search,
    sort = 'rating', page = 1, perPage = 24,
  } = filters;

  try {
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
    if (error || !data || data.length === 0) {
      return {
        data: [AHMAD_SOVEREIGN_ARTIST],
        count: 1,
        page: 1,
        perPage,
        hasMore: false,
      };
    }

    // Filter to ensure Ahmad is sovereign, purging any legacy mock entries
    const cleanList = (data as Artist[]).filter(a => a.username?.toLowerCase() !== 'bell_queen');
    if (cleanList.length === 0) cleanList.push(AHMAD_SOVEREIGN_ARTIST);

    return {
      data: cleanList,
      count: cleanList.length,
      page,
      perPage,
      hasMore: false,
    };
  } catch {
    return {
      data: [AHMAD_SOVEREIGN_ARTIST],
      count: 1,
      page: 1,
      perPage,
      hasMore: false,
    };
  }
}

/** Fetch single artist profile by ID */
export async function getArtist(id: string): Promise<Artist | null> {
  if (id === 'artist-ahmad-01' || id === 'ahmad_kaab' || id === '4295891') {
    return AHMAD_SOVEREIGN_ARTIST;
  }

  try {
    const { data, error } = await supabase
      .from('artists')
      .select(ARTIST_SELECT)
      .eq('id', id)
      .single();

    if (error || !data) return AHMAD_SOVEREIGN_ARTIST;
    if ((data as Artist).username?.toLowerCase() === 'bell_queen') {
      return AHMAD_SOVEREIGN_ARTIST;
    }
    return data as Artist;
  } catch {
    return AHMAD_SOVEREIGN_ARTIST;
  }
}

/** Fetch top artists for homepage */
export async function getTopArtists(limit = 6): Promise<Artist[]> {
  try {
    const { data, error } = await supabase
      .from('artists')
      .select(ARTIST_SELECT)
      .eq('is_active', true)
      .order('average_rating', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return [AHMAD_SOVEREIGN_ARTIST];
    }
    const clean = (data as Artist[]).filter(a => a.username?.toLowerCase() !== 'bell_queen');
    return clean.length > 0 ? clean : [AHMAD_SOVEREIGN_ARTIST];
  } catch {
    return [AHMAD_SOVEREIGN_ARTIST];
  }
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

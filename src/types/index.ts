/* ================================================================
   COVEN — Unified Type Definitions
   These match both the Supabase schema and the UI layer.
   ================================================================ */

/* ── TORN USER (from Torn API) ─────────────────────────────── */
export interface TornUser {
  player_id: number;
  name: string;
  level: number;
  gender: string;
  rank: string;
  profile_image: string;
  donator: boolean;
  faction?: { faction_id: number; faction_name: string };
  last_action?: { status: string };
}

/* ── ARTIST ────────────────────────────────────────────────── */
export interface Artist {
  id: string;
  user_id?: string;
  torn_id?: string;            // Torn player ID as string
  username: string;            // display name (torn name)
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  specialization?: string;     // primary art type
  specialties?: string[];      // multi-tag
  tier?: 'rising' | 'trusted' | 'master' | 'legend';
  is_verified?: boolean;
  total_sales?: number;
  average_rating?: number;
  total_reviews?: number;
  portfolio_count?: number;
  created_at: string;
  updated_at: string;
}

/* ── ARTWORK ───────────────────────────────────────────────── */
export type ArtworkStatus = 'available' | 'sold' | 'reserved' | 'draft';
export type ListingType   = 'fixed' | 'auction' | 'commission';

export interface Artwork {
  id: string;
  artist_id: string;
  artist?: Artist;             // joined
  title: string;
  description?: string;
  image_url?: string;
  thumbnail_url?: string;
  listing_type: ListingType;
  price_torn?: number;         // fixed price in Torn cash
  price_cr?: number;           // price in COVEN Credits (1 Xanax = 1,000 CR)
  status: ArtworkStatus;
  tags?: string[];
  is_nsfw?: boolean;
  // auction fields
  auction_end_time?: string;
  current_bid?: number;
  current_bid_cr?: number;     // current bid in CR
  bid_count?: number;
  // blind auction & pinning
  is_blind?: boolean;          // blind auction: artist & bidders masked
  blind_cipher?: string;       // e.g. "Cipher #12"
  revealed?: boolean;          // true when auction ends and real identity revealed
  is_pinned?: boolean;         // featured 10 Xanax listing
  pin_expires_at?: string;
  // meta
  view_count?: number;
  created_at: string;
  updated_at: string;
}

/* ── BID ───────────────────────────────────────────────────── */
export interface Bid {
  id: string;
  artwork_id: string;
  bidder_id: string;
  bidder?: Artist;
  amount: number;
  amount_cr?: number;          // bid amount in CR
  blind_alias?: string;        // e.g. "Collector #04"
  created_at: string;
}

/* ── WALLET & TOKENS (1 Xanax = 1,000 CR) ──────────────────── */
export interface Wallet {
  user_id: string;
  torn_id: string;
  balance_cr: number;          // available Credits for bidding / buying
  locked_cr: number;           // held in active blind/standard bids
  total_deposited_xanax: number;
  total_withdrawn_xanax: number;
  updated_at: string;
}

export type WithdrawalStatus = 'pending' | 'claimed' | 'fulfilled' | 'cancelled';

export interface WithdrawalTicket {
  id: string;
  user_id: string;
  torn_id: string;
  amount_cr: number;
  amount_xanax: number;
  status: WithdrawalStatus;
  claimed_by_banker_id?: string;
  claimed_by?: string;
  proof_log_url?: string;
  created_at: string;
  fulfilled_at?: string;
}

export type WalletTxType = 'deposit' | 'withdrawal' | 'bid_hold' | 'bid_refund' | 'sale_payout' | 'pin_fee';

export interface WalletTransaction {
  id: string;
  user_id: string;
  torn_id: string;
  type: WalletTxType;
  amount_cr: number;
  amount_xanax?: number;
  description: string;
  created_at: string;
}

/* ── TRANSACTION ───────────────────────────────────────────── */
export type TransactionStatus = 'pending' | 'verified' | 'disputed' | 'cancelled';

export interface Transaction {
  id: string;
  artwork_id: string;
  artwork?: Artwork;
  buyer_user_id: string;
  seller_user_id: string;
  amount: number;
  status: TransactionStatus;
  torn_log_id?: string;
  notes?: string;
  created_at: string;
  verified_at?: string;
}

/* ── COMMISSION ────────────────────────────────────────────── */
export type CommissionStatus = 'open' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';

export interface Commission {
  id: string;
  artist_id: string;
  artist?: Artist;
  buyer_user_id: string;
  title: string;
  description: string;
  budget_torn?: number;
  deadline?: string;
  status: CommissionStatus;
  deliverable_url?: string;
  created_at: string;
  updated_at: string;
}

/* ── REVIEW ────────────────────────────────────────────────── */
export interface Review {
  id: string;
  artist_id: string;
  reviewer_user_id: string;
  reviewer?: { username: string; avatar_url?: string; torn_id?: string };
  rating: number;             // 1–5
  body?: string;
  transaction_id?: string;
  created_at: string;
}

/* ── PAGINATION ────────────────────────────────────────────── */
export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

/* ── FILTER / QUERY PARAMS ─────────────────────────────────── */
export interface ArtworkFilters {
  listingType?: ListingType;
  status?: ArtworkStatus;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  artistId?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  perPage?: number;
}

export interface ArtistFilters {
  tier?: Artist['tier'];
  specialization?: string;
  isVerified?: boolean;
  search?: string;
  sort?: 'rating' | 'sales' | 'newest';
  page?: number;
  perPage?: number;
}

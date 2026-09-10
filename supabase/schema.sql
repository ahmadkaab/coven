-- ================================================================
-- COVEN ART MARKET — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── USERS (mirrors Torn player, one per Torn ID) ─────────────
create table if not exists public.users (
  id              uuid primary key default uuid_generate_v4(),
  torn_id         text unique not null,     -- Torn player_id as text
  username        text not null,            -- torn display name
  level           int  default 0,
  avatar_url      text,
  is_artist       boolean default false,
  api_key_hint    text,                     -- last 4 chars only, for display
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── ARTISTS ──────────────────────────────────────────────────
create table if not exists public.artists (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.users(id) on delete cascade,
  torn_id         text unique not null,
  username        text not null,
  avatar_url      text,
  banner_url      text,
  bio             text,
  specialization  text,
  specialties     text[] default '{}',
  tier            text check (tier in ('rising','trusted','master','legend')) default 'rising',
  is_verified     boolean default false,
  total_sales     int default 0,
  average_rating  numeric(3,2) default 0,
  total_reviews   int default 0,
  portfolio_count int default 0,
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── ARTWORKS ─────────────────────────────────────────────────
create table if not exists public.artworks (
  id              uuid primary key default uuid_generate_v4(),
  artist_id       uuid references public.artists(id) on delete cascade,
  title           text not null,
  description     text,
  image_url       text,
  thumbnail_url   text,
  listing_type    text check (listing_type in ('fixed','auction','commission')) not null,
  price_torn      bigint,                   -- Torn cash amount
  status          text check (status in ('available','sold','reserved','draft')) default 'draft',
  tags            text[] default '{}',
  is_nsfw         boolean default false,
  -- auction
  auction_end_time timestamptz,
  current_bid     bigint,
  bid_count       int default 0,
  -- meta
  view_count      int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── BIDS ─────────────────────────────────────────────────────
create table if not exists public.bids (
  id              uuid primary key default uuid_generate_v4(),
  artwork_id      uuid references public.artworks(id) on delete cascade,
  bidder_id       uuid references public.users(id) on delete cascade,
  amount          bigint not null,
  created_at      timestamptz default now()
);

-- ── TRANSACTIONS ──────────────────────────────────────────────
create table if not exists public.transactions (
  id              uuid primary key default uuid_generate_v4(),
  artwork_id      uuid references public.artworks(id),
  buyer_user_id   uuid references public.users(id),
  seller_user_id  uuid references public.users(id),
  amount          bigint not null,
  status          text check (status in ('pending','verified','disputed','cancelled')) default 'pending',
  torn_log_id     text,
  notes           text,
  created_at      timestamptz default now(),
  verified_at     timestamptz
);

-- ── COMMISSIONS ───────────────────────────────────────────────
create table if not exists public.commissions (
  id              uuid primary key default uuid_generate_v4(),
  artist_id       uuid references public.artists(id) on delete cascade,
  buyer_user_id   uuid references public.users(id),
  title           text not null,
  description     text not null,
  budget_torn     bigint,
  deadline        timestamptz,
  status          text check (status in ('open','in_progress','delivered','completed','cancelled')) default 'open',
  deliverable_url text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── REVIEWS ──────────────────────────────────────────────────
create table if not exists public.reviews (
  id                  uuid primary key default uuid_generate_v4(),
  artist_id           uuid references public.artists(id) on delete cascade,
  reviewer_user_id    uuid references public.users(id),
  transaction_id      uuid references public.transactions(id),
  rating              int check (rating between 1 and 5) not null,
  body                text,
  created_at          timestamptz default now(),
  -- one review per buyer per artist
  unique (artist_id, reviewer_user_id)
);

-- ── WATCHLIST ─────────────────────────────────────────────────
create table if not exists public.watchlist (
  user_id     uuid references public.users(id) on delete cascade,
  artwork_id  uuid references public.artworks(id) on delete cascade,
  added_at    timestamptz default now(),
  primary key (user_id, artwork_id)
);

-- ================================================================
-- INDEXES
-- ================================================================
create index if not exists idx_artworks_artist    on public.artworks(artist_id);
create index if not exists idx_artworks_status    on public.artworks(status);
create index if not exists idx_artworks_listing   on public.artworks(listing_type);
create index if not exists idx_artworks_created   on public.artworks(created_at desc);
create index if not exists idx_bids_artwork       on public.bids(artwork_id);
create index if not exists idx_transactions_buyer on public.transactions(buyer_user_id);
create index if not exists idx_reviews_artist     on public.reviews(artist_id);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
alter table public.users        enable row level security;
alter table public.artists      enable row level security;
alter table public.artworks     enable row level security;
alter table public.bids         enable row level security;
alter table public.transactions enable row level security;
alter table public.commissions  enable row level security;
alter table public.reviews      enable row level security;
alter table public.watchlist    enable row level security;

-- Public read for artworks and artists
create policy "artworks_public_read"  on public.artworks  for select using (status != 'draft');
create policy "artists_public_read"   on public.artists   for select using (is_active = true);
create policy "reviews_public_read"   on public.reviews   for select using (true);

-- Users can read/write their own data
create policy "users_self_read"       on public.users     for select using (true);
create policy "bids_public_read"      on public.bids      for select using (true);
create policy "commissions_artist_read" on public.commissions for select using (true);

-- ================================================================
-- FUNCTIONS
-- ================================================================

-- Increment view count atomically
create or replace function increment_view_count(artwork_uuid uuid)
returns void language sql as $$
  update public.artworks set view_count = view_count + 1 where id = artwork_uuid;
$$;

-- Update artist stats after new review
create or replace function update_artist_rating()
returns trigger language plpgsql as $$
begin
  update public.artists set
    average_rating = (
      select avg(rating)::numeric(3,2) from public.reviews where artist_id = new.artist_id
    ),
    total_reviews = (
      select count(*) from public.reviews where artist_id = new.artist_id
    )
  where id = new.artist_id;
  return new;
end;
$$;

create trigger on_review_insert
  after insert on public.reviews
  for each row execute function update_artist_rating();

-- Update artwork bid state after new bid
create or replace function update_artwork_bid()
returns trigger language plpgsql as $$
begin
  update public.artworks set
    current_bid = new.amount,
    bid_count   = bid_count + 1,
    updated_at  = now()
  where id = new.artwork_id and (current_bid is null or new.amount > current_bid);
  return new;
end;
$$;

create trigger on_bid_insert
  after insert on public.bids
  for each row execute function update_artwork_bid();

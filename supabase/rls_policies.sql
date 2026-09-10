-- ================================================================
-- COVEN — RLS Policies
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ================================================================

-- ── USERS ────────────────────────────────────────────────────
alter table public.users enable row level security;

-- Anyone can read users (public profiles)
create policy "users_read_all"
  on public.users for select
  using (true);

-- Anon can insert/update (we auth via Torn API, not Supabase Auth)
create policy "users_insert_anon"
  on public.users for insert
  to anon
  with check (true);

create policy "users_update_anon"
  on public.users for update
  to anon
  using (true)
  with check (true);

-- ── ARTISTS ──────────────────────────────────────────────────
alter table public.artists enable row level security;

create policy "artists_read_all"
  on public.artists for select
  using (true);

create policy "artists_insert_anon"
  on public.artists for insert
  to anon
  with check (true);

create policy "artists_update_anon"
  on public.artists for update
  to anon
  using (true)
  with check (true);

-- ── ARTWORKS ─────────────────────────────────────────────────
alter table public.artworks enable row level security;

create policy "artworks_read_all"
  on public.artworks for select
  using (true);

create policy "artworks_insert_anon"
  on public.artworks for insert
  to anon
  with check (true);

create policy "artworks_update_anon"
  on public.artworks for update
  to anon
  using (true)
  with check (true);

-- ── BIDS ─────────────────────────────────────────────────────
alter table public.bids enable row level security;

create policy "bids_read_all"    on public.bids for select using (true);
create policy "bids_insert_anon" on public.bids for insert to anon with check (true);

-- ── COMMISSIONS ──────────────────────────────────────────────
alter table public.commissions enable row level security;

create policy "commissions_read_all"    on public.commissions for select using (true);
create policy "commissions_insert_anon" on public.commissions for insert to anon with check (true);
create policy "commissions_update_anon" on public.commissions for update to anon using (true) with check (true);

-- ── REVIEWS ──────────────────────────────────────────────────
alter table public.reviews enable row level security;

create policy "reviews_read_all"    on public.reviews for select using (true);
create policy "reviews_insert_anon" on public.reviews for insert to anon with check (true);

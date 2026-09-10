-- ================================================================
-- COVEN — Missing DB Functions & Fixes
-- Run this in Supabase SQL Editor
-- ================================================================

-- ── increment_view_count RPC ──────────────────────────────────
-- Called by getArtwork() on every detail page view
create or replace function public.increment_view_count(artwork_uuid uuid)
returns void
language sql
security definer
as $$
  update public.artworks
  set view_count = coalesce(view_count, 0) + 1
  where id = artwork_uuid;
$$;

-- ── Ensure artists have is_active = true by default ──────────
-- (getArtists filters by is_active = true)
alter table public.artists
  alter column is_active set default true;

-- Backfill any existing artists that may have null
update public.artists set is_active = true where is_active is null;

-- ── Add view_count column if missing ─────────────────────────
alter table public.artworks
  add column if not exists view_count int default 0;

-- ── Add bid_count column if missing ──────────────────────────
alter table public.artworks
  add column if not exists bid_count int default 0;

-- ── TRANSACTIONS RLS ──────────────────────────────────────────
alter table public.transactions enable row level security;
create policy if not exists "transactions_read_all" on public.transactions for select using (true);
create policy if not exists "transactions_insert_anon" on public.transactions for insert to anon with check (true);
create policy if not exists "transactions_update_anon" on public.transactions for update to anon using (true) with check (true);

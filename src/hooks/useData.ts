import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getArtworks, getArtwork, getLiveAuctions, getNewDrops } from '../services/artworkService';
import { getArtists, getArtist, getTopArtists, getArtistReviews } from '../services/artistService';
import { getBidHistory, placeBid } from '../services/bidService';
import { getUserWatchlist } from '../services/watchlistService';
import type { ArtworkFilters, ArtistFilters } from '../types';

/* ── QUERY KEYS ──────────────────────────────────────────── */
export const queryKeys = {
  artworks:      (filters: ArtworkFilters) => ['artworks', filters] as const,
  artwork:       (id: string)              => ['artwork', id]       as const,
  liveAuctions:  ()                        => ['liveAuctions']      as const,
  newDrops:      ()                        => ['newDrops']          as const,
  artists:       (filters: ArtistFilters)  => ['artists', filters]  as const,
  artist:        (id: string)              => ['artist', id]        as const,
  topArtists:    ()                        => ['topArtists']        as const,
  artistReviews: (id: string)              => ['artistReviews', id] as const,
  bids:          (artworkId: string)       => ['bids', artworkId]   as const,
  watchlist:     (userId: string)          => ['watchlist', userId] as const,
};

/* ── ARTWORKS ─────────────────────────────────────────────── */
export function useArtworks(filters: ArtworkFilters = {}) {
  return useQuery({
    queryKey: queryKeys.artworks(filters),
    queryFn:  () => getArtworks(filters),
    staleTime: 30_000,
  });
}

export function useArtwork(id: string) {
  return useQuery({
    queryKey: queryKeys.artwork(id),
    queryFn:  () => getArtwork(id),
    enabled:  !!id,
    staleTime: 10_000,
  });
}

export function useLiveAuctions(limit = 6) {
  return useQuery({
    queryKey: queryKeys.liveAuctions(),
    queryFn:  () => getLiveAuctions(limit),
    staleTime: 15_000,
    refetchInterval: 30_000, // poll every 30s for auction updates
  });
}

export function useNewDrops(limit = 8) {
  return useQuery({
    queryKey: queryKeys.newDrops(),
    queryFn:  () => getNewDrops(limit),
    staleTime: 60_000,
  });
}

/* ── ARTISTS ─────────────────────────────────────────────── */
export function useArtists(filters: ArtistFilters = {}) {
  return useQuery({
    queryKey: queryKeys.artists(filters),
    queryFn:  () => getArtists(filters),
    staleTime: 60_000,
  });
}

export function useArtist(id: string) {
  return useQuery({
    queryKey: queryKeys.artist(id),
    queryFn:  () => getArtist(id),
    enabled:  !!id,
    staleTime: 30_000,
  });
}

export function useTopArtists(limit = 6) {
  return useQuery({
    queryKey: queryKeys.topArtists(),
    queryFn:  () => getTopArtists(limit),
    staleTime: 120_000,
  });
}

export function useArtistReviews(artistId: string) {
  return useQuery({
    queryKey: queryKeys.artistReviews(artistId),
    queryFn:  () => getArtistReviews(artistId),
    enabled:  !!artistId,
    staleTime: 30_000,
  });
}

/* ── BIDS ────────────────────────────────────────────────── */
export function useBidHistory(artworkId: string) {
  return useQuery({
    queryKey: queryKeys.bids(artworkId),
    queryFn:  () => getBidHistory(artworkId),
    enabled:  !!artworkId,
    staleTime: 5_000,
  });
}

export function usePlaceBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: placeBid,
    onSuccess: (_, vars) => {
      // Invalidate the artwork and bid history so UI updates
      qc.invalidateQueries({ queryKey: queryKeys.artwork(vars.artworkId) });
      qc.invalidateQueries({ queryKey: queryKeys.bids(vars.artworkId) });
      qc.invalidateQueries({ queryKey: queryKeys.liveAuctions() });
    },
  });
}

/* ── WATCHLIST ───────────────────────────────────────────── */
export function useWatchlist(userId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.watchlist(userId ?? ''),
    queryFn: () => (userId ? getUserWatchlist(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: 30_000,
  });
}


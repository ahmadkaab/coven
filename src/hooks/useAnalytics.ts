/* ================================================================
   COVEN — Analytics Hooks
   React Query wrappers for analytics data fetching
   ================================================================ */
import { useQuery } from '@tanstack/react-query';
import {
  getRevenueStats,
  getArtworkPerformance,
  getAudienceInsights,
  type RevenueStats,
  type ArtworkMetric,
  type AudienceData,
} from '../services/analyticsService';

export function useRevenueStats(artistId: string | null | undefined) {
  return useQuery<RevenueStats>({
    queryKey: ['analytics', 'revenue', artistId],
    queryFn: () => getRevenueStats(artistId!),
    enabled: !!artistId,
    staleTime: 60_000,       // 1 minute
    refetchOnWindowFocus: false,
  });
}

export function useArtworkPerformance(artistId: string | null | undefined) {
  return useQuery<ArtworkMetric[]>({
    queryKey: ['analytics', 'performance', artistId],
    queryFn: () => getArtworkPerformance(artistId!),
    enabled: !!artistId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAudienceInsights(artistId: string | null | undefined) {
  return useQuery<AudienceData>({
    queryKey: ['analytics', 'audience', artistId],
    queryFn: () => getAudienceInsights(artistId!),
    enabled: !!artistId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

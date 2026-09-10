import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MARKET_INDICES,
  MARKET_OVERVIEW,
  FACTION_LEADERBOARD,
  getInitialTradingEvents,
  generateNextTradeEvent,
  calculateArtValuation,
  type MarketIndex,
  type MarketOverviewStats,
  type TradingEvent,
  type FactionLeaderboardEntry,
  type ValuationParams,
  type ValuationResult,
} from '../services/marketPulseService';

export function useMarketIndices() {
  const [indices, setIndices] = useState<MarketIndex[]>(MARKET_INDICES);
  const [overview, setOverview] = useState<MarketOverviewStats>(MARKET_OVERVIEW);

  // Micro-fluctuations every 12 seconds to give life to live terminal
  useEffect(() => {
    const interval = setInterval(() => {
      setIndices((prev) =>
        prev.map((idx) => {
          const delta = (Math.random() - 0.48) * 0.4;
          const newChange = Math.round((idx.change24h + delta) * 10) / 10;
          return {
            ...idx,
            change24h: newChange,
            isPositive: newChange >= 0,
          };
        })
      );
    }, 12_000);

    return () => clearInterval(interval);
  }, []);

  return { indices, overview };
}

export function useTradingTape(limit = 8, isLive = true) {
  const [events, setEvents] = useState<TradingEvent[]>(getInitialTradingEvents);

  useEffect(() => {
    if (!isLive) return;

    // Simulate real-time market activity every 7-10 seconds
    const interval = setInterval(() => {
      const nextEvent = generateNextTradeEvent();
      setEvents((prev) => [nextEvent, ...prev.slice(0, limit - 1)]);
    }, 7_500);

    return () => clearInterval(interval);
  }, [isLive, limit]);

  return { events };
}

export function useFactionLeaderboard() {
  const leaderboard: FactionLeaderboardEntry[] = useMemo(() => FACTION_LEADERBOARD, []);
  return { leaderboard };
}

export function useArtValuation() {
  const [params, setParams] = useState<ValuationParams>({
    category: 'signature',
    complexity: 'anim_30',
    artistTier: 'trusted',
    turnaround: 'standard',
    exclusivity: 'exclusive',
  });

  const valuation: ValuationResult = useMemo(() => {
    return calculateArtValuation(params);
  }, [params]);

  const updateParam = useCallback(<K extends keyof ValuationParams>(key: K, value: ValuationParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    params,
    valuation,
    updateParam,
  };
}

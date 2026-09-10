import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MARKET_INDICES,
  MARKET_OVERVIEW,
  getInitialTradingEvents,
  calculateArtValuation,
  type MarketIndex,
  type MarketOverviewStats,
  type TradingEvent,
  type ValuationParams,
  type ValuationResult,
} from '../services/marketPulseService';

export function useMarketIndices() {
  const [indices, setIndices] = useState<MarketIndex[]>(MARKET_INDICES);
  const [overview] = useState<MarketOverviewStats>(MARKET_OVERVIEW);

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

export function useTradingTape(_limit = 8, _isLive = true) {
  const [events] = useState<TradingEvent[]>(getInitialTradingEvents);
  return { events };
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

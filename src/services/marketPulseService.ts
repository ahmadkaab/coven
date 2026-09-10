/* ================================================================
   COVEN — Torn City Market Pulse & Economy Intelligence Service
   Tracks real-time art valuations, trading tape, and faction leaderboards
   ================================================================ */

export interface MarketIndex {
  id: string;
  name: string;
  code: string;
  currentValue: number; // in Torn Cash
  change24h: number;    // percentage, e.g. +6.2
  isPositive: boolean;
  unit: string;
  description: string;
}

export interface MarketOverviewStats {
  donatorPackRate: number;      // e.g. 24500000
  total24hVolume: number;       // e.g. 482500000
  activeTradesCount: number;    // e.g. 142
  verifiedArtistsOnline: number;// e.g. 18
  marketSentiment: 'EXTREMELY_BULLISH' | 'BULLISH' | 'BALANCED' | 'SELECTIVE';
  sentimentScore: number;       // 0 to 100
  marketSummary: string;
}

export type TradeEventType = 'SALE' | 'OUTBID' | 'COMMISSION_ESCROW' | 'VOUCH_RECORDED' | 'LISTING_MINT';

export interface TradingEvent {
  id: string;
  timestamp: string;
  type: TradeEventType;
  title: string;
  amountTorn: number;
  dpEquivalent: number;
  counterpartyName: string;
  counterpartyTornId: string;
  factionTag?: string;
  factionName?: string;
  artistName: string;
  artworkId?: string;
}

export interface FactionLeaderboardEntry {
  rank: number;
  factionName: string;
  factionTag: string;
  totalVolumeTorn: number;
  piecesCommissioned: number;
  preferredArtist: string;
  marketSharePct: number;
  territoryInfluence: string;
}

export interface ValuationParams {
  category: 'avatar' | 'signature' | 'banner' | 'suite';
  complexity: 'static' | 'anim_30' | 'anim_60' | 'render_3d';
  artistTier: 'rising' | 'trusted' | 'master' | 'legend';
  turnaround: 'standard' | 'priority' | 'rush';
  exclusivity: 'standard' | 'exclusive';
}

export interface ValuationResult {
  minPrice: number;
  medianPrice: number;
  maxPrice: number;
  dpEquivalent: number;
  confidenceScore: number;
  turnaroundEstimate: string;
  recommendedTags: string[];
}

export const DONATOR_PACK_VALUE = 24_500_000; // standard Torn cash parity

/* ── Market Indices ──────────────────────────────────────────── */
export const MARKET_INDICES: MarketIndex[] = [
  {
    id: 'dp_parity',
    name: 'Donator Pack Parity',
    code: 'TORN/DP',
    currentValue: 24_500_000,
    change24h: 0.8,
    isPositive: true,
    unit: '$ / DP',
    description: 'Current baseline exchange rate of Torn Donator Packs against digital art pricing',
  },
  {
    id: 'sig_index',
    name: 'Forum Signature Composite',
    code: 'SIG-X',
    currentValue: 8_450_000,
    change24h: 6.2,
    isPositive: true,
    unit: '$ TORN',
    description: 'Volume-weighted average sale price of 600×200 forum signatures over 24h',
  },
  {
    id: 'banner_index',
    name: 'Faction War Banner Index',
    code: 'FBNR-IX',
    currentValue: 34_800_000,
    change24h: 14.5,
    isPositive: true,
    unit: '$ TORN',
    description: 'High-impact faction recruitment & territory war banners commissioned this cycle',
  },
  {
    id: 'avatar_index',
    name: 'High-Res Avatar Median',
    code: 'AVTR-M',
    currentValue: 6_200_000,
    change24h: -1.8,
    isPositive: false,
    unit: '$ TORN',
    description: 'Median transaction price for 1:1 portrait avatar renders and pixel pieces',
  },
  {
    id: 'suite_index',
    name: 'Full Profile BBCode Suite',
    code: 'PROF-S',
    currentValue: 48_000_000,
    change24h: 9.1,
    isPositive: true,
    unit: '$ TORN',
    description: 'Complete faction leadership profiles, custom BBCode layout styling & artwork packages',
  },
];

export const MARKET_OVERVIEW: MarketOverviewStats = {
  donatorPackRate: DONATOR_PACK_VALUE,
  total24hVolume: 482_500_000,
  activeTradesCount: 142,
  verifiedArtistsOnline: 18,
  marketSentiment: 'EXTREMELY_BULLISH',
  sentimentScore: 88,
  marketSummary: 'High syndicate liquidity. Faction war preparation driving peak demand for animated signatures.',
};

export const FACTION_LEADERBOARD: FactionLeaderboardEntry[] = [];

/* ── Recent Trading Tape ────────────────────────────── */
const INITIAL_EVENTS: TradingEvent[] = [];

export function getInitialTradingEvents(): TradingEvent[] {
  return [];
}

/* ── Art Valuation Algorithm ──────────────────────────────────── */
export function calculateArtValuation(params: ValuationParams): ValuationResult {
  // Base cost by category
  let basePrice = 8_000_000;
  let turnaroundEstimate = '3-5 Days';
  const recommendedTags: string[] = [];

  switch (params.category) {
    case 'avatar':
      basePrice = 5_000_000;
      turnaroundEstimate = '1-2 Days';
      recommendedTags.push('Avatar', 'Portrait', 'Pixel Art');
      break;
    case 'signature':
      basePrice = 8_500_000;
      turnaroundEstimate = '3-4 Days';
      recommendedTags.push('Signature', 'Forum Graphic', 'Cyberpunk');
      break;
    case 'banner':
      basePrice = 28_000_000;
      turnaroundEstimate = '4-6 Days';
      recommendedTags.push('Faction Banner', 'War Graphics', 'Recruitment');
      break;
    case 'suite':
      basePrice = 45_000_000;
      turnaroundEstimate = '5-7 Days';
      recommendedTags.push('Profile Suite', 'BBCode', 'Full Identity');
      break;
  }

  // Complexity multiplier
  let complexityMultiplier = 1.0;
  switch (params.complexity) {
    case 'static':
      complexityMultiplier = 1.0;
      break;
    case 'anim_30':
      complexityMultiplier = 1.45;
      recommendedTags.push('Animated', '30fps');
      break;
    case 'anim_60':
      complexityMultiplier = 1.85;
      recommendedTags.push('Animated 60fps', 'High Frame Rate');
      break;
    case 'render_3d':
      complexityMultiplier = 2.2;
      recommendedTags.push('3D Render', 'Cinema4D');
      break;
  }

  // Artist Tier multiplier
  let tierMultiplier = 1.0;
  switch (params.artistTier) {
    case 'rising':
      tierMultiplier = 1.0;
      break;
    case 'trusted':
      tierMultiplier = 1.35;
      break;
    case 'master':
      tierMultiplier = 1.8;
      break;
    case 'legend':
      tierMultiplier = 2.6;
      break;
  }

  // Turnaround multiplier
  let turnaroundMultiplier = 1.0;
  if (params.turnaround === 'priority') {
    turnaroundMultiplier = 1.25;
    turnaroundEstimate = '48h Priority';
  } else if (params.turnaround === 'rush') {
    turnaroundMultiplier = 1.6;
    turnaroundEstimate = '24h Express Rush';
  }

  // Exclusivity
  const exclusivityMultiplier = params.exclusivity === 'exclusive' ? 1.2 : 0.95;

  // Final median price rounded to nearest $250k
  const rawMedian = basePrice * complexityMultiplier * tierMultiplier * turnaroundMultiplier * exclusivityMultiplier;
  const medianPrice = Math.round(rawMedian / 250_000) * 250_000;
  const minPrice = Math.round((medianPrice * 0.82) / 250_000) * 250_000;
  const maxPrice = Math.round((medianPrice * 1.25) / 250_000) * 250_000;

  const dpEquivalent = Math.round((medianPrice / DONATOR_PACK_VALUE) * 10) / 10;
  const confidenceScore = 92;

  return {
    minPrice,
    medianPrice,
    maxPrice,
    dpEquivalent,
    confidenceScore,
    turnaroundEstimate,
    recommendedTags,
  };
}

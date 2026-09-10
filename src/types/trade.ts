export type TradeStatus =
  | 'OPEN'
  | 'LOCKED'
  | 'ACCEPTED'
  | 'COUNTERED'
  | 'DECLINED'
  | 'SETTLED';

export interface TradeParty {
  userId: string;
  username: string;
  tornPlayerId: number;
  avatarUrl: string;
  factionTag?: string;
  isInitiator: boolean;
  hasLocked: boolean;
  hasAccepted: boolean;
}

export interface TradeAsset {
  artworkId: string;
  title: string;
  imageUrl: string;
  artistName: string;
  edition: string;
  estimatedValue: number;
}

export interface TradeSide {
  party: TradeParty;
  offeredAssets: TradeAsset[];
  cashSweetener: number; // in Torn $
}

export interface TradeLog {
  id: string;
  timestamp: string;
  actorName: string;
  action: string;
  details?: string;
}

export interface TradeOffer {
  id: string;
  title: string;
  description: string;
  initiatorSide: TradeSide;
  targetSide: TradeSide;
  status: TradeStatus;
  createdAt: string;
  updatedAt: string;
  settledAt?: string;
  escrowContractId: string;
  logs: TradeLog[];
  tags: string[];
  isPublicListing: boolean;
}

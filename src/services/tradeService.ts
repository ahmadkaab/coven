/* ================================================================
   COVEN — Syndicate Black Market & P2P Trade Service
   Manages P2P artwork swaps, cash sweeteners, and dual escrow.
   ================================================================ */

import type { TradeOffer, TradeAsset, TradeParty, TradeStatus, TradeLog } from '../types/trade';
import { dispatchNotification } from './notificationService';

const TRADES_KEY = 'coven_trades_v1';

/* ── SEED DATA ─────────────────────────────────────────────── */
const SEED_TRADES: TradeOffer[] = [
  {
    id: 'tr-01',
    title: 'Apex Master Swap: City Under Siege ↔ Neon Syndicate + $25M Cash',
    description: 'Looking to trade my verified Genesis Masterpiece "City Under Siege" for high-impact neon animated signatures with cash sweetener to fund upcoming Ranked War expenses.',
    initiatorSide: {
      party: {
        userId: 'user-demo',
        username: 'SINTEX',
        tornPlayerId: 2190421,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        factionTag: 'MNCH',
        isInitiator: true,
        hasLocked: true,
        hasAccepted: false,
      },
      offeredAssets: [
        {
          artworkId: 'art-1',
          title: 'City Under Siege',
          imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
          artistName: 'DarkMatter_7',
          edition: 'EDITION #01/01 MASTER',
          estimatedValue: 250000000,
        },
      ],
      cashSweetener: 0,
    },
    targetSide: {
      party: {
        userId: 'user-viper',
        username: 'Viper_NS',
        tornPlayerId: 2048911,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        factionTag: 'NS',
        isInitiator: false,
        hasLocked: false,
        hasAccepted: false,
      },
      offeredAssets: [
        {
          artworkId: 'art-2',
          title: 'Shadow Protocol',
          imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
          artistName: 'ahmad_kaab',
          edition: 'GENESIS #01/01',
          estimatedValue: 180000000,
        },
      ],
      cashSweetener: 25000000,
    },
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    escrowContractId: 'CVN-ESCROW-99201',
    tags: ['Master Asset', 'Cash Sweetened', 'Monarch vs NS'],
    isPublicListing: true,
    logs: [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        actorName: 'SINTEX',
        action: 'CREATED_TRADE',
        details: 'Submitted City Under Siege into COVEN P2P Escrow.',
      },
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        actorName: 'Viper_NS',
        action: 'COUNTER_PROPOSAL',
        details: 'Added Shadow Protocol + $25,000,000 Torn Cash sweetener.',
      },
    ],
  },
  {
    id: 'tr-02',
    title: 'Pure Artwork Swap: Viper Protocol ↔ Shadow Protocol + $10M Cash',
    description: 'Direct swap proposed for high-tier territory war graphics between Monarch High Council and Natural Selection Strike Team.',
    initiatorSide: {
      party: {
        userId: 'user-nova',
        username: 'Nova_MNCH',
        tornPlayerId: 1984201,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        factionTag: 'MNCH',
        isInitiator: true,
        hasLocked: true,
        hasAccepted: true,
      },
      offeredAssets: [
        {
          artworkId: 'art-fv-01',
          title: 'Monarch Imperial War Standard 2026',
          imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
          artistName: 'ahmad_kaab',
          edition: 'SYNDICATE STANDARD',
          estimatedValue: 38000000,
        },
      ],
      cashSweetener: 10000000,
    },
    targetSide: {
      party: {
        userId: 'user-demo',
        username: 'SINTEX',
        tornPlayerId: 2190421,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        factionTag: 'MNCH',
        isInitiator: false,
        hasLocked: false,
        hasAccepted: false,
      },
      offeredAssets: [
        {
          artworkId: 'art-fv-05',
          title: 'Viper Protocol Cyber-Venom War Banner',
          imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
          artistName: 'Voidwalker',
          edition: 'SPECIAL EDITION',
          estimatedValue: 32000000,
        },
      ],
      cashSweetener: 0,
    },
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    escrowContractId: 'CVN-ESCROW-99202',
    tags: ['War Banner', 'Artwork Swap', 'Verified Syndicate'],
    isPublicListing: true,
    logs: [
      {
        id: 'log-3',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        actorName: 'Nova_MNCH',
        action: 'CREATED_TRADE',
        details: 'Offered Monarch Imperial War Standard with $10M cash pledge.',
      },
    ],
  },
  {
    id: 'tr-03',
    title: 'Direct Private Buyout: Heavy Armored Standard ↔ $30M Cash',
    description: 'Private cash purchase escrow contract submitted by Ahmad_Kaab for CRG Heavy Armored Standard piece.',
    initiatorSide: {
      party: {
        userId: 'user-ahmad',
        username: 'Ahmad_Kaab',
        tornPlayerId: 4295891,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        factionTag: 'MNCH',
        isInitiator: true,
        hasLocked: true,
        hasAccepted: true,
      },
      offeredAssets: [],
      cashSweetener: 30000000,
    },
    targetSide: {
      party: {
        userId: 'user-ironclad',
        username: 'IronClad',
        tornPlayerId: 1849202,
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        factionTag: 'CRG',
        isInitiator: false,
        hasLocked: true,
        hasAccepted: false,
      },
      offeredAssets: [
        {
          artworkId: 'art-fv-07',
          title: 'Heavy Siege Armored Standard',
          imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200',
          artistName: 'DarkMatter_7',
          edition: 'CRG ARMORY ASSET',
          estimatedValue: 24000000,
        },
      ],
      cashSweetener: 0,
    },
    status: 'LOCKED',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    escrowContractId: 'CVN-ESCROW-99203',
    tags: ['Cash Buyout', 'Direct Escrow', 'CRG'],
    isPublicListing: false,
    logs: [
      {
        id: 'log-4',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        actorName: 'Ahmad_Kaab',
        action: 'CREATED_TRADE',
        details: 'Deposited $30,000,000 into COVEN escrow for Heavy Siege Standard.',
      },
      {
        id: 'log-5',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        actorName: 'IronClad',
        action: 'LOCKED_TRADE',
        details: 'Locked asset into contract pending final signature.',
      },
    ],
  },
  {
    id: 'tr-04',
    title: 'Settled Black Market Deal: Void Titan ↔ Cyber Ronin + $15.0M',
    description: 'Contract successfully executed and verified on Torn City logs.',
    initiatorSide: {
      party: {
        userId: 'user-demo',
        username: 'SINTEX',
        tornPlayerId: 2190421,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        factionTag: 'MNCH',
        isInitiator: true,
        hasLocked: true,
        hasAccepted: true,
      },
      offeredAssets: [
        {
          artworkId: 'art-settled-1',
          title: 'Void Titan #01',
          imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800',
          artistName: 'Voidwalker',
          edition: 'MASTER 1-OF-1',
          estimatedValue: 45000000,
        },
      ],
      cashSweetener: 0,
    },
    targetSide: {
      party: {
        userId: 'user-kage',
        username: 'Kage_Zero',
        tornPlayerId: 2991040,
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        factionTag: 'SUB',
        isInitiator: false,
        hasLocked: true,
        hasAccepted: true,
      },
      offeredAssets: [
        {
          artworkId: 'art-settled-2',
          title: 'Cyber Ronin Signature Suite',
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
          artistName: 'bell_queen',
          edition: 'BLACK EDITION',
          estimatedValue: 30000000,
        },
      ],
      cashSweetener: 15000000,
    },
    status: 'SETTLED',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    settledAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    escrowContractId: 'CVN-ESCROW-99180',
    tags: ['Completed', 'Verified Trade', 'Black Market'],
    isPublicListing: true,
    logs: [
      {
        id: 'log-6',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        actorName: 'SINTEX',
        action: 'CREATED_TRADE',
        details: 'Initial trade agreement drafted.',
      },
      {
        id: 'log-7',
        timestamp: new Date(Date.now() - 3600000 * 40).toISOString(),
        actorName: 'COVEN_ESCROW_ENGINE',
        action: 'SETTLED_CONTRACT',
        details: 'Dual cryptographic signatures received. Ownership transfer complete.',
      },
    ],
  },
];

/* ── HELPERS ────────────────────────────────────────────────── */
export function getTrades(): TradeOffer[] {
  try {
    const raw = localStorage.getItem(TRADES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  try {
    localStorage.setItem(TRADES_KEY, JSON.stringify(SEED_TRADES));
  } catch {}
  return SEED_TRADES;
}

export function getTradeById(id: string): TradeOffer | null {
  const trades = getTrades();
  return trades.find((t) => t.id === id) || null;
}

export function getUserTrades(usernameOrId: string): TradeOffer[] {
  const trades = getTrades();
  const query = usernameOrId.toLowerCase();
  return trades.filter(
    (t) =>
      t.initiatorSide.party.username.toLowerCase() === query ||
      t.initiatorSide.party.userId === usernameOrId ||
      t.targetSide.party.username.toLowerCase() === query ||
      t.targetSide.party.userId === usernameOrId
  );
}

export function createTradeOffer(
  title: string,
  description: string,
  initiatorParty: TradeParty,
  initiatorAssets: TradeAsset[],
  initiatorCash: number,
  targetParty: TradeParty,
  targetAssets: TradeAsset[],
  targetCash: number,
  tags: string[] = ['P2P Swap'],
  isPublicListing: boolean = true
): TradeOffer {
  const trades = getTrades();
  const id = `tr-${Date.now().toString().slice(-6)}`;
  const escrowContractId = `CVN-ESCROW-${Math.floor(10000 + Math.random() * 90000)}`;

  const newTrade: TradeOffer = {
    id,
    title,
    description,
    initiatorSide: {
      party: { ...initiatorParty, isInitiator: true, hasLocked: true, hasAccepted: false },
      offeredAssets: initiatorAssets,
      cashSweetener: initiatorCash,
    },
    targetSide: {
      party: { ...targetParty, isInitiator: false, hasLocked: false, hasAccepted: false },
      offeredAssets: targetAssets,
      cashSweetener: targetCash,
    },
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    escrowContractId,
    tags,
    isPublicListing,
    logs: [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorName: initiatorParty.username,
        action: 'CREATED_TRADE',
        details: `Created trade contract ${escrowContractId} with ${initiatorAssets.length} asset(s) and $${initiatorCash.toLocaleString()} cash sweetener.`,
      },
    ],
  };

  const updated = [newTrade, ...trades];
  try {
    localStorage.setItem(TRADES_KEY, JSON.stringify(updated));
  } catch {}

  // Dispatch notification
  dispatchNotification(String(initiatorParty.tornPlayerId), {
    title: 'Trade Contract Published',
    message: `P2P Swap Offer #${id.toUpperCase()} published to Syndicate Black Market escrow.`,
    type: 'sale_completed',
    link: `/trade/${id}`,
  });

  window.dispatchEvent(new CustomEvent('coven:trade_update', { detail: { tradeId: id } }));
  return newTrade;
}

export function acceptTrade(tradeId: string, actorUsername: string): { success: boolean; trade: TradeOffer | null } {
  const trades = getTrades();
  const index = trades.findIndex((t) => t.id === tradeId);
  if (index === -1) return { success: false, trade: null };

  const trade = trades[index];
  const isInitiator = trade.initiatorSide.party.username.toLowerCase() === actorUsername.toLowerCase();
  const isTarget = trade.targetSide.party.username.toLowerCase() === actorUsername.toLowerCase();

  if (isInitiator) {
    trade.initiatorSide.party.hasAccepted = true;
    trade.initiatorSide.party.hasLocked = true;
  }
  if (isTarget) {
    trade.targetSide.party.hasAccepted = true;
    trade.targetSide.party.hasLocked = true;
  }

  trade.logs.push({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorName: actorUsername,
    action: 'ACCEPTED_TRADE',
    details: `${actorUsername} signed the COVEN Escrow cryptographic contract.`,
  });

  // If both accepted, mark SETTLED!
  if (trade.initiatorSide.party.hasAccepted && trade.targetSide.party.hasAccepted) {
    trade.status = 'SETTLED';
    trade.settledAt = new Date().toISOString();
    trade.logs.push({
      id: `log-${Date.now() + 1}`,
      timestamp: new Date().toISOString(),
      actorName: 'COVEN_ESCROW_ENGINE',
      action: 'SETTLED_CONTRACT',
      details: `Escrow clearance verified. Assets transferred between ${trade.initiatorSide.party.username} and ${trade.targetSide.party.username}.`,
    });
  } else {
    trade.status = 'LOCKED';
  }

  trade.updatedAt = new Date().toISOString();
  trades[index] = trade;

  try {
    localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
  } catch {}

  window.dispatchEvent(new CustomEvent('coven:trade_update', { detail: { tradeId } }));
  return { success: true, trade };
}

export function declineTrade(tradeId: string, actorUsername: string, reason?: string): boolean {
  const trades = getTrades();
  const index = trades.findIndex((t) => t.id === tradeId);
  if (index === -1) return false;

  const trade = trades[index];
  trade.status = 'DECLINED';
  trade.updatedAt = new Date().toISOString();
  trade.logs.push({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorName: actorUsername,
    action: 'DECLINED_TRADE',
    details: reason || 'Trade contract was declined.',
  });

  trades[index] = trade;
  try {
    localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
  } catch {}

  window.dispatchEvent(new CustomEvent('coven:trade_update', { detail: { tradeId } }));
  return true;
}

export function counterTrade(
  tradeId: string,
  actorUsername: string,
  counterAssets: TradeAsset[],
  counterCash: number
): boolean {
  const trades = getTrades();
  const index = trades.findIndex((t) => t.id === tradeId);
  if (index === -1) return false;

  const trade = trades[index];
  const isTarget = trade.targetSide.party.username.toLowerCase() === actorUsername.toLowerCase();

  if (isTarget) {
    trade.targetSide.offeredAssets = counterAssets;
    trade.targetSide.cashSweetener = counterCash;
    trade.targetSide.party.hasAccepted = false;
    trade.initiatorSide.party.hasAccepted = false;
  } else {
    trade.initiatorSide.offeredAssets = counterAssets;
    trade.initiatorSide.cashSweetener = counterCash;
    trade.initiatorSide.party.hasAccepted = false;
    trade.targetSide.party.hasAccepted = false;
  }

  trade.status = 'COUNTERED';
  trade.updatedAt = new Date().toISOString();
  trade.logs.push({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorName: actorUsername,
    action: 'COUNTERED_OFFER',
    details: `Updated proposal to include ${counterAssets.length} asset(s) and $${counterCash.toLocaleString()} cash sweetener.`,
  });

  trades[index] = trade;
  try {
    localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
  } catch {}

  window.dispatchEvent(new CustomEvent('coven:trade_update', { detail: { tradeId } }));
  return true;
}

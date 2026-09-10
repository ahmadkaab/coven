/* ================================================================
   COVEN — Syndicate Black Market & P2P Trade Service
   Manages P2P artwork swaps, cash sweeteners, and dual escrow.
   ================================================================ */

import type { TradeOffer, TradeAsset, TradeParty, TradeStatus, TradeLog } from '../types/trade';
import { dispatchNotification } from './notificationService';

const TRADES_KEY = 'coven_trades_v1';


/* ── HELPERS ────────────────────────────────────────────────── */
export function getTrades(): TradeOffer[] {
  try {
    const raw = localStorage.getItem(TRADES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
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

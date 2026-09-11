/* ================================================================
   COVEN — Native Token & Escrow Wallet Service
   Standard: 1 Xanax = 1,000 Credits (CR)
   Deposits: Sent in Torn City to ahmad_kaab [4295891]
   Withdrawals: 0% Fee, Dispatched via Syndicate Banker Queue
   Sales: 5% Marketplace Rake to Platform Treasury
   Featured Pin: 10 Xanax (10,000 CR) for Front-Page Hero Spot
   ================================================================ */

import type { Wallet, WithdrawalTicket, WalletTransaction } from '../types';

export const CR_PER_XANAX = 1000;
export const MARKETPLACE_RAKE_PCT = 0.05; // 5%
export const FEATURED_PIN_CR = 10000;     // 10 Xanax = 10,000 CR
export const TREASURY_OFFICIAL = 'ahmad_kaab [4295891]';
export const TREASURY_TORN_ID = '4295891';

const WALLET_STORAGE_KEY_PREFIX = 'coven_wallet_';
const TICKETS_STORAGE_KEY = 'coven_withdrawal_tickets';
const TXS_STORAGE_KEY_PREFIX = 'coven_wallet_txs_';

/* ── Conversion Helpers ───────────────────────────────────────── */
export function convertXanaxToCredits(xanax: number): number {
  return Math.max(0, Math.floor(xanax * CR_PER_XANAX));
}

export function convertCreditsToXanax(cr: number): number {
  return Math.max(0, Number((cr / CR_PER_XANAX).toFixed(3)));
}

export function formatCR(cr: number): string {
  return Math.floor(cr).toLocaleString() + ' CR';
}

/* ── Wallet Management ────────────────────────────────────────── */
export function getWallet(userId: string, tornId: string): Wallet {
  if (typeof window === 'undefined') {
    return {
      user_id: userId,
      torn_id: tornId,
      balance_cr: 0,
      locked_cr: 0,
      total_deposited_xanax: 0,
      total_withdrawn_xanax: 0,
      updated_at: new Date().toISOString(),
    };
  }

  const key = `${WALLET_STORAGE_KEY_PREFIX}${userId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      /* fallback below */
    }
  }

  const initialWallet: Wallet = {
    user_id: userId,
    torn_id: tornId,
    balance_cr: 0,
    locked_cr: 0,
    total_deposited_xanax: 0,
    total_withdrawn_xanax: 0,
    updated_at: new Date().toISOString(),
  };

  localStorage.setItem(key, JSON.stringify(initialWallet));
  return initialWallet;
}

export function saveWallet(wallet: Wallet): void {
  if (typeof window === 'undefined') return;
  wallet.updated_at = new Date().toISOString();
  localStorage.setItem(`${WALLET_STORAGE_KEY_PREFIX}${wallet.user_id}`, JSON.stringify(wallet));
  window.dispatchEvent(new CustomEvent('coven:wallet_update', { detail: wallet }));
}

/* ── Transactions History ─────────────────────────────────────── */
export function getWalletTransactions(userId: string): WalletTransaction[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`${TXS_STORAGE_KEY_PREFIX}${userId}`);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function recordTransaction(tx: Omit<WalletTransaction, 'id' | 'created_at'>): WalletTransaction {
  const newTx: WalletTransaction = {
    ...tx,
    id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    created_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const list = getWalletTransactions(tx.user_id);
    list.unshift(newTx);
    localStorage.setItem(`${TXS_STORAGE_KEY_PREFIX}${tx.user_id}`, JSON.stringify(list.slice(0, 100)));
  }

  return newTx;
}

/* ── Deposit Logic (Xanax -> Credits) ─────────────────────────── */
export function submitDeposit(
  userId: string,
  tornId: string,
  xanaxCount: number,
  notes?: string
): { wallet: Wallet; tx: WalletTransaction } {
  const wallet = getWallet(userId, tornId);
  const creditsEarned = convertXanaxToCredits(xanaxCount);

  wallet.balance_cr += creditsEarned;
  wallet.total_deposited_xanax += xanaxCount;
  saveWallet(wallet);

  const tx = recordTransaction({
    user_id: userId,
    torn_id: tornId,
    type: 'deposit',
    amount_cr: creditsEarned,
    amount_xanax: xanaxCount,
    description: notes || `Deposited ${xanaxCount}x Xanax to ${TREASURY_OFFICIAL} (+${creditsEarned.toLocaleString()} CR)`,
  });

  return { wallet, tx };
}

/* ── 0% Fee Withdrawal Logic ──────────────────────────────────── */
export function requestWithdrawal(
  userId: string,
  tornId: string,
  amountCr: number
): { ticket: WithdrawalTicket; wallet: Wallet } {
  const wallet = getWallet(userId, tornId);

  if (amountCr <= 0) throw new Error('Withdrawal amount must be greater than 0 CR');
  if (amountCr > wallet.balance_cr) {
    throw new Error(`Insufficient balance. Available: ${wallet.balance_cr.toLocaleString()} CR`);
  }

  const xanaxToReceive = convertCreditsToXanax(amountCr);
  if (xanaxToReceive < 1) {
    throw new Error('Minimum withdrawal is 1,000 CR (1x Xanax)');
  }

  // Hold funds in locked until banker completes dispatch
  wallet.balance_cr -= amountCr;
  wallet.locked_cr += amountCr;
  saveWallet(wallet);

  const ticket: WithdrawalTicket = {
    id: 'wdr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    user_id: userId,
    torn_id: tornId,
    amount_cr: amountCr,
    amount_xanax: xanaxToReceive,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  saveWithdrawalTicket(ticket);

  recordTransaction({
    user_id: userId,
    torn_id: tornId,
    type: 'withdrawal',
    amount_cr: amountCr,
    amount_xanax: xanaxToReceive,
    description: `Withdrawal requested: ${xanaxToReceive}x Xanax to Torn ID #${tornId} (0% Fee - Pending Banker Dispatch)`,
  });

  return { ticket, wallet };
}

/* ── Banker Ticket Storage ────────────────────────────────────── */
export function getWithdrawalTickets(): WithdrawalTicket[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(TICKETS_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveWithdrawalTicket(ticket: WithdrawalTicket): void {
  const tickets = getWithdrawalTickets();
  const index = tickets.findIndex(t => t.id === ticket.id);
  if (index >= 0) {
    tickets[index] = ticket;
  } else {
    tickets.unshift(ticket);
  }
  localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  window.dispatchEvent(new CustomEvent('coven:banker_tickets_update'));
}

export function claimWithdrawalTicket(ticketId: string, bankerTornId: string): WithdrawalTicket {
  const tickets = getWithdrawalTickets();
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) throw new Error('Ticket not found');
  if (ticket.status !== 'pending') throw new Error('Ticket is no longer pending');

  ticket.status = 'claimed';
  ticket.claimed_by_banker_id = bankerTornId;
  saveWithdrawalTicket(ticket);
  return ticket;
}

export function fulfillWithdrawalTicket(
  ticketId: string,
  bankerTornId: string,
  proofLogUrl?: string
): WithdrawalTicket {
  const tickets = getWithdrawalTickets();
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) throw new Error('Ticket not found');

  ticket.status = 'fulfilled';
  ticket.claimed_by_banker_id = bankerTornId;
  ticket.proof_log_url = proofLogUrl;
  ticket.fulfilled_at = new Date().toISOString();
  saveWithdrawalTicket(ticket);

  // Release locked funds from user permanently and increment withdrawn total
  const wallet = getWallet(ticket.user_id, ticket.torn_id);
  wallet.locked_cr = Math.max(0, wallet.locked_cr - ticket.amount_cr);
  wallet.total_withdrawn_xanax += ticket.amount_xanax;
  saveWallet(wallet);

  return ticket;
}

/* ── Escrow Holds for Bids (Blind & Standard) ─────────────────── */
export function lockBidCredits(
  userId: string,
  tornId: string,
  amountCr: number,
  artworkTitle: string
): boolean {
  const wallet = getWallet(userId, tornId);
  if (wallet.balance_cr < amountCr) return false;

  wallet.balance_cr -= amountCr;
  wallet.locked_cr += amountCr;
  saveWallet(wallet);

  recordTransaction({
    user_id: userId,
    torn_id: tornId,
    type: 'bid_hold',
    amount_cr: amountCr,
    description: `Escrow hold for active bid on "${artworkTitle}" (-${amountCr.toLocaleString()} CR)`,
  });

  return true;
}

export function releaseBidCredits(
  userId: string,
  tornId: string,
  amountCr: number,
  artworkTitle: string
): void {
  const wallet = getWallet(userId, tornId);
  wallet.locked_cr = Math.max(0, wallet.locked_cr - amountCr);
  wallet.balance_cr += amountCr;
  saveWallet(wallet);

  recordTransaction({
    user_id: userId,
    torn_id: tornId,
    type: 'bid_refund',
    amount_cr: amountCr,
    description: `Outbid on "${artworkTitle}" — Escrow hold released (+${amountCr.toLocaleString()} CR)`,
  });
}

/* ── Marketplace Settlement (5% Platform Rake) ────────────────── */
export function settleAuctionSale(
  sellerUserId: string,
  sellerTornId: string,
  winnerUserId: string,
  winnerTornId: string,
  finalBidCr: number,
  artworkTitle: string
): { sellerPayoutCr: number; platformFeeCr: number } {
  // Deduct from winner's locked balance
  const winnerWallet = getWallet(winnerUserId, winnerTornId);
  winnerWallet.locked_cr = Math.max(0, winnerWallet.locked_cr - finalBidCr);
  saveWallet(winnerWallet);

  // Compute 5% platform rake
  const platformFeeCr = Math.round(finalBidCr * MARKETPLACE_RAKE_PCT);
  const sellerPayoutCr = finalBidCr - platformFeeCr;

  // Credit seller wallet
  const sellerWallet = getWallet(sellerUserId, sellerTornId);
  sellerWallet.balance_cr += sellerPayoutCr;
  saveWallet(sellerWallet);

  recordTransaction({
    user_id: sellerUserId,
    torn_id: sellerTornId,
    type: 'sale_payout',
    amount_cr: sellerPayoutCr,
    description: `Artwork sale: "${artworkTitle}" for ${finalBidCr.toLocaleString()} CR (Net +${sellerPayoutCr.toLocaleString()} CR after 5% platform fee)`,
  });

  return { sellerPayoutCr, platformFeeCr };
}

/* ── 10 Xanax Featured Pin Fee ────────────────────────────────── */
export function payFeaturedPinFee(
  userId: string,
  tornId: string,
  artworkTitle: string
): boolean {
  const wallet = getWallet(userId, tornId);
  if (wallet.balance_cr < FEATURED_PIN_CR) return false;

  wallet.balance_cr -= FEATURED_PIN_CR;
  saveWallet(wallet);

  recordTransaction({
    user_id: userId,
    torn_id: tornId,
    type: 'pin_fee',
    amount_cr: FEATURED_PIN_CR,
    amount_xanax: FEATURED_PIN_CR / CR_PER_XANAX,
    description: `Featured 72h front-page pin for "${artworkTitle}" (-10,000 CR / 10x Xanax)`,
  });

  return true;
}

/* ================================================================
   COVEN — Executive Admin & Treasury Operations Service
   Platform metrics, 5% rake tracking, 18h SLA cashouts, moderation.
   Owner ID: ahmad_kaab [4295891]
   ================================================================ */

import { 
  getWithdrawalTickets, 
  claimWithdrawalTicket, 
  fulfillWithdrawalTicket, 
  convertCreditsToXanax, 
  TREASURY_OFFICIAL, 
  TREASURY_TORN_ID,
  CR_PER_XANAX,
  FEATURED_PIN_CR as FEATURE_PIN_FEE_CR
} from './walletService';
import type { TornUser } from '../types';

export interface AdminSettings {
  is_escrow_frozen: boolean;
  announcement_banner: string;
  bankers: { torn_id: string; name: string; added_at: string }[];
}

export interface PlatformTreasury {
  total_rake_cr: number;
  total_pin_fees_cr: number;
  total_swept_cr: number;
  last_swept_at?: string;
}

const SETTINGS_KEY = 'coven_admin_settings_v1';
const TREASURY_KEY = 'coven_platform_treasury_v1';

/* ── Default Settings ───────────────────────────────────────── */
const DEFAULT_SETTINGS: AdminSettings = {
  is_escrow_frozen: false,
  announcement_banner: 'ESCROW LIQUID: 100% Xanax-backed. 0% withdrawal fees. 18-hour banker dispatch active.',
  bankers: [
    { torn_id: '4295891', name: 'ahmad_kaab (Executive Sovereign)', added_at: new Date().toISOString() },
  ],
};

const DEFAULT_TREASURY: PlatformTreasury = {
  total_rake_cr: 15000,       // 15 Xanax accumulated from sales
  total_pin_fees_cr: 20000,   // 20 Xanax from 2 featured pins
  total_swept_cr: 0,
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
}

function writeStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
  window.dispatchEvent(new CustomEvent('coven:admin_update'));
}

/* ── Check Admin Privileges ─────────────────────────────────── */
export function isUserAdmin(user: TornUser | null): boolean {
  if (!user) return true; // Allow dev exploration on local server
  const idStr = String(user.player_id);
  if (idStr === TREASURY_TORN_ID || user.name?.toLowerCase().includes('ahmad_kaab')) {
    return true;
  }
  const settings = getAdminSettings();
  return settings.bankers.some(b => b.torn_id === idStr);
}

/* ── Getters ────────────────────────────────────────────────── */
export function getAdminSettings(): AdminSettings {
  return readStorage<AdminSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function getPlatformTreasury(): PlatformTreasury {
  return readStorage<PlatformTreasury>(TREASURY_KEY, DEFAULT_TREASURY);
}

/* ── Metrics Summary ────────────────────────────────────────── */
export function getExecutiveMetrics() {
  const treasury = getPlatformTreasury();
  const tickets = getWithdrawalTickets();
  const pendingTickets = tickets.filter(t => t.status === 'pending' || t.status === 'claimed');

  const pendingWithdrawalCr = pendingTickets.reduce((sum, t) => sum + t.amount_cr, 0);
  const pendingWithdrawalXanax = convertCreditsToXanax(pendingWithdrawalCr);

  const availableProfitCr = Math.max(0, (treasury.total_rake_cr + treasury.total_pin_fees_cr) - treasury.total_swept_cr);
  const availableProfitXanax = convertCreditsToXanax(availableProfitCr);

  return {
    total_rake_cr: treasury.total_rake_cr,
    total_rake_xanax: convertCreditsToXanax(treasury.total_rake_cr),
    total_pin_fees_cr: treasury.total_pin_fees_cr,
    total_pin_fees_xanax: convertCreditsToXanax(treasury.total_pin_fees_cr),
    available_profit_cr: availableProfitCr,
    available_profit_xanax: availableProfitXanax,
    total_swept_cr: treasury.total_swept_cr,
    pending_tickets_count: pendingTickets.length,
    pending_withdrawal_cr: pendingWithdrawalCr,
    pending_withdrawal_xanax: pendingWithdrawalXanax,
    all_tickets: tickets,
  };
}

/* ── Profit Sweep Action ────────────────────────────────────── */
export function sweepPlatformProfit(adminName = 'ahmad_kaab'): { swept_cr: number; swept_xanax: number } {
  const treasury = getPlatformTreasury();
  const available = Math.max(0, (treasury.total_rake_cr + treasury.total_pin_fees_cr) - treasury.total_swept_cr);
  if (available <= 0) {
    throw new Error('No accumulated platform profit available to sweep at this time.');
  }

  treasury.total_swept_cr += available;
  treasury.last_swept_at = new Date().toISOString();
  writeStorage(TREASURY_KEY, treasury);

  return {
    swept_cr: available,
    swept_xanax: convertCreditsToXanax(available),
  };
}

/* ── Emergency Escrow Toggle ────────────────────────────────── */
export function toggleEscrowFreeze(): boolean {
  const settings = getAdminSettings();
  settings.is_escrow_frozen = !settings.is_escrow_frozen;
  writeStorage(SETTINGS_KEY, settings);
  return settings.is_escrow_frozen;
}

/* ── Announcement Editor ────────────────────────────────────── */
export function updateAnnouncementBanner(text: string): void {
  const settings = getAdminSettings();
  settings.announcement_banner = text.trim();
  writeStorage(SETTINGS_KEY, settings);
}

/* ── Staff Banker Management ────────────────────────────────── */
export function addBanker(tornId: string, name: string): void {
  const settings = getAdminSettings();
  if (settings.bankers.some(b => b.torn_id === tornId)) {
    throw new Error('Player is already registered as a cashier banker.');
  }
  settings.bankers.push({
    torn_id: tornId.trim(),
    name: name.trim(),
    added_at: new Date().toISOString(),
  });
  writeStorage(SETTINGS_KEY, settings);
}

export function removeBanker(tornId: string): void {
  if (tornId === TREASURY_TORN_ID) {
    throw new Error('Cannot remove primary sovereign treasury executive.');
  }
  const settings = getAdminSettings();
  settings.bankers = settings.bankers.filter(b => b.torn_id !== tornId);
  writeStorage(SETTINGS_KEY, settings);
}

/* ── Record Rake / Pin Fee (Helper) ─────────────────────────── */
export function recordMarketplaceRake(amountCr: number): void {
  const treasury = getPlatformTreasury();
  treasury.total_rake_cr += amountCr;
  writeStorage(TREASURY_KEY, treasury);
}

export function recordPinFee(): void {
  const treasury = getPlatformTreasury();
  treasury.total_pin_fees_cr += FEATURE_PIN_FEE_CR;
  writeStorage(TREASURY_KEY, treasury);
}

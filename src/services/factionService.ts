/* ================================================================
   COVEN — Faction Service
   Manages Faction Armories, Art Treasuries, Bounties & Vaults
   ================================================================ */

import type { FactionProfile, FactionVaultItem, FactionBounty, TreasuryDonation } from '../types/faction';
import { dispatchNotification } from './notificationService';

const FACTIONS_KEY = 'coven_factions_v1';
const VAULT_KEY = 'coven_faction_vault_items_v1';
const BOUNTIES_KEY = 'coven_faction_bounties_v1';
const DONATIONS_KEY = 'coven_faction_donations_v1';

/* ── SEED DATA ─────────────────────────────────────────────── */
const SEED_FACTIONS: FactionProfile[] = [
  {
    id: 'monarch',
    name: 'Monarch Syndicate',
    tag: 'MNCH',
    tornFactionId: 9120,
    respect: 4850200,
    rank: 1,
    leader: {
      name: 'Nova_MNCH',
      id: 1984201,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    coLeader: { name: 'Ahmad_Kaab', id: 4295891 },
    motto: 'Through Absolute Order, Total Domination.',
    description: 'The supreme power bloc in Torn City. Monarch commands overwhelming frontline warfare, industrial territory holding, and the largest private art commission budget in the underground economy.',
    bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
    crestUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
    accentColor: '#e11d48',
    treasuryBalance: 142500000,
    vaultAssetsCount: 6,
    activeBountiesCount: 2,
    warStatus: {
      opponentTag: 'NS',
      opponentName: 'Natural Selection',
      leadRespect: 2240,
      timeLeft: '18h 42m',
      status: 'active',
    },
    focusTags: ['Territory War Banners', '60FPS Animated Signatures', 'Imperial Crests'],
    verifiedMembersCount: 100,
  },
  {
    id: 'natural-selection',
    name: 'Natural Selection',
    tag: 'NS',
    tornFactionId: 8940,
    respect: 4620800,
    rank: 2,
    leader: {
      name: 'Viper_NS',
      id: 2048911,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    coLeader: { name: 'Kitsune_Prime', id: 3120491 },
    motto: 'Only The Lethal Survive.',
    description: 'Relentless tactical killers and relentless territory raiders. Known across Torn for cyber-warfare, lethal coordination, and biological combat aesthetics.',
    bannerUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
    crestUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=500',
    accentColor: '#10b981',
    treasuryBalance: 98000000,
    vaultAssetsCount: 5,
    activeBountiesCount: 1,
    warStatus: {
      opponentTag: 'MNCH',
      opponentName: 'Monarch Syndicate',
      leadRespect: -2240,
      timeLeft: '18h 42m',
      status: 'active',
    },
    focusTags: ['Bioluminescent Banners', 'Cyber-Venom Graphics', 'Rank Badges'],
    verifiedMembersCount: 98,
  },
  {
    id: 'crg',
    name: 'Commando Recon Group',
    tag: 'CRG',
    tornFactionId: 6710,
    respect: 3410000,
    rank: 3,
    leader: {
      name: 'IronClad',
      id: 1849202,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    coLeader: { name: 'Sovereign_X', id: 984122 },
    motto: 'Direct Action. Zero Compromise.',
    description: 'Militarized heavy hitters specializing in siege defense, territory fortifications, and battle-hardened steel aesthetics.',
    bannerUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200',
    crestUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500',
    accentColor: '#f59e0b',
    treasuryBalance: 64200000,
    vaultAssetsCount: 4,
    activeBountiesCount: 2,
    focusTags: ['Armored Plating Signatures', 'Artillery Banners', 'Siege Emblems'],
    verifiedMembersCount: 95,
  },
  {
    id: 'subversive',
    name: 'Subversive',
    tag: 'SUB',
    tornFactionId: 5420,
    respect: 2980500,
    rank: 4,
    leader: {
      name: 'Kage_Zero',
      id: 2991040,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    },
    motto: 'In Shadows We Dictate Terms.',
    description: 'Elite assassins and silent contract operatives. Subversive members favor glitch art, neon-drenched nightscapes, and encrypted forum signatures.',
    bannerUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200',
    crestUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500',
    accentColor: '#a855f7',
    treasuryBalance: 51800000,
    vaultAssetsCount: 4,
    activeBountiesCount: 1,
    focusTags: ['Glitch Art', 'Dark Cyberpunk Signatures', 'Stealth Badges'],
    verifiedMembersCount: 92,
  },
  {
    id: 'dead-mans-hand',
    name: "Dead Man's Hand",
    tag: 'DMH',
    tornFactionId: 4190,
    respect: 2450000,
    rank: 5,
    leader: {
      name: 'Ace_High',
      id: 1102941,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
    motto: 'Five Aces. No Mercy.',
    description: 'Underground casino barons and high-stakes syndicate enforcers. Known for dark gothic card motifs, skull insignias, and blood-red velvet accents.',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
    crestUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500',
    accentColor: '#ef4444',
    treasuryBalance: 38000000,
    vaultAssetsCount: 3,
    activeBountiesCount: 1,
    focusTags: ['Gothic Seals', 'Poker Noir Signatures', 'Bloodline Crests'],
    verifiedMembersCount: 88,
  },
  {
    id: 'jtf-recon',
    name: 'JTF Recon',
    tag: 'JTF',
    tornFactionId: 3880,
    respect: 2120000,
    rank: 6,
    leader: {
      name: 'Spectre',
      id: 3410981,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    },
    motto: 'Information Is Lethality.',
    description: 'Black-ops tactical intelligence specialists. They operate deep behind rival territory lines, commissioning radar telemetry and night-vision combat graphics.',
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200',
    crestUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500',
    accentColor: '#06b6d4',
    treasuryBalance: 29400000,
    vaultAssetsCount: 3,
    activeBountiesCount: 1,
    focusTags: ['HUD Telemetry Graphics', 'Night Vision War Banners', 'Tactical Sig Packs'],
    verifiedMembersCount: 85,
  },
];

const SEED_VAULT_ITEMS: FactionVaultItem[] = [
  // Monarch
  {
    id: 'fv-01',
    factionId: 'monarch',
    title: 'Monarch Imperial War Standard 2026',
    type: 'war_banner',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
    artistName: 'ahmad_kaab',
    artistId: 'artist-1',
    dimensions: '1200 × 400',
    commissionValue: 38000000,
    completedDate: '2026-08-28',
    bbcode: '[center][url=http://localhost:5173/factions/monarch][img]https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200[/img][/url]\n[b][color=#e11d48]MONARCH SYNDICATE[/color][/b] // [i]Through Absolute Order, Total Domination[/i][/center]',
    animated: true,
    isPublic: true,
  },
  {
    id: 'fv-02',
    factionId: 'monarch',
    title: 'Monarch High Council Forum Signature',
    type: 'forum_sig',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    artistName: 'bell_queen',
    artistId: 'artist-2',
    dimensions: '400 × 150',
    commissionValue: 14500000,
    completedDate: '2026-08-15',
    bbcode: '[center][url=http://localhost:5173/factions/monarch][img]https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400[/img][/url]\n[size=1][color=#888]MONARCH OFFICER // VERIFIED TORN OPERATIVE[/color][/size][/center]',
    animated: true,
    isPublic: true,
  },
  {
    id: 'fv-03',
    factionId: 'monarch',
    title: 'Apex Sovereign Crest (Gold Leaf Edition)',
    type: 'crest',
    imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800',
    artistName: 'DarkMatter_7',
    artistId: 'artist-3',
    dimensions: '800 × 800',
    commissionValue: 25000000,
    completedDate: '2026-07-20',
    bbcode: '[center][img]https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200[/img]\n[b][color=#e11d48]APEX SOVEREIGN // MONARCH SYNDICATE[/color][/b][/center]',
    animated: false,
    isPublic: true,
  },
  {
    id: 'fv-04',
    factionId: 'monarch',
    title: 'Ranked War Season 14 Campaign Banner',
    type: 'war_banner',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200',
    artistName: 'CrimsonBrush',
    artistId: 'artist-6',
    dimensions: '1200 × 400',
    commissionValue: 28000000,
    completedDate: '2026-09-02',
    bbcode: '[center][img]https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200[/img]\n[b][color=#e11d48]WAR CAMPAIGN ACTIVE: MONARCH vs NS[/color][/b][/center]',
    animated: true,
    isPublic: true,
  },
  // Natural Selection
  {
    id: 'fv-05',
    factionId: 'natural-selection',
    title: 'Viper Protocol Cyber-Venom War Banner',
    type: 'war_banner',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
    artistName: 'Voidwalker',
    artistId: 'artist-5',
    dimensions: '1200 × 400',
    commissionValue: 32000000,
    completedDate: '2026-08-30',
    bbcode: '[center][url=http://localhost:5173/factions/natural-selection][img]https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200[/img][/url]\n[b][color=#10b981]NATURAL SELECTION[/color][/b] // [i]Only The Lethal Survive[/i][/center]',
    animated: true,
    isPublic: true,
  },
  {
    id: 'fv-06',
    factionId: 'natural-selection',
    title: 'Bio-Synthetic Enforcer Signature Pack',
    type: 'forum_sig',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800',
    artistName: 'bell_queen',
    artistId: 'artist-2',
    dimensions: '400 × 150',
    commissionValue: 12000000,
    completedDate: '2026-08-10',
    bbcode: '[center][url=http://localhost:5173/factions/natural-selection][img]https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400[/img][/url]\n[size=1][color=#10b981]NS STRIKE TEAM // #8940[/color][/size][/center]',
    animated: true,
    isPublic: true,
  },
  // CRG
  {
    id: 'fv-07',
    factionId: 'crg',
    title: 'Heavy Siege Armored Standard',
    type: 'war_banner',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200',
    artistName: 'DarkMatter_7',
    artistId: 'artist-3',
    dimensions: '1200 × 400',
    commissionValue: 24000000,
    completedDate: '2026-08-22',
    bbcode: '[center][img]https://images.unsplash.com/photo-1563089145-599997674d42?w=1200[/img]\n[b][color=#f59e0b]COMMANDO RECON GROUP[/color][/b] // [i]Direct Action[/i][/center]',
    animated: false,
    isPublic: true,
  },
  // Subversive
  {
    id: 'fv-08',
    factionId: 'subversive',
    title: 'Shadow Cipher Glitch Banner',
    type: 'war_banner',
    imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200',
    artistName: 'Voidwalker',
    artistId: 'artist-5',
    dimensions: '1200 × 400',
    commissionValue: 22000000,
    completedDate: '2026-08-19',
    bbcode: '[center][img]https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200[/img]\n[b][color=#a855f7]SUBVERSIVE[/color][/b] // [i]In Shadows We Dictate Terms[/i][/center]',
    animated: true,
    isPublic: true,
  },
];

const SEED_BOUNTIES: FactionBounty[] = [
  {
    id: 'fb-01',
    factionId: 'monarch',
    title: 'Animated 60FPS Territory War Decimation Banner',
    description: 'Looking for a master artist to build our official Ranked War banner vs Natural Selection. Must incorporate gold/crimson dragon motif, particle embers, and 60fps looping canvas.',
    deliverableType: '1200x400 Animated GIF / MP4 Suite',
    reward: 35000000,
    deadline: '2026-09-18',
    status: 'open',
    postedDate: '2026-09-05',
    escrowSecured: true,
  },
  {
    id: 'fb-02',
    factionId: 'monarch',
    title: 'High Council Officer Forum Signature Suite (10 Variants)',
    description: 'Uniform signature templates for Monarch High Council members with personalized member ID slots, animated crest corner, and clean Torn forum BBCode layout.',
    deliverableType: '400x150 Forum Signature Pack',
    reward: 20000000,
    deadline: '2026-09-25',
    status: 'reviewing',
    postedDate: '2026-09-03',
    escrowSecured: true,
  },
  {
    id: 'fb-03',
    factionId: 'natural-selection',
    title: 'Bioluminescent Strike Roster Graphic 2026',
    description: 'Dynamic team roster card with emerald biohazard telemetry and slot space for 50 active fighters.',
    deliverableType: '1000x1600 Roster Infographic',
    reward: 28000000,
    deadline: '2026-09-22',
    status: 'open',
    postedDate: '2026-09-07',
    escrowSecured: true,
  },
  {
    id: 'fb-04',
    factionId: 'crg',
    title: 'Armored Tank Battlegroup Profile Banners',
    description: 'Heavy industrial war styling with weathered titanium and explosive breach effects.',
    deliverableType: '1200x400 Static WebP',
    reward: 18000000,
    deadline: '2026-09-30',
    status: 'open',
    postedDate: '2026-09-08',
    escrowSecured: true,
  },
];

const SEED_DONATIONS: TreasuryDonation[] = [
  {
    id: 'td-01',
    factionId: 'monarch',
    donatorName: 'SINTEX',
    donatorId: 2190421,
    amount: 10000000,
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    note: 'For the Ranked War decimation banner fund.',
  },
  {
    id: 'td-02',
    factionId: 'monarch',
    donatorName: 'Ahmad_Kaab',
    donatorId: 4295891,
    amount: 25000000,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    note: 'Matching leadership commission pledge.',
  },
  {
    id: 'td-03',
    factionId: 'monarch',
    donatorName: 'GhostRider_MNCH',
    donatorId: 1723490,
    amount: 5000000,
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    note: 'Weekly war dividend contribution.',
  },
  {
    id: 'td-04',
    factionId: 'natural-selection',
    donatorName: 'Viper_NS',
    donatorId: 2048911,
    amount: 20000000,
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    note: 'Territory bounty allocation.',
  },
];

/* ── PERSISTENCE HELPERS ────────────────────────────────────── */
export function getFactions(): FactionProfile[] {
  try {
    const raw = localStorage.getItem(FACTIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  try {
    localStorage.setItem(FACTIONS_KEY, JSON.stringify(SEED_FACTIONS));
  } catch {}
  return SEED_FACTIONS;
}

export function getFactionById(idOrTag: string): FactionProfile | null {
  const factions = getFactions();
  const lower = idOrTag.toLowerCase();
  return (
    factions.find(
      (f) => f.id.toLowerCase() === lower || f.tag.toLowerCase() === lower
    ) || null
  );
}

export function getFactionVaultItems(factionId: string): FactionVaultItem[] {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (raw) {
      const all: FactionVaultItem[] = JSON.parse(raw);
      return all.filter((i) => i.factionId === factionId);
    }
  } catch {}
  try {
    localStorage.setItem(VAULT_KEY, JSON.stringify(SEED_VAULT_ITEMS));
  } catch {}
  return SEED_VAULT_ITEMS.filter((i) => i.factionId === factionId);
}

export function getFactionBounties(factionId: string): FactionBounty[] {
  try {
    const raw = localStorage.getItem(BOUNTIES_KEY);
    if (raw) {
      const all: FactionBounty[] = JSON.parse(raw);
      return all.filter((b) => b.factionId === factionId);
    }
  } catch {}
  try {
    localStorage.setItem(BOUNTIES_KEY, JSON.stringify(SEED_BOUNTIES));
  } catch {}
  return SEED_BOUNTIES.filter((b) => b.factionId === factionId);
}

export function getAllBounties(): FactionBounty[] {
  try {
    const raw = localStorage.getItem(BOUNTIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  try {
    localStorage.setItem(BOUNTIES_KEY, JSON.stringify(SEED_BOUNTIES));
  } catch {}
  return SEED_BOUNTIES;
}

export function getTreasuryDonations(factionId: string): TreasuryDonation[] {
  try {
    const raw = localStorage.getItem(DONATIONS_KEY);
    if (raw) {
      const all: TreasuryDonation[] = JSON.parse(raw);
      return all.filter((d) => d.factionId === factionId);
    }
  } catch {}
  try {
    localStorage.setItem(DONATIONS_KEY, JSON.stringify(SEED_DONATIONS));
  } catch {}
  return SEED_DONATIONS.filter((d) => d.factionId === factionId);
}

/** Donate Torn Cash to a Faction's Art Treasury */
export function donateToTreasury(
  factionId: string,
  amount: number,
  donatorName: string,
  donatorId: number = 2190421,
  note?: string
): { success: boolean; newBalance: number } {
  const factions = getFactions();
  const factionIndex = factions.findIndex((f) => f.id === factionId);
  if (factionIndex === -1) return { success: false, newBalance: 0 };

  // Update Faction Treasury Balance
  factions[factionIndex].treasuryBalance += amount;
  try {
    localStorage.setItem(FACTIONS_KEY, JSON.stringify(factions));
  } catch {}

  // Add Donation Record
  const newDonation: TreasuryDonation = {
    id: `td-${Date.now()}`,
    factionId,
    donatorName,
    donatorId,
    amount,
    timestamp: new Date().toISOString(),
    note: note || 'Faction art treasury contribution',
  };

  try {
    const raw = localStorage.getItem(DONATIONS_KEY);
    const existing: TreasuryDonation[] = raw ? JSON.parse(raw) : SEED_DONATIONS;
    localStorage.setItem(DONATIONS_KEY, JSON.stringify([newDonation, ...existing]));
  } catch {}

  // Notify & Event Broadcast
  dispatchNotification(String(donatorId), {
    title: 'Treasury Contribution Logged',
    message: `You transferred $${amount.toLocaleString()} into the ${factions[factionIndex].name} Art Vault Escrow.`,
    type: 'sale_completed',
    link: `/factions/${factionId}`,
  });

  window.dispatchEvent(new CustomEvent('coven:faction_update', { detail: { factionId } }));

  return {
    success: true,
    newBalance: factions[factionIndex].treasuryBalance,
  };
}

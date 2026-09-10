/* ================================================================
   COVEN — Syndicate Art Heist & Vault Security Service
   Manages Vault Defenses, Lloyd's of Torn Insurance, and Tactical Heists
   ================================================================ */

import type {
  VaultSecurity,
  DefenseUpgrade,
  InsurancePolicy,
  InsuranceTier,
  HeistTarget,
  HeistCrewMember,
  HeistOperation,
  HeistStageResult,
} from '../types/heist';
import { dispatchNotification } from './notificationService';

const VAULT_SEC_KEY = 'coven_vault_security_v1';
const INSURANCE_KEY = 'coven_insurance_policies_v1';
const HEIST_LOGS_KEY = 'coven_heist_ops_v1';

/* ── SEED DATA: VAULT DEFENSES ─────────────────────────────── */
const DEFAULT_DEFENSE_UPGRADES: DefenseUpgrade[] = [
  {
    id: 'upg-laser',
    name: 'Laser Tripline Infrared Grid',
    cost: 8000000,
    installed: true,
    securityBonus: 15,
    description: 'High-density infrared beam net triggering silent alarms upon physical beam disruption.',
    icon: 'Crosshair',
  },
  {
    id: 'upg-cipher',
    name: 'Biometric SHA-256 Cipher Lock',
    cost: 12000000,
    installed: true,
    securityBonus: 18,
    description: 'Dual palm-vein scanner requiring synchronized cryptographic keys to open vault seals.',
    icon: 'Fingerprint',
  },
  {
    id: 'upg-titanium',
    name: 'Titanium-Alloy Reinforced Blast Doors',
    cost: 25000000,
    installed: false,
    securityBonus: 25,
    description: '12-inch hardened military steel and titanium composite door capable of withstanding shaped thermite charges.',
    icon: 'ShieldPlus',
  },
  {
    id: 'upg-emp',
    name: 'Counter-Intrusion EMP Capacitor Traps',
    cost: 18000000,
    installed: false,
    securityBonus: 20,
    description: 'Surge generator frying hostile electronic cipher slicers and camera bypass tools upon unauthorized access.',
    icon: 'Lightning',
  },
  {
    id: 'upg-sentries',
    name: 'Syndicate Cyber-Guard Sentries',
    cost: 30000000,
    installed: false,
    securityBonus: 22,
    description: 'Two cybernetically augmented perimeter enforcers on 24/7 armed vault guard duty.',
    icon: 'UsersFour',
  },
];

const DEFAULT_VAULT_SECURITY: VaultSecurity = {
  vaultLevel: 3,
  ratingName: 'FORTIFIED STEEL VAULT',
  breachResistancePct: 68,
  alarmResponseTime: '38 SECONDS',
  defenseUpgrades: DEFAULT_DEFENSE_UPGRADES,
  recentIntrusions: [],
};

/* ── SEED DATA: HEIST TARGETS ──────────────────────────────── */
const SEED_TARGETS: HeistTarget[] = [
  {
    id: 'tgt-01',
    targetName: 'Monarch Imperial Strongroom',
    targetType: 'FACTION_VAULT',
    ownerName: 'Nova_MNCH',
    factionTag: 'MNCH',
    securityLevel: 5,
    estimatedLootValue: 295000000,
    targetArtwork: {
      title: 'City Under Siege (Genesis Master)',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      estimatedValue: 250000000,
    },
    difficulty: 'EXTREME',
    laserGrid: true,
    biometricCipher: true,
    armedSentries: 8,
  },
  {
    id: 'tgt-02',
    targetName: 'Natural Selection Bio-Lair',
    targetType: 'FACTION_VAULT',
    ownerName: 'Viper_NS',
    factionTag: 'NS',
    securityLevel: 4,
    estimatedLootValue: 60000000,
    targetArtwork: {
      title: 'Viper Protocol Cyber-Venom',
      imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800',
      estimatedValue: 32000000,
    },
    difficulty: 'CHALLENGING',
    laserGrid: true,
    biometricCipher: true,
    armedSentries: 5,
  },
  {
    id: 'tgt-03',
    targetName: 'CRG Heavy Armored Bunker',
    targetType: 'FACTION_VAULT',
    ownerName: 'IronClad',
    factionTag: 'CRG',
    securityLevel: 4,
    estimatedLootValue: 42000000,
    targetArtwork: {
      title: 'Heavy Siege Armored Standard',
      imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800',
      estimatedValue: 24000000,
    },
    difficulty: 'CHALLENGING',
    laserGrid: false,
    biometricCipher: true,
    armedSentries: 6,
  },
  {
    id: 'tgt-04',
    targetName: "Ahmad_Kaab's High-Rise Penthouse",
    targetType: 'COLLECTOR_PENTHOUSE',
    ownerName: 'Ahmad_Kaab',
    factionTag: 'MNCH',
    securityLevel: 3,
    estimatedLootValue: 192000000,
    targetArtwork: {
      title: 'Shadow Protocol (1-of-1)',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
      estimatedValue: 180000000,
    },
    difficulty: 'MODERATE',
    laserGrid: true,
    biometricCipher: false,
    armedSentries: 3,
  },
  {
    id: 'tgt-05',
    targetName: 'Subversive Underground Depot',
    targetType: 'UNDERGROUND_DEPOT',
    ownerName: 'Kage_Zero',
    factionTag: 'SUB',
    securityLevel: 2,
    estimatedLootValue: 51000000,
    targetArtwork: {
      title: 'Void Titan #01 (Glitch Noir)',
      imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800',
      estimatedValue: 45000000,
    },
    difficulty: 'EASY',
    laserGrid: false,
    biometricCipher: false,
    armedSentries: 2,
  },
];

/* ── SEED DATA: CREW OPERATIVES ────────────────────────────── */
const SEED_CREW: HeistCrewMember[] = [
  {
    id: 'crew-01',
    name: 'Cipher_Zero',
    role: 'SLICER',
    skill: 92,
    hireCost: 5000000,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    cutPct: 15,
    perk: '+25% Success on Laser Grid and Camera bypass rolls',
  },
  {
    id: 'crew-02',
    name: 'Echo_Nine',
    role: 'SLICER',
    skill: 74,
    hireCost: 2500000,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    cutPct: 10,
    perk: 'Silences secondary alarm triggers',
  },
  {
    id: 'crew-03',
    name: 'Boris_The_Lock',
    role: 'SAFECRACKER',
    skill: 95,
    hireCost: 6000000,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    cutPct: 18,
    perk: 'Cracks heavy blast doors without thermite detonation alarms',
  },
  {
    id: 'crew-04',
    name: 'Rook',
    role: 'SAFECRACKER',
    skill: 80,
    hireCost: 3000000,
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    cutPct: 12,
    perk: '+15% Speed bonus on mechanical tumbler locks',
  },
  {
    id: 'crew-05',
    name: 'Tank_Griffin',
    role: 'MUSCLE',
    skill: 90,
    hireCost: 4000000,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    cutPct: 12,
    perk: 'Neutralizes up to 5 armed sentries without alert',
  },
  {
    id: 'crew-06',
    name: 'Speedy_Ghost',
    role: 'DRIVER',
    skill: 94,
    hireCost: 4500000,
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    cutPct: 14,
    perk: 'Guaranteed clean getaway escape through Torn City sewer network',
  },
];

/* ── SEED DATA: INSURANCE POLICIES ─────────────────────────── */
const SEED_POLICIES: InsurancePolicy[] = [
  {
    id: 'pol-basic',
    tier: 'BASIC',
    name: 'Basic Loss Indemnity Policy',
    coveragePct: 50,
    weeklyPremiumPct: 0.002,
    weeklyPremiumAmount: 149000,
    totalInsuredValue: 37250000,
    policyNumber: 'LLOYD-TRN-POL-901',
    activatedDate: '2026-08-01',
    active: false,
    features: ['50% cash value reimbursement on verified heist breach', 'Standard 48-hour claim processing', 'Torn API transaction verification'],
  },
  {
    id: 'pol-syndicate',
    tier: 'SYNDICATE',
    name: 'Syndicate Full Replacement Protection',
    coveragePct: 100,
    weeklyPremiumPct: 0.005,
    weeklyPremiumAmount: 372500,
    totalInsuredValue: 74500000,
    policyNumber: 'LLOYD-TRN-POL-902',
    activatedDate: '2026-08-20',
    active: true,
    features: ['100% full replacement value in Torn Cash upon breach', 'Express 12-hour claim clearance', 'Priority alert dispatch to faction armory', 'Recovery bounty posted on Black Market'],
  },
  {
    id: 'pol-vip',
    tier: 'VIP_ARCHON',
    name: 'VIP Archon Provenance Sovereign Shield',
    coveragePct: 120,
    weeklyPremiumPct: 0.009,
    weeklyPremiumAmount: 670500,
    totalInsuredValue: 89400000,
    policyNumber: 'LLOYD-TRN-POL-903',
    activatedDate: '2026-09-01',
    active: false,
    features: ['120% replacement value (Asset Value + 20% distress compensation)', 'Immediate instant claim payout', 'Private syndicate contractor retrieval squad deployed', 'Exclusive cryptographic security certificate seal'],
  },
];

/* ── HELPERS ────────────────────────────────────────────────── */
export function getVaultSecurity(): VaultSecurity {
  try {
    const raw = localStorage.getItem(VAULT_SEC_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  try {
    localStorage.setItem(VAULT_SEC_KEY, JSON.stringify(DEFAULT_VAULT_SECURITY));
  } catch {}
  return DEFAULT_VAULT_SECURITY;
}

export function purchaseDefenseUpgrade(upgradeId: string): { success: boolean; vault: VaultSecurity } {
  const vault = getVaultSecurity();
  const upg = vault.defenseUpgrades.find((u) => u.id === upgradeId);
  if (!upg || upg.installed) return { success: false, vault };

  upg.installed = true;
  vault.breachResistancePct = Math.min(98, vault.breachResistancePct + upg.securityBonus);

  // Recalculate level
  const installedCount = vault.defenseUpgrades.filter((u) => u.installed).length;
  vault.vaultLevel = installedCount >= 5 ? 5 : installedCount >= 4 ? 4 : 3;
  vault.ratingName =
    vault.vaultLevel === 5
      ? 'APEX TITANIUM CITADEL'
      : vault.vaultLevel === 4
      ? 'HEAVY MILITARY BLAST VAULT'
      : 'FORTIFIED STEEL VAULT';

  try {
    localStorage.setItem(VAULT_SEC_KEY, JSON.stringify(vault));
  } catch {}

  window.dispatchEvent(new CustomEvent('coven:heist_update'));
  return { success: true, vault };
}

export function getInsurancePolicies(): InsurancePolicy[] {
  try {
    const raw = localStorage.getItem(INSURANCE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  try {
    localStorage.setItem(INSURANCE_KEY, JSON.stringify(SEED_POLICIES));
  } catch {}
  return SEED_POLICIES;
}

export function purchaseInsurancePolicy(tier: InsuranceTier): InsurancePolicy[] {
  const policies = getInsurancePolicies();
  const updated = policies.map((p) => ({
    ...p,
    active: p.tier === tier,
  }));

  try {
    localStorage.setItem(INSURANCE_KEY, JSON.stringify(updated));
  } catch {}

  dispatchNotification('2190421', {
    title: 'Insurance Policy Updated',
    message: `Lloyd's of Torn coverage updated to ${tier} tier. Your Trophy Vault is protected.`,
    type: 'sale_completed',
    link: '/heist',
  });

  window.dispatchEvent(new CustomEvent('coven:heist_update'));
  return updated;
}

export function getHeistTargets(): HeistTarget[] {
  return SEED_TARGETS;
}

export function getCrewMembers(): HeistCrewMember[] {
  return SEED_CREW;
}

export function calculateHeistOdds(target: HeistTarget, crew: HeistCrewMember[]): number {
  if (crew.length === 0) return 15;
  const avgSkill = crew.reduce((acc, c) => acc + c.skill, 0) / crew.length;
  const difficultyPenalty =
    target.difficulty === 'EXTREME'
      ? 45
      : target.difficulty === 'CHALLENGING'
      ? 30
      : target.difficulty === 'MODERATE'
      ? 15
      : 5;

  const crewBonus = crew.length >= 3 ? 15 : crew.length * 4;
  const odds = Math.max(10, Math.min(92, Math.round(avgSkill - difficultyPenalty + crewBonus)));
  return odds;
}

export function executeHeist(target: HeistTarget, crew: HeistCrewMember[]): HeistOperation {
  const overallOdds = calculateHeistOdds(target, crew);
  const stages: HeistStageResult[] = [];

  // Stage 1: Perimeter
  const roll1 = Math.floor(Math.random() * 100) + 1;
  const slicer = crew.find((c) => c.role === 'SLICER');
  const slicerBonus = slicer ? Math.round(slicer.skill * 0.2) : 0;
  const req1 = 35 - slicerBonus;
  const s1Success = roll1 >= req1;
  stages.push({
    stage: 'PERIMETER',
    stageName: 'Perimeter Infiltration & Camera Override',
    success: s1Success,
    diceRoll: roll1,
    requiredRoll: req1,
    log: s1Success
      ? `Slicer looped CCTV feeds and bypassed outer motion sensors cleanly.`
      : `Motion detector anomaly flagged! Guard patrol alerted to perimeter zone.`,
  });

  // Stage 2: Laser Grid
  const roll2 = Math.floor(Math.random() * 100) + 1;
  const req2 = target.laserGrid ? 45 - slicerBonus : 20;
  const s2Success = s1Success && roll2 >= req2;
  stages.push({
    stage: 'LASER_GRID',
    stageName: 'Laser Grid & Biometric Cipher Bypass',
    success: s2Success,
    diceRoll: roll2,
    requiredRoll: req2,
    log: s2Success
      ? `Infrared grid neutralized with frequency scrambler. Biometric lock bypassed.`
      : `Infrared laser trip beam cut! Sirens triggered in central syndicate corridor.`,
  });

  // Stage 3: Blast Door
  const safecracker = crew.find((c) => c.role === 'SAFECRACKER');
  const crackerBonus = safecracker ? Math.round(safecracker.skill * 0.25) : 0;
  const roll3 = Math.floor(Math.random() * 100) + 1;
  const req3 = 50 - crackerBonus;
  const s3Success = s2Success && roll3 >= req3;
  stages.push({
    stage: 'BLAST_DOOR',
    stageName: 'Blast Door Thermite Crack & Loot Extraction',
    success: s3Success,
    diceRoll: roll3,
    requiredRoll: req3,
    log: s3Success
      ? `Vault tumblers cracked in 42 seconds. Masterwork "${target.targetArtwork.title}" extracted!`
      : `Vault auto-relocker tripped! Reinforced steel lock slammed shut before entry.`,
  });

  // Stage 4: Getaway
  const driver = crew.find((c) => c.role === 'DRIVER');
  const driverBonus = driver ? Math.round(driver.skill * 0.2) : 0;
  const roll4 = Math.floor(Math.random() * 100) + 1;
  const req4 = 30 - driverBonus;
  const s4Success = s3Success && roll4 >= req4;
  stages.push({
    stage: 'GETAWAY',
    stageName: 'Tactical Getaway vs Torn City Enforcers',
    success: s4Success,
    diceRoll: roll4,
    requiredRoll: req4,
    log: s4Success
      ? `Getaway driver evaded syndicate interceptors through the harbor tunnel. Mission Accomplished!`
      : `Pursuit roadblock hit! Crew forced to dump contraband to escape police custody.`,
  });

  const isCompleteSuccess = s4Success;
  const lootCash = isCompleteSuccess ? Math.round(target.estimatedLootValue * 0.15) : 0;
  const respectGained = isCompleteSuccess ? (target.securityLevel * 120) : 0;
  const bountyFine = isCompleteSuccess ? 0 : 5000000;

  const operation: HeistOperation = {
    id: `heist-${Date.now().toString().slice(-6)}`,
    target,
    crew,
    status: isCompleteSuccess ? 'SUCCESS' : 'BUSTED',
    stages,
    lootCash,
    lootedArtworkTitle: isCompleteSuccess ? target.targetArtwork.title : undefined,
    respectGained,
    bountyFine,
    executedAt: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(HEIST_LOGS_KEY);
    const existing: HeistOperation[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(HEIST_LOGS_KEY, JSON.stringify([operation, ...existing]));
  } catch {}

  // Dispatch toast / notification
  dispatchNotification('2190421', {
    title: isCompleteSuccess ? 'Heist Executed Successfully!' : 'Heist Operation Compromised!',
    message: isCompleteSuccess
      ? `Infiltration of ${target.targetName} yielded ${target.targetArtwork.title} and $${lootCash.toLocaleString()} cash!`
      : `Operation against ${target.targetName} failed. Escaped with minor security bounty fine.`,
    type: isCompleteSuccess ? 'sale_completed' : 'price_alert',
    link: '/heist',
  });

  window.dispatchEvent(new CustomEvent('coven:heist_update'));
  return operation;
}

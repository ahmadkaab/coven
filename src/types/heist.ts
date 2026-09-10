export interface DefenseUpgrade {
  id: string;
  name: string;
  cost: number;
  installed: boolean;
  securityBonus: number;
  description: string;
  icon: string;
}

export interface IntrusionEvent {
  id: string;
  timestamp: string;
  intruderFaction: string;
  intruderCrew: string;
  outcome: 'DEFENSE_HELD' | 'ALARM_TRIGGERED' | 'FAILED_BREACH';
  lootProtectedValue: number;
  log: string;
}

export interface VaultSecurity {
  vaultLevel: number;
  ratingName: string;
  breachResistancePct: number;
  alarmResponseTime: string;
  defenseUpgrades: DefenseUpgrade[];
  recentIntrusions: IntrusionEvent[];
}

export type InsuranceTier = 'BASIC' | 'SYNDICATE' | 'VIP_ARCHON';

export interface InsurancePolicy {
  id: string;
  tier: InsuranceTier;
  name: string;
  coveragePct: number;
  weeklyPremiumPct: number;
  weeklyPremiumAmount: number;
  totalInsuredValue: number;
  policyNumber: string;
  activatedDate: string;
  active: boolean;
  features: string[];
}

export interface HeistTarget {
  id: string;
  targetName: string;
  targetType: 'FACTION_VAULT' | 'COLLECTOR_PENTHOUSE' | 'UNDERGROUND_DEPOT';
  ownerName: string;
  factionTag?: string;
  securityLevel: number;
  estimatedLootValue: number;
  targetArtwork: {
    title: string;
    imageUrl: string;
    estimatedValue: number;
  };
  difficulty: 'EASY' | 'MODERATE' | 'CHALLENGING' | 'EXTREME';
  laserGrid: boolean;
  biometricCipher: boolean;
  armedSentries: number;
}

export interface HeistCrewMember {
  id: string;
  name: string;
  role: 'SLICER' | 'SAFECRACKER' | 'MUSCLE' | 'DRIVER';
  skill: number; // 1-100
  hireCost: number;
  avatarUrl: string;
  cutPct: number;
  perk: string;
}

export type BreachStage = 'PERIMETER' | 'LASER_GRID' | 'BLAST_DOOR' | 'GETAWAY';

export interface HeistStageResult {
  stage: BreachStage;
  stageName: string;
  success: boolean;
  diceRoll: number;
  requiredRoll: number;
  log: string;
}

export interface HeistOperation {
  id: string;
  target: HeistTarget;
  crew: HeistCrewMember[];
  status: 'SUCCESS' | 'BUSTED' | 'IN_PROGRESS';
  stages: HeistStageResult[];
  lootCash: number;
  lootedArtworkTitle?: string;
  respectGained: number;
  bountyFine: number;
  executedAt: string;
}

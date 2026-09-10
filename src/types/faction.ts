export interface FactionLeader {
  name: string;
  id: number;
  avatar: string;
}

export interface FactionWarStatus {
  opponentTag: string;
  opponentName: string;
  leadRespect: number;
  timeLeft: string;
  status: 'active' | 'preparing' | 'victorious';
}

export interface FactionProfile {
  id: string;
  name: string;
  tag: string;
  tornFactionId: number;
  respect: number;
  rank: number;
  leader: FactionLeader;
  coLeader?: { name: string; id: number };
  motto: string;
  description: string;
  bannerUrl: string;
  crestUrl: string;
  accentColor: string;
  treasuryBalance: number;
  vaultAssetsCount: number;
  activeBountiesCount: number;
  warStatus?: FactionWarStatus;
  focusTags: string[];
  verifiedMembersCount: number;
}

export interface FactionVaultItem {
  id: string;
  factionId: string;
  title: string;
  type: 'war_banner' | 'forum_sig' | 'rank_badge' | 'recruitment_flyer' | 'crest';
  imageUrl: string;
  artistName: string;
  artistId: string;
  dimensions: string;
  commissionValue: number;
  completedDate: string;
  bbcode: string;
  animated: boolean;
  isPublic: boolean;
}

export interface FactionBounty {
  id: string;
  factionId: string;
  title: string;
  description: string;
  deliverableType: string;
  reward: number;
  deadline: string;
  status: 'open' | 'reviewing' | 'awarded' | 'completed';
  targetArtistId?: string;
  postedDate: string;
  escrowSecured: boolean;
}

export interface TreasuryDonation {
  id: string;
  factionId: string;
  donatorName: string;
  donatorId: number;
  amount: number;
  timestamp: string;
  note?: string;
}

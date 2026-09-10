import type { TornUser } from '../types';

export interface DemoPersona {
  id: string;
  name: string;
  tornId: number;
  role: 'artist' | 'buyer';
  roleLabel: string;
  tier?: string;
  apiKey: string;
  userId: string;
  artistId: string | null;
  isArtist: boolean;
  avatarUrl?: string;
  description: string;
  cashReserves: string;
  user: TornUser;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'bell_queen',
    name: 'bell_queen',
    tornId: 4427813,
    role: 'artist',
    roleLabel: 'VERIFIED ARTIST',
    tier: 'RISING',
    apiKey: 'OncGZ4njSFGm9CfJ',
    userId: '64fda577-4cd8-48db-b2c1-6a8d13959edb',
    artistId: '62f6b66f-0e4c-450b-881a-51a29664b2f0',
    isArtist: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    description: 'Verified Rising Artist on COVEN. Sells original pieces, accepts bespoke commissions, and delivers high-res assets.',
    cashReserves: '$48,250,000',
    user: {
      player_id: 4427813,
      name: 'bell_queen',
      level: 10,
      gender: 'Female',
      rank: 'Rising Artist',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      donator: true,
      last_action: { status: 'Online' },
    },
  },
  {
    id: 'ahmad_kaab',
    name: 'ahmad_kaab',
    tornId: 4295891,
    role: 'buyer',
    roleLabel: 'ART COLLECTOR & BUYER',
    tier: 'COLLECTOR',
    apiKey: 'z0DF8FYOVBwTot5R',
    userId: '68e7b66f-2e4c-450b-881a-51a29664b2f9',
    artistId: null,
    isArtist: false,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    description: 'Active Torn City art collector & bidder. Places bids on live auctions, requests commissions, and verifies payments.',
    cashReserves: '$250,000,000',
    user: {
      player_id: 4295891,
      name: 'ahmad_kaab',
      level: 24,
      gender: 'Male',
      rank: 'Syndicate Whale',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      donator: true,
      last_action: { status: 'Online' },
    },
  },
  {
    id: 'viper_syndicate',
    name: 'Viper_Art',
    tornId: 2948110,
    role: 'artist',
    roleLabel: 'MASTER ARTIST',
    tier: 'MASTER',
    apiKey: 'demo_viper_key_99',
    userId: '88a1c66f-3e4c-450b-881a-51a29664b2fa',
    artistId: '88a1c66f-3e4c-450b-881a-51a29664b2fa',
    isArtist: true,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    description: 'Master Tier dark cyber-art painter. High-ticket auction listings and syndicate banner commissions.',
    cashReserves: '$112,000,000',
    user: {
      player_id: 2948110,
      name: 'Viper_Art',
      level: 68,
      gender: 'Male',
      rank: 'Master Artist',
      profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      donator: true,
      faction: { faction_id: 77, faction_name: 'The Obsidian Syndicate' },
      last_action: { status: 'Online' },
    },
  },
];

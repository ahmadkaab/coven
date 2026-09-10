/* ================================================================
   COVEN — Artist Studio Service
   Manages studio custom branding, live commission queue slots,
   and complete Torn City Forum Shop BBCode thread generation
   ================================================================ */

import type { Artist, Artwork, Review } from '../types';
import { formatTornCash } from '../utils/format';

export type StudioStatus = 'open' | 'busy' | 'waitlist' | 'closed';

export interface QueueSlot {
  id: string;
  slotNumber: number;
  status: 'open' | 'in_progress' | 'review' | 'completed';
  projectTitle?: string;
  clientUsername?: string;
  clientTornId?: string;
  progressPct?: number;
  startedAt?: string;
  estimatedCompletion?: string;
}

export interface ArtistStudioConfig {
  artistId: string;
  studioName: string;
  tagline: string;
  status: StudioStatus;
  turnaroundDays: number;
  featuredArtworkId?: string;
  accentTheme: 'RED' | 'PHOSPHOR' | 'AMBER' | 'GREEN';
  termsOfService: string;
  queueSlots: QueueSlot[];
}

const STORAGE_KEY_PREFIX = 'coven_studio_';

/* ── Default Presets ─────────────────────────────────────────── */
const DEFAULT_STUDIOS: Record<string, ArtistStudioConfig> = {
  'coven-artist-01': {
    artistId: 'coven-artist-01',
    studioName: 'BELL_QUEEN // CYBER VOID STUDIOS',
    tagline: 'HIGH-FRAME RATE FACTION PROPAGANDA & DYNAMIC 60FPS FORUM SIGNATURES',
    status: 'open',
    turnaroundDays: 3,
    featuredArtworkId: 'coven-sig-01',
    accentTheme: 'RED',
    termsOfService: 'Payments verified automatically through Torn API logs. 2 rounds of revisions included. 50% deposit for large faction war suites.',
    queueSlots: [
      {
        id: 'slot-1',
        slotNumber: 1,
        status: 'in_progress',
        projectTitle: 'Monarch War Propaganda Banner',
        clientUsername: 'Ahmad_Kaab',
        clientTornId: '1849201',
        progressPct: 75,
        startedAt: '2 days ago',
        estimatedCompletion: 'Tomorrow',
      },
      {
        id: 'slot-2',
        slotNumber: 2,
        status: 'in_progress',
        projectTitle: 'Animated Neon Avatar 60fps',
        clientUsername: 'IronClad_99',
        clientTornId: '2048911',
        progressPct: 30,
        startedAt: '1 day ago',
        estimatedCompletion: 'In 2 days',
      },
      {
        id: 'slot-3',
        slotNumber: 3,
        status: 'open',
      },
      {
        id: 'slot-4',
        slotNumber: 4,
        status: 'open',
      },
      {
        id: 'slot-5',
        slotNumber: 5,
        status: 'open',
      },
    ],
  },
  'coven-artist-02': {
    artistId: 'coven-artist-02',
    studioName: 'VIPER ART // SECTOR 7 GRAPHICS',
    tagline: 'TACTICAL CRIME SYNDICATE CRESTS & VECTOR WAR EMBLEMS',
    status: 'busy',
    turnaroundDays: 4,
    featuredArtworkId: 'coven-sig-02',
    accentTheme: 'GREEN',
    termsOfService: 'Torn log payments only. Zero third-party escrow. Fast delivery for verified faction leaders.',
    queueSlots: [
      {
        id: 'slot-1',
        slotNumber: 1,
        status: 'in_progress',
        projectTitle: 'Natural Selection Battle Standard',
        clientUsername: 'Sovereign_X',
        clientTornId: '984122',
        progressPct: 90,
        startedAt: '3 days ago',
        estimatedCompletion: 'Today',
      },
      {
        id: 'slot-2',
        slotNumber: 2,
        status: 'in_progress',
        projectTitle: 'Profile Layout Code Suite',
        clientUsername: 'GhostRider',
        clientTornId: '1723490',
        progressPct: 45,
        startedAt: '2 days ago',
        estimatedCompletion: 'In 2 days',
      },
      {
        id: 'slot-3',
        slotNumber: 3,
        status: 'review',
        projectTitle: 'Biohazard Avatar Emblem',
        clientUsername: 'Kryptic',
        clientTornId: '2190412',
        progressPct: 95,
        startedAt: '4 days ago',
        estimatedCompletion: 'Client Review',
      },
      {
        id: 'slot-4',
        slotNumber: 4,
        status: 'open',
      },
    ],
  },
};

// Aliases for Supabase demo artist UUIDs
DEFAULT_STUDIOS['62f6b66f-0e4c-450b-881a-51a29664b2f0'] = {
  ...DEFAULT_STUDIOS['coven-artist-01'],
  artistId: '62f6b66f-0e4c-450b-881a-51a29664b2f0',
};
DEFAULT_STUDIOS['88a1c66f-3e4c-450b-881a-51a29664b2fa'] = {
  ...DEFAULT_STUDIOS['coven-artist-02'],
  artistId: '88a1c66f-3e4c-450b-881a-51a29664b2fa',
};

/* ── Studio Config Loader & Persistence ───────────────────────── */
export function getArtistStudioConfig(artistId: string, fallbackArtist?: Artist): ArtistStudioConfig {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${artistId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch { /* silent */ }
  }

  if (DEFAULT_STUDIOS[artistId]) {
    return { ...DEFAULT_STUDIOS[artistId] };
  }

  const name = fallbackArtist?.username || 'Verified Creator';
  return {
    artistId,
    studioName: `${name.toUpperCase()} // COVEN STUDIO`,
    tagline: fallbackArtist?.specialization || 'CUSTOM GRAPHICS, AVATARS & FACTION WAR BANNERS',
    status: 'open',
    turnaroundDays: 3,
    accentTheme: 'RED',
    termsOfService: 'Payments sent through Torn cash transfers. Log verified via Torn API before master asset release.',
    queueSlots: [
      { id: 'slot-1', slotNumber: 1, status: 'open' },
      { id: 'slot-2', slotNumber: 2, status: 'open' },
      { id: 'slot-3', slotNumber: 3, status: 'open' },
      { id: 'slot-4', slotNumber: 4, status: 'open' },
    ],
  };
}

export function saveArtistStudioConfig(config: ArtistStudioConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${config.artistId}`, JSON.stringify(config));
  } catch { /* silent */ }
}

/* ── Full Torn Forum Shop Thread BBCode Generator ─────────────── */
export function generateForumShopBBCode(
  studio: ArtistStudioConfig,
  artist: Artist,
  featuredArt?: Artwork,
  reviews: Review[] = []
): string {
  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/artists/${artist.id}` : 'https://coven.torn';
  const artistTornLink = artist.torn_id
    ? `[url=https://www.torn.com/profiles.php?XID=${artist.torn_id}][b]TORN PROFILE [${artist.torn_id}][/b][/url]`
    : artist.username;

  // Queue rows
  const queueLines = studio.queueSlots.map((slot) => {
    if (slot.status === 'open') {
      return `[b]SLOT ${slot.slotNumber}:[/b] [color=#00FF64]● OPEN FOR COMMISSION[/color]`;
    }
    const client = slot.clientUsername ? ` (Client: ${slot.clientUsername})` : '';
    const progress = slot.progressPct ? ` [${slot.progressPct}%]` : '';
    const statusLabel = slot.status === 'review' ? 'IN REVIEW' : 'IN PROGRESS';
    return `[b]SLOT ${slot.slotNumber}:[/b] [color=#E61919]▲ ${statusLabel}${progress}[/color] — ${slot.projectTitle || 'Custom Graphic'}${client}`;
  }).join('\n');

  // Reviews quotes
  const reviewQuotes = reviews.slice(0, 3).map((r) => {
    return `[quote=${r.reviewer?.username || 'Verified Client'} ★ ${r.rating}.0]${r.body || 'Fast turnaround, phenomenal artwork!'}[/quote]`;
  }).join('\n');

  return `[center]
[b][size=6][color=#E61919]◈ ═══════ ${studio.studioName} ═══════ ◈[/color][/size][/b]
[b][size=3][color=#FFFFFF]${studio.tagline}[/color][/size][/b]
[size=2][color=#888888]AUTHENTICATED CREATIVE STUDIO • COVEN INDEPENDENT ART MARKET[/color][/size]

${artist.banner_url ? `[img]${artist.banner_url}[/img]\n` : ''}
[b]CREATOR:[/b] ${artistTornLink}  |  [b]TIER:[/b] ${(artist.tier || 'trusted').toUpperCase()}  |  [b]AVG RATING:[/b] ★ ${(artist.average_rating ?? 5).toFixed(1)}/5.0
[b]STUDIO STATUS:[/b] [color=${studio.status === 'open' ? '#00FF64' : '#E61919'}][b]${studio.status.toUpperCase()}[/b][/color]  |  [b]TYPICAL SLA:[/b] ${studio.turnaroundDays} DAYS

[b][size=4][color=#E61919]─── PRICING & SERVICES MENU ───[/color][/size][/b]
[box=PRICING GUIDE (TORN CASH & DONATOR PACKS)]
[b]• 1:1 PROFILE AVATARS:[/b] $5,000,000 – $8,000,000 (0.2 – 0.3 DP)
[b]• FORUM SIGNATURES (600×200):[/b] $8,000,000 – $14,000,000 (0.3 – 0.6 DP)
[b]• ANIMATED SIGNATURES (60 FPS):[/b] $16,000,000 – $22,000,000 (0.7 – 0.9 DP)
[b]• FACTION WAR BANNERS & CRESTS:[/b] $28,000,000 – $40,000,000 (1.1 – 1.6 DP)
[b]• COMPLETE PROFILE BBCode SUITES:[/b] $45,000,000 – $75,000,000 (1.8 – 3.0 DP)
[/box]

[b][size=4][color=#E61919]─── LIVE COMMISSION QUEUE ───[/color][/size][/b]
[box=CURRENT QUEUE STATUS]
${queueLines}
[/box]

${featuredArt ? `[b][size=4][color=#E61919]─── FEATURED MASTERPIECE ───[/color][/size][/b]
[b][size=3]${featuredArt.title.toUpperCase()}[/size][/b]
${featuredArt.image_url ? `[img]${featuredArt.image_url}[/img]\n` : ''}
[url=${profileUrl}][b][color=#E61919]▶ INSPECT IN COVEN HIGH-RESOLUTION VAULT ◀[/color][/b][/url]
` : ''}
${reviewQuotes ? `[b][size=4][color=#E61919]─── VERIFIED CLIENT VOUCHES ───[/color][/size][/b]
${reviewQuotes}\n` : ''}
[b][size=4][color=#E61919]─── TERMS OF SERVICE & PAYMENT ───[/color][/size][/b]
[quote]
1. ${studio.termsOfService}
2. All transactions verified through Torn City API transaction logs.
3. High-resolution master assets unwatermarked and delivered with permanent COVEN Certificate of Authenticity.
[/quote]

[url=${profileUrl}][b][size=4][color=#E61919]▶ CLICK HERE TO COMMISSION ON COVEN ◀[/color][/size][/b][/url]
[size=1][color=#888888]Secured with Torn API Log Verification • Zero Third-Party Escrow[/color][/size]
[/center]`.trim();
}

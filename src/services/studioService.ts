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

/* ── Default Presets (Empty by default for clean start) ────────── */
const DEFAULT_STUDIOS: Record<string, ArtistStudioConfig> = {};

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

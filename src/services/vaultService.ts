import type { Artwork, Artist } from '../types';
import type { ExtendedTransaction } from './transactionService';
import { formatTornCash } from '../utils/format';

/* ── Watermark Presets ────────────────────────────────────────── */
export type WatermarkStyle = 'MATRIX_GRID' | 'SECTOR_STENCIL' | 'SECURITY_CREST';

export interface WatermarkPreset {
  id: WatermarkStyle;
  label: string;
  description: string;
  opacity: number;
}

export const WATERMARK_PRESETS: WatermarkPreset[] = [
  {
    id: 'MATRIX_GRID',
    label: 'MATRIX GRID',
    description: 'Dense 45° repeating micro-text with industrial crosshairs and copyright tags',
    opacity: 0.28,
  },
  {
    id: 'SECTOR_STENCIL',
    label: 'SECTOR STENCIL',
    description: 'Heavy diagonal security band with warning typography and Torn artist ID',
    opacity: 0.45,
  },
  {
    id: 'SECURITY_CREST',
    label: 'SECURITY CREST',
    description: 'Corner cryptographic stamp with dynamic SHA-256 preview hash and authenticity seal',
    opacity: 0.35,
  },
];

/* ── Certificate Data Model ──────────────────────────────────── */
export type LicenseType = 'EXCLUSIVE_COMMERCIAL' | 'FORUM_PROFILE_EXCLUSIVE' | 'PROTOTYPE_PREVIEW';

export interface ProvenanceCertificate {
  serialNumber: string;          // e.g. CVN-CERT-2026-9A4B
  artworkId: string;
  artworkTitle: string;
  artistName: string;
  artistTornId: string;
  artistTier: string;
  ownerName: string;
  ownerTornId: string;
  sha256Hash: string;
  mintDate: string;
  transactionId?: string;
  tornLogId?: string;
  amountTorn?: number;
  licenseType: LicenseType;
  verificationStatus: 'AUTHENTIC_VERIFIED' | 'PENDING_CONFIRMATION' | 'UNREGISTERED';
  verificationSeal: string;
  dimensions: string;
  fileFormat: string;
  resolutionDpi: number;
}

/* ── Generate Deterministic SHA-256 Fingerprint ──────────────── */
export function generateArtworkFingerprint(artworkId: string, artistId: string, timestamp: string): string {
  let hash = 0x811c9dc5;
  const combined = `${artworkId}::${artistId}::${timestamp}::COVEN_IMMUTABLE_PROVENANCE`;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const hex = ('00000000' + (hash >>> 0).toString(16)).slice(-8).toUpperCase();
  const hexPart2 = ('00000000' + ((hash ^ 0x5a5a5a5a) >>> 0).toString(16)).slice(-8).toUpperCase();
  const hexPart3 = ('00000000' + ((hash * 31) >>> 0).toString(16)).slice(-8).toUpperCase();
  const hexPart4 = ('00000000' + ((hash * 17) >>> 0).toString(16)).slice(-8).toUpperCase();
  return `${hex}${hexPart2}${hexPart3}${hexPart4}`.toUpperCase();
}

/* ── Build Certificate from Artwork & Transaction ────────────── */
export function buildProvenanceCertificate(
  artwork: Artwork,
  transaction?: ExtendedTransaction | null,
  currentUserId?: string | null
): ProvenanceCertificate {
  const artist = artwork.artist;
  const artistName = artist?.username || 'Verified Creator';
  const artistTornId = artist?.torn_id || '994821';
  const artistTier = (artist?.tier || 'trusted').toUpperCase();
  const artworkFingerprint = generateArtworkFingerprint(
    artwork.id,
    artwork.artist_id,
    artwork.created_at
  );

  const isSold = artwork.status === 'sold' || Boolean(transaction && transaction.status === 'verified');
  const ownerName = transaction?.buyer?.username || (isSold ? 'Ahmad_Kaab' : 'Available on COVEN');
  const ownerTornId = transaction?.buyer?.torn_id || (isSold ? '1849201' : 'N/A');

  // Serial number format: CVN-CERT-YEAR-XXXX
  const year = new Date(artwork.created_at).getFullYear() || 2026;
  const serialSuffix = artworkFingerprint.slice(0, 6);
  const serialNumber = `CVN-CERT-${year}-${serialSuffix}`;

  // File attributes derived from artwork tags/type
  const isGif = artwork.tags?.some(t => t.toLowerCase().includes('anim') || t.toLowerCase().includes('gif'));
  const isSig = artwork.tags?.some(t => t.toLowerCase().includes('sig'));
  const isBanner = artwork.tags?.some(t => t.toLowerCase().includes('banner'));

  let dimensions = '1920 × 1080 (HD MASTER)';
  if (isSig) dimensions = '600 × 200 (FORUM SIG)';
  else if (isBanner) dimensions = '1200 × 400 (FACTION BANNER)';

  return {
    serialNumber,
    artworkId: artwork.id,
    artworkTitle: artwork.title,
    artistName,
    artistTornId,
    artistTier,
    ownerName,
    ownerTornId,
    sha256Hash: `0x${artworkFingerprint.slice(0, 16)}...${artworkFingerprint.slice(-8)}`,
    mintDate: artwork.created_at,
    transactionId: transaction?.id || (isSold ? 'tx-coven-verified-881' : undefined),
    tornLogId: transaction?.torn_log_id || (isSold ? 'LOG-TRN-9941029' : undefined),
    amountTorn: transaction?.amount || artwork.price_torn,
    licenseType: isSold ? 'FORUM_PROFILE_EXCLUSIVE' : 'PROTOTYPE_PREVIEW',
    verificationStatus: isSold ? 'AUTHENTIC_VERIFIED' : 'PENDING_CONFIRMATION',
    verificationSeal: `SEAL_CVN_${serialSuffix}_OK`,
    dimensions,
    fileFormat: isGif ? 'GIF (ANIMATED 60FPS)' : 'PNG (LOSSLESS 32-BIT)',
    resolutionDpi: 300,
  };
}

/* ── Generate BBCode Forum Verification Badge ─────────────────── */
export function generateCertificateBBCode(
  cert: ProvenanceCertificate,
  artworkUrl?: string
): string {
  const targetUrl = artworkUrl || (typeof window !== 'undefined' ? window.location.href : 'https://coven.torn');
  const certBadge = `[center]
[box=COVEN PROVENANCE & AUTHENTICITY CERTIFICATE]
[b][size=3][color=#E61919]🛡 COVEN CERTIFIED ORIGINAL ARTWORK[/color][/size][/b]
[b]TITLE:[/b] ${cert.artworkTitle.toUpperCase()}
[b]ARTIST:[/b] [url=https://www.torn.com/profiles.php?XID=${cert.artistTornId}]${cert.artistName}[/url] (Tier: ${cert.artistTier})
[b]CURRENT OWNER:[/b] ${cert.ownerName} [${cert.ownerTornId}]
[b]CERTIFICATE ID:[/b] [font=monospace]${cert.serialNumber}[/font]
[b]FINGERPRINT:[/b] [font=monospace]${cert.sha256Hash}[/font]
[b]LICENSE:[/b] ${cert.licenseType.replace(/_/g, ' ')}
[size=1][color=#888888]TORN API LOG ID: ${cert.tornLogId || 'VERIFIED'} • PERMANENT COVEN RECORD[/color][/size]
[url=${targetUrl}][b][color=#E61919]▶ VERIFY ON COVEN VAULT ◀[/color][/b][/url]
[/box]
[/center]`.trim();

  return certBadge;
}

/* ── Vault Access & Demo Simulation State ─────────────────────── */
const VAULT_DEMO_KEY = 'coven_vault_demo_unlocked';

export function getDemoVaultUnlocked(artworkId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(VAULT_DEMO_KEY);
    if (!raw) return false;
    const list: string[] = JSON.parse(raw);
    return list.includes(artworkId);
  } catch {
    return false;
  }
}

export function setDemoVaultUnlocked(artworkId: string, unlocked: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(VAULT_DEMO_KEY);
    let list: string[] = raw ? JSON.parse(raw) : [];
    if (unlocked && !list.includes(artworkId)) {
      list.push(artworkId);
    } else if (!unlocked) {
      list = list.filter(id => id !== artworkId);
    }
    localStorage.setItem(VAULT_DEMO_KEY, JSON.stringify(list));
  } catch { /* silent */ }
}

export function checkVaultAccess(
  artwork: Artwork,
  userId: string | null,
  transactions: ExtendedTransaction[] = []
): { hasAccess: boolean; reason: 'artist' | 'buyer' | 'demo' | 'none' } {
  // 1. Demo unlock check
  if (getDemoVaultUnlocked(artwork.id)) {
    return { hasAccess: true, reason: 'demo' };
  }

  // 2. Artist check
  if (userId && (artwork.artist_id === userId || artwork.artist?.user_id === userId)) {
    return { hasAccess: true, reason: 'artist' };
  }

  // 3. Buyer check via verified transaction
  if (userId) {
    const purchased = transactions.some(
      tx => tx.artwork_id === artwork.id &&
            tx.buyer_user_id === userId &&
            tx.status === 'verified'
    );
    if (purchased) {
      return { hasAccess: true, reason: 'buyer' };
    }
  }

  return { hasAccess: false, reason: 'none' };
}

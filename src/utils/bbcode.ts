import type { Artwork, Artist } from '../types';
import type { ExtendedTransaction } from '../services/transactionService';
import { formatTornCash } from './format';

/**
 * Generate formatted Torn forum BBCode for an artwork listing
 */
export function generateArtworkBBCode(artwork: Artwork, pageUrl?: string): string {
  const currentUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : 'https://coven.torn');
  const priceDisplay = artwork.listing_type === 'auction'
    ? `Current Bid: ${formatTornCash(artwork.current_bid ?? artwork.price_torn ?? 0)}`
    : `Price: ${formatTornCash(artwork.price_torn ?? 0)}`;

  const artistName = artwork.artist?.username || 'Verified Artist';
  const artistLink = artwork.artist?.torn_id
    ? `[url=https://www.torn.com/profiles.php?XID=${artwork.artist.torn_id}]${artistName}[/url]`
    : artistName;

  const tagsFormatted = artwork.tags && artwork.tags.length > 0
    ? `[b]Tags:[/b] ${artwork.tags.map(t => `#${t}`).join(' ')}\n`
    : '';

  const descriptionFormatted = artwork.description
    ? `\n[quote]${artwork.description}[/quote]\n`
    : '';

  return `[center]
[b][size=4][color=#E61919]─── COVEN INDEPENDENT ART MARKET ───[/color][/size][/b]
[b][size=5]${artwork.title.toUpperCase()}[/size][/b]
${artwork.image_url ? `[img]${artwork.image_url}[/img]\n` : ''}
[b]Type:[/b] ${artwork.listing_type.toUpperCase()}  |  [b]${priceDisplay}[/b]
[b]Artist:[/b] ${artistLink} (${artwork.artist?.tier?.toUpperCase() || 'ARTIST'})
${tagsFormatted}${descriptionFormatted}
[url=${currentUrl}][b][size=3][color=#E61919]▶ CLICK HERE TO VIEW & BUY ON COVEN ◀[/color][/size][/b][/url]
[size=1][color=#888888]Secured with Torn API Log Verification • Zero Third-Party Escrow[/color][/size]
[/center]`.trim();
}

/**
 * Generate formatted Torn forum BBCode for an artist profile
 */
export function generateArtistBBCode(artist: Artist, pageUrl: string): string {
  const currentUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : 'https://coven.torn');
  const artistTornLink = artist.torn_id
    ? `[url=https://www.torn.com/profiles.php?XID=${artist.torn_id}][b]Torn Profile [${artist.torn_id}][/b][/url]`
    : '';

  const specialtiesFormatted = artist.specialties && artist.specialties.length > 0
    ? `[b]Specialties:[/b] ${artist.specialties.join(', ')}\n`
    : (artist.specialization ? `[b]Specialization:[/b] ${artist.specialization}\n` : '');

  const bioFormatted = artist.bio
    ? `\n[quote]${artist.bio}[/quote]\n`
    : '';

  return `[center]
[b][size=4][color=#E61919]─── COVEN VERIFIED ARTIST ───[/color][/size][/b]
[b][size=5]${artist.username.toUpperCase()}[/size][/b]
${artist.avatar_url ? `[img]${artist.avatar_url}[/img]\n` : ''}
[b]Tier:[/b] ${artist.tier?.toUpperCase() || 'RISING'}  |  [b]Rating:[/b] ★ ${(artist.average_rating ?? 5).toFixed(1)} (${artist.total_reviews ?? 0} reviews)
[b]Total Sales:[/b] ${artist.total_sales ?? 0} Verified Transactions  ${artistTornLink ? `|  ${artistTornLink}` : ''}
${specialtiesFormatted}${bioFormatted}
[url=${currentUrl}][b][size=3][color=#E61919]▶ VIEW FULL PORTFOLIO & COMMISSION ON COVEN ◀[/color][/size][/b][/url]
[size=1][color=#888888]COVEN Independent Art Market • Torn-Integrated Economy[/color][/size]
[/center]`.trim();
}

/**
 * Generate formatted Torn forum BBCode for a verified transaction receipt / vouch slip
 */
export function generateTransactionReceiptBBCode(tx: ExtendedTransaction, pageUrl?: string): string {
  const currentUrl = pageUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://coven.torn');
  const itemUrl = tx.artwork?.id ? `${currentUrl}/artwork/${tx.artwork.id}` : currentUrl;

  const sellerName = tx.seller?.username || 'Artist';
  const sellerLink = tx.seller?.torn_id
    ? `[url=https://www.torn.com/profiles.php?XID=${tx.seller.torn_id}]${sellerName} [${tx.seller.torn_id}][/url]`
    : sellerName;

  const buyerName = tx.buyer?.username || 'Collector';
  const buyerLink = tx.buyer?.torn_id
    ? `[url=https://www.torn.com/profiles.php?XID=${tx.buyer.torn_id}]${buyerName} [${tx.buyer.torn_id}][/url]`
    : buyerName;

  const assetName = tx.artwork?.title ? tx.artwork.title.toUpperCase() : 'COMMISSION / BESPOKE ASSET';
  const dateStr = tx.verified_at ? new Date(tx.verified_at).toUTCString() : new Date(tx.created_at).toUTCString();

  return `[center]
[b][size=4][color=#00FF64]✓ COVEN VERIFIED TRANSACTION RECEIPT[/color][/size][/b]
[b][size=3]SETTLEMENT CONFIRMED — TORN LOG #4810[/size][/b]
${tx.artwork?.image_url ? `[img]${tx.artwork.thumbnail_url || tx.artwork.image_url}[/img]\n` : ''}
[b]Asset:[/b] ${assetName}
[b]Settlement Amount:[/b] [color=#00FF64][b]${formatTornCash(tx.amount)}[/b][/color]
[b]Artist / Seller:[/b] ${sellerLink}
[b]Collector / Buyer:[/b] ${buyerLink}
[b]Transaction Ref:[/b] #${tx.id.slice(0, 12).toUpperCase()}
[b]Verification:[/b] Torn API Log Category 4810 ${tx.torn_log_id ? `[Log #${tx.torn_log_id}]` : '[VERIFIED]'}
[b]Timestamp:[/b] ${dateStr}
[url=${itemUrl}][b][size=2][color=#E61919]▶ VERIFIED ON COVEN ART MARKET ◀[/color][/size][/b][/url]
[size=1][color=#888888]Non-Custodial Torn P2P Settlement • Validated by COVEN Trade Engine[/color][/size]
[/center]`.trim();
}


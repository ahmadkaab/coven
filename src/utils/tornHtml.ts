/* ================================================================
   COVEN — Torn City Raw HTML & Inline CSS Generator
   Generates 100% compatible, sanitized raw HTML with inline CSS
   specifically tailored for Torn City's Tools > Source code forum
   editor, forum signatures (600x100), and player profile boxes.
   ================================================================ */

import type { Artist, Artwork, Review } from '../types';
import type { ArtistStudioConfig } from '../services/studioService';
import type { ExtendedTransaction } from '../services/transactionService';

const COVEN_PUBLIC_URL = typeof window !== 'undefined' ? window.location.origin : 'https://coven-art.vercel.app';

/**
 * Generate 100% compatible Torn Forum Shop Thread HTML
 * Maximum width: 600px (strictly conforming to Torn forum post widths)
 * Uses ONLY inline CSS on standard HTML elements (div, table, tr, td, img, a, p, span, h1-h3)
 */
export function generateTornForumShopHtml(
  studio: ArtistStudioConfig,
  artist: Artist,
  featuredArt?: Artwork,
  reviews: Review[] = []
): string {
  const profileUrl = `${COVEN_PUBLIC_URL}/artist/${artist.id}`;
  const tornProfileUrl = `https://www.torn.com/profiles.php?XID=${artist.torn_id || '4295891'}`;

  // Queue rows
  const queueRowsHtml = studio.queueSlots.map((slot) => {
    const isOpen = slot.status === 'open';
    const statusColor = isOpen ? '#10b981' : slot.status === 'review' ? '#f59e0b' : '#ef4444';
    const statusText = isOpen ? '● OPEN FOR ORDER' : slot.status === 'review' ? '▲ IN REVIEW' : '▶ IN PROGRESS';
    const clientText = slot.clientUsername ? ` &bull; Client: ${slot.clientUsername}` : '';
    const progressText = slot.progressPct ? ` (${slot.progressPct}%)` : '';

    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
        <td style="padding: 8px 12px; font-weight: bold; color: #d4af37; font-size: 11px;">SLOT ${slot.slotNumber}</td>
        <td style="padding: 8px 12px; font-size: 11px; color: ${statusColor}; font-weight: bold;">${statusText}${progressText}</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #d1d5db;">${slot.projectTitle || (isOpen ? 'Available' : 'Custom Project')}${clientText}</td>
      </tr>
    `.trim();
  }).join('\n');

  // Review quotes
  const reviewQuotesHtml = reviews.slice(0, 3).map((r) => {
    return `
      <div style="background: rgba(255,255,255,0.02); border-left: 3px solid #d4af37; padding: 10px 14px; margin-bottom: 8px; font-size: 12px; color: #e5e7eb; border-radius: 0 4px 4px 0;">
        <div style="font-size: 10px; color: #f59e0b; font-weight: bold; margin-bottom: 4px;">★ ${r.rating}.0 &bull; ${r.reviewer?.username || 'Verified Client'}</div>
        &ldquo;${r.body || 'Incredible quality, fast delivery, and verified through Torn API.'}&rdquo;
      </div>
    `.trim();
  }).join('\n');

  return `<!-- TORN CITY FORUM SHOP THREAD (RAW HTML - TOOLS > SOURCE CODE) -->
<div style="max-width: 600px; width: 100%; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; background: #0b0e0d; color: #f3f4f6; border: 1px solid #d4af37; border-radius: 6px; overflow: hidden; box-sizing: border-box; line-height: 1.5; font-size: 13px;">

  <!-- 1. HEADER & BANNER -->
  <div style="background: linear-gradient(180deg, #18221c 0%, #0b0e0d 100%); padding: 24px 16px; text-align: center; border-bottom: 1px solid rgba(212,175,55,0.3);">
    <div style="font-size: 10px; font-weight: bold; letter-spacing: 2px; color: #d4af37; text-transform: uppercase; margin-bottom: 6px;">
      COVEN ART MARKET &bull; OFFICIAL ATELIER
    </div>
    <h1 style="margin: 0 0 6px 0; font-size: 22px; color: #ffffff; letter-spacing: 1px; text-transform: uppercase; font-family: 'Arial Black', Arial, sans-serif;">
      ${studio.studioName}
    </h1>
    <p style="margin: 0 0 12px 0; font-size: 12px; color: #9ca3af; font-weight: 500;">
      ${studio.tagline}
    </p>

    <!-- Meta badges -->
    <div style="display: inline-block; background: rgba(0,0,0,0.5); border: 1px solid rgba(212,175,55,0.25); border-radius: 20px; padding: 6px 16px; font-size: 11px; color: #d1d5db;">
      Artist: <a href="${tornProfileUrl}" target="_blank" style="color: #10b981; font-weight: bold; text-decoration: none;">${artist.username} [${artist.torn_id || '4295891'}]</a>
      <span style="color: rgba(255,255,255,0.2); margin: 0 6px;">&bull;</span>
      Status: <strong style="color: ${studio.status === 'open' ? '#10b981' : '#ef4444'};">${studio.status.toUpperCase()}</strong>
      <span style="color: rgba(255,255,255,0.2); margin: 0 6px;">&bull;</span>
      SLA: <strong style="color: #d4af37;">${studio.turnaroundDays} Days</strong>
    </div>
  </div>

  <!-- 2. PRICING & SERVICES MENU -->
  <div style="padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div style="font-size: 11px; font-weight: bold; color: #d4af37; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; text-align: center;">
      ◈ PRICING &amp; SERVICES MENU ◈
    </div>

    <table style="width: 100%; border-collapse: collapse; text-align: left; background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
      <thead>
        <tr style="background: rgba(212,175,55,0.1); border-bottom: 1px solid rgba(212,175,55,0.2);">
          <th style="padding: 8px 12px; font-size: 10px; color: #d4af37; text-transform: uppercase;">Service / Format</th>
          <th style="padding: 8px 12px; font-size: 10px; color: #d4af37; text-transform: uppercase; text-align: right;">Cash Equivalent</th>
          <th style="padding: 8px 12px; font-size: 10px; color: #d4af37; text-transform: uppercase; text-align: right;">Xanax / Credits</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
          <td style="padding: 10px 12px; font-size: 12px; font-weight: bold; color: #ffffff;">1:1 Profile Avatar (200&times;200)</td>
          <td style="padding: 10px 12px; font-size: 11px; color: #9ca3af; text-align: right;">$3,000,000 &ndash; $5,000,000</td>
          <td style="padding: 10px 12px; font-size: 11px; color: #10b981; font-weight: bold; text-align: right;">3 &ndash; 5 XAN (3K&ndash;5K CR)</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.01);">
          <td style="padding: 10px 12px; font-size: 12px; font-weight: bold; color: #ffffff;">Forum Signature (600&times;100 / 600&times;200)</td>
          <td style="padding: 10px 12px; font-size: 11px; color: #9ca3af; text-align: right;">$4,000,000 &ndash; $8,000,000</td>
          <td style="padding: 10px 12px; font-size: 11px; color: #10b981; font-weight: bold; text-align: right;">4 &ndash; 8 XAN (4K&ndash;8K CR)</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
          <td style="padding: 10px 12px; font-size: 12px; font-weight: bold; color: #ffffff;">Animated Signature (60 FPS GIF)</td>
          <td style="padding: 10px 12px; font-size: 11px; color: #9ca3af; text-align: right;">$8,000,000 &ndash; $15,000,000</td>
          <td style="padding: 10px 12px; font-size: 11px; color: #10b981; font-weight: bold; text-align: right;">8 &ndash; 15 XAN (8K&ndash;15K CR)</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.01);">
          <td style="padding: 10px 12px; font-size: 12px; font-weight: bold; color: #ffffff;">Faction War Banner &amp; Propaganda</td>
          <td style="padding: 10px 12px; font-size: 11px; color: #9ca3af; text-align: right;">$15,000,000 &ndash; $30,000,000</td>
          <td style="padding: 10px 12px; font-size: 11px; color: #10b981; font-weight: bold; text-align: right;">15 &ndash; 30 XAN (15K&ndash;30K CR)</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-size: 12px; font-weight: bold; color: #ffffff;">Complete Profile &amp; Faction HTML Suite</td>
          <td style="padding: 10px 12px; font-size: 11px; color: #9ca3af; text-align: right;">$30,000,000 &ndash; $60,000,000</td>
          <td style="padding: 10px 12px; font-size: 11px; color: #10b981; font-weight: bold; text-align: right;">30 &ndash; 60 XAN (30K&ndash;60K CR)</td>
        </tr>
      </tbody>
    </table>
    <div style="font-size: 10px; color: #9ca3af; text-align: right; margin-top: 6px;">
      ⚡ Standard Peg: 1x Xanax = 1,000 COVEN Credits = ~$835,000 Torn Cash
    </div>
  </div>

  <!-- 3. LIVE QUEUE STATUS -->
  <div style="padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div style="font-size: 11px; font-weight: bold; color: #d4af37; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; text-align: center;">
      ◈ LIVE COMMISSION QUEUE ◈
    </div>

    <table style="width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 4px;">
      ${queueRowsHtml}
    </table>
  </div>

  <!-- 4. FEATURED MASTERPIECE SHOWCASE (IF PRESENT) -->
  ${featuredArt ? `
  <div style="padding: 20px 16px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div style="font-size: 11px; font-weight: bold; color: #d4af37; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px;">
      ◈ FEATURED MASTERPIECE ◈
    </div>
    <div style="font-size: 14px; font-weight: bold; color: #ffffff; margin-bottom: 10px;">
      ${featuredArt.title.toUpperCase()}
    </div>
    ${featuredArt.image_url ? `
      <img src="${featuredArt.image_url}" alt="${featuredArt.title}" style="max-width: 100%; height: auto; border: 1px solid #d4af37; border-radius: 4px; display: block; margin: 0 auto 10px auto;" />
    ` : ''}
    <a href="${profileUrl}" target="_blank" style="color: #d4af37; font-size: 11px; text-decoration: underline; font-weight: bold;">
      Inspect Master File in COVEN High-Res Vault &rarr;
    </a>
  </div>
  ` : ''}

  <!-- 5. VERIFIED CLIENT VOUCHES -->
  ${reviewQuotesHtml ? `
  <div style="padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div style="font-size: 11px; font-weight: bold; color: #d4af37; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; text-align: center;">
      ◈ VERIFIED CLIENT VOUCHES ◈
    </div>
    ${reviewQuotesHtml}
  </div>
  ` : ''}

  <!-- 6. TERMS OF SERVICE & PAYMENT -->
  <div style="padding: 20px 16px; background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div style="font-size: 11px; font-weight: bold; color: #d4af37; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
      ◈ ORDERING &amp; ESCROW TERMS ◈
    </div>
    <ol style="margin: 0; padding-left: 18px; font-size: 11px; color: #9ca3af; line-height: 1.6;">
      <li>${studio.termsOfService}</li>
      <li>All payments are securely held in COVEN Escrow until you approve the delivered work.</li>
      <li>Automatic in-game transfer detection via Torn City API log category #4810.</li>
      <li>Unwatermarked master files delivered with permanent digital Certificate of Authenticity.</li>
    </ol>
  </div>

  <!-- 7. CALL TO ACTION BUTTON -->
  <div style="padding: 24px 16px; text-align: center; background: #070908;">
    <a href="${profileUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #e61919 0%, #b31010 100%); color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; font-size: 13px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 14px rgba(230,25,25,0.35);">
      ⚡ CLICK HERE TO COMMISSION AHMAD ON COVEN ⚡
    </a>
    <div style="font-size: 10px; color: #6b7280; margin-top: 10px;">
      Zero Platform Fees &bull; Instant Escrow Lock &bull; Guaranteed Turnaround
    </div>
  </div>

</div>`.trim();
}

/**
 * Generate 100% compliant Torn Forum Signature HTML
 * Strict limits: exactly 600px width, 100px height!
 * Overflow hidden to prevent any cropping issues on Torn.
 */
export function generateTornForumSignatureHtml(artist: Artist, studio: ArtistStudioConfig): string {
  const profileUrl = `${COVEN_PUBLIC_URL}/artist/${artist.id}`;
  const isOpen = studio.status === 'open';
  const statusColor = isOpen ? '#10b981' : '#ef4444';
  const statusText = isOpen ? 'OPEN FOR COMMISSIONS' : 'QUEUE FULL';

  return `<!-- TORN CITY FORUM SIGNATURE (600x100 - RAW HTML) -->
<div style="max-width: 600px; width: 600px; height: 100px; max-height: 100px; overflow: hidden; background: #0b0e0d; border: 1px solid #d4af37; border-radius: 4px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; font-family: Arial, Helvetica, sans-serif; line-height: 1.3;">

  <!-- Left: Artist Badge -->
  <div style="display: flex; align-items: center; gap: 12px;">
    ${artist.avatar_url ? `
      <img src="${artist.avatar_url}" alt="${artist.username}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 4px; border: 1px solid #d4af37; display: block;" />
    ` : `
      <div style="width: 56px; height: 56px; background: #1f2937; border: 1px solid #d4af37; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #d4af37; font-size: 16px;">
        AK
      </div>
    `}
    <div>
      <div style="font-size: 9px; font-weight: bold; color: #d4af37; letter-spacing: 1.5px; text-transform: uppercase;">
        MASTER GRAPHICS ARTIST
      </div>
      <div style="font-size: 15px; font-weight: bold; color: #ffffff;">
        ${artist.username} <span style="font-size: 11px; color: #9ca3af;">[${artist.torn_id || '4295891'}]</span>
      </div>
      <div style="font-size: 10px; color: ${statusColor}; font-weight: bold; margin-top: 2px;">
        ● ${statusText} &bull; ${studio.turnaroundDays}d SLA
      </div>
    </div>
  </div>

  <!-- Right: Direct Order CTA -->
  <div style="text-align: right;">
    <a href="${profileUrl}" target="_blank" style="display: inline-block; background: #e61919; color: #ffffff; padding: 8px 16px; text-decoration: none; font-weight: bold; font-size: 11px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
      Order Art &rarr;
    </a>
    <div style="font-size: 9px; color: #9ca3af; margin-top: 4px;">
      COVEN Escrow Protected
    </div>
  </div>

</div>`.trim();
}

/**
 * Generate 100% compliant Torn Forum Vouch / Receipt Slip HTML
 * For pasting in threads after delivering an order to build client reputation.
 */
export function generateTornVouchReceiptHtml(tx: ExtendedTransaction): string {
  const sellerName = tx.seller?.username || 'ahmad_kaab';
  const sellerId = tx.seller?.torn_id || '4295891';
  const buyerName = tx.buyer?.username || 'Collector';
  const buyerId = tx.buyer?.torn_id || 'Client';
  const assetName = tx.artwork?.title ? tx.artwork.title.toUpperCase() : 'CUSTOM COMMISSION GRAPHIC';
  const dateStr = tx.verified_at ? new Date(tx.verified_at).toUTCString() : new Date(tx.created_at).toUTCString();

  return `<!-- TORN CITY VOUCH SLIP (600px - RAW HTML) -->
<div style="max-width: 600px; width: 100%; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; background: #0b0e0d; color: #f3f4f6; border: 1px solid #10b981; border-radius: 6px; overflow: hidden; box-sizing: border-box; line-height: 1.4; font-size: 12px;">

  <div style="background: rgba(16,185,129,0.12); padding: 12px 16px; border-bottom: 1px solid rgba(16,185,129,0.3); display: flex; align-items: center; justify-content: space-between;">
    <div>
      <div style="font-size: 10px; color: #10b981; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">
        ✓ COVEN VERIFIED TRANSACTION VOUCH
      </div>
      <div style="font-size: 14px; font-weight: bold; color: #ffffff;">
        ${assetName}
      </div>
    </div>
    <div style="font-size: 11px; background: rgba(16,185,129,0.2); color: #10b981; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
      TORN LOG #4810 VERIFIED
    </div>
  </div>

  <div style="padding: 16px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
      <div>
        <span style="font-size: 10px; color: #9ca3af; text-transform: uppercase;">Artist / Creator:</span><br/>
        <strong style="color: #ffffff;">${sellerName} [${sellerId}]</strong>
      </div>
      <div>
        <span style="font-size: 10px; color: #9ca3af; text-transform: uppercase;">Client / Collector:</span><br/>
        <strong style="color: #ffffff;">${buyerName} [${buyerId}]</strong>
      </div>
      <div>
        <span style="font-size: 10px; color: #9ca3af; text-transform: uppercase;">Settlement Ref:</span><br/>
        <code style="color: #d4af37; font-size: 11px;">#${tx.id.slice(0, 12).toUpperCase()}</code>
      </div>
      <div>
        <span style="font-size: 10px; color: #9ca3af; text-transform: uppercase;">Timestamp:</span><br/>
        <span style="color: #9ca3af; font-size: 11px;">${dateStr}</span>
      </div>
    </div>

    ${tx.artwork?.image_url ? `
      <div style="text-align: center; margin: 12px 0;">
        <img src="${tx.artwork.thumbnail_url || tx.artwork.image_url}" alt="${assetName}" style="max-width: 100%; max-height: 180px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);" />
      </div>
    ` : ''}

    <div style="font-size: 11px; color: #9ca3af; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 4px; text-align: center;">
      Verified on COVEN Art Market &bull; Certificate of Authenticity permanently recorded.
    </div>
  </div>

</div>`.trim();
}

/**
 * Generate 100% compliant Torn Forum Artwork Listing HTML (600px)
 */
export function generateArtworkTornHtml(artwork: Artwork, pageUrl?: string): string {
  const currentUrl = pageUrl || (typeof window !== 'undefined' ? `${window.location.origin}/artwork/${artwork.id}` : `https://coven-art.vercel.app/artwork/${artwork.id}`);
  const artistName = artwork.artist?.username || 'ahmad_kaab';
  const artistTornId = artwork.artist?.torn_id || '4295891';
  const tornProfileUrl = `https://www.torn.com/profiles.php?XID=${artistTornId}`;

  const priceTorn = artwork.listing_type === 'auction'
    ? (artwork.current_bid ?? artwork.price_torn ?? 0)
    : (artwork.price_torn ?? 0);
  const credits = Math.floor(priceTorn / 1000);
  const xanax = (credits / 1000).toFixed(1);
  const priceDisplay = `$${priceTorn.toLocaleString()} (${xanax}x Xanax / ${credits.toLocaleString()} CR)`;

  return `<!-- TORN CITY FORUM ARTWORK CARD (600px - RAW HTML) -->
<div style="max-width: 600px; width: 100%; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; background: #0b0e0d; color: #f3f4f6; border: 1px solid #d4af37; border-radius: 6px; overflow: hidden; box-sizing: border-box; line-height: 1.4; font-size: 12px;">

  <!-- Header -->
  <div style="background: linear-gradient(180deg, #18221c 0%, #0b0e0d 100%); padding: 14px 16px; border-bottom: 1px solid rgba(212,175,55,0.3); text-align: center;">
    <div style="font-size: 9px; font-weight: bold; letter-spacing: 2px; color: #d4af37; text-transform: uppercase; margin-bottom: 4px;">
      COVEN INDEPENDENT ART MARKET &bull; VERIFIED LISTING
    </div>
    <div style="font-size: 18px; font-weight: bold; color: #ffffff; letter-spacing: 0.5px; font-family: 'Arial Black', Arial, sans-serif;">
      ${artwork.title.toUpperCase()}
    </div>
  </div>

  <!-- Image -->
  ${artwork.image_url ? `
    <div style="text-align: center; background: #000000; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
      <img src="${artwork.image_url}" alt="${artwork.title}" style="max-width: 100%; max-height: 380px; display: block; margin: 0 auto; border-radius: 2px;" />
    </div>
  ` : ''}

  <!-- Details Table -->
  <div style="padding: 16px;">
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px;">
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 6px 0; color: #9ca3af; text-transform: uppercase;">Artist:</td>
        <td style="padding: 6px 0; text-align: right; font-weight: bold;">
          <a href="${tornProfileUrl}" target="_blank" style="color: #10b981; text-decoration: none;">${artistName} [${artistTornId}]</a>
        </td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 6px 0; color: #9ca3af; text-transform: uppercase;">Listing Type:</td>
        <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">
          ${artwork.listing_type.toUpperCase()}
        </td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 6px 0; color: #9ca3af; text-transform: uppercase;">Price / Bid:</td>
        <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #d4af37;">
          ${priceDisplay}
        </td>
      </tr>
      ${artwork.tags && artwork.tags.length > 0 ? `
      <tr>
        <td style="padding: 6px 0; color: #9ca3af; text-transform: uppercase;">Categories:</td>
        <td style="padding: 6px 0; text-align: right; color: #9ca3af;">
          ${artwork.tags.map(t => `#${t}`).join(' ')}
        </td>
      </tr>
      ` : ''}
    </table>

    ${artwork.description ? `
      <div style="background: rgba(255,255,255,0.02); border-left: 2px solid #d4af37; padding: 8px 12px; font-size: 11px; color: #d1d5db; margin-bottom: 14px; border-radius: 0 4px 4px 0;">
        ${artwork.description}
      </div>
    ` : ''}

    <!-- CTA Button -->
    <div style="text-align: center; margin-top: 12px;">
      <a href="${currentUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #e61919 0%, #b31010 100%); color: #ffffff; padding: 10px 22px; text-decoration: none; font-weight: bold; font-size: 12px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
        ▶ INSPECT &amp; PURCHASE ON COVEN ◀
      </a>
      <div style="font-size: 9px; color: #6b7280; margin-top: 6px;">
        Secured with Torn API Log Verification &bull; Escrow Protection Guarantee
      </div>
    </div>
  </div>

</div>`.trim();
}

/**
 * Generate 100% compliant Torn Forum Artist Profile HTML (600px)
 */
export function generateArtistTornHtml(artist: Artist, pageUrl?: string): string {
  const currentUrl = pageUrl || (typeof window !== 'undefined' ? `${window.location.origin}/artist/${artist.id}` : `https://coven-art.vercel.app/artist/${artist.id}`);
  const tornProfileUrl = `https://www.torn.com/profiles.php?XID=${artist.torn_id || '4295891'}`;

  return `<!-- TORN CITY FORUM ARTIST DOSSIER (600px - RAW HTML) -->
<div style="max-width: 600px; width: 100%; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; background: #0b0e0d; color: #f3f4f6; border: 1px solid #d4af37; border-radius: 6px; overflow: hidden; box-sizing: border-box; line-height: 1.4; font-size: 12px;">

  <div style="background: linear-gradient(180deg, #18221c 0%, #0b0e0d 100%); padding: 18px 16px; border-bottom: 1px solid rgba(212,175,55,0.3); text-align: center;">
    <div style="font-size: 9px; font-weight: bold; letter-spacing: 2px; color: #d4af37; text-transform: uppercase; margin-bottom: 6px;">
      COVEN VERIFIED MASTER ATELIER
    </div>
    <div style="font-size: 20px; font-weight: bold; color: #ffffff; font-family: 'Arial Black', Arial, sans-serif;">
      ${artist.username.toUpperCase()} <span style="font-size: 13px; color: #9ca3af;">[${artist.torn_id || '4295891'}]</span>
    </div>
    <div style="font-size: 11px; color: #10b981; font-weight: bold; margin-top: 4px;">
      ★ ${(artist.average_rating ?? 5.0).toFixed(1)} Rating &bull; ${artist.total_sales ?? 0} Masterworks Sold &bull; ${artist.tier?.toUpperCase() || 'SOVEREIGN'} TIER
    </div>
  </div>

  <div style="padding: 16px;">
    ${artist.bio ? `
      <div style="background: rgba(255,255,255,0.02); border-left: 2px solid #d4af37; padding: 10px 14px; font-size: 12px; color: #d1d5db; margin-bottom: 14px; border-radius: 0 4px 4px 0;">
        &ldquo;${artist.bio}&rdquo;
      </div>
    ` : ''}

    <div style="text-align: center; margin-top: 14px;">
      <a href="${currentUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #e61919 0%, #b31010 100%); color: #ffffff; padding: 10px 22px; text-decoration: none; font-weight: bold; font-size: 12px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
        ▶ VIEW PORTFOLIO &amp; COMMISSION ON COVEN ◀
      </a>
      <div style="font-size: 9px; color: #6b7280; margin-top: 6px;">
        Torn Profile: <a href="${tornProfileUrl}" target="_blank" style="color: #9ca3af; text-decoration: underline;">View In-Game Profile</a>
      </div>
    </div>
  </div>

</div>`.trim();
}


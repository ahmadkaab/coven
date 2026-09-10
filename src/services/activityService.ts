/* ================================================================
   COVEN — Activity Feed Service
   Generates a global activity feed of recent marketplace events.
   ================================================================ */

import type { ActivityEvent, ActivityEventType } from '../types/notification';

/* ── RANDOM HELPERS ────────────────────────────────────────── */
const ACTORS = [
  { username: 'DarkViper', avatar_url: 'https://picsum.photos/seed/dv/64/64' },
  { username: 'xShadow', avatar_url: 'https://picsum.photos/seed/xs/64/64' },
  { username: 'NeonKat', avatar_url: 'https://picsum.photos/seed/nk/64/64' },
  { username: 'PixelWitch', avatar_url: 'https://picsum.photos/seed/pw/64/64' },
  { username: 'Crimson_FX', avatar_url: 'https://picsum.photos/seed/cf/64/64' },
  { username: 'GlitchArtist', avatar_url: 'https://picsum.photos/seed/ga/64/64' },
  { username: 'VoidRunner', avatar_url: 'https://picsum.photos/seed/vr/64/64' },
  { username: 'HexMaster', avatar_url: 'https://picsum.photos/seed/hm/64/64' },
  { username: 'InkWizard', avatar_url: 'https://picsum.photos/seed/iw/64/64' },
  { username: 'Spectre_GFX', avatar_url: 'https://picsum.photos/seed/sg/64/64' },
];

const ARTWORKS = [
  'Neon Reaper', 'Crimson Tide', 'Shadow Protocol', 'Digital Vortex',
  'Pixel Warfare', 'Void Eclipse', 'Chrome Skull', 'Faction Fury',
  'Night Ops Banner', 'Toxic Haze', 'Neural Link', 'Cyber Samurai',
  'Ghost Division', 'Retro Pulse', 'Obsidian Crown', 'Solar Flare',
];

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rndPrice(): string { return `$${(5000 + Math.floor(Math.random() * 95000)).toLocaleString()}`; }

let _uid = 0;
function makeId(): string {
  return `act_${Date.now()}_${++_uid}_${Math.random().toString(36).slice(2, 5)}`;
}

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60_000).toISOString();
}

/* ── EVENT GENERATORS ──────────────────────────────────────── */
interface EventTemplate {
  type: ActivityEventType;
  build: () => { action: string; target: string; targetLink: string };
  weight: number; // relative frequency
}

const TEMPLATES: EventTemplate[] = [
  {
    type: 'new_listing',
    weight: 3,
    build: () => {
      const art = rnd(ARTWORKS);
      return {
        action: `listed "${art}" for ${rndPrice()}`,
        target: art,
        targetLink: '/browse',
      };
    },
  },
  {
    type: 'bid_placed',
    weight: 5,
    build: () => {
      const art = rnd(ARTWORKS);
      return {
        action: `placed a ${rndPrice()} bid on "${art}"`,
        target: art,
        targetLink: '/auctions',
      };
    },
  },
  {
    type: 'auction_won',
    weight: 1,
    build: () => {
      const art = rnd(ARTWORKS);
      return {
        action: `won the auction for "${art}" at ${rndPrice()}`,
        target: art,
        targetLink: '/browse',
      };
    },
  },
  {
    type: 'sale_completed',
    weight: 2,
    build: () => {
      const art = rnd(ARTWORKS);
      return {
        action: `purchased "${art}" for ${rndPrice()}`,
        target: art,
        targetLink: '/browse',
      };
    },
  },
  {
    type: 'review_posted',
    weight: 2,
    build: () => {
      const target = rnd(ACTORS).username;
      const stars = 4 + Math.round(Math.random());
      return {
        action: `left a ${'★'.repeat(stars)}${'☆'.repeat(5 - stars)} review for ${target}`,
        target,
        targetLink: '/artists',
      };
    },
  },
  {
    type: 'artist_joined',
    weight: 1,
    build: () => ({
      action: 'joined COVEN as a verified artist',
      target: '',
      targetLink: '/artists',
    }),
  },
  {
    type: 'commission_opened',
    weight: 2,
    build: () => {
      const target = rnd(ACTORS).username;
      return {
        action: `opened a commission with ${target}`,
        target,
        targetLink: '/commissions',
      };
    },
  },
];

/* Weighted random template selection */
function pickTemplate(): EventTemplate {
  const totalWeight = TEMPLATES.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * totalWeight;
  for (const t of TEMPLATES) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return TEMPLATES[0];
}

/* ── PUBLIC API ────────────────────────────────────────────── */

/** Generate a feed of recent activity events */
export function getActivityFeed(limit: number = 15): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const usedActors = new Set<string>();

  for (let i = 0; i < limit; i++) {
    const template = pickTemplate();
    const { action, target, targetLink } = template.build();

    // Try to avoid consecutive same-actor events
    let actor = rnd(ACTORS);
    let attempts = 0;
    while (usedActors.has(actor.username) && attempts < 5) {
      actor = rnd(ACTORS);
      attempts++;
    }
    usedActors.add(actor.username);
    if (usedActors.size > 4) usedActors.clear();

    events.push({
      id: makeId(),
      type: template.type,
      actor,
      action,
      target,
      targetLink,
      // Spread events across last ~60 minutes
      timestamp: minutesAgo(i * 4 + Math.floor(Math.random() * 3)),
    });
  }

  return events.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

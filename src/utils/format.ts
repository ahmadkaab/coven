/* ── Number formatting ───────────────────────────────────────── */
export function formatTornCash(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000)     return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/* ── Time formatting ─────────────────────────────────────────── */
export function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const sec  = Math.floor(diff / 1000);
  if (sec < 60)        return 'just now';
  const min  = Math.floor(sec / 60);
  if (min < 60)        return `${min}m ago`;
  const hrs  = Math.floor(min / 60);
  if (hrs < 24)        return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)       return `${days}d ago`;
  const mos  = Math.floor(days / 30);
  if (mos < 12)        return `${mos}mo ago`;
  return `${Math.floor(mos / 12)}y ago`;
}

/* ── Tier label ──────────────────────────────────────────────── */
export function tierLabel(tier?: string): string {
  const map: Record<string, string> = {
    rising:  'Rising',
    trusted: 'Trusted',
    master:  'Master',
    legend:  'Legend',
  };
  return tier ? (map[tier] ?? tier) : '—';
}

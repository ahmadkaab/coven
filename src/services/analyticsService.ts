/* ================================================================
   COVEN — Analytics Service
   Revenue, performance, and audience metrics for verified artists
   ================================================================ */
import { supabase } from '../config/supabase';

/* ── Types ─────────────────────────────────────────────────────── */
export interface RevenueStats {
  totalRevenue: number;
  totalSales: number;
  avgSalePrice: number;
  monthlyRevenue: MonthlyRevenue[];
  revenueGrowth: number; // month-over-month %
}

export interface MonthlyRevenue {
  month: string;   // e.g. "2026-08"
  label: string;   // e.g. "Aug"
  revenue: number;
  count: number;
}

export interface ArtworkMetric {
  id: string;
  title: string;
  imageUrl: string;
  listingType: string;
  views: number;
  bids: number;
  revenue: number;
  conversionRate: number; // bids/views %
  status: string;
  createdAt: string;
}

export interface AudienceData {
  totalBuyers: number;
  repeatBuyers: number;
  repeatRate: number;       // %
  topBuyers: BuyerSummary[];
  activityByDay: number[];  // 7 values, Mon–Sun
}

export interface BuyerSummary {
  id: string;
  maskedName: string;  // anonymized
  purchases: number;
  totalSpent: number;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ── Revenue Stats ─────────────────────────────────────────────── */
export async function getRevenueStats(artistId: string): Promise<RevenueStats> {
  // Fetch all verified transactions where this artist is the seller
  // We join via artworks to find artist's sales
  const { data: txs } = await supabase
    .from('transactions')
    .select(`
      id, amount, status, created_at,
      artworks!inner( artist_id )
    `)
    .eq('artworks.artist_id', artistId)
    .eq('status', 'verified');

  const transactions = txs ?? [];
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalSales = transactions.length;
  const avgSalePrice = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;

  // Group by month (last 6 months)
  const now = new Date();
  const monthMap = new Map<string, { revenue: number; count: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(key, { revenue: 0, count: 0 });
  }

  for (const tx of transactions) {
    const d = new Date(tx.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (monthMap.has(key)) {
      const entry = monthMap.get(key)!;
      entry.revenue += tx.amount || 0;
      entry.count += 1;
    }
  }

  const monthlyRevenue: MonthlyRevenue[] = [];
  for (const [month, data] of monthMap) {
    const monthIndex = parseInt(month.split('-')[1], 10) - 1;
    monthlyRevenue.push({
      month,
      label: MONTH_LABELS[monthIndex],
      revenue: data.revenue,
      count: data.count,
    });
  }

  // Month-over-month growth
  let revenueGrowth = 0;
  if (monthlyRevenue.length >= 2) {
    const curr = monthlyRevenue[monthlyRevenue.length - 1].revenue;
    const prev = monthlyRevenue[monthlyRevenue.length - 2].revenue;
    if (prev > 0) {
      revenueGrowth = Math.round(((curr - prev) / prev) * 100);
    } else if (curr > 0) {
      revenueGrowth = 100;
    }
  }

  return { totalRevenue, totalSales, avgSalePrice, monthlyRevenue, revenueGrowth };
}

/* ── Artwork Performance ───────────────────────────────────────── */
export async function getArtworkPerformance(artistId: string): Promise<ArtworkMetric[]> {
  const { data: artworks } = await supabase
    .from('artworks')
    .select('id, title, image_url, listing_type, view_count, bid_count, status, created_at, price_torn, current_bid')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!artworks) return [];

  // For each artwork, calculate revenue from verified transactions
  const artworkIds = artworks.map(a => a.id);
  const { data: txData } = await supabase
    .from('transactions')
    .select('artwork_id, amount')
    .in('artwork_id', artworkIds)
    .eq('status', 'verified');

  const revenueMap = new Map<string, number>();
  for (const tx of txData ?? []) {
    revenueMap.set(tx.artwork_id, (revenueMap.get(tx.artwork_id) || 0) + tx.amount);
  }

  return artworks.map(a => {
    const views = a.view_count || 0;
    const bids = a.bid_count || 0;
    const revenue = revenueMap.get(a.id) || 0;
    return {
      id: a.id,
      title: a.title,
      imageUrl: a.image_url || '',
      listingType: a.listing_type,
      views,
      bids,
      revenue,
      conversionRate: views > 0 ? Math.round((bids / views) * 1000) / 10 : 0,
      status: a.status,
      createdAt: a.created_at,
    };
  });
}

/* ── Audience Insights ─────────────────────────────────────────── */
export async function getAudienceInsights(artistId: string): Promise<AudienceData> {
  // Get all verified purchases of this artist's work
  const { data: txs } = await supabase
    .from('transactions')
    .select(`
      buyer_user_id, amount, created_at,
      artworks!inner( artist_id )
    `)
    .eq('artworks.artist_id', artistId)
    .eq('status', 'verified');

  const transactions = txs ?? [];

  // Count by buyer
  const buyerMap = new Map<string, { purchases: number; totalSpent: number }>();
  for (const tx of transactions) {
    const bid = tx.buyer_user_id;
    if (!buyerMap.has(bid)) {
      buyerMap.set(bid, { purchases: 0, totalSpent: 0 });
    }
    const entry = buyerMap.get(bid)!;
    entry.purchases += 1;
    entry.totalSpent += tx.amount || 0;
  }

  const totalBuyers = buyerMap.size;
  const repeatBuyers = [...buyerMap.values()].filter(b => b.purchases > 1).length;
  const repeatRate = totalBuyers > 0 ? Math.round((repeatBuyers / totalBuyers) * 100) : 0;

  // Top buyers (sorted by total spend, anonymized)
  const topBuyers: BuyerSummary[] = [...buyerMap.entries()]
    .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
    .slice(0, 5)
    .map(([id, data], i) => ({
      id,
      maskedName: `Buyer #${id.slice(0, 6).toUpperCase()}`,
      purchases: data.purchases,
      totalSpent: data.totalSpent,
    }));

  // Activity by day of week
  const activityByDay = new Array(7).fill(0);
  for (const tx of transactions) {
    const day = new Date(tx.created_at).getDay(); // 0=Sun
    const idx = day === 0 ? 6 : day - 1; // Mon=0
    activityByDay[idx] += 1;
  }

  return { totalBuyers, repeatBuyers, repeatRate, topBuyers, activityByDay };
}

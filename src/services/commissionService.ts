/* ================================================================
   COVEN — Commission Service
   ================================================================ */
import { supabase } from '../config/supabase';
import type { Commission } from '../types';

const COMMISSION_SELECT = `
  *,
  artist:artists (id, username, avatar_url, tier, is_verified, average_rating)
`;

/** Get commissions for an artist */
export async function getArtistCommissions(artistId: string): Promise<Commission[]> {
  const { data, error } = await supabase
    .from('commissions')
    .select(COMMISSION_SELECT)
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Commission[];
}

/** Get commissions placed by a buyer */
export async function getBuyerCommissions(buyerUserId: string): Promise<Commission[]> {
  const { data, error } = await supabase
    .from('commissions')
    .select(COMMISSION_SELECT)
    .eq('buyer_user_id', buyerUserId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Commission[];
}

/** Create a commission request */
export async function createCommission(payload: {
  artistId: string;
  buyerUserId: string;
  title: string;
  description: string;
  budgetTorn?: number;
  deadline?: string;
}): Promise<Commission> {
  const { data, error } = await supabase
    .from('commissions')
    .insert({
      artist_id:     payload.artistId,
      buyer_user_id: payload.buyerUserId,
      title:         payload.title,
      description:   payload.description,
      budget_torn:   payload.budgetTorn,
      deadline:      payload.deadline,
      status:        'open',
    })
    .select(COMMISSION_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data as Commission;
}

/** Update commission status */
export async function updateCommissionStatus(
  id: string,
  status: Commission['status'],
  deliverableUrl?: string
): Promise<void> {
  const { error } = await supabase
    .from('commissions')
    .update({
      status,
      ...(deliverableUrl ? { deliverable_url: deliverableUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

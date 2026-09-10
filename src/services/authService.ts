/* ================================================================
   COVEN — Auth Service (Torn API → Supabase user upsert)
   ================================================================ */
import { supabase } from '../config/supabase';
import type { TornUser } from '../types';

const TORN_API_BASE = 'https://api.torn.com';

export interface TornApiError {
  code: number;
  error: string;
}

/** Fetch Torn user profile using their API key */
export async function fetchTornProfile(apiKey: string): Promise<TornUser> {
  const res = await fetch(
    `${TORN_API_BASE}/user/?selections=profile,basic&key=${apiKey}`
  );
  if (!res.ok) throw new Error('Network error — could not reach Torn servers.');

  const data = await res.json();
  if (data.error) throw new Error(getTornErrorMessage(data.error.code));

  return {
    player_id:     data.player_id,
    name:          data.name,
    level:         data.level,
    gender:        data.gender,
    rank:          data.rank,
    profile_image: data.profile_image ?? '',
    donator:       data.donator === 1,
    faction:       data.faction,
    last_action:   data.last_action,
  };
}

/** Upsert user in Supabase after successful Torn auth */
export async function upsertUser(torn: TornUser): Promise<{ id: string; is_artist: boolean }> {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      torn_id:    String(torn.player_id),
      username:   torn.name,
      level:      torn.level,
      avatar_url: torn.profile_image,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'torn_id' })
    .select('id, is_artist')
    .single();

  if (error) throw new Error(error.message);
  return data as { id: string; is_artist: boolean };
}

/** Check if a Torn ID already has an artist profile */
export async function getArtistByTornId(tornId: string): Promise<string | null> {
  const { data } = await supabase
    .from('artists')
    .select('id')
    .eq('torn_id', tornId)
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Verify a Torn payment by checking the seller's transaction log.
 * Uses log category 4810 (received money via send money).
 */
export async function verifyTornPayment(opts: {
  sellerApiKey: string;
  buyerTornId: number;
  amountTcash: number;
  windowHours?: number;
}): Promise<{ verified: boolean; logId?: string }> {
  const { sellerApiKey, buyerTornId, amountTcash, windowHours = 24 } = opts;

  try {
    const res = await fetch(
      `${TORN_API_BASE}/user/?selections=log&key=${sellerApiKey}&log=4810`
    );
    const data = await res.json();
    if (data.error) return { verified: false };

    const cutoff = Date.now() / 1000 - windowHours * 3600;
    const logs = Object.entries(data.log ?? {}) as [string, any][];

    for (const [logId, entry] of logs) {
      const isRecent = entry.timestamp > cutoff;
      const isFromBuyer = String(entry.params?.initiator) === String(buyerTornId);
      const amountMatch = Math.abs((entry.data?.money ?? 0) - amountTcash) < 1000;

      if (isRecent && isFromBuyer && amountMatch) {
        return { verified: true, logId };
      }
    }

    return { verified: false };
  } catch {
    return { verified: false };
  }
}

/** Mark a transaction as verified in Supabase */
export async function verifyTransaction(transactionId: string, tornLogId: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .update({
      status:      'verified',
      torn_log_id: tornLogId,
      verified_at: new Date().toISOString(),
    })
    .eq('id', transactionId);

  if (error) throw new Error(error.message);
}

/** Create a pending transaction record */
export async function createTransaction(payload: {
  artworkId: string;
  buyerUserId: string;
  sellerUserId: string;
  amount: number;
}): Promise<string> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      artwork_id:     payload.artworkId,
      buyer_user_id:  payload.buyerUserId,
      seller_user_id: payload.sellerUserId,
      amount:         payload.amount,
      status:         'pending',
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

function getTornErrorMessage(code: number): string {
  const messages: Record<number, string> = {
    0:  'Unknown error — try again',
    1:  'API key is empty',
    2:  'Incorrect API key',
    3:  'Wrong type',
    4:  'Wrong fields',
    5:  'Too many requests — wait a moment',
    6:  'Incorrect ID',
    7:  'Incorrect ID-entity relation',
    8:  'IP block',
    9:  'API disabled',
    10: 'Key owner is federally jailed',
    11: 'Key change error',
    12: 'Key read error',
    13: 'Key temporarily disabled',
    14: 'Too many records',
    15: 'Backend error — try again',
    16: 'Feature disabled',
    17: 'User not found',
    18: 'Category not found',
    19: 'User API access is disabled',
    20: 'Wrong user details',
  };
  return messages[code] ?? `Torn API error #${code}`;
}

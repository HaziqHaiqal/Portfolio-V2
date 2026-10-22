import { unstable_cache } from 'next/cache';
import type { NullableWritable, PromoCode } from '@lib/supabase';
import type { AppliedPromo, DiscountType } from '@lib/promo';
import type { DB } from './types';

export const FEATURED_PROMOS_TAG = 'featured-promos';

export type FeaturedDeal = AppliedPromo & { title: string };

interface FeaturedRow {
  code: string;
  title: string | null;
  discount_type: DiscountType;
  discount_value: number | string;
  perks: string[] | null;
  eligible_targets: string[] | null;
  expires_at: string | null;
}

/** Codes switched to "Show on site" that are active, started and not used up. */
export const getCachedFeaturedDeals = unstable_cache(
  async (): Promise<FeaturedDeal[]> => {
    const { createPublicSupabase } = await import('@lib/supabase/public');
    const { data, error } = await createPublicSupabase().rpc(
      'featured_promo_codes'
    );
    if (error) throw error;
    return ((data as FeaturedRow[] | null) ?? []).map((row) => ({
      code: row.code,
      title: row.title ?? '',
      discountType: row.discount_type,
      discountValue: Number(row.discount_value),
      perks: row.perks ?? [],
      eligibleTargets: row.eligible_targets ?? [],
      expiresAt: row.expires_at,
    }));
  },
  ['featured-promos'],
  // Short revalidation so expired deals drop off on their own.
  { tags: [FEATURED_PROMOS_TAG], revalidate: 300 }
);

export async function upsertPromoCode(
  db: DB,
  row: NullableWritable<PromoCode> & { id?: string }
): Promise<PromoCode> {
  const { id, ...patch } = row;
  const payload = { ...patch, updated_at: new Date().toISOString() };

  const { data, error } = id
    ? await db
        .from('promo_codes')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single()
    : await db.from('promo_codes').insert(payload).select('*').single();

  if (error) throw error;
  return data as PromoCode;
}

export async function setPromoCodeUses(
  db: DB,
  id: string,
  uses: number
): Promise<PromoCode> {
  const { data, error } = await db
    .from('promo_codes')
    .update({ uses_count: uses, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as PromoCode;
}

export async function deletePromoCode(db: DB, id: string): Promise<void> {
  const { error } = await db.from('promo_codes').delete().eq('id', id);
  if (error) throw error;
}

import type { NullableWritable, PromoCode } from '@lib/supabase';
import type { DB } from './types';

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

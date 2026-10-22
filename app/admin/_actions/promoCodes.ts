'use server';

import { revalidatePath } from 'next/cache';
import { upsertPromoCode, setPromoCodeUses, deletePromoCode } from '@lib/data';
import type { NullableWritable, PromoCode } from '@lib/supabase';
import { normalizePromoCode, PROMO_CODE_PATTERN } from '@lib/promo';
import { requireAdminClient } from './auth';

export async function upsertPromoCodeAction(
  row: NullableWritable<PromoCode> & { id?: string }
) {
  const db = await requireAdminClient();
  const code = normalizePromoCode(row.code ?? '');
  if (!PROMO_CODE_PATTERN.test(code)) {
    throw new Error(
      'Codes are 3–32 characters: letters, numbers, dashes or underscores.'
    );
  }
  const result = await upsertPromoCode(db, { ...row, code });
  revalidatePath('/admin/promo-codes');
  return result;
}

export async function setPromoCodeUsesAction(id: string, uses: number) {
  const db = await requireAdminClient();
  const result = await setPromoCodeUses(db, id, Math.max(0, Math.floor(uses)));
  revalidatePath('/admin/promo-codes');
  return result;
}

export async function deletePromoCodeAction(id: string) {
  const db = await requireAdminClient();
  await deletePromoCode(db, id);
  revalidatePath('/admin/promo-codes');
}

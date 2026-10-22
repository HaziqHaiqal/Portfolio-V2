'use server';

import { createPublicSupabase } from '@lib/supabase/public';
import {
  normalizePromoCode,
  PROMO_CODE_PATTERN,
  type AppliedPromo,
  type DiscountType,
} from '@lib/promo';

interface PromoRow {
  code: string;
  discount_type: DiscountType;
  discount_value: number | string;
  perks: string[] | null;
  eligible_targets: string[] | null;
  expires_at: string | null;
}

/** Returns null for unknown, inactive, expired or used-up codes. */
export async function applyPromoCodeAction(
  input: string
): Promise<AppliedPromo | null> {
  const code = normalizePromoCode(String(input ?? ''));
  if (!PROMO_CODE_PATTERN.test(code)) return null;

  const { data, error } = await createPublicSupabase().rpc('apply_promo_code', {
    p_code: code,
  });
  if (error) throw new Error('Could not check the promo code.');

  const row = (data as PromoRow[] | null)?.[0];
  if (!row) return null;

  return {
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    perks: row.perks ?? [],
    eligibleTargets: row.eligible_targets ?? [],
    expiresAt: row.expires_at,
  };
}

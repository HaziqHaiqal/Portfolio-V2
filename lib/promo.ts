import { formatRM } from '@lib/format';

export const PROMO_CODE_PATTERN = /^[A-Z0-9_-]{3,32}$/;

export type DiscountType = 'none' | 'fixed' | 'percent';

export interface AppliedPromo {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  perks: string[];
  eligibleTargets: string[];
  expiresAt: string | null;
}

export function normalizePromoCode(input: string): string {
  return input.trim().toUpperCase();
}

/** An empty target list means the code applies to every service. */
export function promoAppliesTo(
  promo: Pick<AppliedPromo, 'eligibleTargets'>,
  targets: string[]
): boolean {
  if (promo.eligibleTargets.length === 0) return true;
  return targets.some((target) => promo.eligibleTargets.includes(target));
}

export function discountLabel(
  type: DiscountType,
  value: number
): string | null {
  if (value <= 0) return null;
  if (type === 'fixed') return `${formatRM(value)} off`;
  if (type === 'percent') return `${value}% off`;
  return null;
}

export function discountedPrice(amount: number, promo: AppliedPromo): number {
  const { discountType, discountValue } = promo;
  if (discountType === 'fixed') {
    return Math.max(0, Math.round(amount - discountValue));
  }
  if (discountType === 'percent') {
    return Math.max(0, Math.round(amount * (1 - discountValue / 100)));
  }
  return amount;
}

export function rewardSummary(
  promo: Pick<AppliedPromo, 'discountType' | 'discountValue' | 'perks'>
): string {
  return [
    discountLabel(promo.discountType, promo.discountValue),
    ...promo.perks,
  ]
    .filter(Boolean)
    .join(' + ');
}

export function withPromoMessage(href: string, promo: AppliedPromo): string {
  const url = new URL(href);
  const message = url.searchParams.get('text') ?? '';
  url.searchParams.set(
    'text',
    `${message}\n\nPromo code: ${promo.code} (${rewardSummary(promo)})`.trim()
  );
  return url.toString();
}

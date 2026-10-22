'use client';

import type { ComponentProps } from 'react';
import { Gift } from 'lucide-react';
import { formatRM } from '@lib/format';
import {
  discountedPrice,
  discountLabel,
  promoAppliesTo,
  rewardSummary,
  withPromoMessage,
} from '@lib/promo';
import { usePromo } from './PromoProvider';

function useEligiblePromo(targets: string[]) {
  const { promo } = usePromo();
  return promo && promoAppliesTo(promo, targets) ? promo : null;
}

export function PromoPrice({
  target,
  price,
  salePrice,
}: {
  target: string | string[];
  price: number | string;
  /** Price after a running sale; an applied code comes off this. */
  salePrice?: number;
}) {
  const promo = useEligiblePromo(Array.isArray(target) ? target : [target]);
  if (typeof price === 'string') return <>{price}</>;

  const base = salePrice ?? price;
  const final = promo ? discountedPrice(base, promo) : base;
  if (final === price) return <>{formatRM(price)}</>;

  return (
    <>
      <s className="mr-2 text-lg font-normal text-gray-400 decoration-1 dark:text-gray-500">
        {formatRM(price)}
      </s>
      <span className="text-emerald-600 dark:text-emerald-400">
        {formatRM(final)}
      </span>
    </>
  );
}

export function PromoPerks({
  target,
  quoted,
}: {
  target: string | string[];
  quoted: boolean;
}) {
  const promo = useEligiblePromo(Array.isArray(target) ? target : [target]);
  if (!promo) return null;

  const discount = discountLabel(promo.discountType, promo.discountValue);
  const items = [
    ...(quoted && discount ? [`${discount} your quote`] : []),
    ...promo.perks,
  ];

  return items.map((item) => (
    <li
      key={item}
      className="flex items-start gap-2.5 text-sm font-medium leading-relaxed text-emerald-700 dark:text-emerald-300"
    >
      <Gift size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
      {item}
      <span className="sr-only"> (with promo code {promo.code})</span>
    </li>
  ));
}

export function PromoLink({
  href,
  targets,
  ...props
}: ComponentProps<'a'> & { href: string; targets: string[] }) {
  const promo = useEligiblePromo(targets);
  return <a {...props} href={promo ? withPromoMessage(href, promo) : href} />;
}

export function PromoNote({
  targets,
}: {
  targets: { id: string; name: string }[];
}) {
  const promo = useEligiblePromo(targets.map((target) => target.id));
  if (!promo) return null;

  const eligible = targets.filter((target) =>
    promoAppliesTo(promo, [target.id])
  );
  const scope =
    targets.length > 1 && eligible.length < targets.length
      ? ` on ${eligible.map((target) => target.name).join(' & ')}`
      : '';

  return (
    <span className="inline-flex max-w-xs items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300 md:text-right">
      <Gift size={13} aria-hidden="true" className="shrink-0" />
      {promo.code}: {rewardSummary(promo)}
      {scope}
    </span>
  );
}

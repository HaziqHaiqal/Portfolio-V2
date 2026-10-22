'use client';

import { useState } from 'react';
import { Loader2, Tag } from 'lucide-react';
import type { FeaturedDeal } from '@lib/data';
import { rewardSummary } from '@lib/promo';
import { usePromo } from './PromoProvider';

/** Offers a running deal next to the promo field, applied in one tap. */
export default function DealSuggestion({
  deal,
}: {
  deal: FeaturedDeal | null;
}) {
  const { promo, apply } = usePromo();
  const [applying, setApplying] = useState(false);
  if (!deal || promo?.code === deal.code) return null;

  return (
    <p className="flex items-center gap-2.5 rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-900 dark:text-rose-100">
      <Tag size={15} aria-hidden="true" className="shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="font-semibold">Deal:</span> {rewardSummary(deal)} with{' '}
        <span className="font-mono font-semibold tracking-wide">
          {deal.code}
        </span>
      </span>
      <button
        type="button"
        onClick={async () => {
          setApplying(true);
          await apply(deal.code);
          setApplying(false);
        }}
        disabled={applying}
        className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-1 font-semibold text-rose-700 transition-colors hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 disabled:text-rose-400 dark:text-rose-300"
      >
        {applying && (
          <Loader2 size={14} aria-hidden="true" className="animate-spin" />
        )}
        Apply
      </button>
    </p>
  );
}

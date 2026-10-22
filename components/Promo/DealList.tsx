'use client';

import { useState, useSyncExternalStore } from 'react';
import { ArrowUp, Check, Loader2, Tag } from 'lucide-react';
import {
  MOBILE_APP_PROMO_TARGET,
  TEMPLATE_PROMO_TARGET,
  WEBSITE_PROMO_TARGET,
} from '@constants/services';
import type { FeaturedDeal } from '@lib/data';
import { formatSiteLastDay } from '@lib/format';
import { rewardSummary } from '@lib/promo';
import { usePromo } from './PromoProvider';

/** Element the "View prices" link scrolls back to. */
export const SERVICES_ANCHOR_ID = 'services-pricing';

const TARGET_NAMES: Record<string, string> = {
  [TEMPLATE_PROMO_TARGET.id]: 'Templates',
  [WEBSITE_PROMO_TARGET.id]: 'Website packages',
  [MOBILE_APP_PROMO_TARGET.id]: 'Mobile apps',
};

function appliesTo(targets: string[]) {
  if (!targets.length) return 'All services';
  return targets
    .map((target) => TARGET_NAMES[target])
    .filter(Boolean)
    .map((name, index) => (index ? name.toLowerCase() : name))
    .join(' and ');
}

const TICK_MS = 1000;
const COUNTDOWN_UNDER_MS = 2 * 24 * 60 * 60 * 1000;

const subscribeTick = (onTick: () => void) => {
  const timer = setInterval(onTick, TICK_MS);
  return () => clearInterval(timer);
};

/** Current time to the second on the client; null while server rendering. */
function useNow() {
  return useSyncExternalStore(
    subscribeTick,
    () => Math.floor(Date.now() / TICK_MS) * TICK_MS,
    () => null
  );
}

/** A countdown in the last two days, so short deals feel urgent; a date otherwise. */
function endsLabel(expiresAt: string, now: number | null) {
  if (now !== null) {
    const left = new Date(expiresAt).getTime() - now;
    if (left <= 0) return { text: 'Ended', urgent: true };
    if (left < COUNTDOWN_UNDER_MS) {
      const total = Math.ceil(left / 1000);
      const pad = (value: number) => String(value).padStart(2, '0');
      const days = Math.floor(total / 86_400);
      const hours = Math.floor((total % 86_400) / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = total % 60;
      const parts = [
        ...(days ? [`${days}d`] : []),
        ...(days || hours ? [`${days ? pad(hours) : hours}h`] : []),
        `${pad(minutes)}m`,
        `${pad(seconds)}s`,
      ];
      return { text: `Ends in ${parts.join(' ')}`, urgent: true };
    }
  }
  return { text: `Ends ${formatSiteLastDay(expiresAt)}`, urgent: false };
}

const LINK =
  'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-green-700 transition-colors hover:text-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 dark:text-green-400 dark:hover:text-green-300';

/** Deals switched to "Show on site", each applied in one tap. */
export default function DealList({ deals }: { deals: FeaturedDeal[] }) {
  const { promo, apply } = usePromo();
  const [applying, setApplying] = useState<string | null>(null);
  const now = useNow();

  return (
    <ul className="divide-y divide-gray-200 rounded-3xl border border-gray-200 bg-white/70 px-6 backdrop-blur-sm dark:divide-gray-700/70 dark:border-gray-700 dark:bg-gray-800/70 sm:px-8">
      {deals.map((deal) => {
        const applied = promo?.code === deal.code;
        const offer = [rewardSummary(deal), appliesTo(deal.eligibleTargets)]
          .filter(Boolean)
          .join(' · ');
        return (
          <li key={deal.code} className="flex items-center gap-4 py-5">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400"
            >
              <Tag size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {deal.title || offer}
              </p>
              {deal.title && (
                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                  {offer}
                </p>
              )}
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="sr-only">Code </span>
                <span className="rounded-md border border-dashed border-gray-300 px-1.5 py-px font-mono text-xs font-semibold tracking-wide text-gray-900 dark:border-gray-600 dark:text-gray-100">
                  {deal.code}
                </span>
                {deal.expiresAt &&
                  (() => {
                    const ends = endsLabel(deal.expiresAt, now);
                    return (
                      <span
                        className={
                          ends.urgent
                            ? 'font-medium tabular-nums text-amber-700 dark:text-amber-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }
                      >
                        {ends.text}
                      </span>
                    );
                  })()}
              </p>
            </div>
            {applied ? (
              <div className="flex shrink-0 flex-col items-end sm:flex-row sm:items-center sm:gap-3">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 dark:text-green-400">
                  <Check size={15} aria-hidden="true" />
                  Applied
                </span>
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(SERVICES_ANCHOR_ID)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  className={`${LINK} min-h-9 font-medium text-gray-600 dark:text-gray-400`}
                >
                  View prices
                  <ArrowUp size={14} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  setApplying(deal.code);
                  await apply(deal.code);
                  setApplying(null);
                }}
                disabled={applying !== null}
                aria-label={`Apply code ${deal.code}`}
                className={`${LINK} disabled:cursor-default disabled:text-gray-400`}
              >
                {applying === deal.code && (
                  <Loader2
                    size={14}
                    aria-hidden="true"
                    className="animate-spin"
                  />
                )}
                Apply
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

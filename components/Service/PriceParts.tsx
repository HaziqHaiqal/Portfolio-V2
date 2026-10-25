'use client';

import type { ReactNode } from 'react';
import { track } from '@vercel/analytics';
import { SiWhatsapp } from 'react-icons/si';
import {
  type AddOn,
  type Bundle,
  CARE,
  CARE_PLAN,
  CARE_YEARLY_SAVING,
  carePrice,
  type CareTier,
  careYearly,
  type PricingTab,
} from '@constants/services';
import { formatRM } from '@lib/format';
import { discountedPrice, promoAppliesTo } from '@lib/promo';
import { usePromo } from '@components/Promo/PromoProvider';
import { PromoLink } from '@components/Promo/PromoParts';
import { useServicePick } from './servicePick';

const BUTTON =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4';
export const SOLID = `${BUTTON} bg-green-600 text-white shadow-lg shadow-green-600/20 hover:-translate-y-0.5 hover:bg-green-700 focus-visible:ring-green-500/30`;
export const OUTLINE = `${BUTTON} border border-gray-300 text-gray-800 hover:border-green-500/60 hover:text-green-700 focus-visible:ring-green-500/20 dark:border-gray-600 dark:text-gray-200 dark:hover:text-green-400`;

export const trackWhatsApp = (data: Record<string, string | number | null>) =>
  track('WhatsApp click', data);

export const careChoice = (tier: CareTier) =>
  `${carePrice(tier, 'yearly')} (save ${CARE_YEARLY_SAVING}%) or ${carePrice(tier)}`;

const promoTargetsOf = (tab: PricingTab, bundle: Bundle) =>
  tab.promoTarget && !bundle.from ? [tab.promoTarget] : [];

function useBuildPrice(tab: PricingTab, bundle: Bundle) {
  const { promo } = usePromo();
  const targets = promoTargetsOf(tab, bundle);
  return promo && targets.length && promoAppliesTo(promo, targets)
    ? discountedPrice(bundle.price, promo)
    : bundle.price;
}

export function BuildPrice({
  tab,
  bundle,
}: {
  tab: PricingTab;
  bundle: Bundle;
}) {
  const build = useBuildPrice(tab, bundle);
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {bundle.from ? 'Starting at' : 'One-time price'}
      </p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-4xl font-black tracking-tight text-gray-900 dark:text-white">
        {build !== bundle.price && (
          <s className="text-lg font-normal text-gray-400 decoration-1 dark:text-gray-500">
            {formatRM(bundle.price)}
          </s>
        )}
        <span
          className={
            build !== bundle.price
              ? 'text-emerald-600 dark:text-emerald-400'
              : ''
          }
        >
          {formatRM(build)}
        </span>
      </p>
    </div>
  );
}

export const MAINTENANCE_TAB = 'maintenance';

export function SaveBadge() {
  return (
    <span className="inline-block whitespace-nowrap rounded-full bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
      Save {CARE_YEARLY_SAVING}%
    </span>
  );
}

const STRONG = 'font-semibold text-gray-900 dark:text-gray-100';

export function CarePrices({ tier }: { tier: CareTier }) {
  return (
    <>
      + {CARE_PLAN.toLowerCase()} {tier.from ? 'from ' : ''}
      <span className={STRONG}>{formatRM(tier.monthly)}/month</span>{' '}
      <span className="whitespace-nowrap">
        or <span className={STRONG}>{formatRM(careYearly(tier))}/year</span>{' '}
        <SaveBadge />
      </span>
    </>
  );
}

export function MaintenanceLine({ tier }: { tier: CareTier }) {
  return (
    <button
      type="button"
      onClick={() => useServicePick.getState().choose({ tab: MAINTENANCE_TAB })}
      className="pointer-events-none mt-2 rounded text-left text-sm leading-relaxed text-gray-500 underline decoration-gray-300 decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 dark:text-gray-400 dark:decoration-gray-600"
    >
      {/* Only the words take the pointer, not the empty corner of a wrapped line. */}
      <span className="pointer-events-auto cursor-pointer">
        <CarePrices tier={tier} />
      </span>
    </button>
  );
}

function messageFor(
  tab: PricingTab,
  bundle: Bundle,
  build: number,
  extras: AddOn[],
  language?: string
) {
  const care = bundle.care && CARE[bundle.care];
  const price = formatRM(bundle.price);
  const estimate = build + extras.reduce((sum, item) => sum + item.price, 0);
  return [
    !bundle.from
      ? `Hi Haziq, I'd like the ${bundle.name} ${tab.noun} package (${price}).`
      : `Hi Haziq, I'd like a quote for: ${bundle.name}, from ${price}.`,
    ...(language ? [`Main language: ${language}.`] : []),
    ...(extras.length
      ? [
          'Features:',
          ...extras.map((item) => `• ${item.name}: ${formatRM(item.price)}`),
          `Estimated build: ${formatRM(estimate)}.`,
        ]
      : []),
    ...(care ? [`${CARE_PLAN} after launch: ${careChoice(care)}.`] : []),
    'Please let me know what you need from me.',
  ].join('\n');
}

export function QuoteLink({
  tab,
  bundle,
  whatsappHref,
  extras = [],
  language,
  solid = true,
  className = '',
}: {
  tab: PricingTab;
  bundle: Bundle;
  whatsappHref: string;
  extras?: AddOn[];
  language?: string;
  solid?: boolean;
  className?: string;
}) {
  const build = useBuildPrice(tab, bundle);
  const url = new URL(whatsappHref);
  url.searchParams.set(
    'text',
    messageFor(tab, bundle, build, extras, language)
  );

  return (
    <PromoLink
      href={url.toString()}
      targets={promoTargetsOf(tab, bundle)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackWhatsApp({
          tab: tab.id,
          package: bundle.id,
          features: extras.length,
        })
      }
      className={`${solid ? SOLID : OUTLINE} ${className}`}
    >
      <SiWhatsapp size={16} aria-hidden="true" />
      {bundle.from ? 'Get a quote' : 'Order on WhatsApp'}
    </PromoLink>
  );
}

export function WhatsAppButton({
  href,
  message,
  event,
  disabled = false,
  children,
}: {
  href: string;
  message: string;
  event: Record<string, string>;
  disabled?: boolean;
  children: ReactNode;
}) {
  if (disabled)
    return (
      <button
        type="button"
        disabled
        className={`${SOLID} cursor-not-allowed opacity-50 hover:translate-y-0 hover:bg-green-600`}
      >
        <SiWhatsapp size={16} aria-hidden="true" />
        {children}
      </button>
    );
  const url = new URL(href);
  url.searchParams.set('text', message);
  return (
    <a
      href={url.toString()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsApp(event)}
      className={SOLID}
    >
      <SiWhatsapp size={16} aria-hidden="true" />
      {children}
    </a>
  );
}

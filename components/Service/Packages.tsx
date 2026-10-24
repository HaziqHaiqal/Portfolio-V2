'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import {
  BLUEPRINT,
  type Bundle,
  CARE,
  CARE_PLAN,
  carePrice,
  type PricingTab,
} from '@constants/services';
import { formatRM } from '@lib/format';
import { PromoLink, PromoPrice } from '@components/Promo/PromoParts';
import CardCarousel from './CardCarousel';

const BUTTON =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4';
const SOLID = `${BUTTON} bg-green-600 text-white shadow-lg shadow-green-600/20 hover:-translate-y-0.5 hover:bg-green-700 focus-visible:ring-green-500/30`;
const OUTLINE = `${BUTTON} border border-gray-300 text-gray-800 hover:border-green-500/60 hover:text-green-700 focus-visible:ring-green-500/20 dark:border-gray-600 dark:text-gray-200 dark:hover:text-green-400`;

function messageFor(tab: PricingTab, bundle: Bundle) {
  const care = bundle.care && CARE[bundle.care];
  const price = `${formatRM(bundle.price)}${tab.monthly ? '/month' : ''}`;
  return [
    tab.monthly
      ? `Hi Haziq, I'd like a quote for ${bundle.name} ${tab.noun}, from ${price}.`
      : !bundle.from
        ? `Hi Haziq, I'd like the ${bundle.name} ${tab.noun} package (${price}).`
        : tab.blueprint
          ? `Hi Haziq, I'd like to book a ${BLUEPRINT.name} (${formatRM(BLUEPRINT.price)}) for: ${bundle.name}, from ${price}.`
          : `Hi Haziq, I'd like a quote for: ${bundle.name}, from ${price}.`,
    ...(care ? [`${CARE_PLAN}: ${carePrice(care)} after launch.`] : []),
    'Please let me know what you need from me.',
  ].join('\n');
}

function BundleCard({
  tab,
  bundle,
  whatsappHref,
  solid,
}: {
  tab: PricingTab;
  bundle: Bundle;
  whatsappHref: string;
  solid: boolean;
}) {
  const basedOn = tab.bundles.find((item) => item.id === bundle.basedOn);
  const care = bundle.care && CARE[bundle.care];
  const href = (() => {
    const url = new URL(whatsappHref);
    url.searchParams.set('text', messageFor(tab, bundle));
    return url.toString();
  })();

  return (
    <article
      className={`relative flex h-full flex-col rounded-3xl border bg-white/70 p-6 shadow-xl backdrop-blur-sm dark:bg-gray-800/70 sm:p-7 ${
        bundle.popular
          ? 'border-green-500 ring-1 ring-green-500 dark:border-green-400 dark:ring-green-400'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {bundle.popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-green-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg shadow-green-600/20 sm:left-7">
          Most popular
        </span>
      )}
      <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
        {bundle.name}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {bundle.summary}
      </p>

      <p className="mt-5 text-xs font-medium text-gray-500 dark:text-gray-400">
        {bundle.from ? 'Starting at' : 'One-time price'}
      </p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-4xl font-black tracking-tight text-gray-900 dark:text-white">
        {tab.promoTarget && !bundle.from ? (
          <PromoPrice target={tab.promoTarget} price={bundle.price} />
        ) : (
          formatRM(bundle.price)
        )}
        {tab.monthly && (
          <span className="-ml-1 text-base font-semibold tracking-normal text-gray-500 dark:text-gray-400">
            /month
          </span>
        )}
      </p>

      <div className="mt-5 flex-1 border-t border-gray-200 pt-5 dark:border-gray-700">
        {basedOn && (
          <p className="mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
            Everything in {basedOn.name}, plus
          </p>
        )}
        <ul className="space-y-2.5">
          {bundle.includes.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
            >
              <Check
                size={16}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-green-500"
              />
              {item}
            </li>
          ))}
        </ul>
        {bundle.runningCost && (
          <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {bundle.runningCost}.
          </p>
        )}
      </div>

      {bundle.bestFor && (
        <p className="mt-5 border-t border-gray-200 pt-4 text-xs leading-relaxed text-gray-600 dark:border-gray-700 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Choose this if{' '}
          </span>
          {bundle.bestFor}
        </p>
      )}

      <div className="mt-5">
        {care && (
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Plus {CARE_PLAN},{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {carePrice(care)}
            </span>{' '}
            after launch
          </p>
        )}
        <PromoLink
          href={href}
          targets={tab.promoTarget && !bundle.from ? [tab.promoTarget] : []}
          target="_blank"
          rel="noopener noreferrer"
          className={solid ? SOLID : OUTLINE}
        >
          <SiWhatsapp size={16} aria-hidden="true" />
          {bundle.from ? 'Get a quote' : 'Order on WhatsApp'}
        </PromoLink>
      </div>
    </article>
  );
}

/** One pricing tab: its bundles side by side, each with its own WhatsApp order. */
export default function Packages({
  tab,
  whatsappHref,
}: {
  tab: PricingTab;
  whatsappHref: string;
}) {
  const hasPopular = tab.bundles.some((bundle) => bundle.popular);
  return (
    <div>
      <CardCarousel
        label={`${tab.label} packages`}
        className={`-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[11vw] pb-6 pt-4 [scrollbar-width:none] sm:-mx-10 sm:px-[20vw] md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:p-0 ${
          tab.bundles.length > 3 ? 'xl:grid-cols-4' : 'lg:grid-cols-3'
        }`}
        itemClassName="w-[78vw] shrink-0 snap-center sm:w-[60vw] md:w-auto"
        dotsClassName="md:hidden"
        centered
        initial={Math.max(
          0,
          tab.bundles.findIndex((bundle) => bundle.popular)
        )}
      >
        {tab.bundles.map((bundle) => (
          <BundleCard
            key={bundle.id}
            tab={tab}
            bundle={bundle}
            whatsappHref={whatsappHref}
            solid={!hasPopular || Boolean(bundle.popular)}
          />
        ))}
      </CardCarousel>
      {(tab.note || tab.link) && (
        <p className="mx-auto mt-8 max-w-2xl text-balance text-center text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {tab.note}
          {tab.link && (
            <>
              {' '}
              <Link
                href={tab.link.href}
                className="inline-flex items-center gap-1 font-semibold text-green-700 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
              >
                {tab.link.label}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}

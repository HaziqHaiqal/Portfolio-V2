'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, X } from 'lucide-react';
import {
  type Bundle,
  CARE,
  CUSTOM_SYSTEM,
  includesOf,
  type PricingTab,
  SYSTEMS,
  WEBSITES,
} from '@constants/services';
import InfoPopover from '@components/Common/InfoPopover';
import AutomationBento from './AutomationBento';
import CardCarousel from './CardCarousel';
import { BuildPrice, MaintenanceLine, OUTLINE, QuoteLink } from './PriceParts';
import { useServicePick } from './servicePick';
import SystemBuilder from './SystemBuilder';

function BundleCard({
  tab,
  bundle,
  whatsappHref,
  solid,
  onBuild,
  buildOpen = false,
}: {
  tab: PricingTab;
  bundle: Bundle;
  whatsappHref: string;
  solid: boolean;
  onBuild?: () => void;
  buildOpen?: boolean;
}) {
  const basedOn = tab.bundles.find((item) => item.id === bundle.basedOn);
  const care = bundle.care && CARE[bundle.care];
  const info = bundle.includeInfo;

  return (
    <article
      className={`relative flex h-full flex-col rounded-3xl border bg-white/70 p-6 shadow-xl backdrop-blur-sm dark:bg-gray-800/70 sm:p-7 ${
        bundle.recommended
          ? 'border-green-500 ring-1 ring-green-500 dark:border-green-400 dark:ring-green-400'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {bundle.recommended && (
        <span className="absolute -top-3 left-6 rounded-full bg-green-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg shadow-green-600/20 sm:left-7">
          Recommended
        </span>
      )}
      <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
        {bundle.name}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {bundle.summary}
      </p>

      <div className="mt-5">
        <BuildPrice tab={tab} bundle={bundle} />
        {care && <MaintenanceLine tier={care} />}
      </div>

      <div className="mt-5 flex-1 border-t border-gray-200 pt-5 dark:border-gray-700">
        {basedOn && (
          <p className="mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
            Everything in {basedOn.name}, plus
          </p>
        )}
        <ul className="space-y-2.5">
          {includesOf(bundle).map((item) => (
            <li
              key={item}
              className="relative flex items-start gap-2.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
            >
              <Check
                size={16}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-green-500"
              />
              <span>
                {item}
                {info?.item === item && (
                  <InfoPopover
                    label={info.heading}
                    heading={info.heading}
                    items={info.items}
                    note={info.note}
                  />
                )}
              </span>
            </li>
          ))}
          {bundle.excludes?.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-400 dark:text-gray-500"
            >
              <X size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span>
                <span className="sr-only">Not included: </span>
                {item}
              </span>
            </li>
          ))}
        </ul>
        {bundle.runningCost && (
          <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {bundle.runningCost}.
          </p>
        )}
      </div>

      <div className="mt-5">
        {onBuild ? (
          <button
            type="button"
            onClick={onBuild}
            aria-expanded={buildOpen}
            className={OUTLINE}
          >
            {buildOpen ? 'Hide estimate' : 'Build your estimate'}
          </button>
        ) : (
          <QuoteLink
            tab={tab}
            bundle={bundle}
            whatsappHref={whatsappHref}
            solid={solid}
          />
        )}
      </div>
    </article>
  );
}

export default function Packages({
  tab,
  whatsappHref,
}: {
  tab: PricingTab;
  whatsappHref: string;
}) {
  const hasRecommended = tab.bundles.some((bundle) => bundle.recommended);
  const withCustom = tab.id === WEBSITES.id;
  const [builderOpen, setBuilderOpen] = useState(false);
  const builderRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const cardCount = tab.bundles.length + (withCustom ? 1 : 0);

  const openBuilder = () => {
    setBuilderOpen(true);
    requestAnimationFrame(() =>
      builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  };

  const closeBuilder = () => {
    setBuilderOpen(false);
    requestAnimationFrame(() =>
      cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  };

  useEffect(
    () =>
      useServicePick.subscribe(({ pick }) => {
        if (withCustom && pick?.tab === tab.id && pick.builder) openBuilder();
      }),
    [withCustom, tab.id]
  );

  return (
    <div>
      {tab.layout === 'builder' ? (
        <SystemBuilder tab={tab} whatsappHref={whatsappHref} />
      ) : tab.layout === 'bento' ? (
        <AutomationBento tab={tab} whatsappHref={whatsappHref} />
      ) : (
        <div ref={cardsRef} className="scroll-mt-28">
          <CardCarousel
            label={`${tab.label} packages`}
            className={`-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[11vw] pb-6 pt-4 [scrollbar-width:none] sm:-mx-10 sm:px-[20vw] md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:p-0 ${
              cardCount > 3 ? 'xl:grid-cols-4' : 'lg:grid-cols-3'
            }`}
            itemClassName="w-[78vw] shrink-0 snap-center sm:w-[60vw] md:w-auto"
            dotsClassName="md:hidden"
            centered
            initial={Math.max(
              0,
              tab.bundles.findIndex((bundle) => bundle.recommended)
            )}
          >
            {tab.bundles.map((bundle) => (
              <BundleCard
                key={bundle.id}
                tab={tab}
                bundle={bundle}
                whatsappHref={whatsappHref}
                solid={!hasRecommended || Boolean(bundle.recommended)}
              />
            ))}
            {withCustom && (
              <BundleCard
                key={CUSTOM_SYSTEM.id}
                tab={SYSTEMS}
                bundle={CUSTOM_SYSTEM}
                whatsappHref={whatsappHref}
                solid={false}
                onBuild={builderOpen ? closeBuilder : openBuilder}
                buildOpen={builderOpen}
              />
            )}
          </CardCarousel>
        </div>
      )}

      {withCustom && builderOpen && (
        <div
          ref={builderRef}
          id="system-builder"
          className="mt-12 scroll-mt-28 rounded-3xl border border-gray-200 p-5 dark:border-gray-700 sm:p-8"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeBuilder}
              aria-controls="system-builder"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 dark:border-gray-600 dark:text-gray-300 dark:hover:text-white"
            >
              <X size={16} aria-hidden="true" />
              Close
            </button>
          </div>
          <SystemBuilder tab={SYSTEMS} whatsappHref={whatsappHref} />
        </div>
      )}

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

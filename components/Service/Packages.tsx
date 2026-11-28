'use client';

import type { ReactNode } from 'react';
import { ArrowRight, Check, PencilLine, Plus, X } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { type Bundle, includesOf, type PricingTab } from '@constants/services';
import { formatRM } from '@lib/format';
import AutomationBento from './AutomationBento';
import CardCarousel from './CardCarousel';
import { BuildPrice, QuoteLink } from './PriceParts';
import { useServicePick } from './servicePick';
import SystemBuilder, { type SystemDemos } from './SystemBuilder';

function Browser({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-white text-[#111] shadow-sm ring-1 ring-black/5">
      <div className="flex gap-1 bg-gray-100 px-2.5 py-2">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="h-1.5 w-1.5 rounded-full bg-gray-300" />
        ))}
      </div>
      {children}
    </div>
  );
}

const PREVIEWS: Record<string, ReactNode> = {
  starter: (
    <div className="w-full max-w-[15.5rem]">
      <Browser>
        <div className="grid grid-cols-[1.15fr_1fr] gap-2.5 p-3">
          <div>
            <span className="block h-2.5 w-[92%] rounded bg-gray-900" />
            <span className="mt-2 block h-1.5 w-[78%] rounded bg-gray-200" />
            <span className="mt-1.5 block h-1.5 w-3/5 rounded bg-gray-200" />
            <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-[9px] font-bold text-white">
              <SiWhatsapp size={8} />
              WhatsApp
            </span>
          </div>
          <svg
            viewBox="0 0 100 64"
            preserveAspectRatio="none"
            className="h-full min-h-16 w-full rounded-md bg-green-100"
          >
            <circle cx="80" cy="16" r="7" fill="#86efac" />
            <path d="M0 64 L32 20 L58 48 L78 30 L100 64 Z" fill="#4ade80" />
          </svg>
        </div>
      </Browser>
    </div>
  ),
  business: (
    <div className="relative w-full max-w-[15.5rem]">
      <span className="absolute inset-0 -translate-y-3 translate-x-3.5 rounded-xl bg-white/50 ring-1 ring-black/5 dark:bg-gray-700" />
      <span className="absolute inset-0 -translate-y-1.5 translate-x-[7px] rounded-xl bg-white/80 ring-1 ring-black/5 dark:bg-gray-600" />
      <Browser>
        <div className="flex gap-2.5 border-b border-gray-100 px-3 py-2 text-[9px] text-gray-500">
          <span className="font-bold text-gray-900">Home</span>
          <span>About</span>
          <span>Services</span>
          <span>Contact</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 px-3 pb-4 pt-2.5">
          {[0, 1, 2].map((box) => (
            <span key={box} className="h-8 rounded bg-gray-100" />
          ))}
        </div>
      </Browser>
      <span className="absolute -bottom-3 -right-1 inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-[10px] font-semibold text-white ring-1 ring-white/15">
        <PencilLine size={10} />
        Edit prices
      </span>
    </div>
  ),
};

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
  const preview = PREVIEWS[bundle.id];

  return (
    <article
      className={`relative flex h-full flex-col rounded-3xl border bg-white/70 p-6 shadow-xl backdrop-blur-sm dark:bg-gray-800/70 sm:p-7 ${
        bundle.recommended
          ? 'border-green-500 ring-1 ring-green-500 dark:border-green-400 dark:ring-green-400'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {bundle.recommended && (
        <span className="absolute -top-3 left-6 z-10 rounded-full bg-green-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg shadow-green-600/20 sm:left-7">
          Recommended
        </span>
      )}
      {preview && (
        <div
          aria-hidden="true"
          className="mb-6 flex min-h-40 items-center justify-center rounded-2xl bg-gray-100 p-5 ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10"
        >
          {preview}
        </div>
      )}
      <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
        {bundle.name}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {bundle.summary}
      </p>

      <div className="mt-5">
        <BuildPrice tab={tab} bundle={bundle} />
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
              className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
            >
              <Check
                size={16}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-green-500"
              />
              <span>{item}</span>
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
        {bundle.addOns?.map((item) => (
          <p
            key={item.id}
            className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
          >
            <Plus
              size={16}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-green-500"
            />
            <span>
              Optional: {item.name}{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                +{formatRM(item.price)}
              </span>
            </span>
          </p>
        ))}
        {bundle.runningCost && (
          <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {bundle.runningCost}.
          </p>
        )}
      </div>

      <div className="mt-5">
        <QuoteLink
          tab={tab}
          bundle={bundle}
          whatsappHref={whatsappHref}
          solid={solid}
        />
      </div>
    </article>
  );
}

export default function Packages({
  tab,
  whatsappHref,
  systemDemos,
}: {
  tab: PricingTab;
  whatsappHref: string;
  systemDemos?: SystemDemos;
}) {
  const hasRecommended = tab.bundles.some((bundle) => bundle.recommended);
  const seeAlso = tab.seeAlso;

  return (
    <div>
      {tab.layout === 'builder' ? (
        <SystemBuilder
          tab={tab}
          whatsappHref={whatsappHref}
          demos={systemDemos}
        />
      ) : tab.layout === 'bento' ? (
        <AutomationBento tab={tab} whatsappHref={whatsappHref} />
      ) : (
        <CardCarousel
          label={`${tab.label} packages`}
          className={`-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[11vw] pb-6 pt-4 [scrollbar-width:none] sm:-mx-10 sm:px-[20vw] md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:p-0 ${
            tab.bundles.length > 2
              ? 'lg:grid-cols-3'
              : 'md:mx-auto md:max-w-4xl'
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
        </CardCarousel>
      )}

      {seeAlso && (
        <p className="mx-auto mt-8 max-w-2xl text-balance text-center text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {seeAlso.text}{' '}
          <button
            type="button"
            onClick={() =>
              useServicePick.getState().choose({ tab: seeAlso.tab })
            }
            className="pointer-events-none rounded font-semibold text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 dark:text-green-400"
          >
            <span className="pointer-events-auto inline-flex cursor-pointer items-center gap-1">
              {seeAlso.label}
              <ArrowRight size={14} aria-hidden="true" />
            </span>
          </button>
        </p>
      )}
    </div>
  );
}

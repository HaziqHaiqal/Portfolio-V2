'use client';

import { useState, type ReactNode } from 'react';
import { ArrowRight, Check, PlayCircle, Sheet } from 'lucide-react';
import {
  BUG_FIX_INCLUDE,
  type Bundle,
  CARE,
  type PricingTab,
} from '@constants/services';
import { formatRM } from '@lib/format';
import {
  Approvals,
  Chatbot,
  MorningReport,
  WhatsAppOrders,
} from '@components/Templates/automation/Simulations';
import CardCarousel from './CardCarousel';
import DemoDialog from './DemoDialog';
import { MaintenanceLine, QuoteLink } from './PriceParts';

function Bubble({
  me = false,
  children,
}: {
  me?: boolean;
  children: ReactNode;
}) {
  return (
    <p
      className={`w-fit max-w-[85%] rounded-2xl px-3 py-1.5 text-xs leading-relaxed text-[#111] shadow-sm ring-1 ring-black/5 ${
        me ? 'ml-auto rounded-br-md bg-[#D9FDD3]' : 'rounded-bl-md bg-white'
      }`}
    >
      {children}
    </p>
  );
}

const CHIP =
  'rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#111] shadow-sm ring-1 ring-black/5';
const WEEK = [62, 71, 58, 80, 77, 94, 100];

const PREVIEWS: Record<string, ReactNode> = {
  'whatsapp-orders': (
    <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
      <div className="space-y-2">
        <Bubble me>2 nasi lemak ayam, 1 teh ais. Pickup 12:30.</Bubble>
        <Bubble>Order #1042 is in. Total RM21.50.</Bubble>
      </div>
      <ArrowRight
        size={16}
        className="hidden text-gray-400 dark:text-gray-500 sm:block"
      />
      <div className="overflow-hidden rounded-xl bg-white text-xs text-[#111] shadow-sm ring-1 ring-black/5">
        <p className="flex items-center gap-1.5 border-b border-black/10 px-3 py-2 font-semibold">
          <Sheet size={12} className="text-[#188038]" />
          Orders
        </p>
        <p className="flex justify-between gap-3 px-3 py-1.5 text-black/60">
          <span>1041 Priya</span>
          <span>RM13.20</span>
        </p>
        <p className="flex justify-between gap-3 bg-[#DCFCE7] px-3 py-1.5 font-medium">
          <span>1042 Aina</span>
          <span>RM21.50</span>
        </p>
      </div>
    </div>
  ),
  chatbot: (
    <div className="space-y-2">
      <Bubble me>Is it halal?</Bubble>
      <Bubble>Yes, all our products are halal-certified.</Bubble>
      <div className="flex flex-wrap gap-1.5 pt-1">
        <span className={CHIP}>Delivery to Sabah?</span>
        <span className={CHIP}>Talk to a person</span>
      </div>
    </div>
  ),
  reports: (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
      <p className="mt-0.5 flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          RM1,284
        </span>
        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
          +12%
        </span>
      </p>
      <div className="mt-3 flex h-12 items-end gap-1.5">
        {WEEK.map((value, index) => (
          <span
            key={index}
            style={{ height: `${value}%` }}
            className={`w-full rounded-t ${
              index === WEEK.length - 1
                ? 'bg-green-600 dark:bg-green-400'
                : 'bg-green-600/25 dark:bg-green-400/25'
            }`}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
        Low stock: Teh ais powder
      </p>
    </div>
  ),
  approvals: (
    <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
      <div className="rounded-xl bg-white p-3 text-xs text-[#111] shadow-sm ring-1 ring-black/5">
        <p className="font-semibold">Farid · Annual leave</p>
        <p className="mt-0.5 text-black/60">12 to 13 Nov, 2 days</p>
        <div className="mt-2.5 flex gap-1.5">
          <span className="rounded-full bg-[#111] px-2.5 py-1 font-semibold text-white">
            Approve
          </span>
          <span className="rounded-full px-2.5 py-1 font-semibold ring-1 ring-black/15">
            Decline
          </span>
        </div>
      </div>
      <ArrowRight
        size={16}
        className="hidden text-gray-400 dark:text-gray-500 sm:block"
      />
      <div className="space-y-2">
        <p className={`${CHIP} inline-flex items-center gap-1.5`}>
          <Check size={12} className="text-green-600" />
          Approved by Siti
        </p>
        <p className="font-mono text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
          09:05 Siti approved it
          <br />
          09:05 Farid was told
        </p>
      </div>
    </div>
  ),
};

const DEMOS: Record<string, ReactNode> = {
  'whatsapp-orders': <WhatsAppOrders />,
  chatbot: (
    <div className="mx-auto max-w-md">
      <Chatbot />
    </div>
  ),
  approvals: <Approvals />,
  reports: <MorningReport />,
};

const LAYOUT = [
  { id: 'whatsapp-orders', wide: true },
  { id: 'chatbot', wide: false },
  { id: 'reports', wide: false },
  { id: 'approvals', wide: true },
];

function Tile({
  tab,
  bundle,
  whatsappHref,
  onDemo,
}: {
  tab: PricingTab;
  bundle: Bundle;
  whatsappHref: string;
  onDemo: () => void;
}) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white/70 p-5 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
          {bundle.name}
        </h3>
        <p className="shrink-0 text-gray-900 dark:text-white">
          {bundle.from && (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              from{' '}
            </span>
          )}
          <span className="text-xl font-black tracking-tight">
            {formatRM(bundle.price)}
          </span>
        </p>
      </div>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {bundle.summary}
      </p>

      <div
        aria-hidden="true"
        className="my-6 flex flex-1 flex-col justify-center"
      >
        {PREVIEWS[bundle.id]}
      </div>

      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
        {bundle.includes.join(' · ')}
      </p>
      {bundle.runningCost && (
        <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {bundle.runningCost}.
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onDemo}
          className="-ml-1 inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 dark:text-gray-300"
        >
          <PlayCircle
            size={16}
            aria-hidden="true"
            className="text-green-600 dark:text-green-400"
          />
          Try it
        </button>
        <div className="w-40 shrink-0">
          <QuoteLink tab={tab} bundle={bundle} whatsappHref={whatsappHref} />
        </div>
      </div>
    </article>
  );
}

export default function AutomationBento({
  tab,
  whatsappHref,
}: {
  tab: PricingTab;
  whatsappHref: string;
}) {
  const [demoId, setDemoId] = useState<string | null>(null);
  const tiles = LAYOUT.flatMap(({ id, wide }) => {
    const bundle = tab.bundles.find((item) => item.id === id);
    return bundle ? [{ bundle, wide }] : [];
  });
  const demoBundle = tab.bundles.find((item) => item.id === demoId);
  const shared = tab.bundles[0].care;
  const care = shared && CARE[shared];

  return (
    <div>
      <CardCarousel
        label={`${tab.label} options`}
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[11vw] pb-6 pt-4 [scrollbar-width:none] sm:-mx-10 sm:px-[20vw] md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:p-0 lg:grid-cols-3"
        itemClassName={(index) =>
          `w-[78vw] shrink-0 snap-center sm:w-[60vw] md:w-auto ${
            tiles[index]?.wide ? 'md:col-span-2' : ''
          }`
        }
        dotsClassName="md:hidden"
        centered
      >
        {tiles.map(({ bundle }) => (
          <Tile
            key={bundle.id}
            tab={tab}
            bundle={bundle}
            whatsappHref={whatsappHref}
            onDemo={() => setDemoId(bundle.id)}
          />
        ))}
      </CardCarousel>

      <div className="mt-6 flex flex-col items-start gap-1 text-sm text-gray-500 dark:text-gray-400 md:items-center md:text-center">
        <p>Every one includes {BUG_FIX_INCLUDE.toLowerCase()}.</p>
        {care && <MaintenanceLine tier={care} />}
      </div>

      {demoBundle && (
        <DemoDialog
          title={`${demoBundle.name} demo`}
          onClose={() => setDemoId(null)}
          action={
            <QuoteLink
              tab={tab}
              bundle={demoBundle}
              whatsappHref={whatsappHref}
            />
          }
        >
          {DEMOS[demoBundle.id]}
        </DemoDialog>
      )}
    </div>
  );
}

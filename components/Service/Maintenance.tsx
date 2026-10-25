'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  CARE,
  type CareTier,
  careYearly,
  TAKEOVER,
  WEBSITES,
} from '@constants/services';
import { formatRM } from '@lib/format';
import CardCarousel from './CardCarousel';
import { OUTLINE, SaveBadge, SOLID, trackWhatsApp } from './PriceParts';
import { useServicePick } from './servicePick';

interface Row {
  label: string;
  tier: CareTier;
}

interface Plan {
  id: string;
  name: string;
  summary: string;
  rows: Row[];
  setup?: string;
  action: { label: string } & ({ tab: string } | { message: string });
}

const PLANS: Plan[] = [
  {
    id: 'mine',
    name: 'Built by me',
    summary: 'Hosting, updates and backups.',
    rows: [
      { label: 'Starter website', tier: CARE.starter },
      { label: 'Business website', tier: CARE.business },
      { label: 'Store template', tier: CARE.store },
      { label: 'Systems', tier: CARE.system },
      { label: 'Mobile apps', tier: CARE.app },
      { label: 'Automation', tier: CARE.automation },
    ],
    action: { label: 'See packages', tab: WEBSITES.id },
  },
  {
    id: 'takeover',
    name: 'Built by someone else',
    summary: 'Updates and backups, after a one-time check.',
    rows: TAKEOVER.options.map((option) => ({
      label: option.name,
      tier: option.care,
    })),
    setup: `One-time check first: ${TAKEOVER.options
      .map(
        (option) =>
          `${formatRM(option.check)} for a ${option.name.toLowerCase()}`
      )
      .join(', ')}.`,
    action: {
      label: 'Book a takeover check',
      message: `Hi Haziq, I'd like a takeover check (${TAKEOVER.options
        .map(
          (option) =>
            `${formatRM(option.check)} for a ${option.name.toLowerCase()}`
        )
        .join(
          ', '
        )}).\nLink: \nBuilt with: \nPlease let me know what you need from me.`,
    },
  },
];

const INCLUDES = [
  'Hosting and SSL for what I build',
  'Security and software updates',
  'Regular backups',
];

const GOOD_TO_KNOW = [
  'Bug fixes on what I build are free for life, with or without a plan.',
  'You can stop maintenance. The site or app then goes offline from my hosting, and the code is yours to host elsewhere.',
  'Domain renewals and fees from other companies, such as payment gateways, are paid separately.',
  `For sites built by someone else, the check comes off your first year when you pay yearly, and problems that were already there are quoted from its list. Works with ${TAKEOVER.platforms.join(', ')}.`,
];

const price = (amount: number, tier: CareTier) =>
  `${formatRM(amount)}${tier.from ? '+' : ''}`;

function PlanCard({
  plan,
  whatsappHref,
}: {
  plan: Plan;
  whatsappHref: string;
}) {
  const low = plan.rows.reduce((min, row) =>
    row.tier.monthly < min.tier.monthly ? row : min
  ).tier;
  const action = plan.action;

  return (
    <article className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white/70 p-6 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70 sm:p-7">
      <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
        {plan.name}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {plan.summary}
      </p>
      <p className="mt-5 text-xs font-medium text-gray-500 dark:text-gray-400">
        Starting at
      </p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-1 text-gray-900 dark:text-white">
        <span className="text-4xl font-black tracking-tight">
          {formatRM(low.monthly)}
        </span>
        <span className="text-base font-semibold text-gray-500 dark:text-gray-400">
          /month
        </span>
      </p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        or{' '}
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {formatRM(careYearly(low))}/year
        </span>{' '}
        <SaveBadge />
      </p>

      <table className="mt-5 w-full border-t border-gray-200 text-left text-sm dark:border-gray-700">
        <thead>
          <tr className="text-xs text-gray-500 dark:text-gray-400">
            <th scope="col" className="pb-2 pt-4 font-medium">
              <span className="sr-only">Plan</span>
            </th>
            <th scope="col" className="px-2 pb-2 pt-4 text-right font-medium">
              Monthly
            </th>
            <th scope="col" className="pb-2 pt-4 text-right font-medium">
              <span className="inline-flex items-center gap-1.5">
                Yearly
                {/* Phones already see it in the headline, and the table needs the room. */}
                <span className="hidden sm:inline">
                  <SaveBadge />
                </span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {plan.rows.map((row) => (
            <tr key={row.label}>
              <th
                scope="row"
                className="py-1.5 pr-2 font-normal text-gray-700 dark:text-gray-300"
              >
                {row.label}
              </th>
              <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums text-gray-500 dark:text-gray-400">
                {price(row.tier.monthly, row.tier)}
              </td>
              <td className="whitespace-nowrap py-1.5 text-right font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                {price(careYearly(row.tier), row.tier)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {plan.setup && (
        <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {plan.setup}
        </p>
      )}

      <div className="mt-auto pt-5">
        {'tab' in action ? (
          <button
            type="button"
            onClick={() =>
              useServicePick.getState().choose({ tab: action.tab })
            }
            className={OUTLINE}
          >
            {action.label}
          </button>
        ) : (
          <a
            href={(() => {
              const url = new URL(whatsappHref);
              url.searchParams.set('text', action.message);
              return url.toString();
            })()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackWhatsApp({ tab: 'maintenance', package: plan.id })
            }
            className={SOLID}
          >
            {action.label}
          </a>
        )}
      </div>
    </article>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
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
    </div>
  );
}

export default function Maintenance({
  whatsappHref,
}: {
  whatsappHref: string;
}) {
  return (
    <div>
      <CardCarousel
        label="Maintenance plans"
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[11vw] pb-6 pt-4 [scrollbar-width:none] sm:-mx-10 sm:px-[20vw] md:mx-auto md:grid md:max-w-4xl md:grid-cols-2 md:gap-6 md:overflow-visible md:p-0"
        itemClassName="w-[78vw] shrink-0 snap-center sm:w-[60vw] md:w-auto"
        dotsClassName="md:hidden"
        centered
      >
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} whatsappHref={whatsappHref} />
        ))}
      </CardCarousel>

      <details className="group mx-auto mt-8 max-w-4xl">
        <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-full px-2 py-2 text-sm font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 dark:text-gray-300 [&::-webkit-details-marker]:hidden">
          What&apos;s included and good to know
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <div className="mt-6 grid gap-8 border-t border-gray-200 pt-8 dark:border-gray-700 md:grid-cols-3">
          <List title="Every plan includes" items={INCLUDES} />
          <List title="The takeover check" items={TAKEOVER.checkIncludes} />
          <List title="Good to know" items={GOOD_TO_KNOW} />
        </div>
      </details>
    </div>
  );
}

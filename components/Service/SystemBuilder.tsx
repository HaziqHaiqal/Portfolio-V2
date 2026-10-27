'use client';

import { useState } from 'react';
import { Check, PencilLine, Plus } from 'lucide-react';
import {
  type AddOn,
  AI_USAGE_FEES,
  CARE,
  DEFAULT_LANGUAGE,
  includesOf,
  languageAddOn,
  type PricingTab,
} from '@constants/services';
import { formatRM } from '@lib/format';
import { ExtraLanguages, MainLanguage, nextLanguage } from './Languages';
import { MaintenanceLine, QuoteLink, WhatsAppButton } from './PriceParts';

const OTHERS = 'others';
const PILL =
  'min-h-10 rounded-full capitalize border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20';
const PILL_ON =
  'border-green-500 bg-green-500/10 text-green-800 dark:border-green-400 dark:bg-green-400/10 dark:text-green-300';
const PILL_OFF =
  'border-gray-300 bg-white/60 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-300';
const PANEL =
  'rounded-3xl border border-gray-200 bg-white/70 p-5 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70 sm:p-6';

export default function SystemBuilder({
  tab,
  whatsappHref,
}: {
  tab: PricingTab;
  whatsappHref: string;
}) {
  const [systemId, setSystemId] = useState(tab.bundles[0].id);
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const [brief, setBrief] = useState('');
  const others = systemId === OTHERS ? tab.others : undefined;
  const system =
    tab.bundles.find((item) => item.id === systemId) ?? tab.bundles[0];
  const addOns = system.addOns ?? [];
  const chosenIds = picked[system.id] ?? [];
  const [mainLanguage, setMainLanguage] = useState(DEFAULT_LANGUAGE);
  const [extraLanguages, setExtraLanguages] = useState<
    Record<string, string[]>
  >({});
  const languages = extraLanguages[system.id] ?? [];
  const setLanguages = (next: string[]) =>
    setExtraLanguages((current) => ({ ...current, [system.id]: next }));
  const pickMain = (value: string) => {
    setMainLanguage(value);
    setExtraLanguages((current) =>
      Object.fromEntries(
        Object.entries(current).map(([id, list]) => [
          id,
          list.filter((item) => item !== value),
        ])
      )
    );
  };
  const isOn = (item: (typeof addOns)[number]) =>
    item.perLanguage ? languages.length > 0 : chosenIds.includes(item.id);
  const chosen = addOns
    .filter(isOn)
    .map((item) => (item.perLanguage ? languageAddOn(item, languages) : item));
  const care = system.care && CARE[system.care];
  const build =
    system.price + chosen.reduce((sum, item) => sum + item.price, 0);

  const groups = [
    {
      id: 'addons',
      title: 'Add features',
      note: 'Fixed prices. The final quote is confirmed after we talk.',
      items: addOns.filter((item) => !item.ai),
    },
    {
      id: 'ai',
      title: 'AI features',
      note: `${AI_USAGE_FEES}.`,
      items: addOns.filter((item) => item.ai),
    },
  ].filter((group) => group.items.length);

  // Ticking an add-on ticks what it requires; unticking drops what needs it.
  const toggle = (item: AddOn) =>
    setPicked((current) => {
      const ids = current[system.id] ?? [];
      const needs =
        item.requires && !ids.includes(item.requires) ? [item.requires] : [];
      return {
        ...current,
        [system.id]: ids.includes(item.id)
          ? ids.filter(
              (id) =>
                id !== item.id &&
                addOns.find((other) => other.id === id)?.requires !== item.id
            )
          : [...ids, item.id, ...needs],
      };
    });

  const quote = (className = '') => (
    <QuoteLink
      tab={tab}
      bundle={system}
      whatsappHref={whatsappHref}
      extras={chosen}
      language={mainLanguage}
      className={className}
    />
  );

  return (
    <div>
      <div className="mx-auto max-w-3xl text-center">
        <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
          What do you want to build?
        </h3>
        <div
          role="group"
          aria-label={tab.label}
          className="mt-5 flex flex-wrap justify-center gap-2"
        >
          {tab.bundles.map((item) => {
            const count =
              (picked[item.id] ?? []).length +
              ((extraLanguages[item.id] ?? []).length ? 1 : 0);
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === systemId}
                onClick={() => setSystemId(item.id)}
                className={`${PILL} ${item.id === systemId ? PILL_ON : PILL_OFF}`}
              >
                {item.shortName ?? item.name}
                {count > 0 && (
                  <span className="ml-1.5 rounded-full bg-green-600 px-1.5 text-[11px] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          {tab.others && (
            <button
              type="button"
              aria-pressed={systemId === OTHERS}
              onClick={() => setSystemId(OTHERS)}
              className={`${PILL} inline-flex items-center gap-1.5 ${systemId === OTHERS ? PILL_ON : PILL_OFF}`}
            >
              <PencilLine size={14} aria-hidden="true" />
              Something else
            </button>
          )}
        </div>
      </div>

      {others ? (
        <section
          aria-labelledby="system-others"
          className={`${PANEL} mx-auto mt-10 max-w-3xl lg:p-8`}
        >
          <h4
            id="system-others"
            className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100"
          >
            {others.summary}
          </h4>
          <label
            htmlFor="system-brief"
            className="mt-5 block text-sm font-semibold text-gray-900 dark:text-gray-100"
          >
            What should it do?
          </label>
          <textarea
            id="system-brief"
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            rows={5}
            placeholder={others.placeholder}
            className="mt-2 w-full resize-y rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900/60 dark:text-gray-100"
          />
          <div className="mt-4 sm:max-w-xs">
            <WhatsAppButton
              href={whatsappHref}
              message={`Hi Haziq, I'd like a quote for a system.\n${brief.trim()}\nPlease let me know what you need from me.`}
              event={{ tab: tab.id, package: 'others' }}
              disabled={brief.trim().length < 10}
            >
              Send for a quote
            </WhatsAppButton>
          </div>
        </section>
      ) : (
        // The phone bar sticks only within this block, so it appears after the pills.
        <div className="mt-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
            <div>
              <h4 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                {system.name}
              </h4>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {system.summary}
              </p>
              <ul className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {includesOf(system).map((item) => (
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
              {system.runningCost && (
                <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {system.runningCost}.
                </p>
              )}
              <MainLanguage
                value={mainLanguage}
                onChange={pickMain}
                className="mt-6"
              />

              {groups.map((group) => (
                <section
                  key={group.id}
                  aria-labelledby={`${system.id}-${group.id}`}
                  className="mt-8"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h5
                      id={`${system.id}-${group.id}`}
                      className="text-lg font-bold text-gray-900 dark:text-gray-100"
                    >
                      {group.title}
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {group.note}
                    </p>
                  </div>
                  <ul className="mt-3 grid gap-3 md:grid-cols-2">
                    {group.items.map((item) => {
                      const on = isOn(item);
                      return (
                        <li
                          key={item.id}
                          className={`flex flex-col rounded-2xl border transition-all duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-green-500/20 ${
                            on
                              ? 'border-green-500/70 bg-green-500/[0.06] dark:border-green-400/60 dark:bg-green-400/[0.06]'
                              : 'border-gray-200 bg-white/60 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800/60 dark:hover:border-gray-600'
                          }`}
                        >
                          <label className="relative flex flex-1 cursor-pointer items-start gap-3 p-4">
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => {
                                if (item.perLanguage) {
                                  const first = nextLanguage([mainLanguage]);
                                  setLanguages(!on && first ? [first] : []);
                                } else {
                                  toggle(item);
                                }
                              }}
                              className="sr-only"
                            />
                            <span
                              aria-hidden="true"
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                                on
                                  ? 'border-green-600 bg-green-600 text-white'
                                  : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'
                              }`}
                            >
                              {on ? (
                                <Check size={12} strokeWidth={3} />
                              ) : (
                                <Plus
                                  size={12}
                                  strokeWidth={3}
                                  className="text-gray-400"
                                />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-baseline justify-between gap-3">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {item.name}
                                </span>
                                <span className="shrink-0 text-sm font-semibold tabular-nums text-green-700 dark:text-green-400">
                                  +{formatRM(item.price)}
                                  {item.perLanguage && ' each'}
                                </span>
                              </span>
                              <span className="mt-1 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                                {item.description}
                              </span>
                            </span>
                          </label>
                          {item.perLanguage && on && (
                            <div className="-mt-3 px-4 pb-4 pl-12">
                              <ExtraLanguages
                                main={mainLanguage}
                                languages={languages}
                                onChange={setLanguages}
                              />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>

            <aside
              aria-label="Your estimate"
              className={`${PANEL} lg:sticky lg:top-28`}
            >
              <h5 className="font-bold text-gray-900 dark:text-gray-100">
                Your estimate
              </h5>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-600 dark:text-gray-400">
                    {system.name}
                  </dt>
                  <dd className="shrink-0 font-medium tabular-nums text-gray-900 dark:text-gray-100">
                    {formatRM(system.price)}
                  </dd>
                </div>
                {chosen.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4">
                    <dt className="text-gray-600 dark:text-gray-400">
                      + {item.name}
                    </dt>
                    <dd className="shrink-0 font-medium tabular-nums text-gray-900 dark:text-gray-100">
                      {formatRM(item.price)}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 flex items-baseline justify-between gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Estimated build
                </span>
                <span
                  aria-live="polite"
                  className="text-3xl font-black tracking-tight text-gray-900 dark:text-white"
                >
                  {formatRM(build)}
                </span>
              </p>
              {care && (
                <div className="text-right">
                  <MaintenanceLine tier={care} />
                </div>
              )}
              <div className="mt-5 hidden lg:block">{quote()}</div>
            </aside>
          </div>

          <div className="sticky bottom-3 z-30 mt-3 flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/95 p-3 pl-4 shadow-2xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/95 lg:hidden">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Estimated build
              </p>
              <p className="truncate text-xl font-black tracking-tight text-gray-900 dark:text-white">
                {formatRM(build)}
              </p>
            </div>
            {quote('!w-auto shrink-0')}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  GraduationCap,
  IdCard,
  KeyRound,
  LayoutDashboard,
  type LucideIcon,
  Package,
  PencilLine,
  PlayCircle,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Utensils,
  X,
} from 'lucide-react';
import {
  type AddOn,
  AI_USAGE_FEES,
  DEFAULT_LANGUAGE,
  includesOf,
  languageAddOn,
  PHONE_APP,
  type PricingTab,
} from '@constants/services';
import { formatRM } from '@lib/format';
import { ExtraLanguages, MainLanguage, nextLanguage } from './Languages';
import { QuoteLink, WhatsAppButton } from './PriceParts';
import SystemStage from './SystemStage';

const OTHERS = 'others';
const ICONS: Record<string, LucideIcon> = {
  'online-store': ShoppingBag,
  'booking-system': CalendarDays,
  'qr-ordering': Utensils,
  inventory: Package,
  invoicing: ReceiptText,
  crm: TrendingUp,
  tuition: GraduationCap,
  membership: IdCard,
  rentals: KeyRound,
  [OTHERS]: PencilLine,
};
const CARD =
  'rounded-3xl border border-gray-200 bg-white/70 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70';
const FOCUS =
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20';

/** A live demo of a system, keyed by the system's id. */
export type SystemDemos = Record<string, { slug: string; href: string }>;

type Option = { id: string; name: string; label: string; price: string };

function SystemIcon({ id, size = 18 }: { id: string; size?: number }) {
  const Icon = ICONS[id] ?? LayoutDashboard;
  return <Icon size={size} aria-hidden="true" className="shrink-0" />;
}

function Count({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1.5 text-[11px] font-bold text-white ${className}`}
    >
      {value}
    </span>
  );
}

function AddButton({
  name,
  on,
  onClick,
}: {
  name: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`Add ${name}`}
      onClick={onClick}
      className={`inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full px-3.5 text-xs font-bold transition-colors ${FOCUS} ${
        on
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'border border-gray-300 text-gray-900 hover:border-gray-500 dark:border-gray-500 dark:text-gray-100 dark:hover:border-gray-300'
      }`}
    >
      {on ? (
        <Check size={13} strokeWidth={3} aria-hidden="true" />
      ) : (
        <ShoppingCart size={13} aria-hidden="true" />
      )}
      {on ? 'Added' : 'Add'}
    </button>
  );
}

function SystemGrid({
  id,
  options,
  selected,
  counts,
  onPick,
}: {
  id: string;
  options: Option[];
  selected: string;
  counts: Record<string, number>;
  onPick: (id: string) => void;
}) {
  return (
    <div id={id} className="grid grid-cols-2 gap-1">
      {options.map((option) => {
        const on = option.id === selected;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(option.id)}
            className={`flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-2.5 text-left ${FOCUS} ${
              on
                ? 'bg-green-500/10 text-green-800 ring-1 ring-green-500/60 dark:text-green-300'
                : 'text-gray-800 dark:text-gray-200'
            }`}
          >
            <SystemIcon id={option.id} size={16} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold">
                {option.label}
              </span>
              <span className="block truncate text-[11px] tabular-nums text-gray-500 dark:text-gray-400">
                {option.price}
              </span>
            </span>
            {counts[option.id] > 0 && <Count value={counts[option.id]} />}
          </button>
        );
      })}
    </div>
  );
}

export default function SystemBuilder({
  tab,
  whatsappHref,
  demos = {},
}: {
  tab: PricingTab;
  whatsappHref: string;
  demos?: SystemDemos;
}) {
  const [systemId, setSystemId] = useState(tab.bundles[0].id);
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const [phoneApp, setPhoneApp] = useState(false);
  const [addOnsOpen, setAddOnsOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [brief, setBrief] = useState('');
  const barRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const others = systemId === OTHERS ? tab.others : undefined;
  const system =
    tab.bundles.find((item) => item.id === systemId) ?? tab.bundles[0];
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

  // Spooky's button sits just above the estimate bar while the bar is low on screen.
  const hasBar = !others;
  useEffect(() => {
    const bar = barRef.current;
    if (!hasBar || !bar) return;
    const root = document.documentElement;
    let frame = 0;
    const place = () => {
      frame = 0;
      const rect = bar.getBoundingClientRect();
      const corner = window.innerWidth >= 640 ? 88 : 64;
      if (
        rect.height &&
        rect.top < window.innerHeight &&
        window.innerHeight - rect.bottom < corner
      ) {
        root.style.setProperty(
          '--spooky-lift',
          `${Math.round(window.innerHeight - rect.top + 8)}px`
        );
        root.dataset.quoteBar = '';
      } else {
        delete root.dataset.quoteBar;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    const stop = () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      delete root.dataset.quoteBar;
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        schedule();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
      } else {
        stop();
      }
    });
    observer.observe(bar);
    const resize = new ResizeObserver(schedule);
    resize.observe(bar);
    return () => {
      observer.disconnect();
      resize.disconnect();
      cancelAnimationFrame(frame);
      stop();
      root.style.removeProperty('--spooky-lift');
    };
  }, [hasBar]);

  useEffect(() => {
    if (!pickerOpen) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !barRef.current?.contains(target) &&
        !topRef.current?.contains(target)
      ) {
        setPickerOpen(false);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPickerOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [pickerOpen]);

  const options: Option[] = [
    ...tab.bundles.map((item) => ({
      id: item.id,
      name: item.name,
      label: item.shortName ?? item.name,
      price: `${item.from ? 'From ' : ''}${formatRM(item.price)}`,
    })),
    ...(tab.others
      ? [
          {
            id: OTHERS,
            name: 'Something else',
            label: 'Something else',
            price: 'Free quote',
          },
        ]
      : []),
  ];
  const current =
    options.find((option) => option.id === systemId) ?? options[0];
  const counts = Object.fromEntries(
    tab.bundles.map((item) => [
      item.id,
      (picked[item.id] ?? []).length +
        ((extraLanguages[item.id] ?? []).length ? 1 : 0),
    ])
  );
  const choose = (id: string) => setSystemId(id);
  const pickFromBar = (id: string) => {
    setSystemId(id);
    setPickerOpen(false);
  };

  // Plain features first, AI ones after, in one list.
  const addOns = [
    ...(system.addOns ?? []).filter((item) => !item.ai),
    ...(system.addOns ?? []).filter((item) => item.ai),
  ];
  const isOn = (item: AddOn) =>
    item.perLanguage ? languages.length > 0 : chosenIds.includes(item.id);

  // Ticking a feature ticks what it requires; unticking drops what needs it.
  const toggle = (item: AddOn) =>
    setPicked((state) => {
      const ids = state[system.id] ?? [];
      const needs =
        item.requires && !ids.includes(item.requires) ? [item.requires] : [];
      return {
        ...state,
        [system.id]: ids.includes(item.id)
          ? ids.filter(
              (id) =>
                id !== item.id &&
                addOns.find((other) => other.id === id)?.requires !== item.id
            )
          : [...ids, item.id, ...needs],
      };
    });
  const flip = (item: AddOn) => {
    if (item.perLanguage) {
      const first = nextLanguage([mainLanguage]);
      setLanguages(!isOn(item) && first ? [first] : []);
    } else {
      toggle(item);
    }
  };

  const lines = [
    ...(phoneApp
      ? [{ item: PHONE_APP, remove: () => setPhoneApp(false) }]
      : []),
    ...addOns.filter(isOn).map((item) =>
      item.perLanguage
        ? {
            item: languageAddOn(item, languages),
            remove: () => setLanguages([]),
          }
        : { item, remove: () => toggle(item) }
    ),
  ];
  const chosen = lines.map((line) => line.item);
  const build =
    system.price + chosen.reduce((sum, item) => sum + item.price, 0);
  const items = chosen.length + 1;

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

  const row = (
    name: string,
    description: string,
    price: string,
    on: boolean,
    onClick: () => void,
    { ai = false, phone = false } = {}
  ) => (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {phone && (
            <Smartphone
              size={14}
              aria-hidden="true"
              className="-mt-0.5 mr-1.5 inline text-gray-400"
            />
          )}
          {name}
          {ai && (
            <span className="ml-2 rounded-full bg-violet-500/10 px-1.5 py-0.5 align-[1px] text-[10px] font-bold text-violet-700 dark:text-violet-300">
              AI
            </span>
          )}
        </p>
        <p className="mt-0.5 text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100 sm:hidden">
          {price}
        </p>
        <p
          title={description}
          className={`mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400 ${on ? '' : 'truncate'}`}
        >
          {description}
        </p>
      </div>
      <span className="hidden shrink-0 text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100 sm:block">
        {price}
      </span>
      <AddButton name={name} on={on} onClick={onClick} />
    </div>
  );

  return (
    <div
      className={`grid gap-8 md:items-start md:gap-6 xl:gap-8 ${
        others
          ? 'md:grid-cols-[10.5rem_minmax(0,1fr)] xl:grid-cols-[11.5rem_minmax(0,1fr)]'
          : 'md:grid-cols-[10.5rem_minmax(0,1fr)] lg:grid-cols-[10.5rem_minmax(0,1fr)_17rem] xl:grid-cols-[11.5rem_minmax(0,1fr)_18rem]'
      }`}
    >
      <nav
        aria-label="Systems"
        className="hidden md:sticky md:top-28 md:flex md:flex-col md:gap-1"
      >
        <p className="px-3 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          Systems
        </p>
        {options.map((option) => {
          const on = option.id === systemId;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => choose(option.id)}
              className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition-colors ${FOCUS} ${
                on
                  ? 'bg-green-500/10 text-green-800 ring-1 ring-green-500/60 dark:text-green-300'
                  : 'text-gray-700 hover:bg-gray-900/5 dark:text-gray-300 dark:hover:bg-white/5'
              }`}
            >
              <SystemIcon id={option.id} size={17} />
              <span className="min-w-0 flex-1">{option.label}</span>
              {counts[option.id] > 0 && <Count value={counts[option.id]} />}
            </button>
          );
        })}
      </nav>

      <div className="min-w-0">
        {others && (
          <div ref={topRef} className="mb-4 md:hidden">
            <button
              type="button"
              aria-expanded={pickerOpen}
              aria-controls="top-systems"
              onClick={() => setPickerOpen(!pickerOpen)}
              className={`flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white/70 p-3 pl-4 text-left dark:border-gray-700 dark:bg-gray-800/70 ${FOCUS}`}
            >
              <span className="text-green-600 dark:text-green-400">
                <SystemIcon id={current.id} size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  System
                </span>
                <span className="block truncate text-sm font-bold text-gray-900 dark:text-gray-100">
                  {current.name}
                </span>
              </span>
              <span className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full border border-gray-300 px-3.5 text-xs font-bold text-gray-900 dark:border-gray-500 dark:text-gray-100">
                Change
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${pickerOpen ? 'rotate-180' : ''}`}
                />
              </span>
            </button>
            {pickerOpen && (
              <div className="mt-2">
                <SystemGrid
                  id="top-systems"
                  options={options}
                  selected={systemId}
                  counts={counts}
                  onPick={pickFromBar}
                />
              </div>
            )}
          </div>
        )}

        {others ? (
          <div className={`${CARD} max-w-3xl p-5 sm:p-6`}>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {others.summary}
            </p>
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
          </div>
        ) : (
          <>
            <div className={`${CARD} p-4 sm:p-5`}>
              <SystemStage
                id={system.id}
                phone={phoneApp}
                features={addOns.filter(isOn).map((item) => item.name)}
              />
              <div className="mt-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                    {system.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {system.summary}
                  </p>
                </div>
                <p className="shrink-0 text-right">
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {system.from ? 'From' : 'Base price'}
                  </span>
                  <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                    {formatRM(system.price)}
                  </span>
                </p>
              </div>
              <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
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
              {demos[system.id] && (
                <a
                  href={demos[system.id].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 dark:text-green-400"
                >
                  <PlayCircle size={16} aria-hidden="true" />
                  Try a live {system.name.toLowerCase()}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              )}
            </div>

            <section className="mt-6">
              <h3>
                <button
                  type="button"
                  aria-expanded={addOnsOpen}
                  aria-controls="system-add-ons"
                  onClick={() => setAddOnsOpen(!addOnsOpen)}
                  className="flex min-h-16 w-full items-center gap-3 border-b border-gray-200 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 dark:border-gray-700"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold text-gray-900 dark:text-gray-100">
                      Add to your system
                    </span>
                    <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                      Optional, {addOns.length + 1} to choose from
                    </span>
                  </span>
                  {lines.length > 0 && (
                    <span className="shrink-0 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-800 dark:text-green-300">
                      {lines.length} added
                    </span>
                  )}
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className={`shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${addOnsOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </h3>
              <div id="system-add-ons" hidden={!addOnsOpen}>
                <ul className="divide-y divide-gray-200 border-b border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                  <li className="py-3">
                    {row(
                      PHONE_APP.name,
                      phoneApp
                        ? `On the App Store and Google Play. ${PHONE_APP.description}`
                        : 'On the App Store and Google Play. Without it, it still works on phones and installs like an app.',
                      `+${formatRM(PHONE_APP.price)}`,
                      phoneApp,
                      () => setPhoneApp(!phoneApp),
                      { phone: true }
                    )}
                  </li>
                  {addOns.map((item) => {
                    const on = isOn(item);
                    return (
                      <li key={item.id} className="py-3">
                        {row(
                          item.name,
                          item.description,
                          `+${formatRM(item.price)}${item.perLanguage ? ' each' : ''}`,
                          on,
                          () => flip(item),
                          { ai: item.ai }
                        )}
                        {item.perLanguage && on && (
                          <div className="mt-3">
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
                {addOns.some((item) => item.ai) && (
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {AI_USAGE_FEES}.
                  </p>
                )}
                <MainLanguage
                  value={mainLanguage}
                  onChange={pickMain}
                  className="mt-5"
                />
              </div>
            </section>
          </>
        )}
      </div>

      {!others && (
        <>
          <aside
            aria-label="Your estimate"
            className={`${CARD} hidden p-5 lg:sticky lg:top-28 lg:block`}
          >
            <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100">
              <ShoppingCart size={18} aria-hidden="true" />
              Your estimate
              <Count value={items} className="ml-auto" />
            </h3>
            <ul className="mt-3 divide-y divide-gray-200 border-y border-gray-200 text-sm dark:divide-gray-700 dark:border-gray-700">
              <li className="flex items-center gap-3 py-2.5">
                <span className="min-w-0 flex-1 text-gray-600 dark:text-gray-300">
                  {system.name}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                  {formatRM(system.price)}
                </span>
                <span className="w-6 shrink-0" />
              </li>
              {lines.map(({ item, remove }) => (
                <li key={item.id} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1 text-gray-600 dark:text-gray-300">
                    {item.name}
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                    {formatRM(item.price)}
                  </span>
                  <button
                    type="button"
                    onClick={remove}
                    aria-label={`Remove ${item.name}`}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-400 ring-1 ring-gray-300 transition-colors hover:text-gray-900 dark:ring-gray-600 dark:hover:text-white ${FOCUS}`}
                  >
                    <X size={12} strokeWidth={2.5} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-baseline justify-between gap-4">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Total
              </span>
              <span
                aria-live="polite"
                className="text-3xl font-black tracking-tight text-gray-900 dark:text-white"
              >
                {formatRM(build)}
              </span>
            </p>
            <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              The final price is confirmed after we talk.
            </p>
            <div className="mt-5">{quote()}</div>
          </aside>

          <div
            ref={barRef}
            className="sticky bottom-3 z-30 -mt-4 min-w-0 rounded-2xl border border-gray-200 bg-white/95 p-3 pl-4 shadow-2xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/95 md:col-span-2 lg:hidden"
          >
            {pickerOpen && (
              <div className="mb-3 border-b border-gray-200 pb-3 dark:border-gray-700 md:hidden">
                <SystemGrid
                  id="bar-systems"
                  options={options}
                  selected={systemId}
                  counts={counts}
                  onPick={pickFromBar}
                />
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative text-gray-700 dark:text-gray-200">
                  <ShoppingCart size={22} aria-hidden="true" />
                  <Count
                    value={items}
                    className="absolute -right-2.5 -top-2.5"
                  />
                </span>
                <div className="min-w-0">
                  <button
                    type="button"
                    aria-expanded={pickerOpen}
                    aria-controls="bar-systems"
                    aria-label={`System: ${current.name}. Change system`}
                    onClick={() => setPickerOpen(!pickerOpen)}
                    className="-mx-1.5 -my-2 flex max-w-full items-center gap-1 rounded-lg px-1.5 py-2 text-xs font-bold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 dark:text-gray-200 md:hidden"
                  >
                    <span className="truncate">{current.label}</span>
                    <ChevronDown
                      size={14}
                      aria-hidden="true"
                      className={`shrink-0 text-green-600 transition-transform duration-200 dark:text-green-400 ${pickerOpen ? '' : 'rotate-180'}`}
                    />
                  </button>
                  <p className="hidden text-xs text-gray-500 dark:text-gray-400 md:block">
                    Estimated build
                  </p>
                  <p className="truncate text-xl font-black tracking-tight text-gray-900 dark:text-white">
                    {formatRM(build)}
                  </p>
                </div>
              </div>
              {quote('!w-auto shrink-0')}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

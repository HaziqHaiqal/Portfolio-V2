'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  Check,
  ChevronDown,
  Globe,
  LayoutTemplate,
  Smartphone,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { SERVICES_ANCHOR_ID } from '@components/Promo/DealList';
import { useServicePick } from './servicePick';

const ICONS: Record<ServiceTab['icon'], LucideIcon> = {
  templates: LayoutTemplate,
  web: Globe,
  mobile: Smartphone,
  automation: Workflow,
};

export interface ServiceTab {
  id: string;
  label: string;
  /** A few words on what it is. */
  tagline: string;
  price: string;
  icon: 'templates' | 'web' | 'mobile' | 'automation';
  panel: ReactNode;
}

const GLOW_FRAME =
  'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-400 shadow-[0_18px_48px_-22px_rgba(16,185,129,0.75)]';
const IDLE_FRAME =
  'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700/80 dark:hover:bg-gray-600';
const FACE = 'rounded-[15px] bg-white dark:bg-gray-800';

function IconBox({
  icon,
  active,
  small = false,
}: {
  icon: ServiceTab['icon'];
  active: boolean;
  small?: boolean;
}) {
  const Icon = ICONS[icon];
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl transition-colors ${
        small ? 'h-9 w-9' : 'h-10 w-10'
      } ${
        active
          ? 'bg-green-500/15 text-green-600 dark:text-green-400'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-900/70 dark:text-gray-300'
      }`}
    >
      <Icon size={small ? 17 : 19} strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}

function Price({ text, active }: { text: string; active: boolean }) {
  return (
    <span
      className={`text-sm font-semibold ${
        active
          ? 'text-green-700 dark:text-green-400'
          : 'text-gray-900 dark:text-gray-100'
      }`}
    >
      {text}
    </span>
  );
}

function ServicePicker({
  tabs,
  activeId,
  onSelect,
}: {
  tabs: ServiceTab[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative lg:hidden">
      <div className={`rounded-2xl p-px ${GLOW_FRAME}`}>
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls="service-picker-list"
          onClick={() => setOpen((value) => !value)}
          className={`flex w-full items-center gap-3 p-3.5 text-left text-gray-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30 dark:text-gray-100 ${FACE}`}
        >
          <IconBox icon={active.icon} active />
          <span className="min-w-0 flex-1">
            <span className="sr-only">Service: </span>
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-bold">{active.label}</span>
              <Price text={active.price} active />
            </span>
            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
              {active.tagline}
            </span>
          </span>
          <ChevronDown
            size={20}
            aria-hidden="true"
            className={`shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {open && (
        <ul
          id="service-picker-list"
          className="absolute inset-x-0 top-full z-20 mt-2 space-y-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
        >
          {tabs.map((tab) => {
            const selected = tab.id === activeId;
            return (
              <li key={tab.id}>
                <button
                  type="button"
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => {
                    onSelect(tab.id);
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 ${
                    selected
                      ? 'bg-green-500/[0.08]'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                  }`}
                >
                  <IconBox icon={tab.icon} active={selected} small />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {tab.label}
                      </span>
                      <Price text={tab.price} active={selected} />
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                      {tab.tagline}
                    </span>
                  </span>
                  <Check
                    size={16}
                    aria-hidden="true"
                    className={`shrink-0 text-green-600 dark:text-green-400 ${
                      selected ? '' : 'invisible'
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function ServiceTabs({ tabs }: { tabs: ServiceTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      useServicePick.subscribe(({ pick }) => {
        if (!pick || !tabs.some((tab) => tab.id === pick.tab)) return;
        setActiveId(pick.tab);
        rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }),
    [tabs]
  );

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.id === activeId);
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(index + step + tabs.length) % tabs.length];
    setActiveId(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div ref={rootRef} id={SERVICES_ANCHOR_ID} className="scroll-mt-28">
      <ServicePicker tabs={tabs} activeId={activeId} onSelect={setActiveId} />

      <div
        role="tablist"
        aria-label="Services"
        className="mx-auto hidden max-w-5xl grid-cols-4 gap-4 lg:grid"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[tab.id] = node;
              }}
              id={`service-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`service-panel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={onKeyDown}
              className={`group rounded-2xl p-px text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30 ${
                active ? GLOW_FRAME : `${IDLE_FRAME} hover:-translate-y-0.5`
              }`}
            >
              <span className={`flex h-full flex-col p-5 ${FACE}`}>
                <span className="flex items-center gap-3">
                  <IconBox icon={tab.icon} active={active} />
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {tab.label}
                  </span>
                </span>
                <span className="mt-3 flex-1 text-sm leading-snug text-gray-500 dark:text-gray-400">
                  {tab.tagline}
                </span>
                <span className="mt-4">
                  <Price text={tab.price} active={active} />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`service-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`service-tab-${tab.id}`}
          hidden={tab.id !== activeId}
          className="mt-10 md:mt-12"
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}

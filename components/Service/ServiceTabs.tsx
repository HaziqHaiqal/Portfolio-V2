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
  price: string;
  icon: 'templates' | 'web' | 'mobile' | 'automation';
  panel: ReactNode;
}

function IconBox({
  icon,
  active,
}: {
  icon: ServiceTab['icon'];
  active: boolean;
}) {
  const Icon = ICONS[icon];
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        active
          ? 'bg-white/15 dark:bg-gray-900/10'
          : 'bg-gray-100 dark:bg-gray-900/60'
      }`}
    >
      <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
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
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="service-picker-list"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white/70 p-3 text-left text-gray-900 backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-100"
      >
        <IconBox icon={active.icon} active={false} />
        <span className="min-w-0 flex-1">
          <span className="sr-only">Service: </span>
          <span className="block font-bold">{active.label}</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            {active.price}
          </span>
        </span>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className={`mr-1 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <ul
          id="service-picker-list"
          className="absolute inset-x-0 top-full z-20 mt-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-800"
        >
          {tabs.map((tab) => {
            const Icon = ICONS[tab.icon];
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
                  className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 ${
                    selected
                      ? 'bg-gray-100 dark:bg-gray-700/60'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="shrink-0 text-gray-400 dark:text-gray-500"
                  />
                  <span className="flex-1 font-semibold text-gray-900 dark:text-gray-100">
                    {tab.label}
                  </span>
                  <span className="whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {tab.price}
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
        className="mx-auto hidden max-w-4xl grid-cols-4 gap-3 lg:grid"
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
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left backdrop-blur-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 ${
                active
                  ? 'border-gray-900 bg-gray-900 text-white shadow-xl dark:border-white dark:bg-white dark:text-gray-900'
                  : 'border-gray-200 bg-white/70 text-gray-900 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-100 dark:hover:border-gray-600'
              }`}
            >
              <IconBox icon={tab.icon} active={active} />
              <span className="min-w-0">
                <span className="block truncate font-bold">{tab.label}</span>
                <span
                  className={`block truncate text-xs ${
                    active
                      ? 'text-white/70 dark:text-gray-600'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab.price}
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

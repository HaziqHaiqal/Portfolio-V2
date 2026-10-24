'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { HANDOFF, takeHandoff } from '@lib/handoff';
import { useServicePick, type ServicePick } from './servicePick';

export interface ServiceTab {
  id: string;
  label: string;
  /** A shorter name for phones, such as "Apps". */
  shortLabel?: string;
  /** A few words on what it is. */
  tagline: string;
  price: string;
  panel: ReactNode;
}

export default function ServiceTabs({ tabs }: { tabs: ServiceTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(
    null
  );
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  useEffect(
    () =>
      useServicePick.subscribe(({ pick }) => {
        if (!pick || !tabs.some((tab) => tab.id === pick.tab)) return;
        setActiveId(pick.tab);
        rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }),
    [tabs]
  );

  // A demo page's "See prices" arrives as a pick.
  useEffect(() => {
    const raw = takeHandoff(HANDOFF.servicePick);
    if (!raw) return;
    let pick: ServicePick;
    try {
      pick = JSON.parse(raw);
    } catch {
      return;
    }
    const frame = requestAnimationFrame(() =>
      useServicePick.getState().choose(pick)
    );
    return () => cancelAnimationFrame(frame);
  }, []);

  // The green pill slides behind the chosen service.
  useEffect(() => {
    const button = tabRefs.current[activeId];
    if (!button) return;
    const measure = () =>
      setPill({ left: button.offsetLeft, width: button.offsetWidth });
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    if (button.parentElement) observer.observe(button.parentElement);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [activeId]);

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
    <div ref={rootRef} className="scroll-mt-28">
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Services"
          className="relative flex w-full rounded-full border border-gray-200 bg-white/70 p-1.5 shadow-sm backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/70 sm:w-auto"
        >
          {pill && (
            <span
              aria-hidden="true"
              style={{ left: pill.left, width: pill.width }}
              className="absolute inset-y-1.5 rounded-full bg-green-600 shadow-lg shadow-green-600/25 transition-[left,width] duration-300 ease-out motion-reduce:transition-none"
            />
          )}
          {tabs.map((tab) => {
            const selected = tab.id === activeId;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[tab.id] = node;
                }}
                id={`service-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`service-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveId(tab.id)}
                onKeyDown={onKeyDown}
                className={`relative min-h-11 flex-auto whitespace-nowrap rounded-full px-2.5 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 sm:px-6 sm:text-sm ${
                  selected
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {tab.shortLabel ? (
                  <>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </>
                ) : (
                  tab.label
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p
        key={active.id}
        className="mt-4 animate-[tpl-rise_350ms_ease-out] text-balance text-center text-sm text-gray-500 motion-reduce:animate-none dark:text-gray-400"
      >
        <span className="font-semibold text-green-700 dark:text-green-400">
          {active.price}
        </span>{' '}
        · {active.tagline}
      </p>

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

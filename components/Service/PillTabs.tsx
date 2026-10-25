'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

export interface PillTab {
  id: string;
  label: string;
  shortLabel?: string;
  badge?: string;
}

export default function PillTabs({
  tabs,
  activeId,
  onChange,
  label,
  idPrefix,
}: {
  tabs: PillTab[];
  activeId: string;
  onChange: (id: string) => void;
  label: string;
  idPrefix: string;
}) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState<{ left: number; width: number } | null>(
    null
  );

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
    onChange(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div className="flex justify-center">
      <div
        role="tablist"
        aria-label={label}
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
              id={`${idPrefix}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${idPrefix}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={onKeyDown}
              className={`relative inline-flex min-h-11 flex-auto items-center justify-center gap-2 whitespace-nowrap rounded-full px-2 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 sm:px-4 md:px-5 md:text-sm ${
                selected
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {tab.shortLabel ? (
                <>
                  <span className="md:hidden">{tab.shortLabel}</span>
                  <span className="hidden md:inline">{tab.label}</span>
                </>
              ) : (
                tab.label
              )}
              {tab.badge && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
                    selected
                      ? 'bg-white/20 text-white'
                      : 'bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

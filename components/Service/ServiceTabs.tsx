'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { HANDOFF, takeHandoff } from '@lib/handoff';
import { useServicePick, type ServicePick } from './servicePick';
import PillTabs from './PillTabs';

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

export default function ServiceTabs({
  tabs,
  assurances = [],
}: {
  tabs: ServiceTab[];
  assurances?: string[];
}) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const rootRef = useRef<HTMLDivElement>(null);
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

  return (
    <div ref={rootRef} className="scroll-mt-28">
      <PillTabs
        tabs={tabs}
        activeId={active.id}
        onChange={setActiveId}
        label="Services"
        idPrefix="service"
      />

      <p
        key={active.id}
        className="mt-4 animate-[tpl-rise_350ms_ease-out] text-balance text-center text-sm text-gray-500 motion-reduce:animate-none dark:text-gray-400"
      >
        <span className="font-semibold text-green-700 dark:text-green-400">
          {active.price}
        </span>{' '}
        · {active.tagline}
      </p>
      {assurances.length > 0 && (
        <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
          {assurances.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <Check
                size={13}
                aria-hidden="true"
                className="text-green-600 dark:text-green-400"
              />
              {item}
            </li>
          ))}
        </ul>
      )}

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

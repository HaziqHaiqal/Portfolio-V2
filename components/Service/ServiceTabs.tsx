'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { SERVICES_ANCHOR_ID } from '@components/Promo/DealList';
import { useServicePick } from './servicePick';

export interface ServiceTab {
  id: string;
  label: string;
  /** A few words on what it is. */
  tagline: string;
  price: string;
  panel: ReactNode;
}

const number = (index: number) => String(index + 1).padStart(2, '0');

const FADE = '40px';

/** Which sides of the phone row have tabs scrolled out of view. */
const hiddenSides = (scroller: HTMLElement) => ({
  start: scroller.scrollLeft > 1,
  end: scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1,
});

export default function ServiceTabs({ tabs }: { tabs: ServiceTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const labelRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [fade, setFade] = useState({ start: false, end: false });
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

  // The underline slides to the active name; on phones the row scrolls to it.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const list = listRef.current;
    const label = labelRefs.current[activeId];
    if (!scroller || !list || !label) return;
    const measure = () => {
      setUnderline({ left: label.offsetLeft, width: label.offsetWidth });
      setFade(hiddenSides(scroller));
    };
    const frame = requestAnimationFrame(measure);
    scroller.scrollTo({
      left: label.offsetLeft - (scroller.clientWidth - label.offsetWidth) / 2,
      behavior: 'smooth',
    });
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    observer.observe(label);
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

  const onScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const next = hiddenSides(scroller);
    setFade((prev) =>
      prev.start === next.start && prev.end === next.end ? prev : next
    );
  };

  return (
    <div ref={rootRef} id={SERVICES_ANCHOR_ID} className="scroll-mt-28">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        style={
          {
            '--fade-start': fade.start ? FADE : '0px',
            '--fade-end': fade.end ? FADE : '0px',
          } as CSSProperties
        }
        className="overflow-x-auto shadow-[inset_0_-1px_0_theme(colors.gray.200)] [mask-image:linear-gradient(to_right,transparent,#000_var(--fade-start),#000_calc(100%_-_var(--fade-end)),transparent)] [scrollbar-width:none] dark:shadow-[inset_0_-1px_0_rgb(55_65_81/0.7)] lg:overflow-visible lg:[mask-image:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          ref={listRef}
          role="tablist"
          aria-label="Services"
          className="relative flex w-max gap-6 lg:grid lg:w-auto lg:grid-cols-4"
        >
          {tabs.map((tab, index) => {
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
                className="group shrink-0 rounded-md pb-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500/40 lg:pb-5"
              >
                <span className="hidden font-mono text-xs text-gray-400 dark:text-gray-500 lg:block">
                  {number(index)}
                </span>
                <span
                  ref={(node) => {
                    labelRefs.current[tab.id] = node;
                  }}
                  className={`block w-fit text-xl font-bold tracking-tight transition-colors duration-200 lg:mt-1 lg:text-3xl ${
                    selected
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </span>
                <span
                  className={`mt-1.5 hidden text-sm transition-colors duration-200 lg:block ${
                    selected
                      ? 'font-medium text-green-700 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {tab.price}
                </span>
              </button>
            );
          })}
          {underline && (
            <span
              aria-hidden="true"
              style={{ left: underline.left, width: underline.width }}
              className="absolute bottom-0 h-0.5 rounded-full bg-green-500 transition-[left,width] duration-300 ease-out"
            />
          )}
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 lg:hidden">
        <span className="font-medium text-green-700 dark:text-green-400">
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

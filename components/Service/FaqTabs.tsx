'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import { Plus } from 'lucide-react';

export interface FaqItem {
  id?: string;
  question: string;
  answer: ReactNode;
}

export interface FaqGroup {
  id: string;
  label: string;
  items: FaqItem[];
}

const OPEN_EVENT = 'faq:open';

/** Switches to the question's topic, opens it and scrolls to it. */
export function openFaq(id: string) {
  window.dispatchEvent(new CustomEvent<string>(OPEN_EVENT, { detail: id }));
}

export default function FaqTabs({ groups }: { groups: FaqGroup[] }) {
  const [activeId, setActiveId] = useState(groups[0]?.id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const onOpen = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      const group = groups.find((item) =>
        item.items.some((faq) => faq.id === id)
      );
      if (!group) return;
      flushSync(() => setActiveId(group.id));
      const target = document.getElementById(id);
      if (target instanceof HTMLDetailsElement) target.open = true;
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [groups]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const index = groups.findIndex((group) => group.id === activeId);
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = groups[(index + step + groups.length) % groups.length];
    setActiveId(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Questions by topic"
        className="mb-6 flex flex-wrap justify-center gap-1.5 sm:gap-2"
      >
        {groups.map((group) => {
          const active = group.id === activeId;
          return (
            <button
              key={group.id}
              ref={(node) => {
                tabRefs.current[group.id] = node;
              }}
              id={`faq-tab-${group.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`faq-panel-${group.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setActiveId(group.id)}
              onKeyDown={onKeyDown}
              className={`min-h-10 rounded-full border px-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 sm:px-4 ${
                active
                  ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                  : 'border-gray-300 bg-white/60 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-300'
              }`}
            >
              {group.label}
            </button>
          );
        })}
      </div>

      {groups.map((group) => (
        <div
          key={group.id}
          id={`faq-panel-${group.id}`}
          role="tabpanel"
          aria-labelledby={`faq-tab-${group.id}`}
          hidden={group.id !== activeId}
          className="divide-y divide-gray-200 rounded-3xl border border-gray-200 bg-white/70 px-6 shadow-xl backdrop-blur-sm dark:divide-gray-700/70 dark:border-gray-700 dark:bg-gray-800/70 sm:px-8"
        >
          {group.items.map((faq) => (
            <details
              key={faq.question}
              id={faq.id}
              className="group scroll-mt-28"
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500/40 dark:text-gray-100 [&::-webkit-details-marker]:hidden">
                {faq.question}
                <Plus
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-45 group-open:text-green-600 dark:group-open:text-green-400"
                />
              </summary>
              <div className="pb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-[15px]">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      ))}
    </div>
  );
}

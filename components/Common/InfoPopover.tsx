'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Check, Info } from 'lucide-react';
import { cn } from '@lib/utils';

interface InfoPopoverProps {
  label: string;
  heading: string;
  items: string[];
  note?: string;
}

export default function InfoPopover({
  label,
  heading,
  items,
  note,
}: InfoPopoverProps) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [below, setBelow] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const open = hovered || pinned;

  useEffect(() => {
    if (!pinned) return;
    const onPointerDown = (e: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPinned(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPinned(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [pinned]);

  const place = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) setBelow(rect.top < window.innerHeight / 2);
  };

  // Touch screens fire emulated hover events on tap; only a real mouse hovers.
  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    place();
    setHovered(true);
  };
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setHovered(false);
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          place();
          setPinned((p) => !p);
        }}
        className="flex min-h-11 items-center gap-2 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        <Info size={16} aria-hidden="true" />
        {label}
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            id={panelId}
            initial={{ opacity: 0, y: below ? -6 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: below ? -6 : 6 }}
            transition={{ duration: 0.16 }}
            className={cn(
              'absolute left-0 right-0 z-20 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-gray-900',
              below ? 'top-full mt-1' : 'bottom-full mb-1'
            )}
          >
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
              {heading}
            </p>
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm leading-snug text-gray-700 dark:text-gray-300"
                >
                  <Check
                    size={15}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  {item}
                </li>
              ))}
            </ul>
            {note && (
              <p className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
                {note}
              </p>
            )}
            <span
              aria-hidden="true"
              className={cn(
                'absolute left-1 h-3 w-3 rotate-45 border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900',
                below
                  ? '-top-1.5 border-l border-t'
                  : '-bottom-1.5 border-b border-r'
              )}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { CircleHelp } from 'lucide-react';

interface InfoPopoverProps {
  label: string;
  heading: string;
  items: string[];
  note?: string;
}

/** Needs a `relative` parent: the panel spans the nearest positioned ancestor. */
export default function InfoPopover({
  label,
  heading,
  items,
  note,
}: InfoPopoverProps) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
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

  // Touch screens fire emulated hover events on tap; only a real mouse hovers.
  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setHovered(true);
  };
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setHovered(false);
  };

  return (
    <span
      ref={rootRef}
      className="ml-1 inline-flex align-middle"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setPinned((p) => !p)}
        className="-my-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 aria-expanded:text-green-600 dark:text-gray-500 dark:hover:text-green-400 dark:aria-expanded:text-green-400"
      >
        <CircleHelp size={16} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <m.span
            id={panelId}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="absolute inset-x-0 top-full z-20 mt-2 block rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-xl dark:border-gray-700 dark:bg-gray-900"
          >
            <span className="block text-sm font-bold text-gray-900 dark:text-gray-100">
              {heading}
            </span>
            <span role="list" className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {items.map((item) => (
                <span
                  key={item}
                  role="listitem"
                  className="text-[13px] leading-snug text-gray-700 dark:text-gray-300"
                >
                  {item}
                </span>
              ))}
            </span>
            {note && (
              <span className="mt-3 block border-t border-gray-200 pt-3 text-xs leading-relaxed text-gray-500 dark:border-gray-700 dark:text-gray-400">
                {note}
              </span>
            )}
          </m.span>
        )}
      </AnimatePresence>
    </span>
  );
}

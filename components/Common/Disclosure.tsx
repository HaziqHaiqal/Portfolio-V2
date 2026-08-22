'use client';

import { useState, type ReactNode } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface DisclosureProps {
  showLabel: string;
  hideLabel: string;
  children: ReactNode;
  className?: string;
}

export default function Disclosure({
  showLabel,
  hideLabel,
  children,
  className = '',
}: DisclosureProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 font-mono text-sm text-gray-600 transition-colors hover:border-gray-400 dark:border-white/15 dark:text-gray-400 dark:hover:border-white/30"
      >
        {open ? hideLabel : showLabel}
        <ChevronDown
          size={15}
          className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <m.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.25, ease: 'linear' },
            }}
            className="overflow-hidden"
          >
            {children}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

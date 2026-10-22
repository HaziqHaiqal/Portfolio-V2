'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { themeClasses } from '@constants/theme';

/** Two-column order modal: details on the left, the order on the right. */
export default function OrderDialog({
  titleId,
  title,
  onClose,
  details,
  order,
  bar,
}: {
  titleId: string;
  title: string;
  onClose: () => void;
  details: ReactNode;
  order: ReactNode;
  /** Pinned under the content on phones, where the order column comes last. */
  bar: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && ref.current.close()}
      aria-labelledby={titleId}
      className={`m-auto h-[92dvh] w-[min(96vw,60rem)] flex-col overflow-hidden rounded-3xl border p-0 text-gray-900 shadow-2xl backdrop:bg-gray-950/60 backdrop:backdrop-blur-sm open:flex dark:text-gray-100 md:h-[min(88dvh,47rem)] ${themeClasses.modal}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 py-3 pl-5 pr-3 dark:border-gray-700 sm:pl-6">
        <h3 id={titleId} className="truncate text-base font-bold">
          {title}
        </h3>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Close"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain md:grid md:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="p-5 sm:p-6">{details}</div>
        <aside className="border-t border-gray-200 bg-gray-50/70 dark:border-gray-700 dark:bg-gray-900/30 md:border-l md:border-t-0">
          <div className="p-5 sm:p-6 md:sticky md:top-0">{order}</div>
        </aside>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700 md:hidden">
        {bar}
      </div>
    </dialog>
  );
}

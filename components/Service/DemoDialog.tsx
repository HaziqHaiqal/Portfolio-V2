'use client';

import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { X } from 'lucide-react';

/** Clicking an element marked `data-dismiss` (the empty areas) closes it. */
export default function DemoDialog({
  title,
  onClose,
  action,
  children,
}: {
  title: string;
  onClose: () => void;
  action?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    ref.current?.showModal();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const dismiss = (event: MouseEvent) => {
    if ((event.target as HTMLElement).dataset.dismiss !== undefined)
      ref.current?.close();
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={dismiss}
      aria-labelledby={titleId}
      data-dismiss=""
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto overscroll-contain border-0 bg-transparent p-0 text-white backdrop:bg-gray-950/80 backdrop:backdrop-blur-md open:flex"
    >
      <button
        type="button"
        onClick={() => ref.current?.close()}
        aria-label="Close"
        className="fixed right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gray-950/70 text-white shadow-lg ring-1 ring-white/15 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:right-5 sm:top-5"
      >
        <X size={22} />
      </button>

      <div
        data-dismiss=""
        className="m-auto w-full max-w-5xl px-4 pb-8 pt-16 sm:px-6 sm:py-12"
      >
        <h3 id={titleId} className="text-xl font-bold sm:text-2xl">
          {title}
        </h3>
        <p className="mt-1 text-sm text-white/70">
          Simulated. Nothing is sent.
        </p>

        <div data-dismiss="" className="mt-6 text-[#111]">
          {children}
        </div>

        {action && (
          <div data-dismiss="" className="mt-8 flex justify-center">
            <div className="w-full max-w-xs">{action}</div>
          </div>
        )}
      </div>
    </dialog>
  );
}

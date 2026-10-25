'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Phone, X } from 'lucide-react';

export default function CallButton({
  phone,
  className,
  children,
}: {
  phone: string;
  className: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <Phone size={16} aria-hidden="true" />
        {children}
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(event) => event.target === ref.current && setOpen(false)}
        className="w-[min(92vw,24rem)] rounded-3xl bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-neutral-950/50 backdrop:backdrop-blur-sm"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white">
                <Phone size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="font-sans text-sm font-semibold">Call to order</p>
                <p className="font-sans text-xs text-neutral-500">
                  On your site, this rings your number.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="-m-2 flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100"
            >
              <X size={18} />
            </button>
          </div>
          <p className="mt-5 font-sans text-3xl font-semibold tabular-nums tracking-tight">
            {phone}
          </p>
          <p className="mt-1 font-sans text-xs text-neutral-500">
            Nothing is dialled in the demo.
          </p>
        </div>
      </dialog>
    </>
  );
}

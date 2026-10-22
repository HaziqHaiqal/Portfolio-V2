'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

/** Demo stand-in for the WhatsApp hand-off: shows the message a customer would send. */
export default function OrderPreview({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      className="w-[min(92vw,26rem)] rounded-3xl bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-neutral-950/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white">
              <SiWhatsapp size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="font-sans text-sm font-semibold">
                WhatsApp order preview
              </p>
              <p className="font-sans text-xs text-neutral-500">
                On your site, this opens WhatsApp to your number.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="-m-2 flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 rounded-2xl bg-[#E7FFDB] p-4 font-sans text-sm leading-relaxed text-neutral-800 shadow-inner">
          <pre className="whitespace-pre-wrap font-sans">{message}</pre>
        </div>
      </div>
    </dialog>
  );
}

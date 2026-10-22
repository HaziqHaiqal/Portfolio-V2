'use client';

import { useState, type ReactNode } from 'react';
import { SiWhatsapp } from 'react-icons/si';
import OrderPreview from './OrderPreview';

export default function WhatsAppButton({
  message,
  className,
  children,
}: {
  message: string;
  className: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <SiWhatsapp size={16} aria-hidden="true" />
        {children}
      </button>
      <OrderPreview
        open={open}
        message={message}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

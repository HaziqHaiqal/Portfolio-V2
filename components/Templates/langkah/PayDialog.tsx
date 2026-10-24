'use client';

import { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { PAY_METHODS, rm } from './data';
import type { Order } from './store';

/**
 * A stand-in for the payment gateway. It never asks for real bank or card
 * details: the visitor approves or declines to see both outcomes.
 */
export default function PayDialog({
  order,
  onApprove,
  onDecline,
  onClose,
}: {
  order: Order;
  onApprove: () => void;
  onDecline: (reason: string) => void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const method = PAY_METHODS.find((item) => item.id === order.details.method);

  const finish = (approve: boolean) => {
    setBusy(true);
    setTimeout(() => {
      if (approve) onApprove();
      else onDecline('Your bank declined the payment.');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pay-title"
        className="w-full max-w-md rounded-t-[28px] bg-white p-6 text-black shadow-2xl sm:rounded-[28px]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-black/50">
              <Lock size={12} aria-hidden="true" />
              DemoPay · test mode
            </p>
            <h2 id="pay-title" className="mt-1 text-xl font-extrabold">
              Pay {rm(order.total)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Cancel payment"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5"
          >
            <X size={18} />
          </button>
        </div>
        <dl className="mt-5 space-y-2 rounded-2xl bg-black/[0.04] p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-black/50">Merchant</dt>
            <dd className="font-semibold">Langkah</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-black/50">Order</dt>
            <dd className="font-semibold">{order.id}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-black/50">Method</dt>
            <dd className="font-semibold">{method?.name}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-black/50">
          This is a demo: no money moves. Approve or decline to see what your
          customer would see.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => finish(false)}
            className="h-12 rounded-full border border-black/15 text-sm font-bold disabled:opacity-40"
          >
            Decline
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => finish(true)}
            className="h-12 rounded-full bg-black text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? 'Waiting for the bank…' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}

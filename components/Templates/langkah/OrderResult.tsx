'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { BASE_PATH, colourway, DELIVERY, rm } from './data';
import PayDialog from './PayDialog';
import { useHydrated, useStore } from './store';
import { BUTTON_ACCENT, BUTTON_GHOST, CONTAINER, DISPLAY } from './ui';

export default function OrderResult() {
  const hydrated = useHydrated();
  const [id, setId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const order = useStore((state) =>
    state.orders.find((item) => item.id === id)
  );
  const retry = useStore((state) => state.retry);
  const markPaid = useStore((state) => state.markPaid);
  const markFailed = useStore((state) => state.markFailed);

  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setId(new URLSearchParams(window.location.search).get('id'))
    );
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!hydrated || !id) return <div className="min-h-[60vh]" />;
  if (!order)
    return (
      <div className={`${CONTAINER} py-24 text-center`}>
        <h1 className={`${DISPLAY} text-5xl`}>Order not found</h1>
        <Link href={`${BASE_PATH}/shop`} className={`${BUTTON_ACCENT} mt-8`}>
          Back to the shop
        </Link>
      </div>
    );

  const paid = order.status === 'paid';
  const delivery = DELIVERY.find(
    (item) => item.id === order.details.deliveryId
  );

  return (
    <div className={`${CONTAINER} max-w-3xl pb-24 pt-12`}>
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          paid ? 'bg-tpl-accent text-tpl-on-accent' : 'bg-red-500 text-white'
        }`}
      >
        {paid ? (
          <Check size={28} aria-hidden="true" />
        ) : (
          <X size={28} aria-hidden="true" />
        )}
      </span>
      <h1
        className={`${DISPLAY} mt-6 text-[clamp(2.6rem,7vw,5rem)] leading-[0.9]`}
      >
        {paid ? 'Paid. Lace up.' : 'Payment didn’t go through'}
      </h1>
      <p className="mt-3 text-tpl-muted">
        {paid
          ? `Order ${order.id} is confirmed. A receipt is on its way to ${order.details.email}.`
          : `${order.reason ?? 'The payment was not completed.'} Your bag is saved, so you can try again.`}
      </p>

      {!paid && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              retry(order.id);
              setPaying(true);
            }}
            className={BUTTON_ACCENT}
          >
            Pay again
          </button>
          <Link href={`${BASE_PATH}/checkout`} className={BUTTON_GHOST}>
            Change payment method
          </Link>
        </div>
      )}

      <div className="mt-10 rounded-[28px] bg-tpl-surface p-5">
        <ul className="space-y-3">
          {order.lines.map((line) => (
            <li key={line.key} className="flex items-center gap-3">
              <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-[14px] bg-white">
                <Image
                  src={colourway(line.colour).image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{line.name}</span>
                <span className="block text-xs text-tpl-muted">
                  {colourway(line.colour).name}, UK {line.size} × {line.qty}
                </span>
              </span>
              <span className="text-sm font-bold tabular-nums">
                {rm(line.unit * line.qty)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-tpl-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-tpl-muted">Delivery</dt>
            <dd>
              {delivery?.name}, {order.delivery ? rm(order.delivery) : 'free'}
            </dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-tpl-muted">Discount</dt>
              <dd>-{rm(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold">
            <dt>Total</dt>
            <dd className="tabular-nums">{rm(order.total)}</dd>
          </div>
          {paid && order.ref && (
            <div className="flex justify-between text-xs text-tpl-muted">
              <dt>Payment reference</dt>
              <dd>{order.ref}</dd>
            </div>
          )}
        </dl>
      </div>

      {paid && (
        <Link href={`${BASE_PATH}/shop`} className={`${BUTTON_GHOST} mt-8`}>
          Keep shopping
        </Link>
      )}

      {paying && (
        <PayDialog
          order={order}
          onClose={() => setPaying(false)}
          onApprove={() => {
            markPaid(order.id);
            setPaying(false);
          }}
          onDecline={(reason) => {
            markFailed(order.id, reason);
            setPaying(false);
          }}
        />
      )}
    </div>
  );
}

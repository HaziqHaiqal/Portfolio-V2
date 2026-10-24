'use client';

import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import {
  BASE_PATH,
  COLOURWAYS,
  lineKey,
  PAY_METHODS,
  PRODUCTS,
  rm,
  SIZES,
} from './data';
import { availableFrom, useHydrated, useStore, type Order } from './store';
import { swatchFill } from './Pickers';
import { BUTTON_GHOST, CONTAINER, DISPLAY, Wordmark } from './ui';

const LOW_STOCK = 3;

function status(order: Order) {
  if (order.status === 'paid')
    return order.shipped
      ? { label: 'Shipped', tone: 'bg-tpl-tint text-tpl-ink' }
      : { label: 'Paid, to pack', tone: 'bg-tpl-accent text-tpl-on-accent' };
  if (order.status === 'payment_failed')
    return { label: 'Payment failed', tone: 'bg-red-500/15 text-red-400' };
  return { label: 'Awaiting payment', tone: 'bg-amber-400/15 text-amber-400' };
}

export default function Admin() {
  const hydrated = useHydrated();
  const orders = useStore((state) => state.orders);
  const sold = useStore((state) => state.sold);
  const markShipped = useStore((state) => state.markShipped);
  const reset = useStore((state) => state.reset);

  const paid = orders.filter((order) => order.status === 'paid');
  const stats = [
    {
      label: 'Paid revenue',
      value: rm(paid.reduce((sum, order) => sum + order.total, 0)),
    },
    { label: 'Paid orders', value: paid.length },
    {
      label: 'Awaiting payment',
      value: orders.filter((order) => order.status === 'pending_payment')
        .length,
    },
    {
      label: 'Failed payments',
      value: orders.filter((order) => order.status === 'payment_failed').length,
    },
  ];

  return (
    <div className="min-h-svh">
      <header className="sticky top-[var(--demo-bar)] z-30 border-b border-tpl-line bg-tpl-bg/90 backdrop-blur">
        <div
          className={`${CONTAINER} flex h-16 items-center justify-between gap-4`}
        >
          <div className="flex items-center gap-3">
            <Wordmark />
            <span className="rounded-full bg-tpl-tint px-3 py-1 text-xs font-bold">
              Admin
            </span>
          </div>
          <Link
            href={BASE_PATH}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-tpl-muted hover:text-tpl-ink"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to the store
          </Link>
        </div>
      </header>

      <main className={`${CONTAINER} pb-24 pt-10`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1
              className={`${DISPLAY} text-[clamp(2.4rem,6vw,4rem)] leading-[0.9]`}
            >
              Today at Langkah
            </h1>
            <p className="mt-2 text-sm text-tpl-muted">
              Orders you place in the shop show up here. Demo data lives in this
              browser only.
            </p>
          </div>
          <button type="button" onClick={reset} className={BUTTON_GHOST}>
            <RotateCcw size={16} aria-hidden="true" />
            Reset demo data
          </button>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[22px] bg-tpl-surface p-4">
              <dt className="text-xs font-semibold text-tpl-muted">
                {stat.label}
              </dt>
              <dd className="mt-1 text-2xl font-extrabold tabular-nums">
                {hydrated ? stat.value : '–'}
              </dd>
            </div>
          ))}
        </dl>

        <section className="mt-12">
          <h2 className="text-lg font-bold">Orders</h2>
          {hydrated && orders.length === 0 ? (
            <p className="mt-4 rounded-[22px] bg-tpl-surface p-6 text-sm text-tpl-muted">
              No orders yet.{' '}
              <Link
                href={`${BASE_PATH}/shop`}
                className="font-semibold text-tpl-accent underline-offset-4 hover:underline"
              >
                Place one from the shop
              </Link>{' '}
              and it appears here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-tpl-line rounded-[22px] bg-tpl-surface">
              {orders.map((order) => {
                const pill = status(order);
                const items = order.lines.reduce(
                  (sum, line) => sum + line.qty,
                  0
                );
                return (
                  <li
                    key={order.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4"
                  >
                    <span className="min-w-0 flex-1 basis-48">
                      <span className="block text-sm font-bold">
                        {order.id} · {order.details.name}
                      </span>
                      <span className="block text-xs text-tpl-muted">
                        {items} {items === 1 ? 'pair' : 'pairs'},{' '}
                        {
                          PAY_METHODS.find(
                            (method) => method.id === order.details.method
                          )?.name
                        }
                      </span>
                    </span>
                    <span className="text-sm font-bold tabular-nums">
                      {rm(order.total)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${pill.tone}`}
                    >
                      {pill.label}
                    </span>
                    {order.status === 'paid' && !order.shipped && (
                      <button
                        type="button"
                        onClick={() => markShipped(order.id)}
                        className="rounded-full border border-tpl-line px-3 py-1 text-xs font-bold hover:bg-tpl-tint"
                      >
                        Mark shipped
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-bold">Stock by size</h2>
          <p className="mt-1 text-sm text-tpl-muted">
            Paid orders take pairs off the shelf. {LOW_STOCK} or fewer is
            flagged.
          </p>
          <div className="mt-4 space-y-6">
            {PRODUCTS.map((product) => (
              <div
                key={product.slug}
                className="overflow-x-auto rounded-[22px] bg-tpl-surface p-4"
              >
                <table className="w-full min-w-[30rem] text-sm">
                  <caption className="mb-3 text-left font-bold">
                    {product.name}
                  </caption>
                  <thead>
                    <tr className="text-xs text-tpl-muted">
                      <th scope="col" className="pb-2 text-left font-semibold">
                        Colourway
                      </th>
                      {SIZES.map((size) => (
                        <th
                          key={size}
                          scope="col"
                          className="pb-2 font-semibold"
                        >
                          UK {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COLOURWAYS.map((colour) => (
                      <tr key={colour.id} className="border-t border-tpl-line">
                        <th
                          scope="row"
                          className="py-2 text-left font-semibold"
                        >
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundImage: swatchFill(colour) }}
                            />
                            {colour.name}
                          </span>
                        </th>
                        {SIZES.map((size) => {
                          const left = availableFrom(
                            hydrated ? sold : {},
                            lineKey(product.slug, colour.id, size)
                          );
                          return (
                            <td
                              key={size}
                              className="py-2 text-center tabular-nums"
                            >
                              <span
                                className={`inline-block min-w-8 rounded-full px-2 py-0.5 ${
                                  left <= LOW_STOCK
                                    ? 'bg-amber-400/15 font-bold text-amber-400'
                                    : ''
                                }`}
                              >
                                {left}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

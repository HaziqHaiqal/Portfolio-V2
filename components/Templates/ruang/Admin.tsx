'use client';

import { useState } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { ExternalLink, PackageCheck, RotateCcw, X } from 'lucide-react';
import Photo from '@components/Templates/Photo';
import { rm } from '@components/Templates/Bag';
import {
  BASE_PATH,
  DELIVERY,
  OWNER_REASONS,
  lineKey,
  PRODUCTS,
  startingStock,
  STUDIO,
  variantsOf,
} from './data';
import {
  availableFrom,
  useHydrated,
  useStore,
  useToday,
  type Order,
  type OrderStatus,
} from './store';
import { DemoNotice } from './Checkout';
import { CONTAINER, Logo } from './ui';

const STATUS: Record<OrderStatus, { label: string; className: string }> = {
  pending_payment: {
    label: 'Awaiting payment',
    className: 'bg-amber-100 text-amber-900',
  },
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-900' },
  payment_failed: {
    label: 'Payment failed',
    className: 'bg-red-100 text-red-900',
  },
  cod_pending: { label: 'COD, unpaid', className: 'bg-sky-100 text-sky-900' },
  packed: { label: 'Packed', className: 'bg-violet-100 text-violet-900' },
  shipped: { label: 'Shipped', className: 'bg-blue-100 text-blue-900' },
  delivered: { label: 'Delivered', className: 'bg-neutral-900 text-white' },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-neutral-200 text-neutral-600',
  },
};

const COLUMNS: { title: string; statuses: OrderStatus[]; empty: string }[] = [
  {
    title: 'To pack',
    statuses: ['paid', 'cod_pending'],
    empty: 'New paid orders land here.',
  },
  {
    title: 'Packed',
    statuses: ['packed'],
    empty: 'Nothing waiting for the courier.',
  },
  { title: 'Shipped', statuses: ['shipped'], empty: 'Nothing on the road.' },
  { title: 'Delivered', statuses: ['delivered'], empty: 'No deliveries yet.' },
];

const ACTION: Partial<Record<OrderStatus, string>> = {
  paid: 'Mark packed',
  cod_pending: 'Mark packed',
  packed: 'Hand to courier',
  shipped: 'Mark delivered',
};

const CANCELLABLE: OrderStatus[] = [
  'pending_payment',
  'payment_failed',
  'cod_pending',
];

const METHOD_SHORT: Record<string, string> = {
  fpx: 'FPX',
  card: 'Card',
  ewallet: 'QR',
  cod: 'COD',
};

const LOW_STOCK = 5;

const time = (at: number) =>
  new Date(at).toLocaleString('en-MY', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

const itemCount = (order: Order) =>
  order.lines.reduce((sum, line) => sum + line.qty, 0);

const isRevenue = (order: Order) =>
  (['paid', 'packed', 'shipped', 'delivered'] as OrderStatus[]).includes(
    order.status
  ) && !(order.details.method === 'cod' && order.status !== 'delivered');

function StatusPill({ status }: { status: OrderStatus }) {
  const { label, className } = STATUS[status];
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

/** Running total of money received, as a small line. */
function Sparkline({ orders }: { orders: Order[] }) {
  const paid = orders
    .filter(isRevenue)
    .toSorted((a, b) => a.createdAt - b.createdAt);
  const points = paid.reduce<number[]>(
    (acc, order) => [...acc, (acc.at(-1) ?? 0) + order.total],
    [0]
  );
  if (points.length < 2)
    return (
      <span className="block h-9 w-28 border-b border-dashed border-tpl-line" />
    );
  const max = Math.max(...points);
  const path = points
    .map(
      (value, index) =>
        `${(index / (points.length - 1)) * 112},${34 - (value / max) * 30}`
    )
    .join(' ');
  return (
    <svg viewBox="0 0 112 36" className="h-9 w-28" aria-hidden="true">
      <polyline
        points={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        className="text-tpl-accent"
      />
    </svg>
  );
}

function OrderDrawer({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  const advance = useStore((state) => state.advance);
  const cancel = useStore((state) => state.cancel);
  const open = Boolean(order);
  const action = order ? ACTION[order.status] : undefined;
  const delivery = order
    ? DELIVERY.find((item) => item.id === order.details.deliveryId)
    : null;

  return (
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      inert={!open}
    >
      <button
        type="button"
        aria-label="Close order"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <aside
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-order-title"
        onKeyDown={(event) => event.key === 'Escape' && onClose()}
        className={`absolute inset-y-0 right-0 flex w-full max-w-lg flex-col overflow-hidden bg-tpl-surface text-tpl-ink shadow-2xl transition-transform duration-300 sm:inset-y-2 sm:right-2 sm:rounded-[28px] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {order && (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-tpl-line px-6 py-5">
              <div>
                <h2
                  id="admin-order-title"
                  className="text-lg font-semibold tabular-nums"
                >
                  {order.id}
                </h2>
                <p className="text-sm text-tpl-muted">
                  {time(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={order.status} />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close order"
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-tpl-tint"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6 text-sm">
              <section>
                <h3 className="font-semibold">Customer</h3>
                <p className="mt-2 leading-relaxed text-tpl-muted">
                  {order.details.name}
                  <br />
                  {order.details.email}
                  <br />
                  {order.details.phone}
                </p>
              </section>
              <section>
                <h3 className="font-semibold">{delivery?.label}</h3>
                <p className="mt-2 leading-relaxed text-tpl-muted">
                  {order.details.deliveryId === 'pickup'
                    ? `Collect at ${STUDIO}`
                    : `${order.details.address1}, ${order.details.address2 ? `${order.details.address2}, ` : ''}${order.details.postcode} ${order.details.city}, ${order.details.state}`}
                </p>
                {order.tracking && (
                  <p className="mt-1 tabular-nums">Tracking {order.tracking}</p>
                )}
              </section>
              <section>
                <h3 className="font-semibold">Payment</h3>
                <p className="mt-2 leading-relaxed text-tpl-muted">
                  {order.details.method === 'cod'
                    ? 'Cash on delivery'
                    : (order.payment.detail ?? 'Not paid yet')}
                  {order.payment.ref && (
                    <>
                      <br />
                      Reference {order.payment.ref}
                    </>
                  )}
                  {order.payment.reason && (
                    <>
                      <br />
                      <span className="text-red-600">
                        Failed: {OWNER_REASONS[order.payment.reason]}
                      </span>
                    </>
                  )}
                  {order.payment.attempts > 1 && (
                    <>
                      <br />
                      {order.payment.attempts} payment attempts
                    </>
                  )}
                </p>
              </section>
              <section>
                <h3 className="font-semibold">
                  {itemCount(order)} {itemCount(order) === 1 ? 'item' : 'items'}
                </h3>
                <ul className="mt-2 divide-y divide-tpl-line border-y border-tpl-line">
                  {order.lines.map((line) => (
                    <li key={line.key} className="flex gap-3 py-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-tpl-tint">
                        <Photo
                          src={line.image}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {line.qty} × {line.name}
                        </p>
                        {line.variant && (
                          <p className="text-xs text-tpl-muted">
                            {line.variant}
                          </p>
                        )}
                      </div>
                      <p className="tabular-nums">{rm(line.unit * line.qty)}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{rm(order.total)}</span>
                </p>
              </section>
              <section>
                <h3 className="font-semibold">History</h3>
                <ol className="mt-3 space-y-3 border-l border-tpl-line pl-4">
                  {order.history.toReversed().map((entry, index) => (
                    <li key={`${entry.at}-${index}`} className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full bg-tpl-ink"
                      />
                      <p className="font-medium">
                        {STATUS[entry.status].label}
                        {entry.note && (
                          <span className="font-normal text-tpl-muted">
                            , {entry.note}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-tpl-muted">{time(entry.at)}</p>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            {(action || CANCELLABLE.includes(order.status)) && (
              <div className="flex gap-3 border-t border-tpl-line px-6 py-5">
                {CANCELLABLE.includes(order.status) && (
                  <button
                    type="button"
                    onClick={() => cancel(order.id)}
                    className="h-12 rounded-full border border-tpl-line px-5 text-sm font-medium text-red-600 hover:border-red-600"
                  >
                    Cancel order
                  </button>
                )}
                {action && (
                  <button
                    type="button"
                    onClick={() => advance(order.id)}
                    className="h-12 flex-1 rounded-full bg-tpl-accent px-5 text-sm font-medium text-tpl-on-accent hover:opacity-90"
                  >
                    {order.status === 'shipped' &&
                    order.details.method === 'cod'
                      ? 'Mark delivered, cash collected'
                      : action}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

function OrderCard({ order, onOpen }: { order: Order; onOpen: () => void }) {
  const advance = useStore((state) => state.advance);
  const action = ACTION[order.status];
  const extra = order.lines.length - 3;

  return (
    <m.article
      layout
      layoutId={order.id}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className="rounded-[20px] bg-tpl-surface p-4 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="text-left text-sm font-semibold tabular-nums hover:underline"
        >
          {order.id}
        </button>
        <span className="rounded-md bg-tpl-tint px-1.5 py-0.5 text-[11px] font-medium text-tpl-muted">
          {METHOD_SHORT[order.details.method]}
        </span>
      </div>
      <p className="mt-1 text-sm text-tpl-muted">{order.details.name}</p>
      <div className="mt-3 flex items-center gap-1.5">
        {order.lines.slice(0, 3).map((line) => (
          <span
            key={line.key}
            className="relative h-10 w-9 overflow-hidden rounded-lg bg-tpl-tint"
          >
            <Photo
              src={line.image}
              alt=""
              fill
              sizes="36px"
              className="object-cover"
            />
          </span>
        ))}
        {extra > 0 && <span className="text-xs text-tpl-muted">+{extra}</span>}
        <span className="ml-auto text-sm font-semibold tabular-nums">
          {rm(order.total)}
        </span>
      </div>
      {order.status === 'cod_pending' && (
        <p className="mt-2 text-xs text-sky-800">Collect cash on delivery</p>
      )}
      {action && (
        <button
          type="button"
          onClick={() => advance(order.id)}
          className="mt-3 h-9 w-full rounded-full bg-tpl-ink text-xs font-medium text-tpl-surface transition-opacity hover:opacity-85"
        >
          {action}
        </button>
      )}
    </m.article>
  );
}

function Board({
  orders,
  onOpen,
}: {
  orders: Order[];
  onOpen: (id: string) => void;
}) {
  const attention = orders.filter(
    (order) =>
      order.status === 'payment_failed' || order.status === 'pending_payment'
  );

  return (
    <>
      {attention.length > 0 && (
        <section className="mb-8 rounded-3xl border border-amber-300/60 bg-amber-50 p-5 text-amber-950">
          <h2 className="font-semibold">
            Needs attention{' '}
            <span className="font-normal opacity-70">({attention.length})</span>
          </h2>
          <ul className="mt-3 divide-y divide-amber-900/10">
            {attention.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm"
              >
                <button
                  type="button"
                  onClick={() => onOpen(order.id)}
                  className="font-semibold tabular-nums hover:underline"
                >
                  {order.id}
                </button>
                <span className="flex-1">
                  {order.details.name},{' '}
                  {order.payment.reason
                    ? OWNER_REASONS[order.payment.reason]
                    : 'has not paid yet'}
                </span>
                <span className="tabular-nums">{rm(order.total)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="-mx-5 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0">
        <div className="grid min-w-[56rem] grid-cols-4 gap-4">
          {COLUMNS.map((column) => {
            const items = orders.filter((order) =>
              column.statuses.includes(order.status)
            );
            return (
              <section
                key={column.title}
                className="flex min-h-[18rem] flex-col rounded-[24px] bg-tpl-tint p-3 ring-1 ring-tpl-line"
              >
                <h2 className="flex items-center justify-between px-2 pb-3 pt-1 text-sm font-semibold">
                  {column.title}
                  <span className="rounded-full bg-tpl-surface px-2 py-0.5 text-xs tabular-nums text-tpl-muted">
                    {items.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {items.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onOpen={() => onOpen(order.id)}
                    />
                  ))}
                </div>
                {!items.length && (
                  <p className="m-auto px-4 text-center text-xs text-tpl-muted">
                    {column.empty}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Stock() {
  const sold = useStore((state) => state.sold);
  const [lowOnly, setLowOnly] = useState(true);

  const rows = PRODUCTS.flatMap((product) =>
    variantsOf(product).map((values) => {
      const key = lineKey(product.slug, values);
      return {
        key,
        product,
        variant: values.join(', ') || 'One option',
        left: availableFrom(sold, key),
        sold: sold[key] ?? 0,
        start: startingStock(key),
      };
    })
  ).filter((row) => !lowOnly || row.left <= LOW_STOCK);

  return (
    <>
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={lowOnly}
          onChange={(event) => setLowOnly(event.target.checked)}
          className="h-4 w-4 accent-current"
        />
        Only show {LOW_STOCK} or fewer left
      </label>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-center gap-3 rounded-[20px] bg-tpl-surface p-3"
          >
            <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-tpl-tint">
              <Photo
                src={row.product.images[0]}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium">{row.product.name}</p>
              <p className="truncate text-xs text-tpl-muted">{row.variant}</p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-tpl-tint">
                <div
                  className={`h-full rounded-full ${
                    row.left === 0
                      ? 'bg-red-500'
                      : row.left <= LOW_STOCK
                        ? 'bg-orange-500'
                        : 'bg-tpl-accent'
                  }`}
                  style={{
                    width: `${row.start ? (row.left / row.start) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <p
              className={`w-14 text-right text-sm font-semibold tabular-nums ${
                row.left === 0
                  ? 'text-red-600'
                  : row.left <= LOW_STOCK
                    ? 'text-orange-700'
                    : ''
              }`}
            >
              {row.left === 0 ? 'Sold out' : `${row.left} left`}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function Admin() {
  const hydrated = useHydrated();
  const today = useToday();
  const orders = useStore((state) => state.orders);
  const sold = useStore((state) => state.sold);
  const reset = useStore((state) => state.reset);
  const [tab, setTab] = useState<'board' | 'stock'>('board');
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const open = orders.find((order) => order.id === openId) ?? null;

  const revenue = orders
    .filter(isRevenue)
    .reduce((sum, order) => sum + order.total, 0);
  const lowStock = PRODUCTS.flatMap((product) =>
    variantsOf(product).filter(
      (values) =>
        availableFrom(sold, lineKey(product.slug, values)) <= LOW_STOCK
    )
  ).length;
  const stats = [
    {
      label: 'Orders today',
      value: orders.filter(
        (order) => order.createdAt >= today && order.status !== 'payment_failed'
      ).length,
    },
    {
      label: 'To pack',
      value: orders.filter(
        (order) => order.status === 'paid' || order.status === 'cod_pending'
      ).length,
    },
    { label: 'Low stock', value: lowStock },
  ];

  return (
    <div className="min-h-[calc(100svh-var(--demo-bar))]">
      <header className={`${CONTAINER} pt-3`}>
        <div className="flex h-16 items-center justify-between gap-4 rounded-[22px] bg-tpl-surface px-4 md:px-5">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-tpl-tint px-3 py-1 text-xs font-medium sm:inline">
              Admin portal
            </span>
          </div>
          <Link
            href={BASE_PATH}
            className="flex h-10 items-center gap-1.5 rounded-full bg-tpl-ink px-4 text-sm font-medium text-tpl-surface hover:opacity-85"
          >
            View store
            <ExternalLink size={14} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className={`${CONTAINER} pb-24 pt-8`}>
        <DemoNotice>
          Demo data lives in this browser only. Orders you place in the store
          land here, ready to pack and ship.
        </DemoNotice>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
            Today at the studio
          </h1>
          {hydrated && (
            <div className="flex items-end gap-4">
              <div>
                <p className="text-xs text-tpl-muted">Money received</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums tracking-[-0.03em]">
                  {rm(revenue)}
                </p>
              </div>
              <Sparkline orders={orders} />
            </div>
          )}
        </div>

        {!hydrated ? (
          <div className="mt-8 h-72 animate-pulse rounded-[28px] bg-tpl-surface" />
        ) : (
          <>
            <dl className="mt-8 grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[20px] bg-tpl-surface px-4 py-3"
                >
                  <dt className="text-xs text-tpl-muted">{stat.label}</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div
              role="tablist"
              aria-label="Admin sections"
              className="mt-10 flex gap-2"
            >
              {(
                [
                  ['board', 'Orders'],
                  ['stock', 'Stock'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`h-10 rounded-full px-5 text-sm font-medium transition-colors ${
                    tab === id
                      ? 'bg-tpl-ink text-tpl-surface'
                      : 'text-tpl-muted hover:bg-tpl-surface'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {tab === 'board' ? (
                orders.length ? (
                  <Board orders={orders} onOpen={setOpenId} />
                ) : (
                  <div className="flex flex-col items-center gap-4 rounded-[28px] bg-tpl-surface px-6 py-20 text-center">
                    <PackageCheck size={32} aria-hidden="true" />
                    <p className="max-w-sm text-tpl-muted">
                      No orders yet. Place a test order in the store, then pack
                      and ship it here.
                    </p>
                    <Link
                      href={`${BASE_PATH}/shop`}
                      className="inline-flex h-11 items-center rounded-full bg-tpl-accent px-5 text-sm font-medium text-tpl-on-accent"
                    >
                      Open the store
                    </Link>
                  </div>
                )
              ) : (
                <Stock />
              )}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-3 text-sm">
              {confirming ? (
                <>
                  <span>Clear every demo order, bag and stock change?</span>
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setConfirming(false);
                    }}
                    className="rounded-full bg-red-600 px-4 py-2 font-medium text-white"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="rounded-full px-4 py-2 font-medium hover:bg-tpl-tint"
                  >
                    Keep
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="flex items-center gap-1.5 font-medium text-tpl-muted hover:text-tpl-ink"
                >
                  <RotateCcw size={15} aria-hidden="true" />
                  Reset demo data
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <OrderDrawer order={open} onClose={() => setOpenId(null)} />
    </div>
  );
}

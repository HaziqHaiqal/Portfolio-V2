'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PackageCheck, RotateCcw, X } from 'lucide-react';
import { rm, useBag } from '@components/Templates/Bag';
import { digits, type FailReason } from '@components/Templates/pay/data';
import {
  BASE_PATH,
  deliveryOf,
  LOW_STOCK,
  SHOP_ADDRESS,
  stockKey,
} from '../data';
import { useCatalogue, useItems } from '../catalogue';
import {
  TAKES_STOCK,
  useOrders,
  useOrdersReady,
  useStockLeft,
  type Order,
} from '../orders';
import { useThumb } from '../garment';

const METHOD: Record<string, string> = {
  fpx: 'FPX',
  card: 'Card',
  ewallet: 'E-wallet',
  cod: 'Cash on delivery',
};

const REASON: Record<FailReason, string> = {
  declined: 'card declined',
  insufficient_funds: 'not enough funds on the card',
  bank_declined: 'rejected in the bank app',
  bank_unavailable: 'their bank was offline',
  otp_failed: 'wrong one-time code',
  qr_expired: 'QR code expired before payment',
  wallet_declined: 'declined in the e-wallet',
  cancelled: 'left the payment page',
};

const time = (at: number) =>
  new Date(at).toLocaleString('en-MY', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

const count = (order: Order) =>
  order.lines.reduce((sum, line) => sum + line.qty, 0);

const toPack = (order: Order) =>
  TAKES_STOCK.includes(order.status) && !order.shipped;

const newTracking = () => `JT${digits(10)}`;

function Thumbs({ order }: { order: Order }) {
  const thumb = useThumb();
  const extra = order.lines.length - 3;
  return (
    <span className="flex items-center gap-1.5">
      {order.lines.slice(0, 3).map((line) => (
        <span
          key={line.key}
          className="relative h-12 w-10 shrink-0 bg-tpl-tint"
        >
          <Image
            src={thumb(line.image)}
            alt=""
            fill
            sizes="40px"
            unoptimized
            className="object-contain p-0.5"
          />
        </span>
      ))}
      {extra > 0 && <span className="text-xs text-tpl-ink/70">+{extra}</span>}
    </span>
  );
}

function ShipForm({
  order,
  onDone,
}: {
  order: Order;
  onDone: () => void;
}) {
  const markShipped = useOrders((state) => state.markShipped);
  const [tracking, setTracking] = useState(newTracking);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.select(), []);
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!tracking.trim()) return;
        markShipped(order.id, tracking.trim());
        onDone();
      }}
    >
      <label className="min-w-0 flex-1 basis-40">
        <span className="gaya-adm-label">Tracking number</span>
        <input
          ref={input}
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          className="gaya-adm-input is-small mt-1.5"
        />
      </label>
      <button type="submit" className="gaya-btn !h-[38px] !w-auto px-4">
        Ship it
      </button>
      <button
        type="button"
        onClick={onDone}
        className="h-[38px] px-2 text-[13px] font-semibold"
      >
        Cancel
      </button>
    </form>
  );
}

function Row({ order, onOpen }: { order: Order; onOpen: () => void }) {
  const [shipping, setShipping] = useState(false);
  return (
    <li className="border-b border-tpl-line py-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Thumbs order={order} />
        <div className="min-w-0 flex-1 basis-48">
          <button
            type="button"
            onClick={onOpen}
            className="gaya-adm-link text-[15px] tabular-nums"
          >
            {order.id}
          </button>
          <p className="truncate text-sm text-tpl-ink/70">
            {order.details.name}, {count(order)}{' '}
            {count(order) === 1 ? 'piece' : 'pieces'}, {time(order.createdAt)}
          </p>
        </div>
        <p className="w-28 text-sm">
          {METHOD[order.details.method]}
          {order.status === 'cod_pending' && (
            <span className="block text-xs text-tpl-ink/70">Not paid yet</span>
          )}
        </p>
        <p className="w-24 text-right font-semibold tabular-nums">
          {rm(order.total)}
        </p>
        <div className="flex w-full justify-end sm:w-40">
          {order.shipped ? (
            <p className="text-right text-sm">
              Shipped
              <span className="block text-xs tabular-nums text-tpl-ink/70">
                {order.shipped.tracking}
              </span>
            </p>
          ) : toPack(order) && !shipping ? (
            <button
              type="button"
              onClick={() => setShipping(true)}
              className="gaya-btn !h-10 px-4 sm:!w-full"
            >
              Mark as shipped
            </button>
          ) : !toPack(order) ? (
            <p className="text-right text-sm text-tpl-ink/70">
              {order.status === 'payment_failed'
                ? 'Payment failed'
                : 'Waiting for payment'}
            </p>
          ) : null}
        </div>
      </div>
      {shipping && (
        <div className="mt-4 sm:ml-auto sm:max-w-md">
          <ShipForm order={order} onDone={() => setShipping(false)} />
        </div>
      )}
    </li>
  );
}

function Section({
  title,
  orders,
  empty,
  onOpen,
}: {
  title: string;
  orders: Order[];
  empty: string;
  onOpen: (id: string) => void;
}) {
  return (
    <section className="mt-12">
      <h2 className="flex items-baseline gap-2 border-b border-tpl-ink pb-3 text-xl font-extrabold tracking-[-0.03em]">
        {title}
        <span className="text-sm font-semibold tabular-nums text-tpl-ink/70">
          {orders.length}
        </span>
      </h2>
      {orders.length ? (
        <ul>
          {orders.map((order) => (
            <Row key={order.id} order={order} onOpen={() => onOpen(order.id)} />
          ))}
        </ul>
      ) : (
        <p className="py-6 text-sm text-tpl-ink/70">{empty}</p>
      )}
    </section>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-tpl-line py-5">
      <h3 className="text-[13px] font-semibold">{title}</h3>
      <div className="mt-2 text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}

function Drawer({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  const close = useRef<HTMLButtonElement>(null);
  const thumb = useThumb();
  const [shippingId, setShippingId] = useState<string | null>(null);
  const open = Boolean(order);
  const shipping = order !== null && shippingId === order.id;

  useEffect(() => {
    if (open) close.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const delivery = order ? deliveryOf(order.details.deliveryId) : null;

  return (
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
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
        aria-labelledby="gaya-order-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-tpl-bg text-tpl-ink transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {order && (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-tpl-line px-6 py-5">
              <div>
                <h2
                  id="gaya-order-title"
                  className="text-2xl font-extrabold tabular-nums tracking-[-0.03em]"
                >
                  {order.id}
                </h2>
                <p className="text-sm text-tpl-ink/70">{time(order.createdAt)}</p>
              </div>
              <button
                ref={close}
                type="button"
                onClick={onClose}
                aria-label="Close order"
                className="-mr-2 flex h-11 w-11 items-center justify-center"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <Block title="Customer">
                {order.details.name}
                <br />
                {order.details.email}
                <br />
                {order.details.phone}
              </Block>
              <Block title={delivery?.label ?? 'Delivery'}>
                {order.details.deliveryId === 'pickup'
                  ? `Collect at ${SHOP_ADDRESS}`
                  : `${order.details.address1}, ${order.details.address2 ? `${order.details.address2}, ` : ''}${order.details.postcode} ${order.details.city}, ${order.details.state}`}
                {order.shipped && (
                  <span className="mt-1 block tabular-nums">
                    Shipped {time(order.shipped.at)}, tracking{' '}
                    {order.shipped.tracking}
                  </span>
                )}
              </Block>
              <Block title="Payment">
                {order.details.method === 'cod'
                  ? 'Cash on delivery'
                  : (order.payment.detail ?? 'Not paid yet')}
                {order.payment.ref && (
                  <span className="block tabular-nums text-tpl-ink/70">
                    Reference {order.payment.ref}
                  </span>
                )}
                {order.payment.reason && (
                  <span className="block text-[rgb(var(--gaya-error))]">
                    Failed: {REASON[order.payment.reason]}
                  </span>
                )}
              </Block>
              <section className="py-5">
                <h3 className="text-[13px] font-semibold">
                  {count(order)} {count(order) === 1 ? 'piece' : 'pieces'}
                </h3>
                <ul className="mt-2 border-t border-tpl-line">
                  {order.lines.map((line) => (
                    <li
                      key={line.key}
                      className="flex items-center gap-3 border-b border-tpl-line py-3"
                    >
                      <span className="relative h-14 w-11 shrink-0 bg-tpl-tint">
                        <Image
                          src={thumb(line.image)}
                          alt=""
                          fill
                          sizes="44px"
                          unoptimized
                          className="object-contain p-0.5"
                        />
                      </span>
                      <span className="min-w-0 flex-1 text-sm">
                        <b className="block font-semibold">
                          {line.qty} × {line.name}
                        </b>
                        {line.variant && (
                          <span className="text-tpl-ink/70">{line.variant}</span>
                        )}
                      </span>
                      <span className="text-sm tabular-nums">
                        {rm(line.unit * line.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex justify-between text-sm">
                  <span>Postage</span>
                  <span className="tabular-nums">
                    {order.delivery ? rm(order.delivery) : 'Free'}
                  </span>
                </p>
                <p className="mt-1 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{rm(order.total)}</span>
                </p>
              </section>
            </div>
            {toPack(order) && (
              <div className="border-t border-tpl-line px-6 py-5">
                {shipping ? (
                  <ShipForm order={order} onDone={() => setShippingId(null)} />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShippingId(order.id)}
                    className="gaya-btn"
                  >
                    Mark as shipped
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

function Reset() {
  const [asking, setAsking] = useState(false);
  const resetOrders = useOrders((state) => state.reset);
  const resetCatalogue = useCatalogue((state) => state.reset);
  const { clear } = useBag();
  return (
    <div className="mt-16 flex flex-wrap items-center gap-3 text-sm">
      {asking ? (
        <>
          <span>Clear every demo order, added product and stock change?</span>
          <button
            type="button"
            onClick={() => {
              resetOrders();
              resetCatalogue();
              clear();
              setAsking(false);
            }}
            className="h-10 rounded-[2px] bg-[rgb(var(--gaya-error))] px-4 font-semibold text-white"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setAsking(false)}
            className="h-10 px-3 font-semibold"
          >
            Keep
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="inline-flex h-10 items-center gap-1.5 font-semibold text-tpl-ink/70"
        >
          <RotateCcw size={15} aria-hidden="true" />
          Reset demo data
        </button>
      )}
    </div>
  );
}

export default function Orders() {
  const ready = useOrdersReady();
  const orders = useOrders((state) => state.orders);
  const items = useItems();
  const left = useStockLeft();
  const params = useSearchParams();
  const [openId, setOpenId] = useState<string | null>(params.get('order'));
  const open = orders.find((order) => order.id === openId) ?? null;
  const closeDrawer = useCallback(() => setOpenId(null), []);

  const [today] = useState(() => new Date().setHours(0, 0, 0, 0));
  const money = orders
    .filter((order) => order.status === 'paid')
    .reduce((sum, order) => sum + order.total, 0);
  const lowSizes = items.reduce(
    (n, item) =>
      n +
      item.sizes.filter((size) => left(stockKey(item, size)) <= LOW_STOCK)
        .length,
    0
  );
  const packing = orders.filter(toPack);
  const shipped = orders.filter((order) => order.shipped);
  const unpaid = orders.filter((order) => !TAKES_STOCK.includes(order.status));

  const stats = [
    { label: 'Money received', value: rm(money) },
    {
      label: 'Orders today',
      value: orders.filter(
        (order) =>
          order.createdAt >= today && order.status !== 'payment_failed'
      ).length,
    },
    { label: 'To pack', value: packing.length },
    { label: 'Sizes low or sold out', value: lowSizes },
  ];

  return (
    <>
      <h1 className="gaya-adm-title">Orders</h1>
      <p className="gaya-adm-sub">
        Demo data stays in this browser. Orders you place in the store land
        here, ready to pack and ship.
      </p>

      {!ready ? (
        <div className="mt-10 h-64 bg-tpl-tint" aria-busy="true" />
      ) : (
        <>
          <dl className="mt-9 grid grid-cols-2 border-y border-tpl-line md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="gaya-adm-stat">
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>

          {orders.length ? (
            <>
              <Section
                title="To pack"
                orders={packing}
                empty="Nothing to pack. Paid orders land here."
                onOpen={setOpenId}
              />
              <Section
                title="Shipped"
                orders={shipped}
                empty="Nothing shipped yet."
                onOpen={setOpenId}
              />
              {unpaid.length > 0 && (
                <Section
                  title="Not paid"
                  orders={unpaid}
                  empty=""
                  onOpen={setOpenId}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-start gap-4 border-b border-tpl-line py-14">
              <PackageCheck size={30} strokeWidth={1.6} aria-hidden="true" />
              <p className="max-w-sm text-tpl-ink/70">
                No orders yet. Place a test order in the store, then pack and
                ship it here.
              </p>
              <Link href={BASE_PATH} className="gaya-btn !w-auto px-6">
                Open the store
              </Link>
            </div>
          )}

          <Reset />
        </>
      )}

      <Drawer order={open} onClose={closeDrawer} />
    </>
  );
}

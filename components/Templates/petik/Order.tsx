'use client';

import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import { Check, Minus, Plus, X } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import OrderPreview from '../OrderPreview';
import {
  BRAND,
  CUTOFF_HOUR,
  DELIVERY_FEE,
  FREE_DELIVERY_AT,
  MIN_ORDER,
  PICTURES,
  PRODUCTS,
  productById,
  rm,
  SLOTS,
  type Product,
} from './data';
import Pic from './Pic';

// The clock is read on the client only, a minute at a time, so the server
// render and the first client render agree.
let minute: Date | null = null;
const readClock = () => {
  const now = Math.floor(Date.now() / 60000) * 60000;
  if (minute?.getTime() !== now) minute = new Date(now);
  return minute;
};
const tick = (onChange: () => void) => {
  const timer = setInterval(onChange, 15000);
  return () => clearInterval(timer);
};
export const useNow = () => useSyncExternalStore(tick, readClock, () => null);

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** The next delivery day for an order placed now. There is no Monday box. */
export function planFor(now: Date) {
  let day = addDays(now, now.getHours() < CUTOFF_HOUR ? 1 : 2);
  if (day.getDay() === 1) day = addDays(day, 1);
  day.setHours(0, 0, 0, 0);
  const closes = addDays(day, -1);
  closes.setHours(CUTOFF_HOUR, 0, 0, 0);
  return { day, closes, left: closes.getTime() - now.getTime() };
}

export const dayName = (date: Date) =>
  `${date.toLocaleDateString('en-MY', { weekday: 'long' })} ${date.getDate()} ${date.toLocaleDateString('en-MY', { month: 'long' })}`;

export const duration = (ms: number) => {
  const minutes = Math.max(0, Math.round(ms / 60000));
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours} h ${minutes % 60} min` : `${minutes} min`;
};

interface OrderValue {
  qty: Record<string, number>;
  change: (id: string, delta: number) => void;
  saved: string[];
  toggleSaved: (id: string) => void;
  count: number;
  subtotal: number;
  openBag: () => void;
}

const OrderContext = createContext<OrderValue | null>(null);

export function useOrder() {
  const value = use(OrderContext);
  if (!value) throw new Error('useOrder must be used inside OrderProvider');
  return value;
}

function Line({
  product,
  count,
  onChange,
}: {
  product: Product;
  count: number;
  onChange: (delta: number) => void;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-tpl-surface">
        {product.cut ? (
          <Image
            src={product.cut}
            alt=""
            fill
            sizes="64px"
            className="object-contain p-1.5"
          />
        ) : (
          <Pic
            picture={PICTURES[product.picture]}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold text-tpl-ink">
          {product.name}
        </span>
        <span className="block text-[13px] text-tpl-muted">
          {rm(product.price)} / {product.unit}
        </span>
      </span>
      <span className="inline-flex h-9 items-center rounded-full border border-tpl-line">
        <button
          type="button"
          onClick={() => onChange(-1)}
          aria-label={`One less ${product.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-tpl-surface"
        >
          <Minus size={14} aria-hidden="true" />
        </button>
        <span className="w-5 text-center text-[14px] font-semibold tabular-nums">
          {count}
        </span>
        <button
          type="button"
          onClick={() => onChange(1)}
          aria-label={`One more ${product.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-tpl-surface"
        >
          <Plus size={14} aria-hidden="true" />
        </button>
      </span>
    </li>
  );
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState<string[]>([]);
  const [slot, setSlot] = useState(SLOTS[0].id);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const now = useNow();

  const lines = PRODUCTS.filter((product) => qty[product.id]);
  const count = lines.reduce((sum, product) => sum + qty[product.id], 0);
  const subtotal = lines.reduce(
    (sum, product) => sum + qty[product.id] * product.price,
    0
  );
  const delivery = subtotal >= FREE_DELIVERY_AT || !subtotal ? 0 : DELIVERY_FEE;
  const short = Math.max(0, MIN_ORDER - subtotal);
  const chosen = SLOTS.find((item) => item.id === slot) ?? SLOTS[0];
  const plan = now ? planFor(now) : null;
  const day = plan ? dayName(plan.day) : 'tomorrow';

  const change = (id: string, delta: number) => {
    setQty((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      const rest = { ...prev };
      if (next) rest[id] = next;
      else delete rest[id];
      return rest;
    });
    if (delta > 0) {
      clearTimeout(timer.current);
      setAdded(id);
      timer.current = setTimeout(() => setAdded(null), 2400);
    }
  };

  const toggleSaved = (id: string) =>
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

  const openBag = () => {
    setAdded(null);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const message = [
    `Hi ${BRAND}! My order for ${day}, ${chosen.label}:`,
    ...lines.map(
      (product) =>
        `• ${qty[product.id]} × ${product.name} (${product.unit}): ${rm(qty[product.id] * product.price)}`
    ),
    `Subtotal: ${rm(subtotal)}`,
    `Delivery: ${delivery ? rm(delivery) : 'free'}`,
    `Total: ${rm(subtotal + delivery)}`,
    '',
    'Name:',
    'Address and postcode:',
  ].join('\n');

  const toast = added ? productById(added) : null;

  return (
    <OrderContext
      value={{ qty, change, saved, toggleSaved, count, subtotal, openBag }}
    >
      {children}

      <div
        aria-live="polite"
        className={`fixed right-4 top-[calc(var(--demo-bar)+5.5rem)] z-[65] w-[min(21rem,calc(100vw-2rem))] transition duration-200 ${
          toast
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        {toast && (
          <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tpl-accent text-white">
              <Check size={16} aria-hidden="true" />
            </span>
            <p className="min-w-0 flex-1 text-[14px] text-tpl-ink">
              <span className="font-semibold">{toast.name}</span> added to cart
            </p>
            <button
              type="button"
              onClick={openBag}
              className="h-9 shrink-0 rounded-full bg-tpl-ink px-4 text-[13px] font-semibold text-white"
            >
              View cart
            </button>
          </div>
        )}
      </div>

      {count > 0 && (
        <div className="fixed inset-x-3 bottom-3 z-[55] md:hidden">
          <button
            type="button"
            onClick={openBag}
            className="flex h-14 w-full items-center justify-between rounded-full bg-tpl-accent px-6 text-[14px] font-semibold text-white shadow-lg"
          >
            <span>View cart</span>
            <span className="tabular-nums">
              {count} {count === 1 ? 'item' : 'items'}, {rm(subtotal)}
            </span>
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Close cart"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="petik-cart-title"
            className="petik-drawer absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white"
          >
            <div className="flex items-center justify-between border-b border-tpl-line px-6 py-5">
              <h2
                id="petik-cart-title"
                className="font-[family-name:var(--petik-display)] text-[22px] font-medium uppercase text-tpl-ink"
              >
                Your cart
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close cart"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-tpl-surface"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {lines.length ? (
                <ul className="space-y-4">
                  {lines.map((product) => (
                    <Line
                      key={product.id}
                      product={product}
                      count={qty[product.id]}
                      onChange={(delta) => change(product.id, delta)}
                    />
                  ))}
                </ul>
              ) : (
                <p className="py-10 text-center text-[14px] text-tpl-muted">
                  Your cart is empty.
                </p>
              )}

              <div className="mt-8">
                <p className="text-[14px] font-semibold text-tpl-ink">
                  Delivery for {day}
                </p>
                <div
                  role="radiogroup"
                  aria-label="Delivery slot"
                  className="mt-3 grid grid-cols-3 gap-2"
                >
                  {SLOTS.map((item) => {
                    const on = item.id === slot;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setSlot(item.id)}
                        className={`h-11 rounded-full text-[13px] font-semibold transition-colors ${
                          on
                            ? 'bg-tpl-accent text-white'
                            : 'bg-tpl-surface text-tpl-ink hover:bg-tpl-line'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                {plan && (
                  <p className="mt-3 text-[13px] text-tpl-muted">
                    Orders for {day} close in {duration(plan.left)}.
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-tpl-line px-6 py-5">
              {subtotal > 0 && subtotal < FREE_DELIVERY_AT && (
                <div className="mb-4">
                  <p className="text-[13px] text-tpl-muted">
                    Add {rm(FREE_DELIVERY_AT - subtotal)} more for free
                    delivery.
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-tpl-surface">
                    <div
                      className="h-full rounded-full bg-tpl-accent"
                      style={{
                        width: `${Math.min(100, (subtotal / FREE_DELIVERY_AT) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              <dl className="space-y-1.5 text-[14px] tabular-nums">
                <div className="flex justify-between text-tpl-muted">
                  <dt>Subtotal</dt>
                  <dd>{rm(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-tpl-muted">
                  <dt>Delivery</dt>
                  <dd>{delivery ? rm(delivery) : 'Free'}</dd>
                </div>
                <div className="flex justify-between pt-1 text-[18px] font-semibold text-tpl-ink">
                  <dt>Total</dt>
                  <dd>{rm(subtotal + delivery)}</dd>
                </div>
              </dl>
              <button
                type="button"
                disabled={!lines.length || short > 0}
                onClick={() => setPreview(true)}
                className="mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-tpl-accent font-[family-name:var(--petik-display)] text-[14px] font-medium uppercase tracking-[1px] text-white transition hover:brightness-95 disabled:opacity-40"
              >
                <SiWhatsapp size={18} aria-hidden="true" />
                Order on WhatsApp
              </button>
              <p className="mt-2 text-center text-[13px] text-tpl-muted">
                {short > 0 && lines.length
                  ? `Minimum order ${rm(MIN_ORDER)}. Add ${rm(short)} more.`
                  : 'We reply with the final total. Pay by DuitNow, transfer or cash.'}
              </p>
            </div>
          </aside>
        </div>
      )}

      <OrderPreview
        open={preview}
        message={message}
        onClose={() => setPreview(false)}
      />
    </OrderContext>
  );
}

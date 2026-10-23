'use client';

import { createContext, use, useRef, useState, type ReactNode } from 'react';
import { Check, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import OrderPreview from './OrderPreview';
import Photo from './Photo';

export interface BagProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface BagLine {
  key: string;
  product: BagProduct;
  variant?: string;
  qty: number;
}

interface BagContextValue {
  count: number;
  total: number;
  add: (product: BagProduct, variant?: string, qty?: number) => void;
  openBag: () => void;
}

const BagContext = createContext<BagContextValue | null>(null);

export function useBag() {
  const context = use(BagContext);
  if (!context) throw new Error('useBag must be used inside BagProvider');
  return context;
}

export const rm = (amount: number) =>
  `RM${amount.toLocaleString('en-MY', { maximumFractionDigits: 2 })}`;

export function QtyStepper({
  qty,
  name,
  onChange,
  min = 0,
  max,
}: {
  qty: number;
  name: string;
  onChange: (delta: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex h-10 w-fit items-center rounded-full border border-tpl-line">
      <button
        type="button"
        onClick={() => onChange(-1)}
        disabled={qty <= min}
        aria-label={`One less ${name}`}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-tpl-tint disabled:opacity-30"
      >
        <Minus size={14} />
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onChange(1)}
        disabled={max !== undefined && qty >= max}
        aria-label={`One more ${name}`}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-tpl-tint disabled:opacity-30"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export function BagProvider({
  brand,
  freeShippingAt,
  note,
  buttonClassName = 'rounded-full',
  children,
}: {
  brand: string;
  freeShippingAt?: number;
  note: string;
  buttonClassName?: string;
  children: ReactNode;
}) {
  const [lines, setLines] = useState<BagLine[]>([]);
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toast, setToast] = useState<BagLine | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const total = lines.reduce(
    (sum, line) => sum + line.qty * line.product.price,
    0
  );
  const remaining = freeShippingAt ? Math.max(0, freeShippingAt - total) : 0;

  const change = (key: string, delta: number) =>
    setLines((prev) =>
      prev
        .map((line) =>
          line.key === key ? { ...line, qty: line.qty + delta } : line
        )
        .filter((line) => line.qty > 0)
    );

  const add = (product: BagProduct, variant?: string, qty = 1) => {
    const key = variant ? `${product.id}:${variant}` : product.id;
    setLines((prev) =>
      prev.some((line) => line.key === key)
        ? prev.map((line) =>
            line.key === key ? { ...line, qty: line.qty + qty } : line
          )
        : [...prev, { key, product, variant, qty }]
    );
    clearTimeout(toastTimer.current);
    setToast({ key, product, variant, qty });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const openBag = () => {
    setToast(null);
    setOpen(true);
  };

  const message = [
    `Hi ${brand}! I'd like to order:`,
    ...lines.map(
      (line) =>
        `• ${line.qty} × ${line.product.name}${line.variant ? ` (${line.variant})` : ''}: ${rm(line.qty * line.product.price)}`
    ),
    `Subtotal: ${rm(total)}`,
    '',
    'Name:',
    'Delivery address:',
  ].join('\n');

  return (
    <BagContext value={{ count, total, add, openBag }}>
      {children}

      <div
        aria-live="polite"
        className={`fixed right-4 top-4 z-[75] w-[min(22rem,calc(100vw-2rem))] transition-all duration-300 ${
          toast
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-3 opacity-0'
        }`}
      >
        {toast && (
          <div className="flex items-center gap-3 rounded-2xl bg-tpl-surface p-3 text-tpl-ink shadow-2xl ring-1 ring-tpl-line">
            <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-tpl-tint">
              <Photo
                src={toast.product.image}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-tpl-accent">
                <Check size={14} aria-hidden="true" />
                Added to bag
              </p>
              <p className="truncate text-sm font-medium">
                {toast.product.name}
              </p>
            </div>
            <button
              type="button"
              onClick={openBag}
              className={`h-9 shrink-0 bg-tpl-ink px-3.5 text-xs font-semibold text-tpl-bg ${buttonClassName}`}
            >
              View bag
            </button>
          </div>
        )}
      </div>

      <div
        className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        inert={!open}
      >
        <button
          type="button"
          aria-label="Close bag"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        />
        <aside
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-labelledby="tpl-bag-title"
          onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
          className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-tpl-bg text-tpl-ink shadow-2xl transition-transform duration-300 ease-out ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-6 pb-4 pt-6">
            <h2 id="tpl-bag-title" className="text-xl font-semibold">
              Your bag{' '}
              <span className="font-normal text-tpl-muted">({count})</span>
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close bag"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-tpl-tint"
            >
              <X size={20} />
            </button>
          </div>

          {freeShippingAt && (
            <div className="mx-6 rounded-2xl bg-tpl-tint px-4 py-3">
              <p className="text-sm">
                {remaining > 0 ? (
                  <>
                    Add <strong>{rm(remaining)}</strong> more for free postage
                  </>
                ) : (
                  <strong>You have free postage</strong>
                )}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-tpl-line">
                <div
                  className="h-full rounded-full bg-tpl-accent transition-[width] duration-500"
                  style={{
                    width: `${Math.min(100, (total / freeShippingAt) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-2">
            {lines.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-tpl-muted">
                <ShoppingBag size={32} aria-hidden="true" />
                <p className="text-sm">Your bag is empty.</p>
              </div>
            ) : (
              <ul className="divide-y divide-tpl-line">
                {lines.map((line) => (
                  <li key={line.key} className="flex gap-4 py-5">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-tpl-tint">
                      <Photo
                        src={line.product.image}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            {line.product.name}
                          </p>
                          {line.variant && (
                            <p className="mt-0.5 text-xs text-tpl-muted">
                              {line.variant}
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-semibold tabular-nums">
                          {rm(line.qty * line.product.price)}
                        </p>
                      </div>
                      <QtyStepper
                        qty={line.qty}
                        name={line.product.name}
                        onChange={(delta) => change(line.key, delta)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-tpl-line px-6 pb-6 pt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-tpl-muted">Subtotal</span>
              <span className="text-2xl font-semibold tabular-nums">
                {rm(total)}
              </span>
            </div>
            <p className="mt-1 text-xs text-tpl-muted">{note}</p>
            <button
              type="button"
              disabled={!lines.length}
              onClick={() => setPreviewOpen(true)}
              className={`mt-4 flex h-12 w-full items-center justify-center gap-2 bg-tpl-accent text-sm font-semibold text-tpl-on-accent transition-opacity hover:opacity-90 disabled:opacity-40 ${buttonClassName}`}
            >
              <SiWhatsapp size={17} aria-hidden="true" />
              Checkout on WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full text-center text-sm font-medium text-tpl-muted underline-offset-4 hover:text-tpl-ink hover:underline"
            >
              Continue shopping
            </button>
          </div>
        </aside>
      </div>

      <OrderPreview
        open={previewOpen}
        message={message}
        onClose={() => setPreviewOpen(false)}
      />
    </BagContext>
  );
}

export function BagButton({ className = '' }: { className?: string }) {
  const { count, openBag } = useBag();
  return (
    <button
      type="button"
      onClick={openBag}
      aria-label={`Open bag, ${count} ${count === 1 ? 'item' : 'items'}`}
      className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-tpl-tint ${className}`}
    >
      <ShoppingBag size={20} strokeWidth={1.75} aria-hidden="true" />
      {count > 0 && (
        <span
          key={count}
          className="absolute right-0.5 top-0.5 flex h-5 min-w-5 animate-[tpl-pop_300ms_ease-out] items-center justify-center rounded-full bg-tpl-accent px-1 text-[11px] font-bold text-tpl-on-accent"
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Phone-only bar so the bag is always one tap away while scrolling a shop.
export function MobileBagBar({
  className = 'rounded-full',
}: {
  className?: string;
}) {
  const { count, total, openBag } = useBag();
  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-40 transition-all duration-300 md:hidden ${
        count
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-6 opacity-0'
      }`}
      inert={!count}
    >
      <button
        type="button"
        onClick={openBag}
        className={`flex h-14 w-full items-center justify-between bg-tpl-ink px-5 text-tpl-bg shadow-2xl ${className}`}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <ShoppingBag size={18} aria-hidden="true" />
          View bag ({count})
        </span>
        <span className="text-sm font-semibold tabular-nums">{rm(total)}</span>
      </button>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import {
  BASE_PATH,
  colourway,
  FREE_DELIVERY_AT,
  productBySlug,
  rm,
} from './data';
import {
  availableFrom,
  cartCount,
  resolveLines,
  useHydrated,
  useStore,
} from './store';
import { BUTTON_ACCENT } from './ui';

function AddedToast() {
  const added = useStore((state) => state.added);
  const dismiss = useStore((state) => state.dismissAdded);
  const setCartOpen = useStore((state) => state.setCartOpen);
  const product = added ? productBySlug(added.slug) : null;

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(dismiss, 2600);
    return () => clearTimeout(timer);
  }, [added, dismiss]);

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-[75] w-[min(22rem,calc(100vw-2rem))] transition-all duration-300 md:bottom-6 md:right-6 ${
        product
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      {product && added && (
        <div className="flex items-center gap-3 rounded-[20px] bg-tpl-surface p-2.5 shadow-2xl ring-1 ring-tpl-line">
          <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-[14px] bg-white">
            <Image
              src={colourway(added.colour).image}
              alt=""
              fill
              sizes="64px"
              className="object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-tpl-accent">
              <Check size={14} aria-hidden="true" />
              Added to bag
            </p>
            <p className="truncate text-sm font-bold">{product.name}</p>
            <p className="truncate text-xs text-tpl-muted">
              {colourway(added.colour).name}, UK {added.size}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="h-9 shrink-0 rounded-full bg-tpl-accent px-4 text-xs font-bold text-tpl-on-accent"
          >
            View bag
          </button>
        </div>
      )}
    </div>
  );
}

export default function CartDrawer() {
  const hydrated = useHydrated();
  const open = useStore((state) => state.cartOpen);
  const cart = useStore((state) => state.cart);
  const sold = useStore((state) => state.sold);
  const setQty = useStore((state) => state.setQty);
  const setCartOpen = useStore((state) => state.setCartOpen);
  const lines = hydrated ? resolveLines(cart) : [];
  const subtotal = lines.reduce((sum, line) => sum + line.unit * line.qty, 0);
  const remaining = Math.max(0, FREE_DELIVERY_AT - subtotal);
  const close = () => setCartOpen(false);

  return (
    <>
      <AddedToast />
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
          onClick={close}
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        />
        <aside
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-labelledby="langkah-bag-title"
          onKeyDown={(event) => event.key === 'Escape' && close()}
          className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-tpl-bg shadow-2xl transition-transform duration-300 ease-out sm:inset-y-2 sm:right-2 sm:rounded-[28px] ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-6 pb-4 pt-6">
            <h2 id="langkah-bag-title" className="text-xl font-bold">
              Your bag{' '}
              <span className="font-normal text-tpl-muted">
                ({cartCount(lines)})
              </span>
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close bag"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-tpl-tint"
            >
              <X size={20} />
            </button>
          </div>

          {lines.length > 0 && (
            <div className="mx-6 rounded-[18px] bg-tpl-surface p-4 text-sm">
              {remaining > 0 ? (
                <>
                  Add <strong>{rm(remaining)}</strong> more for free delivery
                </>
              ) : (
                <strong>Free delivery unlocked</strong>
              )}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-tpl-tint">
                <div
                  className="h-full rounded-full bg-tpl-accent transition-[width] duration-500"
                  style={{
                    width: `${Math.min(100, (subtotal / FREE_DELIVERY_AT) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-3">
            {lines.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-tpl-muted">
                <ShoppingBag size={32} aria-hidden="true" />
                <p className="text-sm">Your bag is empty.</p>
                <Link
                  href={`${BASE_PATH}/shop`}
                  onClick={close}
                  className="text-sm font-bold text-tpl-ink underline underline-offset-4"
                >
                  Shop the Strider
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {lines.map((line) => {
                  const stock = availableFrom(sold, line.key);
                  return (
                    <li
                      key={line.key}
                      className="flex gap-3 rounded-[20px] bg-tpl-surface p-2.5"
                    >
                      <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-[14px] bg-white">
                        <Image
                          src={colourway(line.colour).image}
                          alt={line.product.name}
                          fill
                          sizes="112px"
                          className="object-contain"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div className="flex justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold">
                              {line.product.name}
                            </p>
                            <p className="text-xs text-tpl-muted">
                              {colourway(line.colour).name}, UK {line.size}
                            </p>
                            {line.qty > stock && (
                              <p className="mt-1 text-xs font-semibold text-red-500">
                                Only {stock} left
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-bold tabular-nums">
                            {rm(line.unit * line.qty)}
                          </p>
                        </div>
                        <div className="flex w-fit items-center gap-1 rounded-full bg-tpl-tint p-1">
                          <button
                            type="button"
                            onClick={() => setQty(line.key, line.qty - 1)}
                            aria-label={`One less ${line.product.name}`}
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-tpl-line"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-bold tabular-nums">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(line.key, line.qty + 1)}
                            disabled={line.qty >= stock}
                            aria-label={`One more ${line.product.name}`}
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-tpl-line disabled:opacity-30"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="m-3 mt-0 rounded-[24px] bg-tpl-surface p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-tpl-muted">Subtotal</span>
              <span className="text-2xl font-bold tabular-nums">
                {rm(subtotal)}
              </span>
            </div>
            {lines.length ? (
              <Link
                href={`${BASE_PATH}/checkout`}
                onClick={close}
                className={`${BUTTON_ACCENT} mt-4 w-full`}
              >
                Checkout
              </Link>
            ) : (
              <span className={`${BUTTON_ACCENT} mt-4 w-full opacity-40`}>
                Checkout
              </span>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

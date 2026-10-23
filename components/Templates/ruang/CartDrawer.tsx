'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, ShoppingBag, X } from 'lucide-react';
import Photo from '@components/Templates/Photo';
import { QtyStepper, rm } from '@components/Templates/Bag';
import { BASE_PATH, FREE_DELIVERY_AT, productBySlug } from './data';
import {
  availableFrom,
  cartCount,
  resolveLines,
  useHydrated,
  useStore,
} from './store';

const TOAST_MS = 2600;

function AddedToast() {
  const added = useStore((state) => state.added);
  const dismiss = useStore((state) => state.dismissAdded);
  const setCartOpen = useStore((state) => state.setCartOpen);
  const product = added ? productBySlug(added.slug) : null;

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(dismiss, TOAST_MS);
    return () => clearTimeout(timer);
  }, [added, dismiss]);

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-28 right-4 z-[75] w-[min(22rem,calc(100vw-2rem))] transition-all duration-300 md:bottom-6 md:right-6 ${
        product
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      {product && added && (
        <div className="flex items-center gap-3 rounded-[20px] bg-tpl-surface p-2.5 text-tpl-ink shadow-2xl ring-1 ring-tpl-line">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-tpl-tint">
            <Photo
              src={product.images[0]}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-medium">
              <Check size={14} aria-hidden="true" />
              Added to bag
            </p>
            <p className="truncate text-sm font-medium">{product.name}</p>
            {added.values.length > 0 && (
              <p className="truncate text-xs text-tpl-muted">
                {added.values.join(', ')}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="h-9 shrink-0 rounded-full bg-tpl-ink px-4 text-xs font-medium text-tpl-surface"
          >
            View bag
          </button>
        </div>
      )}
    </div>
  );
}

/** Phone-only bar so the cart stays one tap away while browsing. */
function MobileCartBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const cart = useStore((state) => state.cart);
  const setCartOpen = useStore((state) => state.setCartOpen);
  const count = hydrated ? cartCount(cart) : 0;
  const total = resolveLines(cart).reduce(
    (sum, line) => sum + line.unit * line.qty,
    0
  );
  const hidden =
    !count ||
    pathname.startsWith(`${BASE_PATH}/product/`) ||
    pathname.startsWith(`${BASE_PATH}/checkout`) ||
    pathname.startsWith(`${BASE_PATH}/order`);

  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-40 transition-all duration-300 md:hidden ${
        hidden
          ? 'pointer-events-none translate-y-6 opacity-0'
          : 'translate-y-0 opacity-100'
      }`}
      inert={hidden}
    >
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="flex h-14 w-full items-center justify-between rounded-full bg-tpl-ink px-5 text-tpl-surface shadow-2xl"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <ShoppingBag size={18} aria-hidden="true" />
          View bag ({count})
        </span>
        <span className="text-sm font-medium tabular-nums">{rm(total)}</span>
      </button>
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
  const count = cartCount(lines);
  const subtotal = lines.reduce((sum, line) => sum + line.unit * line.qty, 0);
  const remaining = Math.max(0, FREE_DELIVERY_AT - subtotal);
  const close = () => setCartOpen(false);

  return (
    <>
      <AddedToast />
      <MobileCartBar />

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
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        />
        <aside
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-labelledby="ruang-bag-title"
          onKeyDown={(event) => event.key === 'Escape' && close()}
          className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-hidden bg-tpl-bg text-tpl-ink shadow-2xl transition-transform duration-300 ease-out sm:inset-y-2 sm:right-2 sm:rounded-[28px] ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-6 pb-4 pt-6">
            <h2
              id="ruang-bag-title"
              className="text-xl font-semibold tracking-[-0.02em]"
            >
              Your bag{' '}
              <span className="font-normal text-tpl-muted">({count})</span>
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close bag"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-tpl-surface transition-colors hover:bg-tpl-tint"
            >
              <X size={20} />
            </button>
          </div>

          {lines.length > 0 && (
            <div className="mx-6 rounded-[20px] bg-tpl-surface p-4">
              <p className="text-sm">
                {remaining > 0 ? (
                  <>
                    Add <strong>{rm(remaining)}</strong> more for free standard
                    delivery
                  </>
                ) : (
                  <strong>Standard delivery is on us</strong>
                )}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-tpl-tint">
                <div
                  className="h-full rounded-full bg-tpl-accent transition-[width] duration-500"
                  style={{
                    width: `${Math.min(100, (subtotal / FREE_DELIVERY_AT) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-2">
            {lines.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-tpl-muted">
                <ShoppingBag size={32} aria-hidden="true" />
                <p className="text-sm">Your bag is empty.</p>
                <Link
                  href={`${BASE_PATH}/shop`}
                  onClick={close}
                  className="text-sm font-medium text-tpl-ink underline underline-offset-4"
                >
                  Browse the shop
                </Link>
              </div>
            ) : (
              <ul className="space-y-3 py-2">
                {lines.map((line) => {
                  const stock = availableFrom(sold, line.key);
                  return (
                    <li
                      key={line.key}
                      className="flex gap-3 rounded-[20px] bg-tpl-surface p-2.5"
                    >
                      <Link
                        href={`${BASE_PATH}/product/${line.slug}`}
                        onClick={close}
                        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-tpl-tint"
                      >
                        <Photo
                          src={line.product.images[0]}
                          alt={line.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                        <div className="flex justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              {line.product.name}
                            </p>
                            {line.values.length > 0 && (
                              <p className="mt-0.5 text-xs text-tpl-muted">
                                {line.values.join(', ')}
                              </p>
                            )}
                            {line.qty > stock && (
                              <p className="mt-1 text-xs font-medium text-red-600">
                                Only {stock} left
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-semibold tabular-nums">
                            {rm(line.qty * line.unit)}
                          </p>
                        </div>
                        <QtyStepper
                          qty={line.qty}
                          name={line.product.name}
                          max={stock}
                          onChange={(delta) =>
                            setQty(line.key, line.qty + delta)
                          }
                        />
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
              <span className="text-2xl font-semibold tabular-nums">
                {rm(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-xs text-tpl-muted">
              Delivery and discount codes at checkout.
            </p>
            {lines.length ? (
              <Link
                href={`${BASE_PATH}/checkout`}
                onClick={close}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-tpl-ink text-sm font-medium text-tpl-surface transition-opacity hover:opacity-85"
              >
                Checkout
              </Link>
            ) : (
              <span className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-tpl-ink text-sm font-medium text-tpl-surface opacity-40">
                Checkout
              </span>
            )}
            <button
              type="button"
              onClick={close}
              className="mt-3 w-full text-center text-sm font-medium text-tpl-muted underline-offset-4 hover:text-tpl-ink hover:underline"
            >
              Continue shopping
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}

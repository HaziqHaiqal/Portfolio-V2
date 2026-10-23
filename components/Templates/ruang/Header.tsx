'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import {
  BASE_PATH,
  BRAND,
  CATEGORIES,
  DISCOUNT,
  FREE_DELIVERY_AT,
} from './data';
import { cartCount, useHydrated, useStore } from './store';
import { CONTAINER, Logo } from './ui';

export const SHOP_LINKS = [
  { href: `${BASE_PATH}/shop`, label: 'Shop all' },
  ...CATEGORIES.map((category) => ({
    href: `${BASE_PATH}/shop?category=${category.id}`,
    label: category.label,
  })),
];

const NAV = [
  { href: `${BASE_PATH}/shop`, label: 'Shop' },
  { href: `${BASE_PATH}/shop?category=tableware`, label: 'Tableware' },
  { href: `${BASE_PATH}/shop?category=decor`, label: 'Lamps & vases' },
  { href: `${BASE_PATH}/shop?sale=1`, label: 'Sale' },
];

const ICON_BUTTON =
  'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tpl-surface transition-colors hover:bg-tpl-tint';

function Count({ value, dark = false }: { value: number; dark?: boolean }) {
  if (!value) return null;
  return (
    <span
      key={value}
      className={`absolute -right-0.5 -top-0.5 flex h-5 min-w-5 animate-[tpl-pop_300ms_ease-out] items-center justify-center rounded-full px-1 text-[11px] font-semibold ${
        dark
          ? 'bg-tpl-accent text-tpl-on-accent'
          : 'bg-tpl-ink text-tpl-surface'
      }`}
    >
      {value}
    </span>
  );
}

function SearchField({
  className = '',
  onDone,
}: {
  className?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    router.push(
      term
        ? `${BASE_PATH}/shop?q=${encodeURIComponent(term)}`
        : `${BASE_PATH}/shop`
    );
    onDone?.();
  };

  return (
    <form role="search" onSubmit={submit} className={`relative ${className}`}>
      <label htmlFor="ruang-search" className="sr-only">
        Search products
      </label>
      <input
        id="ruang-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search vases, mugs, linen"
        className="h-11 w-full rounded-full bg-tpl-surface pl-11 pr-4 text-sm outline-none ring-1 ring-transparent transition-shadow placeholder:text-tpl-muted focus:ring-tpl-ink/30"
      />
      <Search
        size={17}
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-tpl-muted"
      />
    </form>
  );
}

export default function Header() {
  const pathname = usePathname();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const count = useStore((state) => cartCount(state.cart));
  const savedCount = useStore((state) => state.saved.length);
  const setCartOpen = useStore((state) => state.setCartOpen);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const current = `${pathname}${params.size ? `?${params}` : ''}`;

  return (
    <>
      <p className="bg-tpl-accent px-4 py-2 text-center text-xs font-medium text-tpl-on-accent sm:text-sm">
        Free delivery above RM{FREE_DELIVERY_AT}. Use {DISCOUNT.code} for RM
        {DISCOUNT.amount} off orders over RM{DISCOUNT.minSpend}.
      </p>
      <header className="sticky top-[--demo-bar] z-30 bg-tpl-bg/85 backdrop-blur-xl">
        <div className={`${CONTAINER} flex h-[4.5rem] items-center gap-3`}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className={`${ICON_BUTTON} lg:hidden`}
          >
            <Menu size={19} />
          </button>
          <Link href={BASE_PATH} aria-label={`${BRAND} home`} className="mr-2">
            <Logo />
          </Link>
          <nav
            aria-label="Main"
            className="hidden items-center gap-1 rounded-full bg-tpl-surface p-1 lg:flex"
          >
            {NAV.map((link) => {
              const active = current === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    active ? 'bg-tpl-ink text-tpl-surface' : 'hover:bg-tpl-tint'
                  } ${link.label === 'Sale' && !active ? 'text-rose-600' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <SearchField className="ml-auto hidden w-72 md:block xl:w-80" />
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <button
              type="button"
              onClick={() => setSearching((value) => !value)}
              aria-label="Search"
              aria-expanded={searching}
              className={`${ICON_BUTTON} md:hidden`}
            >
              <Search size={18} />
            </button>
            <Link
              href={`${BASE_PATH}/shop?saved=1`}
              aria-label={`Wishlist, ${hydrated ? savedCount : 0} saved`}
              className={ICON_BUTTON}
            >
              <Heart size={18} />
              <Count value={hydrated ? savedCount : 0} />
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Open bag, ${hydrated ? count : 0} ${count === 1 ? 'item' : 'items'}`}
              className="relative flex h-11 items-center gap-2 rounded-full bg-tpl-ink pl-4 pr-4 text-sm font-medium text-tpl-surface transition-opacity hover:opacity-85"
            >
              <ShoppingBag size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Bag</span>
              <Count value={hydrated ? count : 0} dark />
            </button>
          </div>
        </div>
        {searching && (
          <div className={`${CONTAINER} pb-3 md:hidden`}>
            <SearchField onDone={() => setSearching(false)} />
          </div>
        )}
      </header>

      <div
        className={`fixed inset-0 z-[70] transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        inert={!open}
        onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/40"
        />
        <nav
          aria-label="Menu"
          className={`absolute inset-y-2 left-2 flex w-[85%] max-w-sm flex-col rounded-[24px] bg-tpl-surface p-5 text-tpl-ink transition-transform duration-300 ${
            open ? 'translate-x-0' : '-translate-x-[110%]'
          }`}
        >
          <div className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-tpl-tint"
            >
              <X size={19} />
            </button>
          </div>
          <ul className="mt-6 space-y-1">
            {[
              ...SHOP_LINKS,
              { href: `${BASE_PATH}/shop?sale=1`, label: 'Sale' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg font-medium hover:bg-tpl-tint"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-auto rounded-2xl bg-tpl-tint p-4 text-sm leading-relaxed text-tpl-muted">
            Free delivery above RM{FREE_DELIVERY_AT}. Same-day pickup at our
            Damansara Kim studio.
          </p>
        </nav>
      </div>
    </>
  );
}

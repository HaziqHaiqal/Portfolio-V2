'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, ShoppingBag } from 'lucide-react';
import { BASE_PATH } from './data';
import { cartCount, useHydrated, useStore } from './store';
import { CONTAINER, Wordmark } from './ui';

const LINKS = [
  { href: `${BASE_PATH}/shop`, label: 'Shop' },
  { href: `${BASE_PATH}/product/strider`, label: 'Strider' },
  { href: `${BASE_PATH}/product/strider-pro`, label: 'Pro' },
  { href: `${BASE_PATH}/product/strider-max`, label: 'Max' },
];

export default function Header() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const count = useStore((state) => (hydrated ? cartCount(state.cart) : 0));
  const saved = useStore((state) => (hydrated ? state.saved.length : 0));
  const setCartOpen = useStore((state) => state.setCartOpen);

  return (
    <header className="sticky top-[--demo-bar] z-40 border-b border-tpl-line/60 bg-tpl-bg/80 backdrop-blur-xl">
      <div
        className={`${CONTAINER} flex h-16 items-center justify-between gap-4`}
      >
        <Wordmark />
        <nav aria-label="Shop" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-tpl-tint text-tpl-ink'
                    : 'text-tpl-muted hover:text-tpl-ink'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={`${BASE_PATH}/shop?saved=1`}
            aria-label={`Saved items, ${saved}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-tpl-tint transition-colors hover:bg-tpl-line"
          >
            <Heart size={17} aria-hidden="true" />
            {saved > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-tpl-accent px-1 text-[10px] font-bold text-tpl-on-accent">
                {saved}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex h-10 items-center gap-2 rounded-full bg-tpl-accent px-4 text-sm font-bold text-tpl-on-accent"
          >
            <ShoppingBag size={16} aria-hidden="true" />
            <span className="tabular-nums">{count}</span>
            <span className="sr-only">items in your bag</span>
          </button>
        </div>
      </div>
      <nav
        aria-label="Shop"
        className={`${CONTAINER} -mt-1 flex gap-1 overflow-x-auto pb-2 [scrollbar-width:none] md:hidden`}
      >
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              pathname === link.href
                ? 'bg-tpl-tint text-tpl-ink'
                : 'text-tpl-muted'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

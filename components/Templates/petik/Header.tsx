'use client';

import { useEffect, useState } from 'react';
import { Heart, Menu, Search, ShoppingCart, X } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { PHONE } from './data';
import { useOrder } from './Order';
import { DISPLAY } from './ui';

export const showCategory = (id: string) =>
  window.dispatchEvent(new CustomEvent('petik:category', { detail: id }));

const LINKS = [
  { href: '#top', label: 'Home' },
  { href: '#shop', label: 'Fruit', category: 'fruit' },
  { href: '#shop', label: 'Vegetables', category: 'vegetables' },
  { href: '#shop', label: 'Eggs & kitchen', category: 'kitchen' },
  { href: '#farms', label: 'Our farms' },
];

export function Logo() {
  return (
    <a
      href="#top"
      className="inline-flex items-center gap-2"
      aria-label="Petik, home"
    >
      <svg viewBox="0 0 36 36" className="h-9 w-9" aria-hidden="true">
        <circle cx="17" cy="21" r="12" fill="#EF8829" />
        <circle cx="13" cy="17" r="3.5" fill="#fff" opacity="0.35" />
        <path d="M18 9c1-4 5-6 9-5-1 4-5 6-9 5Z" fill="#86BA09" />
        <path
          d="M17 10c0-2 .5-3.5 1.5-5"
          stroke="#3B2A1A"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span
        className={`${DISPLAY} text-[30px] font-semibold leading-none tracking-[-0.02em] text-tpl-ink`}
      >
        Petik
      </span>
    </a>
  );
}

export default function Header() {
  const { count, saved, openBag } = useOrder();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  const pick = (category?: string) => {
    if (category) showCategory(category);
    setMenu(false);
  };

  const search = () => {
    showCategory('all');
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
    window.setTimeout(
      () =>
        document.getElementById('petik-search')?.focus({ preventScroll: true }),
      600
    );
  };

  const badge =
    'absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#EF8829] px-1 text-[11px] font-semibold text-white';

  return (
    <>
      <div className="bg-white">
        <div className="mx-auto grid h-20 max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 md:h-24">
          <div>
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
            <p className="hidden items-center gap-2 text-[13px] text-tpl-muted md:flex">
              <SiWhatsapp
                size={15}
                aria-hidden="true"
                className="text-[#25D366]"
              />
              Order on WhatsApp {PHONE}
            </p>
          </div>
          <Logo />
          <div className="flex justify-end">
            <a
              href="#farms"
              className={`${DISPLAY} hidden h-12 items-center rounded-full border border-neutral-200 px-8 text-[12px] font-medium uppercase tracking-[2px] text-tpl-ink transition-colors hover:border-tpl-accent hover:text-tpl-accent md:inline-flex`}
            >
              Our farms
            </a>
            <button
              type="button"
              onClick={openBag}
              aria-label={`Open cart, ${count} items`}
              className="relative flex h-10 w-10 items-center justify-center md:hidden"
            >
              <ShoppingCart size={21} aria-hidden="true" />
              {count > 0 && <span className={badge}>{count}</span>}
            </button>
          </div>
        </div>
      </div>

      <nav
        aria-label="Shop"
        className={`sticky top-[--demo-bar] z-50 hidden transition-[background-color,box-shadow] duration-300 md:block ${
          scrolled
            ? 'bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]'
            : 'bg-tpl-tint'
        }`}
      >
        <div className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between px-6">
          <button
            type="button"
            onClick={search}
            aria-label="Search the shop"
            className="flex h-10 w-10 items-center justify-center rounded-full text-tpl-ink transition-colors hover:text-tpl-accent"
          >
            <Search size={22} aria-hidden="true" />
          </button>
          <ul className="flex items-center gap-9">
            {LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => pick(link.category)}
                  className={`${DISPLAY} text-[14px] font-medium uppercase tracking-[0.5px] text-tpl-ink transition-colors hover:text-tpl-accent`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <a
              href="#shop"
              onClick={() => pick('saved')}
              aria-label={`Saved items, ${saved.length}`}
              className="relative flex h-10 w-10 items-center justify-center text-tpl-ink transition-colors hover:text-tpl-accent"
            >
              <Heart size={22} aria-hidden="true" />
              <span className={badge}>{saved.length}</span>
            </a>
            <button
              type="button"
              onClick={openBag}
              aria-label={`Open cart, ${count} items`}
              className="relative flex h-10 w-10 items-center justify-center text-tpl-ink transition-colors hover:text-tpl-accent"
            >
              <ShoppingCart size={22} aria-hidden="true" />
              <span className={badge}>{count}</span>
            </button>
          </div>
        </div>
      </nav>

      {menu && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenu(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="petik-menu absolute inset-y-0 left-0 w-[82%] max-w-xs bg-white p-6">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setMenu(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <ul className="mt-8 space-y-1">
              {LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => pick(link.category)}
                    className={`${DISPLAY} block rounded-lg py-3 text-[16px] font-medium uppercase tracking-[0.5px] text-tpl-ink`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#shop"
                  onClick={() => pick('saved')}
                  className={`${DISPLAY} block rounded-lg py-3 text-[16px] font-medium uppercase tracking-[0.5px] text-tpl-ink`}
                >
                  Saved ({saved.length})
                </a>
              </li>
            </ul>
            <p className="mt-8 flex items-center gap-2 text-[14px] text-tpl-muted">
              <SiWhatsapp
                size={16}
                aria-hidden="true"
                className="text-[#25D366]"
              />
              {PHONE}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

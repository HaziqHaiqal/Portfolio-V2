'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useScrolled } from '@components/Templates/motion';
import { BASE_PATH, NAV } from './data';

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-tpl-accent text-xs font-bold text-tpl-on-accent">
        TB
      </span>
      <span className="text-lg font-semibold tracking-tight">Teras Bina</span>
    </span>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const home = pathname === BASE_PATH;
  const scrolled = useScrolled(40);
  const clear = home && !scrolled && !open;

  return (
    <header
      className={`sticky top-0 z-30 transition-colors duration-500 ${home ? '-mb-16' : ''} ${
        clear
          ? 'text-white'
          : 'border-b border-tpl-line bg-tpl-bg/90 text-tpl-ink backdrop-blur-xl'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href={BASE_PATH} aria-label="Teras Bina home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`border-b-2 py-1 text-sm font-medium transition-opacity hover:opacity-100 ${
                  active ? 'border-tpl-accent' : 'border-transparent opacity-75'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={`${BASE_PATH}/contact`}
            className="hidden h-10 items-center rounded-full bg-tpl-accent px-5 text-sm font-semibold text-tpl-on-accent transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Request a quote
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-tpl-tint lg:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 lg:hidden ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        inert={!open}
      >
        <nav aria-label="Mobile" className="min-h-0">
          <div className="space-y-1 px-5 pb-5 pt-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-3 text-lg font-medium hover:bg-tpl-tint"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={`${BASE_PATH}/contact`}
              onClick={() => setOpen(false)}
              className="mt-3 flex h-12 items-center justify-center rounded-full bg-tpl-accent text-sm font-semibold text-tpl-on-accent"
            >
              Request a quote
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

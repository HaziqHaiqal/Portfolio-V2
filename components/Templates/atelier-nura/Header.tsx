'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { BagButton, MobileBagBar } from '@components/Templates/Bag';
import { useScrolled } from '@components/Templates/motion';
import { BASE_PATH, CATEGORIES } from './data';

const SHOP_LINKS = [
  { href: `${BASE_PATH}/shop`, label: 'Shop all' },
  ...CATEGORIES.map((category) => ({
    href: `${BASE_PATH}/shop?category=${category}`,
    label: category,
  })),
];
const INFO_LINKS = [
  { href: `${BASE_PATH}/about`, label: 'Our story' },
  { href: `${BASE_PATH}/contact`, label: 'Visit us' },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const home = pathname === BASE_PATH;
  const scrolled = useScrolled(40);
  const clear = home && !scrolled;

  const linkClass = (href: string) =>
    `text-sm transition-opacity hover:opacity-100 ${
      pathname === href ? 'opacity-100' : 'opacity-70'
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-30 transition-colors duration-500 ${home ? '-mb-16' : ''} ${
          clear
            ? 'text-white'
            : 'border-b border-tpl-line bg-tpl-bg/90 text-tpl-ink backdrop-blur-xl'
        }`}
      >
        <div className="mx-auto grid h-16 max-w-[90rem] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8">
          <div className="flex items-center gap-7">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="-ml-2 flex h-11 w-11 items-center justify-center md:hidden"
            >
              <Menu size={22} strokeWidth={1.75} />
            </button>
            <nav aria-label="Shop" className="hidden gap-7 md:flex">
              {SHOP_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={linkClass(link.href)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href={BASE_PATH}
            className="text-lg font-semibold uppercase tracking-[0.28em] md:text-xl"
          >
            Atelier Nura
          </Link>
          <div className="flex items-center justify-end gap-7">
            <nav aria-label="About" className="hidden gap-7 lg:flex">
              {INFO_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={linkClass(link.href)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <BagButton className="-mr-2" />
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[70] transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        inert={!open}
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
          className={`absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-tpl-bg px-6 py-5 transition-transform duration-300 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="-ml-2 flex h-11 w-11 items-center justify-center"
          >
            <X size={22} />
          </button>
          <ul className="mt-6 space-y-1">
            {[...SHOP_LINKS, ...INFO_LINKS].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-2xl font-medium tracking-tight"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {!pathname.startsWith(`${BASE_PATH}/shop/`) && (
        <MobileBagBar className="rounded-none" />
      )}
    </>
  );
}

'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useScrolled } from './motion';

/**
 * Sticky header that sits clear over a full-bleed hero, then turns solid once
 * the page scrolls. Children can style themselves with
 * `group-data-[clear=true]:` for the over-photo state.
 */
export default function SiteHeader({
  brand,
  links,
  overlay = false,
  children,
}: {
  brand: ReactNode;
  links: { href: string; label: string }[];
  overlay?: boolean;
  children?: ReactNode;
}) {
  const scrolled = useScrolled(40);
  const clear = overlay && !scrolled;

  return (
    <header
      data-clear={clear}
      className={`group sticky top-[--demo-bar] z-30 transition-colors duration-500 ${
        overlay ? '-mb-16' : ''
      } ${
        clear
          ? 'border-b border-transparent text-white'
          : 'border-b border-tpl-line bg-tpl-bg/85 text-tpl-ink backdrop-blur-xl'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-5 md:px-8">
        {brand}
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {links.map((link) =>
            link.href.startsWith('#') ? (
              <a
                key={link.href}
                href={link.href}
                className="opacity-75 transition-opacity hover:opacity-100"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="opacity-75 transition-opacity hover:opacity-100"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}

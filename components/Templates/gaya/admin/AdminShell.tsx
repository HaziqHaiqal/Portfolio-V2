'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { Logo } from '../Header';
import { BASE_PATH } from '../data';

export const ADMIN = `${BASE_PATH}/admin`;

const TABS = [
  { href: ADMIN, label: 'Orders' },
  { href: `${ADMIN}/products`, label: 'Products' },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="gaya-adm">
      <header className="gaya-adm-head">
        <div className="gaya-adm-in">
          <div className="flex items-baseline gap-3">
            <Logo />
            <span className="text-[13px] font-semibold text-tpl-ink/70">
              Admin
            </span>
          </div>
          <nav aria-label="Admin" className="gaya-adm-tabs order-last w-full md:order-none md:w-auto">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={
                  tab.href === ADMIN
                    ? path === ADMIN
                      ? 'page'
                      : undefined
                    : path.startsWith(tab.href)
                      ? 'page'
                      : undefined
                }
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          <Link
            href={BASE_PATH}
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold"
          >
            View store
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </header>
      <main className="gaya-adm-in pb-20 pt-7">{children}</main>
    </div>
  );
}

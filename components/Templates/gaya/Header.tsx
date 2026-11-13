'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BagButton, MobileBagBar } from '@components/Templates/Bag';
import { BASE_PATH, BRAND, LISTS, listHref } from './data';

export function Logo({ className = '' }: { className?: string }) {
  return <span className={`gaya-logo ${className}`}>{BRAND}</span>;
}

export default function Header() {
  const path = usePathname();
  return (
    <>
      <header className="sticky top-[--demo-bar] z-30 bg-tpl-bg">
        <div className="flex h-16 items-center gap-5 px-4 md:h-[72px] md:gap-12 md:px-8">
          <Link href={BASE_PATH} aria-label={`${BRAND} home`} className="shrink-0">
            <Logo />
          </Link>
          <nav aria-label="Shop" className="gaya-nav">
            {LISTS.map((list) => {
              const href = listHref(list.slug);
              return (
                <Link
                  key={list.slug}
                  href={href}
                  aria-current={path === href ? 'page' : undefined}
                >
                  {list.name}
                </Link>
              );
            })}
          </nav>
          <BagButton className="-mr-2 ml-auto" />
        </div>
      </header>
      <MobileBagBar className="rounded-[3px]" />
    </>
  );
}

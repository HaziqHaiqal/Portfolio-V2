import type { ReactNode } from 'react';
import Link from 'next/link';
import { SiInstagram, SiStrava, SiTiktok } from 'react-icons/si';
import Header from '@components/Templates/langkah/Header';
import CartDrawer from '@components/Templates/langkah/CartDrawer';
import { BASE_PATH, BRAND } from '@components/Templates/langkah/data';
import { CONTAINER, DISPLAY, Wordmark } from '@components/Templates/langkah/ui';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { href: `${BASE_PATH}/product/strider`, label: 'Strider' },
      { href: `${BASE_PATH}/product/strider-pro`, label: 'Strider Pro' },
      { href: `${BASE_PATH}/product/strider-max`, label: 'Strider Max' },
      { href: `${BASE_PATH}/shop`, label: 'All colourways' },
    ],
  },
  {
    title: 'Help',
    links: [
      { href: `${BASE_PATH}/shop`, label: 'Size guide' },
      { href: `${BASE_PATH}/shop`, label: 'Delivery and returns' },
      { href: `${BASE_PATH}/shop`, label: 'Warranty' },
    ],
  },
];

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <CartDrawer />
      <footer className="border-t border-tpl-line bg-tpl-bg">
        <div className={`${CONTAINER} py-14`}>
          <p
            className={`${DISPLAY} text-[clamp(3.5rem,14vw,11rem)] leading-[0.85] text-tpl-ink`}
          >
            Keep moving<span className="text-tpl-accent">.</span>
          </p>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-[2fr_1fr_1fr]">
            <div className="col-span-2 md:col-span-1">
              <Wordmark />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-tpl-muted">
                Light knit sneakers made for Malaysian heat and rain.
              </p>
              <div className="mt-5 flex gap-2">
                {[
                  { icon: SiInstagram, label: 'Instagram' },
                  { icon: SiTiktok, label: 'TikTok' },
                  { icon: SiStrava, label: 'Strava' },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-tpl-tint"
                  >
                    <Icon size={15} aria-hidden="true" />
                  </span>
                ))}
              </div>
            </div>
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="text-sm font-bold">{column.title}</p>
                <ul className="mt-4 space-y-2.5 text-sm text-tpl-muted">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="hover:text-tpl-ink">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-tpl-line pt-6 text-xs text-tpl-muted sm:flex-row sm:justify-between">
            <p>
              © {new Date().getFullYear()} {BRAND}. A store demo.
            </p>
            <p>
              3D model: &ldquo;Materials Variants Shoe&rdquo; © 2021 Shopify,{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-tpl-ink"
              >
                CC BY 4.0
              </a>
              .
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Instrument_Sans } from 'next/font/google';
import { SiInstagram, SiTiktok, SiWhatsapp } from 'react-icons/si';
import DemoBar from '@components/Templates/DemoBar';
import { PaletteRoot } from '@components/Templates/Palette';
import { BagProvider } from '@components/Templates/Bag';
import Header from '@components/Templates/atelier-nura/Header';
import {
  BASE_PATH,
  BRAND,
  CATEGORIES,
  FREE_POSTAGE_AT,
} from '@components/Templates/atelier-nura/data';

const font = Instrument_Sans({ subsets: ['latin'], variable: '--tpl-font' });

export const metadata: Metadata = {
  title: { template: `%s, ${BRAND}`, default: BRAND },
  description:
    'Fashion boutique template with product pages, sizes and WhatsApp checkout.',
};

export default function AtelierNuraLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PaletteRoot slug="atelier-nura" className={font.variable}>
      <DemoBar slug="atelier-nura" />
      <BagProvider
        brand={BRAND}
        freeShippingAt={FREE_POSTAGE_AT}
        buttonClassName="rounded-none"
        note="Send your height with the order for free sleeve and length alteration."
      >
        <p className="bg-tpl-ink px-4 py-2 text-center text-xs text-tpl-bg">
          Free postage above RM{FREE_POSTAGE_AT}. Free alteration on every
          piece.
        </p>
        <Header />
        <main>{children}</main>

        <footer className="mt-24 border-t border-tpl-line px-4 pb-24 pt-14 md:px-8 md:pb-10">
          <div className="mx-auto grid max-w-[90rem] gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <p className="text-lg font-semibold uppercase tracking-[0.28em]">
                Atelier Nura
              </p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-tpl-muted">
                Modest wear designed and finished in Kuala Lumpur, in small
                batches.
              </p>
              <div className="mt-6 flex gap-2">
                {[
                  { icon: SiInstagram, label: 'Instagram' },
                  { icon: SiTiktok, label: 'TikTok' },
                  { icon: SiWhatsapp, label: 'WhatsApp' },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center border border-tpl-line"
                  >
                    <Icon size={15} aria-hidden="true" />
                  </span>
                ))}
              </div>
            </div>
            {[
              {
                title: 'Shop',
                links: CATEGORIES.map((category) => ({
                  href: `${BASE_PATH}/shop?category=${category}`,
                  label: category,
                })),
              },
              {
                title: 'Help',
                links: [
                  { href: `${BASE_PATH}/contact`, label: 'Sizes and delivery' },
                  { href: `${BASE_PATH}/contact`, label: 'Book a fitting' },
                ],
              },
              {
                title: 'About',
                links: [
                  { href: `${BASE_PATH}/about`, label: 'Our story' },
                  { href: `${BASE_PATH}/contact`, label: 'Visit the studio' },
                ],
              },
            ].map((column) => (
              <nav
                key={column.title}
                aria-label={column.title}
                className="text-sm"
              >
                <p className="font-medium">{column.title}</p>
                <ul className="mt-4 space-y-3 text-tpl-muted">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="hover:text-tpl-ink">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <p className="mx-auto mt-14 max-w-[90rem] text-xs text-tpl-muted">
            © {BRAND}. Demo content for template preview.
          </p>
        </footer>
      </BagProvider>
    </PaletteRoot>
  );
}

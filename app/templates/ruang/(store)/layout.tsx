import { Suspense, type ReactNode } from 'react';
import Link from 'next/link';
import { SiInstagram, SiPinterest, SiTiktok, SiWhatsapp } from 'react-icons/si';
import Header from '@components/Templates/ruang/Header';
import CartDrawer from '@components/Templates/ruang/CartDrawer';
import {
  BASE_PATH,
  BRAND,
  CATEGORIES,
  STUDIO,
} from '@components/Templates/ruang/data';
import { Logo } from '@components/Templates/ruang/ui';
import { CONTAINER } from '@components/Templates/ruang/styles';

const HELP = [
  'Delivery in 2 to 5 working days',
  'Breakages replaced, just send a photo',
  '30-day returns on unused pieces',
];

const PAYMENTS = [
  'FPX',
  'Visa',
  'Mastercard',
  'DuitNow QR',
  'Cash on delivery',
];

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-[6.75rem]" />}>
        <Header />
      </Suspense>
      <main className="pb-6">{children}</main>
      <CartDrawer />

      <footer className="mt-20 rounded-t-[32px] bg-tpl-ink text-tpl-bg md:mt-28 md:rounded-t-[48px]">
        <div className={`${CONTAINER} pb-28 pt-12 md:pb-10 md:pt-16`}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
            <div className="col-span-2 md:col-span-1">
              <Logo inverse />
              <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-70">
                Handmade stoneware, glass and linen for everyday homes, made in
                small batches in Malaysia.
              </p>
              <div className="mt-6 flex gap-2">
                {[
                  { icon: SiInstagram, label: 'Instagram' },
                  { icon: SiTiktok, label: 'TikTok' },
                  { icon: SiPinterest, label: 'Pinterest' },
                  { icon: SiWhatsapp, label: 'WhatsApp' },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-tpl-bg/10"
                  >
                    <Icon size={15} aria-hidden="true" />
                  </span>
                ))}
              </div>
            </div>
            <nav aria-label="Shop" className="text-sm">
              <p className="font-semibold">Shop</p>
              <ul className="mt-4 space-y-3 opacity-70">
                {CATEGORIES.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`${BASE_PATH}/shop?category=${category.id}`}
                      className="hover:underline hover:opacity-100"
                    >
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Help" className="text-sm">
              <p className="font-semibold">Help</p>
              <ul className="mt-4 space-y-3 opacity-70">
                {HELP.map((item) => (
                  <li key={item}>{item}</li>
                ))}
                <li>
                  <Link
                    href={`${BASE_PATH}/shop?saved=1`}
                    className="hover:underline"
                  >
                    Your wishlist
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="col-span-2 text-sm md:col-span-1">
              <p className="font-semibold">Visit the studio</p>
              <p className="mt-4 leading-relaxed opacity-70">
                {STUDIO}
                <br />
                Jalan SS 20/10, 47400 Petaling Jaya
                <br />
                Tuesday to Sunday, 11am to 7pm
              </p>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-4 border-t border-tpl-bg/15 pt-6 md:flex-row md:items-center md:justify-between">
            <ul className="flex flex-wrap gap-2" aria-label="Ways to pay">
              {PAYMENTS.map((method) => (
                <li
                  key={method}
                  className="rounded-lg bg-tpl-bg/10 px-2.5 py-1 text-xs font-medium"
                >
                  {method}
                </li>
              ))}
            </ul>
            <p className="text-xs opacity-60">
              © {BRAND}. Demo store with simulated payments.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

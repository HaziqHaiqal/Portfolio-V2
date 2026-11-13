import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Gloock, Inter_Tight } from 'next/font/google';
import DemoBar from '@components/Templates/DemoBar';
import { PaletteRoot } from '@components/Templates/Palette';
import { BagProvider } from '@components/Templates/Bag';
import { OrdersHydrator } from '@components/Templates/gaya/orders';
import {
  BASE_PATH,
  BRAND,
  FREE_POSTAGE_AT,
  SLUG,
} from '@components/Templates/gaya/data';
import '@components/Templates/gaya/gaya.css';

const font = Inter_Tight({ subsets: ['latin'], variable: '--tpl-font' });
const logoFont = Gloock({
  weight: '400',
  subsets: ['latin'],
  variable: '--gaya-logo-font',
});

export const metadata: Metadata = {
  title: { template: `%s, ${BRAND}`, default: BRAND },
  description:
    'Clothing store template where every piece hangs on an ampaian and the shoes walk along the floor, with checkout and simulated FPX, card and e-wallet payments.',
};

export default function GayaRootLayout({ children }: { children: ReactNode }) {
  return (
    <PaletteRoot
      slug={SLUG}
      className={`${font.variable} ${logoFont.variable}`}
    >
      <OrdersHydrator />
      <DemoBar slug={SLUG} />
      <BagProvider
        buttonClassName="rounded-[2px]"
        brand={BRAND}
        freeShippingAt={FREE_POSTAGE_AT}
        note="Postage and payment are chosen at checkout."
        checkoutHref={`${BASE_PATH}/checkout`}
        storageKey="gaya-bag"
      >
        {children}
      </BagProvider>
    </PaletteRoot>
  );
}

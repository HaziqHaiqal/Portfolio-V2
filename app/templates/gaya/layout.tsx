import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Gloock, Inter_Tight } from 'next/font/google';
import DemoBar from '@components/Templates/DemoBar';
import { PaletteRoot } from '@components/Templates/Palette';
import GayaBag from '@components/Templates/gaya/GayaBag';
import { CatalogueHydrator } from '@components/Templates/gaya/catalogue';
import { OrdersHydrator } from '@components/Templates/gaya/orders';
import { BASE_PATH, BRAND, SLUG } from '@components/Templates/gaya/data';
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
    'Clothing store template where every piece hangs on an ampaian and the shoes walk along the floor, with checkout, simulated FPX, card and e-wallet payments, and an admin portal that cuts product photos out and hangs them on the line.',
};

export default function GayaRootLayout({ children }: { children: ReactNode }) {
  return (
    <PaletteRoot
      slug={SLUG}
      className={`gaya-root ${font.variable} ${logoFont.variable}`}
    >
      <OrdersHydrator />
      <CatalogueHydrator />
      <DemoBar
        slug={SLUG}
        links={[{ href: `${BASE_PATH}/admin`, label: 'Owner view' }]}
      />
      <GayaBag>{children}</GayaBag>
    </PaletteRoot>
  );
}

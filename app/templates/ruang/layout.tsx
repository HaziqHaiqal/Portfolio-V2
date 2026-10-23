import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Outfit } from 'next/font/google';
import DemoBar from '@components/Templates/DemoBar';
import { PaletteRoot } from '@components/Templates/Palette';
import { StoreHydrator } from '@components/Templates/ruang/store';
import { BASE_PATH, BRAND } from '@components/Templates/ruang/data';

const font = Outfit({ subsets: ['latin'], variable: '--tpl-font' });

export const metadata: Metadata = {
  title: { template: `%s, ${BRAND}`, default: `${BRAND}, online store demo` },
  description:
    'Home and living store demo: product options, stock, bag, checkout with FPX, card, e-wallet or cash on delivery, and an Admin portal.',
};

export default function RuangLayout({ children }: { children: ReactNode }) {
  return (
    <PaletteRoot slug="ruang" className={font.variable}>
      <StoreHydrator />
      <DemoBar
        slug="ruang"
        links={[{ href: `${BASE_PATH}/admin`, label: 'Owner view' }]}
      />
      {children}
    </PaletteRoot>
  );
}

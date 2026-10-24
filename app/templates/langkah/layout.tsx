import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Archivo } from 'next/font/google';
import DemoBar from '@components/Templates/DemoBar';
import { PaletteRoot } from '@components/Templates/Palette';
import { StoreHydrator } from '@components/Templates/langkah/store';
import { BASE_PATH, BRAND } from '@components/Templates/langkah/data';

// One variable font: normal width for reading, stretched wide for display.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--tpl-font',
});

export const metadata: Metadata = {
  title: { template: `%s, ${BRAND}`, default: `${BRAND}, 3D shoe store demo` },
  description:
    'A 3D sneaker store demo: spin the shoe, switch colours live, pick a size and check out end to end.',
};

export default function LangkahLayout({ children }: { children: ReactNode }) {
  return (
    <PaletteRoot
      slug="langkah"
      className={`${archivo.variable} [--display-font:var(--tpl-font)]`}
    >
      <StoreHydrator />
      <DemoBar
        slug="langkah"
        links={[{ href: `${BASE_PATH}/admin`, label: 'Owner view' }]}
      />
      {children}
    </PaletteRoot>
  );
}

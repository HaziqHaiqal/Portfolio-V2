import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import DemoBar from '@components/Templates/DemoBar';
import { PaletteRoot } from '@components/Templates/Palette';
import { SLUG } from '@components/Templates/sapa/data';
import {
  About,
  Contact,
  Footer,
  Header,
  Hero,
  Music,
} from '@components/Templates/sapa/Sections';
import '@components/Templates/sapa/sapa.css';

const font = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--tpl-font' });

export const metadata: Metadata = {
  title: 'Sapa',
  description:
    'Personal page template for a pianist, with a hero you can play: an equaliser, a ring of keys, or a piano that teaches songs.',
};

export default function SapaPage() {
  return (
    <PaletteRoot
      slug={SLUG}
      className={`${font.variable} sapa`}
    >
      <DemoBar slug={SLUG} />
      <Header />
      <main>
        <Hero />
        <Music />
        <About />
        <Contact />
      </main>
      <Footer />
    </PaletteRoot>
  );
}

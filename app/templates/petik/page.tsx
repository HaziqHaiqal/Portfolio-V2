import type { Metadata } from 'next';
import { Poppins, Rubik } from 'next/font/google';
import DemoBar from '@components/Templates/DemoBar';
import { PaletteRoot } from '@components/Templates/Palette';
import { BRAND } from '@components/Templates/petik/data';
import Header from '@components/Templates/petik/Header';
import Hero from '@components/Templates/petik/Hero';
import {
  Farms,
  Footer,
  Numbers,
  Reviews,
  Tips,
} from '@components/Templates/petik/More';
import { OrderProvider } from '@components/Templates/petik/Order';
import {
  About,
  Features,
  Newsletter,
  Products,
  WhyUs,
} from '@components/Templates/petik/Sections';
import Shop from '@components/Templates/petik/Shop';
import '@components/Templates/petik/petik.css';

const body = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--tpl-font',
});
const display = Rubik({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--petik-display',
});

export const metadata: Metadata = {
  title: BRAND,
  description:
    'Fresh grocery delivery template: produce from Malaysian farms, a categories shop and a WhatsApp cart with delivery slots.',
};

export default function PetikPage() {
  return (
    <PaletteRoot
      slug="petik"
      className={`${body.variable} ${display.variable} font-tpl`}
    >
      <DemoBar slug="petik" />
      <OrderProvider>
        <Header />
        <main>
          <Hero />
          <About />
          <Features />
          <Products />
          <WhyUs />
          <Newsletter />
          <Shop />
          <Farms />
          <Numbers />
          <Reviews />
          <Tips />
        </main>
        <Footer />
      </OrderProvider>
    </PaletteRoot>
  );
}

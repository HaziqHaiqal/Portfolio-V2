import type { ReactNode } from 'react';
import Header from '@components/Templates/gaya/Header';
import Footer from '@components/Templates/gaya/Footer';

export default function GayaStoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

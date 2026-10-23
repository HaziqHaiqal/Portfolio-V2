import type { Metadata } from 'next';
import Checkout from '@components/Templates/ruang/Checkout';

export const metadata: Metadata = { title: 'Checkout' };

export default function RuangCheckout() {
  return <Checkout />;
}

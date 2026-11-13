import type { Metadata } from 'next';
import Checkout from '@components/Templates/gaya/Checkout';

export const metadata: Metadata = { title: 'Checkout' };

export default function GayaCheckout() {
  return <Checkout />;
}

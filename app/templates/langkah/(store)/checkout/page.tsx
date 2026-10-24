import type { Metadata } from 'next';
import Checkout from '@components/Templates/langkah/Checkout';

export const metadata: Metadata = { title: 'Checkout' };

export default function CheckoutPage() {
  return <Checkout />;
}

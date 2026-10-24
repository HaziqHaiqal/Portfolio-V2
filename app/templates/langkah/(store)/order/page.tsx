import type { Metadata } from 'next';
import OrderResult from '@components/Templates/langkah/OrderResult';

export const metadata: Metadata = { title: 'Your order' };

export default function OrderPage() {
  return <OrderResult />;
}

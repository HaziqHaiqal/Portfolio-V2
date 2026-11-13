import type { Metadata } from 'next';
import OrderResult from '@components/Templates/gaya/OrderResult';

export const metadata: Metadata = { title: 'Your order' };

export default async function GayaOrder({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id = '' } = await searchParams;
  return <OrderResult key={id} id={id} />;
}

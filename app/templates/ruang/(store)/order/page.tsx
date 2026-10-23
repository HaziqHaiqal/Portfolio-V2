import type { Metadata } from 'next';
import OrderResult from '@components/Templates/ruang/OrderResult';

export const metadata: Metadata = { title: 'Your order' };

export default async function RuangOrder({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id = '' } = await searchParams;
  return <OrderResult key={id} id={id} />;
}

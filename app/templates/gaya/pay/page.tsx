import type { Metadata } from 'next';
import Pay from '@components/Templates/gaya/Pay';

export const metadata: Metadata = { title: 'DemoPay' };

export default async function GayaPay({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order = '' } = await searchParams;
  return <Pay key={order} orderId={order} />;
}

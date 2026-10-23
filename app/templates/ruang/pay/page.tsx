import type { Metadata } from 'next';
import Gateway from '@components/Templates/ruang/Gateway';

export const metadata: Metadata = { title: 'DemoPay' };

export default async function RuangPay({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order = '' } = await searchParams;
  return <Gateway key={order} orderId={order} />;
}

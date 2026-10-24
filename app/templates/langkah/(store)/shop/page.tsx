import type { Metadata } from 'next';
import ShopGrid from '@components/Templates/langkah/ShopGrid';

export const metadata: Metadata = { title: 'Shop' };

export default function ShopPage() {
  return <ShopGrid />;
}

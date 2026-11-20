import type { Metadata } from 'next';
import Products from '@components/Templates/gaya/admin/Products';

export const metadata: Metadata = { title: 'Products' };

export default function GayaAdminProductsPage() {
  return <Products />;
}

import type { Metadata } from 'next';
import AddProduct from '@components/Templates/gaya/admin/AddProduct';

export const metadata: Metadata = { title: 'Add product' };

export default function GayaAddProductPage() {
  return <AddProduct />;
}

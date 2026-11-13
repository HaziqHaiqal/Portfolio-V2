import type { Metadata } from 'next';
import ListPage from '@components/Templates/gaya/ListPage';

export const metadata: Metadata = { title: 'Shoes' };

export default function GayaShoes() {
  return <ListPage slug="shoes" />;
}

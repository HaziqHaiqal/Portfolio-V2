import type { Metadata } from 'next';
import ListPage from '@components/Templates/gaya/ListPage';

export const metadata: Metadata = { title: 'Tops' };

export default function GayaTops() {
  return <ListPage slug="tops" />;
}

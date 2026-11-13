import type { Metadata } from 'next';
import ListPage from '@components/Templates/gaya/ListPage';

export const metadata: Metadata = { title: 'Bottoms' };

export default function GayaBottoms() {
  return <ListPage slug="bottoms" />;
}

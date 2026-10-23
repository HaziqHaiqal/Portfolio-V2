import type { Metadata } from 'next';
import Admin from '@components/Templates/ruang/Admin';

export const metadata: Metadata = { title: 'Admin portal' };

export default function RuangAdmin() {
  return <Admin />;
}

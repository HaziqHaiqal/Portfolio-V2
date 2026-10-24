import type { Metadata } from 'next';
import Admin from '@components/Templates/langkah/Admin';

export const metadata: Metadata = { title: 'Admin' };

export default function AdminPage() {
  return <Admin />;
}

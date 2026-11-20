import type { Metadata } from 'next';
import { Suspense } from 'react';
import Orders from '@components/Templates/gaya/admin/Orders';

export const metadata: Metadata = { title: 'Orders' };

export default function GayaAdminOrdersPage() {
  return (
    <Suspense>
      <Orders />
    </Suspense>
  );
}

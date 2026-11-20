import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AdminShell from '@components/Templates/gaya/admin/AdminShell';

export const metadata: Metadata = {
  title: { template: '%s, Gaya admin', default: 'Admin portal' },
};

export default function GayaAdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

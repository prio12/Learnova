import type { ReactNode } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoleGuard } from '@/components/RoleGuard';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['Admin']}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}

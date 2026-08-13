import type { ReactNode } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoleGuard } from '@/components/RoleGuard';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['Student']}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}

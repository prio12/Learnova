import type { ReactNode } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoleGuard } from '@/components/RoleGuard';

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['Teacher']}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}

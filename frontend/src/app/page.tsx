'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/authStore';

const dashboardByRole: Record<string, string> = {
  Admin: '/admin',
  Teacher: '/teacher',
  Student: '/student',
};

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (user) {
      router.replace(dashboardByRole[user.role] ?? '/login');
    } else {
      router.replace('/login');
    }
  }, [isHydrated, user, router]);

  return null;
}

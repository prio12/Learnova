import type { UserRole } from '@/store/authStore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

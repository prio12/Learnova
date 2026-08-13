import { UserRole } from '@/store/authStore';

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

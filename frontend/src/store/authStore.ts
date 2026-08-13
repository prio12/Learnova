import { create } from "zustand";

export type UserRole = "Admin" | "Teacher" | "Student";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,

  login: (user, token) => {
    localStorage.setItem("learnova_token", token);
    localStorage.setItem("learnova_user", JSON.stringify(user));
    set({ user, token, isHydrated: true });
  },

  logout: () => {
    localStorage.removeItem("learnova_token");
    localStorage.removeItem("learnova_user");
    set({ user: null, token: null, isHydrated: true });
  },

  hydrate: () => {
    const token = localStorage.getItem("learnova_token");
    const userJson = localStorage.getItem("learnova_user");

    if (!token || !userJson) {
      set({ isHydrated: true });
      return;
    }

    try {
      const user = JSON.parse(userJson) as User;
      set({ user, token, isHydrated: true });
    } catch {
      localStorage.removeItem("learnova_token");
      localStorage.removeItem("learnova_user");
      set({ user: null, token: null, isHydrated: true });
    }
  },
}));

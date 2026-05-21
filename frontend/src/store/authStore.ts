import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: { user: User; token: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: ({ user, token }) =>
    set({
      user,
      token,
      isAuthenticated: true,
    }),
  logout: () => {
    // Clear localStorage and cookies
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

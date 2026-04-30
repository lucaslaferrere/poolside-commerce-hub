import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as apiLogin, register as apiRegister } from '@/lib/api';

interface AuthUser {
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: async (email, password) => {
        const tokens = await apiLogin(email, password);
        set({ token: tokens.access_token, user: { email } });
      },

      register: async (email, password) => {
        await apiRegister(email, password);
        const tokens = await apiLogin(email, password);
        set({ token: tokens.access_token, user: { email } });
      },

      logout: () => set({ user: null, token: null }),
    }),
    { name: 'aqualed-auth' }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Admin } from '@/types';

interface AuthState {
  user: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: Admin, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<Admin>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_user');
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      updateUser: (updatedUser) => {
        set((state) => {
          const newUser = state.user ? { ...state.user, ...updatedUser } : null;
          if (newUser) {
            localStorage.setItem('admin_user', JSON.stringify(newUser));
          }
          return { user: newUser };
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

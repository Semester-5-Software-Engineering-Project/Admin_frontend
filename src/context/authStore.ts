import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Admin } from '@/types';

// Cookie helpers (simple)
const setAuthCookie = (token: string) => {
  // Default: session cookie. You can add ;Secure;SameSite=Strict if served over HTTPS
  document.cookie = `AUTH_TOKEN=${token}; Path=/; SameSite=Lax`;
};

const clearAuthCookie = () => {
  document.cookie = 'AUTH_TOKEN=; Path=/; Max-Age=0; SameSite=Lax';
};

interface AuthState {
  user: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean; // indicates persisted state has been rehydrated
  setAuth: (user: Admin, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<Admin>) => void;
  hasRole: (roles: string | string[]) => boolean;
  isSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hydrated: false,
      
      setAuth: (user, token) => {
        try {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('admin_user', JSON.stringify(user));
        } catch (e) {
          console.warn('LocalStorage set failed', e);
        }
        setAuthCookie(token);
        set({ user, token, isAuthenticated: true });
      },
      
      logout: () => {
        try {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('admin_user');
        } catch (e) {
          console.warn('LocalStorage remove failed', e);
        }
        clearAuthCookie();
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
      hasRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        const list = Array.isArray(roles) ? roles : [roles];
        return list.includes(user.role);
      },
      isSuperAdmin: () => {
        const { user } = get();
        return user?.role === 'SUPER_ADMIN';
      }
    }),
    {
      name: 'auth-storage',
      // mark store as hydrated after rehydration so UI can wait before redirecting
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          // if hydration fails, still mark hydrated to avoid indefinite loading
          try {
            // @ts-expect-error - set is available on store instance at runtime
            state?.set({ hydrated: true });
          } catch {}
        } else {
          try {
            // @ts-expect-error - set is available on store instance at runtime
            state?.set({ hydrated: true });
          } catch {}
        }
      },
    }
  )
);

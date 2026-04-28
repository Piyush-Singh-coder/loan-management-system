import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';
import type { User, ProfileStatus } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => void;
  getMe: () => Promise<User>;
  updateProfileStatus: (status: ProfileStatus) => void;
  updateUser: (user: User) => void;
  clearError: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      /**
       * POST /api/auth/login
       * Login for all roles: BORROWER, ADMIN, SALES, SANCTION, DISBURSEMENT, COLLECTION
       */
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, token } = response.data.data;
          set({ user, token, isLoading: false });
          return user;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Login failed. Please try again.';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      /**
       * POST /api/auth/register
       * Borrower self-registration only. Other roles are seeded by Admin.
       */
      register: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', { email, password });
          const { user, token } = response.data.data;
          set({ user, token, isLoading: false });
          return user;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Registration failed. Please try again.';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      /** Clears auth state from memory and localStorage */
      logout: () => set({ user: null, token: null, error: null }),

      /** Fetch current user profile to stay in sync with backend */
      getMe: async () => {
        try {
          const response = await api.get('/auth/me');
          const { user } = response.data.data;
          set({ user });
          return user;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Error fetching profile . Please try again.';
          set({ error: message });
          // If token is invalid, it's handled by api interceptor, but we catch here too
          throw error;
        }
      },

      /** Optimistically update profileStatus after BRE result */
      updateProfileStatus: (status) =>
        set((state) => ({
          user: state.user ? { ...state.user, profileStatus: status } : null,
        })),

      /** Replace the full user object (e.g. after personal details saved) */
      updateUser: (user) => set({ user }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'lms-auth-storage',
      partialize: (state: AuthState) => ({ user: state.user, token: state.token }),
    }
  )
);

import { create } from 'zustand';
import api from '@/services/api';
import type { User, Loan } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BorrowerProfile {
  user: User;
  loans: Loan[];
}

interface SalesState {
  // State
  leads: User[];                                    // borrowers who haven't applied yet
  borrowerProfiles: Record<string, BorrowerProfile>; // cache by borrowerId
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLeads: () => Promise<void>;
  fetchBorrowerProfile: (borrowerId: string) => Promise<BorrowerProfile>;
  clearError: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useSalesStore = create<SalesState>()((set, get) => ({
  leads: [],
  borrowerProfiles: {},
  isLoading: false,
  error: null,

  /**
   * GET /api/sales/leads
   * All registered borrowers who have NOT yet submitted a loan application.
   * Includes borrowers with profileStatus: REGISTERED | ELIGIBLE | INELIGIBLE
   */
  fetchLeads: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/sales/leads');
      set({ leads: response.data.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch leads.';
      set({ error: message, isLoading: false });
    }
  },

  /**
   * GET /api/sales/borrower/:borrowerId
   * Full profile (user + loan history) of a specific borrower.
   * Results are cached in borrowerProfiles to avoid redundant API calls.
   */
  fetchBorrowerProfile: async (borrowerId) => {
    // Return from cache if available
    const cached = get().borrowerProfiles[borrowerId];
    if (cached) return cached;

    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/sales/borrower/${borrowerId}`);
      const profile: BorrowerProfile = response.data.data;
      set((state) => ({
        borrowerProfiles: { ...state.borrowerProfiles, [borrowerId]: profile },
        isLoading: false,
      }));
      return profile;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch borrower profile.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));

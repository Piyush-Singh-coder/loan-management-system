import { create } from 'zustand';
import api from '@/services/api';
import type { Loan } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DisbursementState {
  // State
  approvedLoans: Loan[];
  isLoading: boolean;
  actionLoading: string | null; // loanId currently being disbursed
  error: string | null;

  // Actions
  fetchApprovedLoans: () => Promise<void>;
  disburseLoan: (loanId: string) => Promise<void>;
  clearError: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useDisbursementStore = create<DisbursementState>()((set) => ({
  approvedLoans: [],
  isLoading: false,
  actionLoading: null,
  error: null,

  /**
   * GET /api/disbursement/approved
   * All APPROVED loans awaiting disbursement, sorted by updatedAt (oldest first).
   * Each loan has borrowerId populated (no password).
   */
  fetchApprovedLoans: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/disbursement/approved');
      set({ approvedLoans: response.data.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch approved loans.';
      set({ error: message, isLoading: false });
    }
  },

  /**
   * POST /api/disbursement/disburse   { loanId }
   * Transitions loan from APPROVED → DISBURSED.
   * Optimistically removes the loan from the approved list on success.
   */
  disburseLoan: async (loanId) => {
    set({ actionLoading: loanId, error: null });
    try {
      await api.post('/disbursement/disburse', { loanId });
      set((state) => ({
        approvedLoans: state.approvedLoans.filter((l) => l._id !== loanId),
        actionLoading: null,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to disburse loan.';
      set({ error: message, actionLoading: null });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));

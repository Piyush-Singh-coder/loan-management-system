import { create } from 'zustand';
import api from '@/services/api';
import type { Loan } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type SanctionAction = 'APPROVE' | 'REJECT';

interface SanctionState {
  // State
  pendingLoans: Loan[];
  isLoading: boolean;
  actionLoading: string | null; // loanId currently being acted upon
  error: string | null;

  // Actions
  fetchPendingLoans: () => Promise<void>;
  approveLoan: (loanId: string) => Promise<void>;
  rejectLoan: (loanId: string, reason: string) => Promise<void>;
  clearError: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useSanctionStore = create<SanctionState>()((set, get) => ({
  pendingLoans: [],
  isLoading: false,
  actionLoading: null,
  error: null,

  /**
   * GET /api/sanction/pending
   * Fetches all PENDING loan applications sorted oldest-first.
   * Each loan has borrowerId populated (no password).
   */
  fetchPendingLoans: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/sanction/pending');
      set({ pendingLoans: response.data.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch pending loans.';
      set({ error: message, isLoading: false });
    }
  },

  /**
   * POST /api/sanction/action  { loanId, action: 'APPROVE' }
   * Transitions loan from PENDING → APPROVED.
   * Optimistically removes the loan from the pending list on success.
   */
  approveLoan: async (loanId) => {
    set({ actionLoading: loanId, error: null });
    try {
      await api.post('/sanction/action', { loanId, action: 'APPROVE' });
      // Remove from pending list
      set((state) => ({
        pendingLoans: state.pendingLoans.filter((l) => l._id !== loanId),
        actionLoading: null,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to approve loan.';
      set({ error: message, actionLoading: null });
      throw new Error(message);
    }
  },

  /**
   * POST /api/sanction/action  { loanId, action: 'REJECT', reason }
   * Transitions loan from PENDING → REJECTED.
   * reason is mandatory (enforced by backend).
   * Borrower profileStatus is reset to ELIGIBLE so they can re-apply.
   */
  rejectLoan: async (loanId, reason) => {
    if (!reason?.trim()) throw new Error('A rejection reason is required.');
    set({ actionLoading: loanId, error: null });
    try {
      await api.post('/sanction/action', { loanId, action: 'REJECT', reason });
      set((state) => ({
        pendingLoans: state.pendingLoans.filter((l) => l._id !== loanId),
        actionLoading: null,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reject loan.';
      set({ error: message, actionLoading: null });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));

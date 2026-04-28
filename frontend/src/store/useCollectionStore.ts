import { create } from 'zustand';
import api from '@/services/api';
import type { Loan, Payment } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecordPaymentInput {
  loanId: string;
  utrNumber: string;
  amount: number;
  paymentDate: string; // 'YYYY-MM-DD'
}

interface CollectionState {
  // State
  activeLoans: Loan[];
  // Payment history cached per loanId to avoid redundant fetches
  paymentHistory: Record<string, Payment[]>;
  isLoading: boolean;
  paymentLoading: string | null; // loanId currently recording a payment
  error: string | null;

  // Actions
  fetchActiveLoans: () => Promise<void>;
  fetchPaymentHistory: (loanId: string) => Promise<Payment[]>;
  recordPayment: (input: RecordPaymentInput) => Promise<{ message: string }>;
  clearError: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useCollectionStore = create<CollectionState>()((set, get) => ({
  activeLoans: [],
  paymentHistory: {},
  isLoading: false,
  paymentLoading: null,
  error: null,

  /**
   * GET /api/collection/active
   * All DISBURSED (active) loans for collection follow-up.
   * Each loan has borrowerId populated (no password).
   * Sorted by createdAt ascending (oldest loan first).
   */
  fetchActiveLoans: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/collection/active');
      set({ activeLoans: response.data.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch active loans.';
      set({ error: message, isLoading: false });
    }
  },

  /**
   * GET /api/collection/payments/:loanId
   * Payment history for a specific loan, sorted newest first.
   * Results are cached in paymentHistory keyed by loanId.
   */
  fetchPaymentHistory: async (loanId) => {
    // Serve from cache if available
    const cached = get().paymentHistory[loanId];
    if (cached) return cached;

    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/collection/payments/${loanId}`);
      const payments: Payment[] = response.data.data;
      set((state) => ({
        paymentHistory: { ...state.paymentHistory, [loanId]: payments },
        isLoading: false,
      }));
      return payments;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch payment history.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  /**
   * POST /api/collection/payment
   * Body: { loanId, utrNumber, amount, paymentDate }
   * Backend deducts from outstandingBalance and auto-closes loan if balance hits 0.
   * Returns: { payment, loan } where loan reflects the updated outstandingBalance and status.
   *
   * After success:
   *  - Updates the loan in activeLoans with new outstandingBalance
   *  - If loan.status === 'CLOSED', removes it from activeLoans
   *  - Invalidates the payment history cache for that loanId
   */
  recordPayment: async ({ loanId, utrNumber, amount, paymentDate }) => {
    set({ paymentLoading: loanId, error: null });
    try {
      const response = await api.post('/collection/payment', {
        loanId,
        utrNumber,
        amount,
        paymentDate,
      });

      const { loan }: { loan: Loan } = response.data.data;
      const message: string = response.data.message;

      set((state) => {
        let updatedLoans: Loan[];
        if (loan.status === 'CLOSED') {
          // Remove closed loan from the active list
          updatedLoans = state.activeLoans.filter((l) => l._id !== loanId);
        } else {
          // Update outstanding balance in place
          updatedLoans = state.activeLoans.map((l) =>
            l._id === loanId ? { ...l, outstandingBalance: loan.outstandingBalance } : l
          );
        }

        // Invalidate cached payment history for this loan
        const { [loanId]: _removed, ...remainingHistory } = state.paymentHistory;

        return {
          activeLoans: updatedLoans,
          paymentHistory: remainingHistory,
          paymentLoading: null,
        };
      });

      return { message };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to record payment.';
      set({ error: message, paymentLoading: null });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));

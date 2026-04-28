import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';
import type { Loan, BreResult, User } from '@/types';
import { useAuthStore } from './useAuthStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonalDetailsInput {
  fullName: string;
  pan: string;
  dob: string;            // 'YYYY-MM-DD'
  monthlySalary: number;
  employmentMode: 'SALARIED' | 'SELF_EMPLOYED' | 'UNEMPLOYED';
}

interface BorrowerState {
  // State
  myLoans: Loan[];
  salarySlipUrl: string | null;    // held between Step 3 and Step 4
  breResult: BreResult | null;     // result of last BRE check
  isLoading: boolean;
  error: string | null;

  // Actions
  submitPersonalDetails: (details: PersonalDetailsInput) => Promise<BreResult>;
  uploadSalarySlip: (file: File) => Promise<string>;
  applyForLoan: (amount: number, tenure: number) => Promise<Loan>;
  fetchMyLoans: () => Promise<void>;
  setSalarySlipUrl: (url: string) => void;
  clearApplicationState: () => void;
  clearError: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useBorrowerStore = create<BorrowerState>()(
  persist(
    (set, get) => ({
      myLoans: [],
      salarySlipUrl: null,
      breResult: null,
      isLoading: false,
      error: null,

      /**
       * POST /api/borrower/personal-details
       * Step 2: Submit personal details. Backend runs BRE and updates profileStatus.
       * Body: { fullName, pan, dob, monthlySalary, employmentMode }
       * Response: { user, breResult: { eligible, reason? } }
       */
      submitPersonalDetails: async (details) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/borrower/personal-details', details);
          const { user, breResult }: { user: User; breResult: BreResult } = response.data.data;

          // Sync the updated user (with new profileStatus) into the auth store
          useAuthStore.getState().updateUser(user);
          set({ breResult, isLoading: false });
          return breResult;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to submit personal details.';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      /**
       * POST /api/borrower/upload-slip
       * Step 3: Upload salary slip file to Cloudinary via the backend.
       * Content-Type: multipart/form-data  (field name: "salarySlip")
       * Response: { salarySlipUrl }
       */
      uploadSalarySlip: async (file) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          formData.append('salarySlip', file);

          const response = await api.post('/borrower/upload-slip', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const { salarySlipUrl } = response.data.data;
          set({ salarySlipUrl, isLoading: false });
          return salarySlipUrl as string;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to upload salary slip.';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      /**
       * POST /api/borrower/apply
       * Step 4: Submit final loan application.
       * Body: { amount, tenure, salarySlipUrl }
       * Backend calculates interest (12% p.a.) and creates PENDING loan.
       */
      applyForLoan: async (amount, tenure) => {
        const { salarySlipUrl } = get();
        if (!salarySlipUrl) throw new Error('Salary slip must be uploaded first.');

        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/borrower/apply', {
            amount,
            tenure,
            salarySlipUrl,
          });

          const loan: Loan = response.data.data;
          // Add the new loan to the list and update profile status
          set((state) => ({ myLoans: [loan, ...state.myLoans], isLoading: false }));
          useAuthStore.getState().updateProfileStatus('APPLIED');
          return loan;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to submit loan application.';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      /**
       * GET /api/borrower/loans
       * Returns all loans for the authenticated borrower (sorted newest first).
       */
      fetchMyLoans: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/borrower/loans');
          set({ myLoans: response.data.data, isLoading: false });
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to fetch loans.';
          set({ error: message, isLoading: false });
        }
      },

      /** Manually set URL (e.g. from a redirect after upload) */
      setSalarySlipUrl: (url) => set({ salarySlipUrl: url }),

      /** Reset multi-step state after application submitted or abandoned */
      clearApplicationState: () =>
        set({ salarySlipUrl: null, breResult: null, error: null }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'lms-borrower-storage',
      // Only persist the salary slip URL so the multi-step form survives a refresh
      partialize: (state: BorrowerState) => ({ salarySlipUrl: state.salarySlipUrl }),
    }
  )
);

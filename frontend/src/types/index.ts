// ─── Shared Types ─────────────────────────────────────────────────────────────

export type UserRole =
  | 'BORROWER'
  | 'ADMIN'
  | 'SALES'
  | 'SANCTION'
  | 'DISBURSEMENT'
  | 'COLLECTION';

export type ProfileStatus = 'REGISTERED' | 'ELIGIBLE' | 'INELIGIBLE' | 'APPLIED';

export type EmploymentMode = 'SALARIED' | 'SELF_EMPLOYED' | 'UNEMPLOYED';

export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'CLOSED';

// ─── User / Auth ───────────────────────────────────────────────────────────────

export interface PersonalDetails {
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
}

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  profileStatus: ProfileStatus;
  personalDetails?: PersonalDetails;
  createdAt: string;
  updatedAt: string;
}

// ─── Loan ─────────────────────────────────────────────────────────────────────

export interface Loan {
  _id: string;
  borrowerId: string | User; // populated or raw ID
  amount: number;
  tenure: number;
  interestRate: number;
  totalRepayment: number;
  outstandingBalance: number;
  monthlyEMI: number;
  salarySlipUrl?: string;
  status: LoanStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface Payment {
  _id: string;
  loanId: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── BRE Result ───────────────────────────────────────────────────────────────

export interface BreResult {
  eligible: boolean;
  reason?: string;
}

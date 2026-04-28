import { Request } from 'express';

// All roles in the system
export type UserRole =
  | 'BORROWER'
  | 'ADMIN'
  | 'SALES'
  | 'SANCTION'
  | 'DISBURSEMENT'
  | 'COLLECTION';

// Employment mode options for BRE
export type EmploymentMode = 'SALARIED' | 'SELF_EMPLOYED' | 'UNEMPLOYED';

// Profile status tracking borrower journey
export type ProfileStatus = 'REGISTERED' | 'ELIGIBLE' | 'INELIGIBLE' | 'APPLIED';

// Loan status lifecycle
export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'CLOSED';

// Attach authenticated user to Express request
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
    email: string;
  };
}

// BRE result payload
export interface BREResult {
  eligible: boolean;
  reason?: string;
}

// Loan calculation result
export interface LoanCalcResult {
  principal: number;
  interestRate: number;
  tenure: number;
  totalInterest: number;
  totalRepayment: number;
  monthlyEMI: number;
}

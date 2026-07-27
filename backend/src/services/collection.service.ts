import LoanRepo from '../models/LoanRepo';
import PaymentRepo from '../models/PaymentRepo';
import { LoanStatus } from '../types';

interface RecordPaymentInput {
  loanId: string;
  utrNumber: string;
  amount: number;
  paymentDate: string; // ISO date string
  recordedBy: string; // Collection officer userId
}

export class CollectionService {
  /**
   * Get all DISBURSED (active) loans for collection follow-up.
   */
  static async getActiveLoans() {
    return LoanRepo.findByStatusWithBorrower('DISBURSED');
  }

  /**
   * Get payment history for a specific loan.
   */
  static async getPaymentHistory(loanId: string) {
    return PaymentRepo.findByLoanId(loanId);
  }

  /**
   * Record a payment for a DISBURSED loan.
   * Automatically closes the loan if outstanding balance reaches 0.
   */
  static async recordPayment(input: RecordPaymentInput) {
    const loan = await LoanRepo.findById(input.loanId);
    if (!loan) {
      const err = new Error('Loan not found.') as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }
    if (loan.status !== 'DISBURSED') {
      const err = new Error(`Payments can only be recorded for DISBURSED loans. Current status: '${loan.status}'.`) as Error & { statusCode: number };
      err.statusCode = 400;
      throw err;
    }
    if (input.amount > loan.outstandingBalance) {
      const err = new Error(`Payment amount ₹${input.amount} exceeds outstanding balance ₹${loan.outstandingBalance}.`) as Error & { statusCode: number };
      err.statusCode = 400;
      throw err;
    }

    // Record the payment
    const payment = await PaymentRepo.create({
      loanId: input.loanId,
      utrNumber: input.utrNumber,
      amount: input.amount,
      paymentDate: input.paymentDate,
      recordedBy: input.recordedBy,
    });

    // Deduct from outstanding balance
    let newBalance = Math.max(0, Math.round((loan.outstandingBalance - input.amount) * 100) / 100);
    let newStatus: LoanStatus = loan.status;

    // Auto-close loan when fully repaid
    if (newBalance <= 0) {
      newBalance = 0;
      newStatus = 'CLOSED';
    }

    const updatedLoan = await LoanRepo.update(loan.id, {
      outstandingBalance: newBalance,
      status: newStatus,
    });

    return { payment, loan: updatedLoan };
  }
}

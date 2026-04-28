import Loan from '../models/Loan';
import Payment from '../models/Payment';

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
    return Loan.find({ status: 'DISBURSED' })
      .populate('borrowerId', '-password')
      .sort({ createdAt: 1 });
  }

  /**
   * Get payment history for a specific loan.
   */
  static async getPaymentHistory(loanId: string) {
    return Payment.find({ loanId }).sort({ paymentDate: -1 });
  }

  /**
   * Record a payment for a DISBURSED loan.
   * Automatically closes the loan if outstanding balance reaches 0.
   */
  static async recordPayment(input: RecordPaymentInput) {
    const loan = await Loan.findById(input.loanId);
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
    const payment = await Payment.create({
      loanId: input.loanId,
      utrNumber: input.utrNumber,
      amount: input.amount,
      paymentDate: new Date(input.paymentDate),
      recordedBy: input.recordedBy,
    });

    // Deduct from outstanding balance
    loan.outstandingBalance = Math.max(0,Math.round((loan.outstandingBalance - input.amount) * 100) / 100);

    // Auto-close loan when fully repaid
    if (loan.outstandingBalance <= 0) {
      loan.outstandingBalance = 0;
      loan.status = 'CLOSED';
    }

    await loan.save();

    return { payment, loan };
  }
}

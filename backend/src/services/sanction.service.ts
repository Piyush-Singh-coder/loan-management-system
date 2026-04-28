import Loan from '../models/Loan';

export class SanctionService {
  /**
   * Get all PENDING loan applications for review.
   */
  static async getPendingLoans() {
    return Loan.find({ status: 'PENDING' })
      .populate('borrowerId', '-password')
      .sort({ createdAt: 1 }); // oldest first
  }

  /**
   * Approve a PENDING loan.
   */
  static async approveLoan(loanId: string) {
    const loan = await Loan.findById(loanId);
    if (!loan) {
      const err = new Error('Loan not found.') as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }
    if (loan.status !== 'PENDING') {
      const err = new Error(`Cannot approve a loan with status '${loan.status}'.`) as Error & { statusCode: number };
      err.statusCode = 400;
      throw err;
    }
    loan.status = 'APPROVED';
    loan.rejectionReason = undefined;
  await loan.save();
    return loan;
  }

  /**
   * Reject a PENDING loan with a mandatory reason.
   */
  static async rejectLoan(loanId: string, reason: string) {
    const loan = await Loan.findById(loanId);
    if (!loan) {
      const err = new Error('Loan not found.') as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }
    if (loan.status !== 'PENDING') {
      const err = new Error(`Cannot reject a loan with status '${loan.status}'.`) as Error & { statusCode: number };
      err.statusCode = 400;
      throw err;
    }
    loan.status = 'REJECTED';
    loan.rejectionReason = reason;
    await loan.save();

    // Reset borrower profile so they can re-apply
    const { default: User } = await import('../models/User');
    await User.findByIdAndUpdate(loan.borrowerId, { profileStatus: 'ELIGIBLE' });

    return loan;
  }
}

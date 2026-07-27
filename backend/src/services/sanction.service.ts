import LoanRepo from '../models/LoanRepo';
import UserRepo from '../models/UserRepo';

export class SanctionService {
  /**
   * Get all PENDING loan applications for review.
   */
  static async getPendingLoans() {
    return LoanRepo.findByStatusWithBorrower('PENDING');
  }

  /**
   * Approve a PENDING loan.
   */
  static async approveLoan(loanId: string) {
    const loan = await LoanRepo.findById(loanId);
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
    const updatedLoan = await LoanRepo.update(loanId, {
      status: 'APPROVED',
      rejectionReason: null,
    });
    return updatedLoan;
  }

  /**
   * Reject a PENDING loan with a mandatory reason.
   */
  static async rejectLoan(loanId: string, reason: string) {
    const loan = await LoanRepo.findById(loanId);
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
    const updatedLoan = await LoanRepo.update(loanId, {
      status: 'REJECTED',
      rejectionReason: reason,
    });

    // Reset borrower profile so they can re-apply
    const borrowerIdStr = typeof loan.borrowerId === 'string' ? loan.borrowerId : loan.borrowerId?._id;
    if (borrowerIdStr) {
      await UserRepo.update(borrowerIdStr, { profileStatus: 'ELIGIBLE' });
    }

    return updatedLoan;
  }
}

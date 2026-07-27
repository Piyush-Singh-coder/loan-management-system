import LoanRepo from '../models/LoanRepo';

export class DisbursementService {
  /**
   * Get all APPROVED loans awaiting disbursement.
   */
  static async getApprovedLoans() {
    return LoanRepo.findByStatusWithBorrower('APPROVED');
  }

  /**
   * Mark an APPROVED loan as DISBURSED.
   */
  static async disburseLoan(loanId: string) {
    const loan = await LoanRepo.findById(loanId);
    if (!loan) {
      const err = new Error('Loan not found.') as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }
    if (loan.status !== 'APPROVED') {
      const err = new Error(`Loan must be in APPROVED status to disburse. Current status: '${loan.status}'.`) as Error & { statusCode: number };
      err.statusCode = 400;
      throw err;
    }
    const updatedLoan = await LoanRepo.update(loanId, { status: 'DISBURSED' });
    return updatedLoan;
  }
}

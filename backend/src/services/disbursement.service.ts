import Loan from '../models/Loan';

export class DisbursementService {
  /**
   * Get all APPROVED loans awaiting disbursement.
   */
  static async getApprovedLoans() {
    return Loan.find({ status: 'APPROVED' })
      .populate('borrowerId', '-password')
      .sort({ updatedAt: 1 });
  }

  /**
   * Mark an APPROVED loan as DISBURSED.
   */
  static async disburseLoan(loanId: string) {
    const loan = await Loan.findById(loanId);
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
    loan.status = 'DISBURSED';
    await loan.save();
    return loan;
  }
}

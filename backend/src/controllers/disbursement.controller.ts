import { Response } from 'express';
import { AuthRequest } from '../types';
import { DisbursementService } from '../services/disbursement.service';
import { sendSuccess, sendError } from '../utils/response';

export class DisbursementController {
  static async getApprovedLoans(_req: AuthRequest, res: Response): Promise<void> {
    const loans = await DisbursementService.getApprovedLoans();
    sendSuccess(res, loans, 'Approved loans fetched successfully.');
  }

  static async disburseLoan(req: AuthRequest, res: Response): Promise<void> {
    const { loanId } = req.body;

    if (!loanId) {
      sendError(res, 'loanId is required.', 400);
      return;
    }

    const loan = await DisbursementService.disburseLoan(loanId);
    sendSuccess(res, loan, 'Loan disbursed successfully.');
  }
}

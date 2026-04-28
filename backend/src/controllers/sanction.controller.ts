import { Response } from 'express';
import { AuthRequest } from '../types';
import { SanctionService } from '../services/sanction.service';
import { sendSuccess, sendError } from '../utils/response';

export class SanctionController {
  static async getPendingLoans(_req: AuthRequest, res: Response): Promise<void> {
    const loans = await SanctionService.getPendingLoans();
    sendSuccess(res, loans, 'Pending loans fetched successfully.');
  }

  static async approveOrReject(req: AuthRequest, res: Response): Promise<void> {
    const { loanId, action, reason } = req.body;

    if (!loanId || !action) {
      sendError(res, 'loanId and action (APPROVE | REJECT) are required.', 400);
      return;
    }
    if (!['APPROVE', 'REJECT'].includes(action)) {
      sendError(res, "action must be either 'APPROVE' or 'REJECT'.", 400);
      return;
    }
    if (action === 'REJECT' && !reason) {
      sendError(res, 'A rejection reason is required.', 400);
      return;
    }

    let loan;
    if (action === 'APPROVE') {
      loan = await SanctionService.approveLoan(loanId);
    } else {
      loan = await SanctionService.rejectLoan(loanId, reason);
    }

    sendSuccess(res, loan, `Loan ${action}D successfully.`);
  }
}

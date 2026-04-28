import { Response } from 'express';
import { AuthRequest } from '../types';
import { CollectionService } from '../services/collection.service';
import { sendSuccess, sendError } from '../utils/response';

export class CollectionController {
  static async getActiveLoans(_req: AuthRequest, res: Response): Promise<void> {
    const loans = await CollectionService.getActiveLoans();
    sendSuccess(res, loans, 'Active (disbursed) loans fetched successfully.');
  }

  static async getPaymentHistory(req: AuthRequest, res: Response): Promise<void> {
    const { loanId } = req.params;
    const payments = await CollectionService.getPaymentHistory(loanId);
    sendSuccess(res, payments, 'Payment history fetched successfully.');
  }

  static async recordPayment(req: AuthRequest, res: Response): Promise<void> {
    const { loanId, utrNumber, amount, paymentDate } = req.body;

    if (!loanId || !utrNumber || !amount || !paymentDate) {
      sendError(res, 'loanId, utrNumber, amount, and paymentDate are required.', 400);
      return;
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      sendError(res, 'Amount must be a positive number.', 400);
      return;
    }

    const result = await CollectionService.recordPayment({
      loanId,
      utrNumber,
      amount: Number(amount),
      paymentDate,
      recordedBy: req.user!.userId,
    });

    const message =
      result.loan.status === 'CLOSED'
        ? '🎉 Payment recorded. Loan is fully repaid and CLOSED.'
        : `Payment recorded. Outstanding balance: ₹${result.loan.outstandingBalance}`;

    sendSuccess(res, result, message);
  }
}

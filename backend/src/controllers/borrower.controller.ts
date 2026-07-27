import { Response } from 'express';
import { AuthRequest } from '../types';
import { BorrowerService } from '../services/borrower.service';
import { sendSuccess, sendError } from '../utils/response';

export class BorrowerController {
  /**
   * POST /api/borrower/personal-details
   * Body: { fullName, pan, dob, monthlySalary, employmentMode }
   */
  static async submitPersonalDetails(req: AuthRequest, res: Response): Promise<void> {
    const { fullName, pan, dob, monthlySalary, employmentMode } = req.body;

    if (!fullName || !pan || !dob || !monthlySalary || !employmentMode) {
      sendError(res, 'All personal details are required: fullName, pan, dob, monthlySalary, employmentMode.', 400);
      return;
    }

    const result = await BorrowerService.submitPersonalDetails(req.user!.userId, {
      fullName,
      pan,
      dob,
      monthlySalary: Number(monthlySalary),
      employmentMode,
    });

    if (result.breResult.eligible) {
      sendSuccess(res, result, 'Personal details saved. You are eligible to proceed.', 200);
    } else {
      sendSuccess(res, result, `Not eligible: ${result.breResult.reason}`, 200);
    }
  }

  /**
   * POST /api/borrower/upload-slip
   * Multipart form-data with field: salarySlip
   */
  static async uploadSalarySlip(req: AuthRequest, res: Response): Promise<void> {
    if (!req.file) {
      sendError(res, 'Salary slip file is required.', 400);
      return;
    }

    let slipUrl = (req.file as Express.Multer.File & { path?: string }).path || '';
    if (!slipUrl.startsWith('http://') && !slipUrl.startsWith('https://')) {
      slipUrl = `/uploads/${req.file.filename}`;
    }

    const result = await BorrowerService.saveSalarySlip(req.user!.userId, slipUrl);
    sendSuccess(res, result, 'Salary slip uploaded successfully.');
  }

  /**
   * POST /api/borrower/apply
   * Body: { amount, tenure, salarySlipUrl }
   */
  static async applyForLoan(req: AuthRequest, res: Response): Promise<void> {
    const { amount, tenure, salarySlipUrl } = req.body;

    if (!amount || !tenure || !salarySlipUrl) {
      sendError(res, 'amount, tenure and salarySlipUrl are required.', 400);
      return;
    }
    if (amount < 1000) {
      sendError(res, 'Minimum loan amount is ₹1,000.', 400);
      return;
    }
    if (tenure < 1 || tenure > 60) {
      sendError(res, 'Tenure must be between 1 and 60 months.', 400);
      return;
    }

    const loan = await BorrowerService.applyForLoan(
      req.user!.userId,
      { amount: Number(amount), tenure: Number(tenure) },
      salarySlipUrl
    );
    sendSuccess(res, loan, 'Loan application submitted successfully.', 201);
  }

  /**
   * GET /api/borrower/loans
   * Returns all loans for the authenticated borrower.
   */
  static async getMyLoans(req: AuthRequest, res: Response): Promise<void> {
    const loans = await BorrowerService.getMyLoans(req.user!.userId);
    sendSuccess(res, loans, 'Loans fetched successfully.');
  }
}

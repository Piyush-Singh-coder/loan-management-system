import { Response } from 'express';
import { AuthRequest } from '../types';
import { SalesService } from '../services/sales.service';
import { sendSuccess } from '../utils/response';

export class SalesController {
  static async getLeads(_req: AuthRequest, res: Response): Promise<void> {
    const leads = await SalesService.getLeads();
    sendSuccess(res, leads, 'Leads fetched successfully.');
  }

  static async getBorrowerProfile(req: AuthRequest, res: Response): Promise<void> {
    const { borrowerId } = req.params;
    const data = await SalesService.getBorrowerProfile(borrowerId);
    sendSuccess(res, data, 'Borrower profile fetched successfully.');
  }
}

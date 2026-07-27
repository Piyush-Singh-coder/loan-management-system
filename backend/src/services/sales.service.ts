import UserRepo, { IUser } from '../models/UserRepo';
import LoanRepo from '../models/LoanRepo';

export class SalesService {
  /**
   * Get all registered borrowers who have not yet submitted a loan application.
   * These are "leads" for the Sales team.
   */
  static async getLeads() {
    const leads = await UserRepo.findBorrowersByStatuses(['REGISTERED', 'ELIGIBLE', 'INELIGIBLE']);
    return leads.map((lead: IUser) => {
      const { password, ...leadWithoutPassword } = lead;
      return leadWithoutPassword;
    });
  }

  /**
   * Get full profile of a specific borrower (for Sales to review).
   */
  static async getBorrowerProfile(borrowerId: string) {
    const user = await UserRepo.findById(borrowerId);
    if (!user || user.role !== 'BORROWER') {
      const err = new Error('Borrower not found.') as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }
    const { password, ...userWithoutPassword } = user;
    const loans = await LoanRepo.findByBorrowerId(borrowerId);
    return { user: userWithoutPassword, loans };
  }
}

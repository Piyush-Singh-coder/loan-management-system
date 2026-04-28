import User from '../models/User';
import Loan from '../models/Loan';

export class SalesService {
  /**
   * Get all registered borrowers who have not yet submitted a loan application.
   * These are "leads" for the Sales team.
   */
  static async getLeads() {
    return User.find({
      role: 'BORROWER',
      profileStatus: { $in: ['REGISTERED', 'ELIGIBLE', 'INELIGIBLE'] },
    })
      .select('-password')
      .sort({ createdAt: -1 });
  }

  /**
   * Get full profile of a specific borrower (for Sales to review).
   */
  static async getBorrowerProfile(borrowerId: string) {
    const user = await User.findOne({ _id: borrowerId, role: 'BORROWER' }).select('-password');
    if (!user) {
      const err = new Error('Borrower not found.') as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }
    const loans = await Loan.find({ borrowerId }).sort({ createdAt: -1 });
    return { user, loans };
  }
}

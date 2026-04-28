import User from '../models/User';
import Loan from '../models/Loan';
import { checkEligibility } from '../utils/bre';
import { calculateLoan } from '../utils/loanCalculator';
import { EmploymentMode } from '../types';

interface PersonalDetailsInput {
  fullName: string;
  pan: string;
  dob: string; // ISO date string
  monthlySalary: number;
  employmentMode: EmploymentMode;
}

interface ApplyLoanInput {
  amount: number;
  tenure: number; // months
}

export class BorrowerService {
  /**
   * Step 2: Save personal details and run BRE.
   * Updates profileStatus to 'ELIGIBLE' or 'INELIGIBLE'.
   */
  static async submitPersonalDetails(userId: string, details: PersonalDetailsInput) {
    const dob = new Date(details.dob);
    const breResult = checkEligibility({
      dob,
      monthlySalary: details.monthlySalary,
      pan: details.pan.toUpperCase(),
      employmentMode: details.employmentMode,
    });

    const profileStatus = breResult.eligible ? 'ELIGIBLE' : 'INELIGIBLE';

    const user = await User.findByIdAndUpdate(
      userId,
      {
        personalDetails: { ...details, dob, pan: details.pan.toUpperCase() },
        profileStatus,
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      const err = new Error('User not found.') as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }

    return { user, breResult };
  }

  /**
   * Step 3: Save salary slip URL (already uploaded to Cloudinary via middleware).
   * Returns current loan draft for preview or creates a temp holder.
   */
  static async saveSalarySlip(userId: string, slipUrl: string) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found.') as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }

    if (user.profileStatus !== 'ELIGIBLE') {
      const err = new Error('Borrower is not eligible to apply for a loan.') as Error & { statusCode: number };
      err.statusCode = 400;
      throw err;
    }

    // We store the slip URL in the loan once the full application is submitted.
    // Return it here so the frontend can display a preview.
    return { salarySlipUrl: slipUrl, message: 'Salary slip uploaded. Proceed to loan application.' };
  }

  /**
   * Step 4: Calculate loan and create PENDING loan application.
   */
  static async applyForLoan(userId: string, data: ApplyLoanInput, salarySlipUrl: string) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found.') as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }

    if (user.profileStatus !== 'ELIGIBLE') {
      const err = new Error('Borrower is not eligible to apply for a loan.') as Error & { statusCode: number };
      err.statusCode = 400;
      throw err;
    }

    // Prevent multiple active applications
    const existingLoan = await Loan.findOne({
      borrowerId: userId,
      status: { $in: ['PENDING', 'APPROVED', 'DISBURSED'] },
    });
    if (existingLoan) {
      const err = new Error('You already have an active loan application.') as Error & { statusCode: number };
      err.statusCode = 409;
      throw err;
    }

    const calc = calculateLoan(data.amount, data.tenure);

    const loan = await Loan.create({
      borrowerId: userId,
      amount: calc.principal,
      tenure: calc.tenure,
      interestRate: calc.interestRate,
      totalRepayment: calc.totalRepayment,
      outstandingBalance: calc.totalRepayment,
      monthlyEMI: calc.monthlyEMI,
      salarySlipUrl,
      status: 'PENDING',
    });

    // Update borrower profile status
    await User.findByIdAndUpdate(userId, { profileStatus: 'APPLIED' });

    return loan;
  }

  /**
   * Get all loans for a specific borrower.
   */
  static async getMyLoans(userId: string) {
    return Loan.find({ borrowerId: userId }).sort({ createdAt: -1 });
  }
}

import UserRepo from '../models/UserRepo';
import LoanRepo from '../models/LoanRepo';
import { checkEligibility } from '../utils/bre';
import { calculateLoan } from '../utils/loanCalculator';
import { EmploymentMode, LoanStatus } from '../types';

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

    const user = await UserRepo.update(userId, {
      personalDetails: { ...details, dob: dob.toISOString(), pan: details.pan.toUpperCase() },
      profileStatus,
    });

    if (!user) {
      const err = new Error('User not found.') as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, breResult };
  }

  /**
   * Step 3: Save salary slip URL.
   */
  static async saveSalarySlip(userId: string, slipUrl: string) {
    const user = await UserRepo.findById(userId);
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

    return { salarySlipUrl: slipUrl, message: 'Salary slip uploaded. Proceed to loan application.' };
  }

  /**
   * Step 4: Calculate loan and create PENDING loan application.
   */
  static async applyForLoan(userId: string, data: ApplyLoanInput, salarySlipUrl: string) {
    const user = await UserRepo.findById(userId);
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
    const activeStatuses: LoanStatus[] = ['PENDING', 'APPROVED', 'DISBURSED'];
    const existingLoan = await LoanRepo.findByBorrowerIdAndStatuses(userId, activeStatuses);
    if (existingLoan) {
      const err = new Error('You already have an active loan application.') as Error & { statusCode: number };
      err.statusCode = 409;
      throw err;
    }

    const calc = calculateLoan(data.amount, data.tenure);

    const loan = await LoanRepo.create({
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
    await UserRepo.update(userId, { profileStatus: 'APPLIED' });

    return loan;
  }

  /**
   * Get all loans for a specific borrower.
   */
  static async getMyLoans(userId: string) {
    return LoanRepo.findByBorrowerId(userId);
  }
}

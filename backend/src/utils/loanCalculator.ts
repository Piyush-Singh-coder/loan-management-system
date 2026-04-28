import { LoanCalcResult } from '../types';

/**
 * Calculates loan repayment using Simple Interest.
 * Formula:
 *   Interest = (Principal × Rate × Tenure_in_months) / (12 × 100)
 *   Total Repayment = Principal + Interest
 *   Monthly EMI = Total Repayment / Tenure
 *
 * @param principal   - Loan amount in INR
 * @param tenureMonths - Repayment period in months
 * @param annualRate   - Annual interest rate in % (default 12)
 */
export const calculateLoan = (
  principal: number,
  tenureMonths: number,
  annualRate: number = 12
): LoanCalcResult => {
  const totalInterest = (principal * annualRate * tenureMonths) / (12 * 100);
  const totalRepayment = principal + totalInterest;
  const monthlyEMI = totalRepayment / tenureMonths;

  return {
    principal,
    interestRate: annualRate,
    tenure: tenureMonths,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
    monthlyEMI: Math.round(monthlyEMI * 100) / 100,
  };
};

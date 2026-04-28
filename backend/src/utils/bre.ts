import { BREResult, EmploymentMode } from '../types';

interface BREInput {
  dob: Date;
  monthlySalary: number;
  pan: string;
  employmentMode: EmploymentMode;
}

// Calculate age from date of birth
const getAge = (dob: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

// PAN format: 5 uppercase letters + 4 digits + 1 uppercase letter
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

/**
 * Business Rule Engine — checks all eligibility criteria.
 * Returns { eligible: true } or { eligible: false, reason: '...' }
 */
export const checkEligibility = (input: BREInput): BREResult => {
  const age = getAge(input.dob);

  if (age < 23 || age > 58) {
    return {
      eligible: false,
      reason: `Age ${age} is out of the acceptable range (23–58 years).`,
    };
  }

  if (input.monthlySalary < 25000) {
    return {
      eligible: false,
      reason: `Monthly salary ₹${input.monthlySalary} is below the minimum required ₹25,000.`,
    };
  }

  if (!PAN_REGEX.test(input.pan)) {
    return {
      eligible: false,
      reason: 'PAN card number format is invalid. Expected format: ABCDE1234F.',
    };
  }

  if (input.employmentMode === 'UNEMPLOYED') {
    return {
      eligible: false,
      reason: 'Unemployed applicants are not eligible for a loan.',
    };
  }

  return { eligible: true };
};

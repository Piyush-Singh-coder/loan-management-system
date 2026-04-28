import mongoose, { Schema, Document } from 'mongoose';
import { LoanStatus } from '../types';

export interface ILoan extends Document {
  borrowerId: mongoose.Types.ObjectId;
  amount: number;
  tenure: number; // in months
  interestRate: number; // fixed 12%
  totalRepayment: number;
  outstandingBalance: number;
  monthlyEMI: number;
  status: LoanStatus;
  salarySlipUrl?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    borrowerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1000 },
    tenure: { type: Number, required: true, min: 1, max: 60 },
    interestRate: { type: Number, default: 12 }, // 12% per annum fixed
    totalRepayment: { type: Number, required: true },
    outstandingBalance: { type: Number, required: true },
    monthlyEMI: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'DISBURSED', 'CLOSED'],
      default: 'PENDING',
    },
    salarySlipUrl: { type: String, default: null },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<ILoan>('Loan', LoanSchema);

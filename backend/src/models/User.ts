import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, EmploymentMode, ProfileStatus } from '../types';

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  profileStatus: ProfileStatus;
  personalDetails?: {
    fullName: string;
    pan: string;
    dob: Date;
    monthlySalary: number;
    employmentMode: EmploymentMode;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PersonalDetailsSchema = new Schema(
  {
    fullName: { type: String, required: true },
    pan: { type: String, required: true, uppercase: true },
    dob: { type: Date, required: true },
    monthlySalary: { type: Number, required: true },
    employmentMode: {
      type: String,
      enum: ['SALARIED', 'SELF_EMPLOYED', 'UNEMPLOYED'],
      required: true,
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['BORROWER', 'ADMIN', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION'],
      default: 'BORROWER',
    },
    profileStatus: {
      type: String,
      enum: ['REGISTERED', 'ELIGIBLE', 'INELIGIBLE', 'APPLIED'],
      default: 'REGISTERED',
    },
    personalDetails: { type: PersonalDetailsSchema, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);

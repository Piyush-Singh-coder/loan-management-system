import {
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { docClient, LOANS_TABLE } from '../config/dynamo';
import { LoanStatus } from '../types';
import { UserRepo, IUser } from './UserRepo';

export interface ILoan {
  _id: string;
  id: string;
  borrowerId: any;
  amount: number;
  tenure: number;
  interestRate: number;
  totalRepayment: number;
  outstandingBalance: number;
  monthlyEMI: number;
  status: LoanStatus;
  salarySlipUrl?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export class LoanRepo {
  private static formatLoan(item: any): ILoan | null {
    if (!item) return null;
    const loan = { ...item };
    loan._id = item.id || item._id;
    loan.id = loan._id;
    return loan as ILoan;
  }

  static async findById(id: string): Promise<ILoan | null> {
    const command = new GetCommand({
      TableName: LOANS_TABLE,
      Key: { id },
    });
    const result = await docClient.send(command);
    if (!result.Item) return null;
    return this.formatLoan(result.Item);
  }

  static async create(data: {
    borrowerId: string;
    amount: number;
    tenure: number;
    interestRate: number;
    totalRepayment: number;
    outstandingBalance: number;
    monthlyEMI: number;
    salarySlipUrl?: string | null;
    status?: LoanStatus;
  }): Promise<ILoan> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newLoan: ILoan = {
      _id: id,
      id,
      borrowerId: data.borrowerId,
      amount: data.amount,
      tenure: data.tenure,
      interestRate: data.interestRate,
      totalRepayment: data.totalRepayment,
      outstandingBalance: data.outstandingBalance,
      monthlyEMI: data.monthlyEMI,
      salarySlipUrl: data.salarySlipUrl || null,
      status: data.status || 'PENDING',
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: LOANS_TABLE,
        Item: newLoan,
      })
    );

    return newLoan;
  }

  static async update(id: string, updates: Partial<ILoan>): Promise<ILoan | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updatedLoan = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: LOANS_TABLE,
        Item: updatedLoan,
      })
    );

    return updatedLoan;
  }

  static async findByBorrowerId(borrowerId: string): Promise<ILoan[]> {
    const command = new QueryCommand({
      TableName: LOANS_TABLE,
      IndexName: 'BorrowerIndex',
      KeyConditionExpression: 'borrowerId = :bId',
      ExpressionAttributeValues: {
        ':bId': borrowerId,
      },
    });
    const result = await docClient.send(command);
    const loans = (result.Items || []).map((item) => this.formatLoan(item)!);
    // Sort descending by createdAt
    return loans.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  static async findByBorrowerIdAndStatuses(
    borrowerId: string,
    statuses: LoanStatus[]
  ): Promise<ILoan | null> {
    const loans = await this.findByBorrowerId(borrowerId);
    return loans.find((l) => statuses.includes(l.status)) || null;
  }

  static async findByStatusWithBorrower(status: LoanStatus): Promise<ILoan[]> {
    const command = new QueryCommand({
      TableName: LOANS_TABLE,
      IndexName: 'StatusIndex',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
      },
    });
    const result = await docClient.send(command);
    const loans = (result.Items || []).map((item) => this.formatLoan(item)!);

    // Populate borrowerId details parallelly
    const populatedLoans = await Promise.all(
      loans.map(async (loan) => {
        const borrowerIdStr = typeof loan.borrowerId === 'string' ? loan.borrowerId : loan.borrowerId?._id;
        if (borrowerIdStr) {
          const user = await UserRepo.findById(borrowerIdStr);
          if (user) {
            const { password, ...userWithoutPassword } = user;
            return { ...loan, borrowerId: userWithoutPassword };
          }
        }
        return loan;
      })
    );

    return populatedLoans;
  }
}

export default LoanRepo;

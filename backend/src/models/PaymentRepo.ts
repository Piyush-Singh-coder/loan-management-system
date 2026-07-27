import {
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { docClient, PAYMENTS_TABLE } from '../config/dynamo';

export interface IPayment {
  _id: string;
  id: string;
  loanId: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export class PaymentRepo {
  private static formatPayment(item: any): IPayment | null {
    if (!item) return null;
    const payment = { ...item };
    payment._id = item.id || item._id;
    payment.id = payment._id;
    return payment as IPayment;
  }

  static async findByUtrNumber(utrNumber: string): Promise<IPayment | null> {
    const command = new QueryCommand({
      TableName: PAYMENTS_TABLE,
      IndexName: 'UtrIndex',
      KeyConditionExpression: 'utrNumber = :utr',
      ExpressionAttributeValues: {
        ':utr': utrNumber.trim(),
      },
    });
    const result = await docClient.send(command);
    if (!result.Items || result.Items.length === 0) return null;
    return this.formatPayment(result.Items[0]);
  }

  static async findByLoanId(loanId: string): Promise<IPayment[]> {
    const command = new QueryCommand({
      TableName: PAYMENTS_TABLE,
      IndexName: 'LoanIndex',
      KeyConditionExpression: 'loanId = :lId',
      ExpressionAttributeValues: {
        ':lId': loanId,
      },
    });
    const result = await docClient.send(command);
    const payments = (result.Items || []).map((item) => this.formatPayment(item)!);
    // Sort descending by paymentDate
    return payments.sort((a, b) => (a.paymentDate < b.paymentDate ? 1 : -1));
  }

  static async create(data: {
    loanId: string;
    utrNumber: string;
    amount: number;
    paymentDate: string;
    recordedBy: string;
  }): Promise<IPayment> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newPayment: IPayment = {
      _id: id,
      id,
      loanId: data.loanId,
      utrNumber: data.utrNumber.trim(),
      amount: data.amount,
      paymentDate: data.paymentDate,
      recordedBy: data.recordedBy,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: PAYMENTS_TABLE,
        Item: newPayment,
      })
    );

    return newPayment;
  }
}

export default PaymentRepo;

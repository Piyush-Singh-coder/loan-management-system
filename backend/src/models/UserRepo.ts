import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { docClient, USERS_TABLE } from '../config/dynamo';
import { UserRole, ProfileStatus, EmploymentMode } from '../types';

export interface IUser {
  _id: string;
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  profileStatus: ProfileStatus;
  personalDetails?: {
    fullName: string;
    pan: string;
    dob: string;
    monthlySalary: number;
    employmentMode: EmploymentMode;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export class UserRepo {
  private static formatUser(item: any): IUser | null {
    if (!item) return null;
    const user = { ...item };
    user._id = item.id || item._id;
    user.id = user._id;
    return user as IUser;
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const command = new QueryCommand({
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email.toLowerCase(),
      },
    });
    const result = await docClient.send(command);
    if (!result.Items || result.Items.length === 0) return null;
    return this.formatUser(result.Items[0]);
  }

  static async findById(id: string): Promise<IUser | null> {
    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: { id },
    });
    const result = await docClient.send(command);
    if (!result.Item) return null;
    return this.formatUser(result.Item);
  }

  static async create(data: {
    email: string;
    password: string;
    role?: UserRole;
    profileStatus?: ProfileStatus;
    personalDetails?: IUser['personalDetails'];
  }): Promise<IUser> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newUser: IUser = {
      _id: id,
      id,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || 'BORROWER',
      profileStatus: data.profileStatus || 'REGISTERED',
      personalDetails: data.personalDetails || null,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: newUser,
      })
    );

    return newUser;
  }

  static async update(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updatedUser = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: updatedUser,
      })
    );

    return updatedUser;
  }

  static async findBorrowersByStatuses(statuses: ProfileStatus[]): Promise<IUser[]> {
    const command = new ScanCommand({
      TableName: USERS_TABLE,
      FilterExpression: '#role = :role AND #status IN (' + statuses.map((_, i) => `:s${i}`).join(',') + ')',
      ExpressionAttributeNames: {
        '#role': 'role',
        '#status': 'profileStatus',
      },
      ExpressionAttributeValues: {
        ':role': 'BORROWER',
        ...statuses.reduce((acc, status, i) => ({ ...acc, [`:s${i}`]: status }), {}),
      },
    });
    const result = await docClient.send(command);
    return (result.Items || []).map((item) => this.formatUser(item)!);
  }
}

export default UserRepo;

import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import { UserRole } from '../types';

interface RegisterInput {
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthTokenPayload {
  user: Record<string, unknown>;
  token: string;
}

const generateToken = (userId: string, role: UserRole, email: string): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign(
    { userId, role, email },
    process.env.JWT_SECRET as string,
    options
  );
};

export class AuthService {
  /**
   * Register a new Borrower.
   * Only borrowers self-register; other roles are seeded by Admin.
   */
  static async register(input: RegisterInput): Promise<AuthTokenPayload> {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      const err = new Error('An account with this email already exists.') as Error & { statusCode: number };
      err.statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);
    const user = await User.create({
      email: input.email.toLowerCase(),
      password: hashedPassword,
      role: 'BORROWER',
      profileStatus: 'REGISTERED',
    });

    const token = generateToken(user._id.toString(), user.role, user.email);
    const userObj = user.toObject() as unknown as Record<string, unknown>;
    delete userObj.password;

    return { user: userObj, token };
  }

  /**
   * Login for all roles (Borrower, Admin, Sales, etc.)
   */
  static async login(input: LoginInput): Promise<AuthTokenPayload> {
    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user) {
      const err = new Error('Invalid email or password.') as Error & { statusCode: number };
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid email or password.') as Error & { statusCode: number };
      err.statusCode = 401;
      throw err;
    }

    const token = generateToken(user._id.toString(), user.role, user.email);
    const userObj = user.toObject() as unknown as Record<string, unknown>;
    delete userObj.password;

    return { user: userObj, token };
  }

  /**
   * Get user profile by ID.
   */
  static async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      const err = new Error('User not found.') as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }
    return user;
  }
}

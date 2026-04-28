import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required.', 400);
      return;
    }
    if (password.length < 6) {
      sendError(res, 'Password must be at least 6 characters long.', 400);
      return;
    }

    const result = await AuthService.register({ email, password });
    sendSuccess(res, result, 'Registration successful.', 201);
  }

  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required.', 400);
      return;
    }

    const result = await AuthService.login({ email, password });
    sendSuccess(res, result, 'Login successful.');
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    // userId is attached by auth middleware
    const userId = (req as any).user?.userId;
    if (!userId) {
      sendError(res, 'Unauthorized.', 401);
      return;
    }

    const user = await AuthService.getProfile(userId);
    sendSuccess(res, { user }, 'Profile fetched successfully.');
  }
}

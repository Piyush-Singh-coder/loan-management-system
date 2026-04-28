import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UserRole } from '../types';
import { sendError } from '../utils/response';

interface JwtPayload {
  userId: string;
  role: string;
  email: string;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Access denied. No token provided.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = {
      userId: decoded.userId,
      role: decoded.role as UserRole,
      email: decoded.email,
    };
    next();
  } catch {
    sendError(res, 'Invalid or expired token.', 401);
  }
};

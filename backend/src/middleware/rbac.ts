import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { sendError } from '../utils/response';

/**
 * RBAC middleware factory.
 * Usage: router.get('/route', verifyToken, authorize(['ADMIN', 'SANCTION']), controller)
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthenticated. Please login.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Access forbidden. Role '${req.user.role}' is not allowed to perform this action.`,
        403
      );
      return;
    }

    next();
  };
};

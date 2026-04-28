import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

/**
 * Global error handler middleware.
 */

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('🔴 Error:', err);

  if (err.name === 'ValidationError') {
    sendError(res, 'Validation Error', 400, err.errors);
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    sendError(res, `Duplicate value for field: '${field}'.`, 409);
    return;
  }

  if (err.name === 'CastError') {
    sendError(res, `Invalid ID format.`, 400);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  sendError(res, message, statusCode);
};

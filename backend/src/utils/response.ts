import { Response } from 'express';

/**
 * Send a standardised success response.
 */
export const sendSuccess = (
  res: Response,
  data: unknown,
  message = 'Success',
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a standardised error response.
 */
export const sendError = (
  res: Response,
  message = 'Something went wrong',
  statusCode = 500,
  errors?: unknown
): Response => {
  const body: Record<string, unknown> = { success: false, message };
  if (errors !== undefined) {
    body.errors = errors;
  }
  return res.status(statusCode).json(body);
};

// src/interfaces/http/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../application/errors/AppError';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const appError = err instanceof AppError ? err : new AppError();

  res.status(appError.status).json({ success: false, message: appError.message });
}

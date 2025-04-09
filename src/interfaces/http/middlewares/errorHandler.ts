import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../application/errors/AppError';
import { BaseResponse } from '../utils/BaseResponse';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    BaseResponse.error(
      res,
      {
        message: err.message,
        type: err.type,
        details: err.details,
      },
      err.statusCode
    );
  } else {
    console.error('Unexpected error - NO DEBERIA ENTRAR ACA:', err);
    // fallback para errores inesperados
    BaseResponse.error(
      res,
      {
        message: 'Internal server error',
        type: 'INTERNAL_SERVER_ERROR',
      },
      500
    );
  }
}

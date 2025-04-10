import { Response } from 'express';
import { ErrorResponse } from '../types/BaseResponseTypes';

export class BaseResponse {
  static success<T>(res: Response, data: T, status = 200): void {
    res.status(status).json({
      success: true,
      data,
    });
  }

  static error(res: Response, error: ErrorResponse['error'], status = 500): void {
    res.status(status).json({
      success: false,
      data: null,
      error,
    });
  }
}

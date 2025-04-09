import { Response } from 'express';
import { SuccessResponse, ErrorResponse } from '../types/BaseResponseTypes';

export class BaseResponse {
  static success<T>(res: Response, data: T, status = 200): Response<SuccessResponse<T>> {
    return res.status(status).json({
      success: true,
      data,
      error: null,
    });
  }

  static error(
    res: Response,
    error: ErrorResponse['error'],
    status = 500
  ): Response<ErrorResponse> {
    return res.status(status).json({
      success: false,
      data: null,
      error,
    });
  }
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  error: null;
}

export interface ErrorResponse {
  success: false;
  data: null;
  error: {
    message: string;
    type?: string;
    details?: Record<string, unknown>;
  };
}

export type BaseResponse<T> = SuccessResponse<T> | ErrorResponse;

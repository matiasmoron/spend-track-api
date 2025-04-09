export class AppError extends Error {
  public readonly type: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, statusCode = 400, type?: string, details?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.type = type ?? AppError.mapStatusToType(statusCode);
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  private static mapStatusToType(statusCode: number): string {
    if (statusCode >= 500) return 'INTERNAL_SERVER_ERROR';
    if (statusCode === 422) return 'UNPROCESSABLE_ENTITY';
    if (statusCode === 409) return 'CONFLICT';
    if (statusCode === 404) return 'NOT_FOUND';
    if (statusCode === 401) return 'UNAUTHORIZED';
    if (statusCode === 403) return 'FORBIDDEN';
    if (statusCode === 400) return 'BAD_REQUEST';

    return 'UNKNOWN_ERROR';
  }
}

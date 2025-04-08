export class AppError extends Error {
  status: number;

  constructor(
    {
      message,
      status = 500,
    }: {
      message?: string;
      status?: number;
    } = {
      status: 500,
    }
  ) {
    super(message || AppError.getErrorMessage(status));
    this.status = status;
  }

  private static getErrorMessage(status: number = 500): string {
    switch (status) {
      case 400:
        return 'Bad request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not found';
      case 409:
        return 'Conflict';
      case 500:
        return 'Internal server error';
      default:
        return 'Internal server error';
    }
  }
}

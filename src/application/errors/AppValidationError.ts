import { ValidationError } from 'class-validator';
import { AppError } from './AppError';

export const ERROR_VALIDATION_TYPE = 'VALIDATION_ERROR';
export const ERROR_VALIDATION_MESSAGE = 'Validation Error';

export class AppValidationError extends AppError {
  constructor(errors: ValidationError[]) {
    super('Validation Error', 400, ERROR_VALIDATION_TYPE, {
      errors: AppValidationError.formatErrors(errors),
    });
  }

  private static formatErrors(errors: ValidationError[]) {
    return errors.map((err) => ({
      property: err.property,
      messages: Object.values(err.constraints || {}),
    }));
  }
}

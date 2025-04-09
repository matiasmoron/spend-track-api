import { ValidationError } from 'class-validator';
import { AppError } from './AppError';

const ERROR_TYPE = 'VALIDATION_ERROR';
export class AppValidationError extends AppError {
  constructor(errors: ValidationError[]) {
    super('Validation Error', 400, ERROR_TYPE, {
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

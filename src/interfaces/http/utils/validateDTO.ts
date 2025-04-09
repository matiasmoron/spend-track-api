import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AppValidationError } from '../../../application/errors';

export async function validateDTO<T extends object>(cls: new () => T, data: unknown): Promise<T> {
  const dto = plainToInstance(cls, data);
  const errors = await validate(dto);

  if (errors.length) {
    throw new AppValidationError(errors);
  }

  return dto;
}

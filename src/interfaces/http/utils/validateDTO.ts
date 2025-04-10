import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AppValidationError } from '../../../application/errors';

export async function validateDTO<T extends object>(cls: new () => T, data: unknown): Promise<T> {
  const dto = plainToInstance(cls, data);

  // whitelist = true only includes properties in the dto ( expected properties )
  const errors = await validate(dto, { whitelist: true });

  if (errors.length > 0) {
    throw new AppValidationError(errors);
  }

  return dto;
}

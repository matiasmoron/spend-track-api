import { plainToInstance as _plainToInstance } from 'class-transformer';

export const plainToInstance = <T>(cls: new () => T, obj: object): T =>
  _plainToInstance(cls, obj, { excludeExtraneousValues: false });

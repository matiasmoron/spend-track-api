import { NextFunction, Request, Response } from 'express';
import { ValidationError, validationResult } from 'express-validator';
import { httpResponse } from './../data/enums/response';
import { errorResponse } from './response';

const errorFormatter = ({ msg, param }: ValidationError) => {
  return `${param}: ${msg}`;
};

const fieldsValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return errorResponse(res)(errors.array().join(', '), httpResponse.BAD_REQUEST);
  }
  next();
  return undefined;
};

export default fieldsValidation;

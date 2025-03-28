import { Request, Response } from 'express';
import { httpResponse } from '../data/enums';
import { errorResponse } from './response';

const errorHandler = (err: Error, _req: Request, res: Response) => {
  console.log(err);
  return errorResponse(res)(
    'Internal error, try it again later',
    httpResponse.INTERNAL_SERVER_ERROR
  );
};

export default errorHandler;

// import { NextFunction, Request, Response } from 'express';
import { NextFunction, Request, Response } from 'express';
import { responseStatus, httpResponse } from '../data/enums';

const customResponse =
  (res: Response) =>
    (data: unknown, msg = 'It has been processed successfully.'): Response => {
      const resp = {
        status: responseStatus.SUCCESS,
        message: msg,
        data: data ?? '',
      };
      return res.status(httpResponse.OK).json(resp);
    };

export const errorResponse =
  (res: Response) =>
    (msg = '', status: httpResponse = httpResponse.BAD_REQUEST): Response => {
      const resp = {
        status: responseStatus.ERROR,
        message: msg,
        data: null,
      };
      return res.status(status).json(resp);
    };

const response = (_req: Request, res: Response, next: NextFunction) => {
  res.response = customResponse(res);
  res.errorResponse = errorResponse(res);
  next();
};

export default response;

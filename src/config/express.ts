import cors from 'cors';
import express, { Express } from 'express';
import { AppError } from '../application/errors';
import { BaseResponse } from '../interfaces/http/utils/BaseResponse';

const ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'https://expense-tracker-app-smoky-seven.vercel.app',
];

const app = express();

export function initExpress(): Express {
  app.disable('x-powered-by');

  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    cors({
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.options('*', cors());

  app.use(
    express.json({
      strict: true,
      verify: (_req, _res, buf, _encoding) => {
        try {
          JSON.parse(buf.toString());
        } catch {
          throw new AppError('INVALID_JSON', 400);
        }
      },
    })
  );

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.headers['content-type'] !== 'application/json') {
      return BaseResponse.error(
        res,
        {
          message: 'Content-Type must be application/json',
        },
        400
      );
    }
    next();
  });

  return app;
}

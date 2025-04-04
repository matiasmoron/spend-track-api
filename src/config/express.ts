import cors from 'cors';
import express, { Express } from 'express';

const app = express();

export function initExpress(): Express {
  app.disable('x-powered-by');
  app.use(express.json());

  app.use(
    cors({
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) => {
        const allowedOrigins = ['http://localhost:3000', 'https://your-production-url.com'];

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
  );

  return app;
}

import express from 'express';
import { errorHandler } from './interfaces/http/middlewares/errorHandler';
import apiRouter, { apiRouterPrefix } from './interfaces/http/routes/apiRouter';

const app = express();
app.use(express.json());
app.use(`${apiRouterPrefix}`, apiRouter);
app.use(errorHandler);

export default app;

import { initExpress } from './config/express';
import { errorHandler } from './interfaces/http/middlewares/errorHandler';
import apiRouter, { apiRouterPrefix } from './interfaces/http/routes/apiRouter';

const app = initExpress();
app.use(`${apiRouterPrefix}`, apiRouter);
app.use(errorHandler);

export default app;

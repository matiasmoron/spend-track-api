import { Router } from 'express';
import groupRoutes from './groupRoutes';
import healthRouter from './healthRoutes';
import userRoutes from './userRoutes';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/users', userRoutes);
apiRouter.use('/groups', groupRoutes);

export const apiRouterPrefix = '/api';

export default apiRouter;

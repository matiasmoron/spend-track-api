import { Router } from 'express';
import healthRouter from './healthRoutes';
import userRoutes from './userRoutes';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/users', userRoutes);

export default apiRouter;

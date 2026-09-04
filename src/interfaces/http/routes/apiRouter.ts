import { Router } from 'express';
import expenseRoutes from './expenseRoutes';
import groupRoutes from './groupRoutes';
import healthRouter from './healthRoutes';
import invitationRoute from './invitationRoute';
import paymentRoutes from './paymentRoutes';
import userRoutes from './userRoutes';

const apiRouter = Router();

apiRouter.use('/expenses', expenseRoutes);
apiRouter.use('/groups', groupRoutes);
apiRouter.use('/health', healthRouter);
apiRouter.use('/invitations', invitationRoute);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/users', userRoutes);

export const apiRouterPrefix = '/api';

export default apiRouter;

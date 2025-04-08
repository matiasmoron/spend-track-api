import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.status(200).json({ status: 'success', message: 'OK' });
});

export default healthRouter;

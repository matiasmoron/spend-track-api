import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userController.register(req, res);
  } catch (error: unknown) {
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userController.login(req, res);
  } catch (error: unknown) {
    next(error);
  }
});

export default router;

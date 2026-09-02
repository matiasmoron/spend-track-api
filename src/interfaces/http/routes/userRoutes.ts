import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateJWT } from '../middlewares/authenticate';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

const router = Router();
const userController = new UserController();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userController.register(req, res, next);
  } catch (error: unknown) {
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userController.login(req, res, next);
  } catch (error: unknown) {
    next(error);
  }
});

router.get(
  '/claimable-guests',
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await userController.getClaimableGuests(req as AuthenticatedRequest, res, next);
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.post(
  '/claim-guest',
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await userController.claimGuestMembership(req as AuthenticatedRequest, res, next);
    } catch (error: unknown) {
      next(error);
    }
  }
);

export default router;

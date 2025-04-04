import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

router.post('/register', async (req: Request, res: Response) => {
  try {
    await userController.register(req, res); // Manejo explícito de la promesa
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;

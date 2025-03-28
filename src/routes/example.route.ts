import express, { NextFunction, Request, Response } from 'express';
import { getExample, addExample } from '../controllers/example.controller';
import { validateExample } from '../validations/example';

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await getExample();
    res.response(result);
  } catch (err) {
    next(err);
  }
});

router.post('/', validateExample(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const result = await addExample({ name });
    res.response(result);
  } catch (err) {
    next(err);
  }
});

export default router;

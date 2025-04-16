import { Router } from 'express';
import { ExpenseController } from '../../../interfaces/http/controllers/ExpenseController';
import { authenticateJWT } from '../middlewares/authenticate';

const router = Router();
const expenseController = new ExpenseController();

router.post('/create', authenticateJWT, expenseController.create.bind(expenseController));

export default router;

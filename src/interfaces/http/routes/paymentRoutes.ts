import { Router } from 'express';
import { PaymentController } from '../../../interfaces/http/controllers/PaymentController';
import { authenticateJWT } from '../middlewares/authenticate';

const router = Router();
const paymentController = new PaymentController();

router.post('/create', authenticateJWT, paymentController.create.bind(paymentController));
router.put('/:id', authenticateJWT, paymentController.update.bind(paymentController));
router.delete('/:id', authenticateJWT, paymentController.delete.bind(paymentController));

export default router;

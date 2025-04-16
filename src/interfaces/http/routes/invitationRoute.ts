import { Router } from 'express';
import { InvitationController } from '../../../interfaces/http/controllers/InvitationController';
import { authenticateJWT } from '../middlewares/authenticate';

const router = Router();
const controller = new InvitationController();

router.post('/send', authenticateJWT, controller.send.bind(InvitationController));
router.get('/all', authenticateJWT, controller.getAll.bind(InvitationController));
router.patch('/:id', authenticateJWT, controller.updateStatus.bind(InvitationController));

export default router;

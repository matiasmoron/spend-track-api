import { Router } from 'express';
import { GroupController } from '../controllers/GroupController';
import { authenticateJWT } from '../middlewares/authenticate';

const groupController = new GroupController();
const groupRouter = Router();

groupRouter.post('/create', authenticateJWT, groupController.create.bind(groupController));
groupRouter.get('/', authenticateJWT, groupController.getByUser.bind(groupController));

export default groupRouter;

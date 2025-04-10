import { NextFunction, Response } from 'express';
import { createGroup } from '../../../application/use-cases/group/CreateGroup';
import { getGroupsByUser } from '../../../application/use-cases/group/GetGroupsByUser';
import { groupRepository, userGroupRepository } from '../../../config/di';
import { CreateGroupDTO } from '../../../interfaces/validators/group';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { BaseResponse } from '../utils/BaseResponse';
import { validateDTO } from '../utils/validateDTO';

export class GroupController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Check why is necessary to move the try to this position
      const dto = await validateDTO(CreateGroupDTO, req.body);

      const groupInput = {
        ...dto,
        createdBy: req.user.id,
      };

      const result = await createGroup(groupRepository, userGroupRepository, groupInput);

      BaseResponse.success(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async getByUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: userId } = req.user;
      const result = await getGroupsByUser({ userId }, groupRepository);
      BaseResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

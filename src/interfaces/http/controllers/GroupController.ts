import { Request, Response, NextFunction } from 'express';
import { createGroup } from '../../../application/use-cases/group/CreateGroup';
import { groupRepository, userGroupRepository } from '../../../config/di';
import { CreateGroupDTO } from '../../../interfaces/validators/group';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { BaseResponse } from '../utils/BaseResponse';
import { validateDTO } from '../utils/validateDTO';

export class GroupController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const dto = await validateDTO(CreateGroupDTO, req.body);

    const groupInput = {
      ...dto,
      createdBy: req.user.id,
    };

    try {
      const result = await createGroup(groupRepository, userGroupRepository, groupInput);

      BaseResponse.success(res, result, 201);
      return;
    } catch (error) {
      next(error);
    }
  }
}

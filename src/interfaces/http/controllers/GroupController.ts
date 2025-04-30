import { NextFunction, Response } from 'express';
import { createGroup } from '../../../application/use-cases/group/CreateGroup';
import { getGroupById } from '../../../application/use-cases/group/GetGroupById';
import { getGroupMembers } from '../../../application/use-cases/group/GetGroupMembers';
import { getGroupsByUser } from '../../../application/use-cases/group/GetGroupsByUser';
import {
  expenseParticipantRepository,
  expenseRepository,
  groupRepository,
  userGroupRepository,
} from '../../../config/di';
import { CreateGroupDTO } from '../../../interfaces/validators/group';
import { GetGroupMembersDTO } from '../../../interfaces/validators/group/GetGroupMembersDTO';
import { GetGroupDetailsDTO } from '../../validators/group/GetGroupDetailsDTO';
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

  async getDetailsById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = await validateDTO(GetGroupDetailsDTO, {
        groupId: Number(req.params.groupId),
        userId: Number(req.user.id),
      });

      const result = await getGroupById(dto, {
        groupRepository,
        userGroupRepository,
        expenseRepository,
        expenseParticipantRepository,
      });

      BaseResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getGroupMembers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const groupId = Number(req.params.groupId);

      const dto = await validateDTO(GetGroupMembersDTO, { groupId, userId: req.user.id });

      const result = await getGroupMembers(dto, {
        userGroupRepository,
      });

      BaseResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

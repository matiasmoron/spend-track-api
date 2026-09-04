import { NextFunction, Response } from 'express';
import { addGuestMember } from '../../../application/use-cases/group/AddGuestMember';
import { createGroup } from '../../../application/use-cases/group/CreateGroup';
import { deleteGroup } from '../../../application/use-cases/group/DeleteGroup';
import { getGroupById } from '../../../application/use-cases/group/GetGroupById';
import { getGroupMembers } from '../../../application/use-cases/group/GetGroupMembers';
import { getGroupsByUser } from '../../../application/use-cases/group/GetGroupsByUser';
import { getGroupsSummary } from '../../../application/use-cases/group/GetGroupsSummary';
import {
  authService,
  expenseParticipantRepository,
  expenseRepository,
  groupRepository,
  invitationRepository,
  paymentRepository,
  userGroupRepository,
  userRepository,
} from '../../../config/di';
import {
  AddGuestMemberDTO,
  CreateGroupDTO,
  DeleteGroupDTO,
  GetGroupDetailsDTO,
  GetGroupMembersDTO,
} from '../../../interfaces/validators/group';
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

  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: userId } = req.user;
      const result = await getGroupsSummary(
        { userId },
        {
          groupRepository,
          userGroupRepository,
          expenseRepository,
          expenseParticipantRepository,
          paymentRepository,
        }
      );
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
        paymentRepository,
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

  async addGuestMember(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = await validateDTO(AddGuestMemberDTO, {
        ...req.body,
        groupId: Number(req.params.groupId),
      });

      const result = await addGuestMember(
        invitationRepository,
        userGroupRepository,
        userRepository,
        authService,
        {
          groupId: dto.groupId,
          name: dto.name,
          claimEmail: dto.claimEmail,
          addedById: req.user.id,
        }
      );

      BaseResponse.success(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDTO(DeleteGroupDTO, { groupId: Number(req.params.groupId) });

      const input = {
        groupId: dto.groupId,
        userId: Number(req.user.id),
      };

      await deleteGroup(input, { groupRepository, userGroupRepository });
      return BaseResponse.success(res, { message: 'Group deleted successfully' }, 200);
    } catch (error) {
      next(error);
    }
  }
}

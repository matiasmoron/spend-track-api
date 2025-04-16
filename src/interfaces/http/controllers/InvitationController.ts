import { Response, NextFunction } from 'express';
import { updateInvitationStatus } from 'application/use-cases/invitation/UpdateInvitationStatus';
import { UpdateInvitationStatusDTO } from 'interfaces/validators/invitation/UpdateInvitationStatusDTO';
import { getUserInvitations } from '../../../application/use-cases/invitation/GetUserInvitations';
import { sendInvitation } from '../../../application/use-cases/invitation/SendInvitation';
import { invitationRepository, userGroupRepository } from '../../../config/di';
import { AuthenticatedRequest } from '../../../interfaces/http/types/AuthenticatedRequest';
import { BaseResponse } from '../../../interfaces/http/utils/BaseResponse';
import { CreateInvitationDTO } from '../../validators/invitation/CreateInvitationDTO';
import { validateDTO } from '../utils/validateDTO';

export class InvitationController {
  async send(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDTO(CreateInvitationDTO, req.body);

      const result = await sendInvitation(invitationRepository, userGroupRepository, {
        groupId: dto.groupId,
        invitedUserId: dto.invitedUserId,
        invitedById: req.user.id,
      });

      return BaseResponse.success(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await getUserInvitations(invitationRepository, req.user.id);
      return BaseResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);

      const dto = await validateDTO(UpdateInvitationStatusDTO, {
        ...req.body,
        id,
      });

      const result = await updateInvitationStatus(invitationRepository, userGroupRepository, {
        id,
        userId: req.user.id,
        status: dto.status,
      });

      return BaseResponse.success(res, result, 200);

      // return BaseResponse.success(res, null, 204);
    } catch (error) {
      next(error);
    }
  }
}

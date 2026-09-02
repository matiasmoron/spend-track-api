import { NextFunction, Request, Response } from 'express';
import {
  claimGuestMembership,
  getClaimableGuests,
  loginUser,
  registerUser,
} from '../../../application/use-cases/user';
import {
  authService,
  expenseParticipantRepository,
  invitationRepository,
  userGroupRepository,
  userRepository,
} from '../../../config/di';
import { ClaimGuestMembershipDTO, LoginDTO, RegisterUserDTO } from '../../validators/user';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { BaseResponse } from '../utils/BaseResponse';
import { validateDTO } from '../utils/validateDTO';

interface RegisterRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}

export class UserController {
  register: (_req: RegisterRequest, _res: Response, next: NextFunction) => Promise<void> = async (
    req,
    res,
    next
  ) => {
    const dto = await validateDTO(RegisterUserDTO, req.body);

    try {
      const result = await registerUser(userRepository, authService, dto);
      BaseResponse.success(res, result, 201);
      return;
    } catch (error) {
      next(error);
    }
  };

  login: (_req: RegisterRequest, _res: Response, next: NextFunction) => Promise<void> = async (
    req,
    res,
    next
  ) => {
    const dto = await validateDTO(LoginDTO, req.body);
    try {
      const result = await loginUser(userRepository, authService, dto);
      BaseResponse.success(res, result);
      return;
    } catch (error) {
      next(error);
    }
  };

  getClaimableGuests = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await getClaimableGuests(userRepository, req.user.email);
      BaseResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  claimGuestMembership = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto = await validateDTO(ClaimGuestMembershipDTO, req.body);

      await claimGuestMembership(
        userRepository,
        userGroupRepository,
        expenseParticipantRepository,
        invitationRepository,
        {
          guestUserId: dto.guestUserId,
          realUserId: req.user.id,
        }
      );

      BaseResponse.success(res, { message: 'Guest membership claimed successfully' });
    } catch (error) {
      next(error);
    }
  };
}

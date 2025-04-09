import { NextFunction, Request, Response } from 'express';
import { loginUser, registerUser } from '../../../application/use-cases/user';
import { authService, userRepository } from '../../../config/di';
import { LoginDTO, RegisterUserDTO } from '../../validators/user';
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
  register: (_req: RegisterRequest, _res: Response, next: NextFunction) => Promise<Response> =
    async (req, res, next) => {
      const dto = await validateDTO(RegisterUserDTO, req.body);

      try {
        const result = await registerUser(userRepository, authService, dto);
        return BaseResponse.success(res, result);
      } catch (error) {
        next(error);
      }
    };

  login: (_req: RegisterRequest, _res: Response, next: NextFunction) => Promise<Response> = async (
    req,
    res,
    next
  ) => {
    const dto = await validateDTO(LoginDTO, req.body);
    try {
      const result = await loginUser(userRepository, authService, dto);
      return BaseResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}

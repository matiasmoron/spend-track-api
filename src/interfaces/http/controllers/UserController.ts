import { validate } from 'class-validator';
import { red } from 'colorette';
import { Request, Response } from 'express';
import { AppValidationError, AppError } from '../../../application/errors';
import { loginUser, registerUser } from '../../../application/use-cases/user';
import { authService, userRepository } from '../../../config/di';
import { LoginDTO, RegisterUserDTO } from '../../validators/user';
import { BaseResponse } from '../utils/BaseResponse';
import { plainToInstance } from '../utils/plainToInstance';

interface RegisterRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}

export class UserController {
  register: (_req: RegisterRequest, _res: Response) => Promise<Response> = async (req, res) => {
    const dto = plainToInstance(RegisterUserDTO, req.body);
    const errors = await validate(dto);
    if (errors.length) throw new AppValidationError(errors);

    try {
      const result = await registerUser(userRepository, authService, dto);
      return BaseResponse.success(res, result);
    } catch (err) {
      throw new AppError(`Error registering user: ${err}`);
    }
  };

  login: (_req: Request, _res: Response) => Promise<Response> = async (req, res) => {
    const dto = plainToInstance(LoginDTO, req.body);
    const errors = await validate(dto);
    if (errors.length) throw new AppValidationError(errors);

    try {
      const result = await loginUser(userRepository, authService, dto);
      return BaseResponse.success(res, result);
    } catch (error) {
      throw new AppError(`Error logging in: ${error}`, 500);
    }
  };
}

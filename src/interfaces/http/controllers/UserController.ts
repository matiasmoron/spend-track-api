import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { AppError } from '../../../application/errors/AppError';
import { registerUser } from '../../../application/use-cases/user';
import { authService, userRepository } from '../../../config/di';
import { RegisterUserDTO } from '../../../interfaces/validators/RegisterUserDTO';

interface RegisterRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}

export class UserController {
  register: (_req: RegisterRequest, _res: Response) => Promise<Response> = async (req, res) => {
    const dto = new RegisterUserDTO();
    const { name: reqName, email: reqEmail, password: reqPassword } = req.body;

    dto.name = reqName;
    dto.email = reqEmail;
    dto.password = reqPassword;

    const errors = await validate(dto);
    if (errors.length)
      throw new AppError({ message: `Validation Error: ${errors.toString()}`, status: 400 });

    try {
      const { id, name, email } = await registerUser(userRepository, authService, dto);
      return res.status(201).json({ id, name, email });
    } catch (err) {
      throw new AppError({
        message: `Error registering user: ${err}`,
        status: 500,
      });
    }
  };
}

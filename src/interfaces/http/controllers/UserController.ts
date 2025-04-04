import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { registerUser } from '../../../application/use-cases/RegisterUser';
import { authService, userRepository } from '../../../config/di';
import { RegisterUserDTO } from '../../../interfaces/validators/RegisterUserDTO';

interface RegisterRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}

interface AppError extends Error {
  message: string;
}

export class UserController {
  register: (_req: RegisterRequest, _res: Response) => Promise<Response> = async (req, res) => {
    const dto = new RegisterUserDTO();
    const { name: reqName, email: reqEmail, password: reqPassword } = req.body;

    dto.name = reqName;
    dto.email = reqEmail;
    dto.password = reqPassword;

    const errors = await validate(dto);
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    try {
      const { id, name, email } = await registerUser(userRepository, authService, dto);
      return res.status(201).json({ id, name, email });
    } catch (err) {
      return res.status(400).json({ message: (err as AppError).message });
    }
  };
}

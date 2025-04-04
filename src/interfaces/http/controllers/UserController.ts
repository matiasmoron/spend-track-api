import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { registerUser } from '../../../application/use-cases/RegisterUser';
import { authService, userRepository } from '@/config/di';
import { RegisterUserDTO } from '@/interfaces/validators/RegisterUserDTO';

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
    dto.name = req.body.name;
    dto.email = req.body.email;
    dto.password = req.body.password;

    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const user = await registerUser(userRepository, authService, dto);
      return res.status(201).json({ id: user.id, name: user.name, email: user.email });
    } catch (err) {
      return res.status(400).json({ message: (err as AppError).message });
    }
  };
}

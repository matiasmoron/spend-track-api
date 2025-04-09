import { User } from '../../../domain/entities/user/User';
import { UserRepository } from '../../../domain/repositories/user/UserRepository';
import { AuthService } from '../../../infrastructure/database/services/AuthService';
import { AppError } from '../../errors/AppError';

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export async function registerUser(
  userRepository: UserRepository,
  authService: AuthService,
  data: RegisterUserInput
): Promise<User> {
  const existingUser = await userRepository.getByEmail(data.email);
  if (existingUser) {
    throw new AppError('Email is already in use', 409);
  }

  const passwordHash = await authService.hashPassword(data.password);

  const newUser = new User({
    name: data.name,
    email: data.email,
    password: passwordHash,
  });

  return await userRepository.save(newUser);
}

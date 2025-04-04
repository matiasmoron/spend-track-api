import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { AuthService } from '../../infrastructure/database/services/AuthService';

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
    throw new Error('Email is already in use');
  }

  const passwordHash = await authService.hashPassword(data.password);

  const newUser = new User({
    name: data.name,
    email: data.email,
    passwordHash,
  });

  return await userRepository.save(newUser);
}

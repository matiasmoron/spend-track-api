import { UserRepository } from '../../../domain/repositories/user/UserRepository';
import { AuthService } from '../../../infrastructure/database/services/AuthService';
import { AppError } from '../../errors/AppError';

interface LoginInput {
  email: string;
  password: string;
}

interface LoginOutput {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

export async function loginUser(
  userRepository: UserRepository,
  authService: AuthService,
  data: LoginInput
): Promise<LoginOutput> {
  const user = await userRepository.getByEmail(data.email);

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const passwordMatches = await authService.comparePasswords(data.password, user.password);

  if (!passwordMatches) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = authService.generateToken({ id: user.id }, '7D');

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
}

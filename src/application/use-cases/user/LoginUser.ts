import { UserProps } from '../../../domain/entities/user';
import { UserRepository } from '../../../domain/repositories/user/UserRepository';
import { AuthService } from '../../../infrastructure/database/services/AuthService';
import { AppError } from '../../errors/AppError';

type LoginInput = Pick<UserProps, 'email' | 'password'>;

type LoginOutput = {
  user: Pick<UserProps, 'id' | 'name' | 'email'>;
  token: string;
};

const EXPIRATION_TIME = '7D';

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

  const token = authService.generateToken({ id: user.id, email: user.email }, EXPIRATION_TIME);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
}

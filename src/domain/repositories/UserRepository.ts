import { User } from '../entities/User';

export interface UserRepository {
  save(user: User): Promise<User>;
  getByEmail(email: string): Promise<User | null>;
  getById(id: number): Promise<User | null>;
}

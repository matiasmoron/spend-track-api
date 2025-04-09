import { User } from '../../entities/user/User';

export interface UserRepository {
  save(_user: User): Promise<User>;
  getByEmail(_email: string): Promise<User | null>;
  getById(_id: number): Promise<User | null>;
}

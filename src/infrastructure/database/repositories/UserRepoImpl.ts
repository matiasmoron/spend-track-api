import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { AppDataSource } from '../DataSource';
import { UserModel } from '../models/UserModel';

export class UserRepoImpl implements UserRepository {
  private ormRepo: Repository<UserModel>;

  constructor() {
    this.ormRepo = AppDataSource.getRepository(UserModel);
  }

  async save(user: User): Promise<User> {
    const savedUser = await this.ormRepo.save({
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
    });

    return new User({
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
      passwordHash: savedUser.passwordHash,
    });
  }

  async getByEmail(email: string): Promise<User | null> {
    const user = await this.ormRepo.findOne({ where: { email } });
    if (!user) return null;

    return new User({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
    });
  }

  async getById(id: number): Promise<User | null> {
    const user = await this.ormRepo.findOne({ where: { id } });
    if (!user) return null;

    return new User({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
    });
  }
}

import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user/User';
import { UserRepository } from '../../../domain/repositories/user/UserRepository';
import { AppDataSource } from '../DataSource';
import { UserModel } from '../models/UserModel';

export class UserRepoImpl implements UserRepository {
  private ormRepo: Repository<UserModel>;

  constructor() {
    this.ormRepo = AppDataSource.getRepository(UserModel);
  }

  private toDomainUser(user: UserModel): User {
    return new User({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      isGuest: user.isGuest,
      claimEmail: user.claimEmail,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async save(user: User): Promise<User> {
    const savedUser = await this.ormRepo.save({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      isGuest: user.isGuest,
      claimEmail: user.claimEmail,
    });

    return this.toDomainUser(savedUser);
  }

  async getByEmail(email: string): Promise<User | null> {
    const user = await this.ormRepo.findOne({ where: { email } });
    if (!user) return null;

    return this.toDomainUser(user);
  }

  async getById(id: number): Promise<User | null> {
    const user = await this.ormRepo.findOne({ where: { id } });
    if (!user) return null;

    return this.toDomainUser(user);
  }

  async findGuestsByClaimEmail(claimEmail: string): Promise<User[]> {
    const users = await this.ormRepo.find({ where: { claimEmail, isGuest: true } });
    return users.map((user) => this.toDomainUser(user));
  }

  async delete(id: number): Promise<void> {
    await this.ormRepo.delete(id);
  }
}

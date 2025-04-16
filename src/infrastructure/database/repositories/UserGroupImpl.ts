import { Repository } from 'typeorm';
import { UserGroup } from '../../../domain/entities/group';
import { UserGroupRepository } from '../../../domain/repositories/group/UserGroupRepository';
import { AppDataSource } from '../DataSource';
import { UserGroupModel } from '../models/UserGroupModel';

export class UserGroupRepoImpl implements UserGroupRepository {
  private readonly repository: Repository<UserGroupModel>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserGroupModel);
  }

  async save(userGroup: Partial<UserGroup>): Promise<UserGroup> {
    const userGroupEntity = this.repository.create(userGroup);
    return await this.repository.save(userGroupEntity);
  }

  async findByUserId(userId: number): Promise<UserGroup[]> {
    return await this.repository.findBy({ userId });
  }

  async findByGroupId(groupId: number): Promise<UserGroup[]> {
    return await this.repository.findBy({ groupId });
  }

  async addUserToGroup(userId: number, groupId: number): Promise<void> {
    const repo = AppDataSource.getRepository(UserGroupModel);
    const entry = repo.create({ userId, groupId });
    await repo.save(entry);
  }

  async getUserGroups(userId: number): Promise<number[]> {
    const repo = AppDataSource.getRepository(UserGroupModel);
    const results = await repo.find({ where: { userId } });
    return results.map((r) => r.groupId);
  }

  async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
    const repo = AppDataSource.getRepository(UserGroupModel);
    const count = await repo.count({ where: { userId, groupId } });
    return count > 0;
  }
}

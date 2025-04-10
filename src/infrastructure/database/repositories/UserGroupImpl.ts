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
}

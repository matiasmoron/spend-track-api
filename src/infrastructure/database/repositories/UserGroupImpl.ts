import { Repository } from 'typeorm';
import { UserGroup, UserGroupWithUserName } from '../../../domain/entities/group';
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

  async findByGroupId(groupId: number): Promise<UserGroupWithUserName[]> {
    return await this.repository
      .createQueryBuilder('ug')
      .innerJoin('users', 'u', 'ug.userId = u.id')
      .select([
        'ug.id         AS "id"',
        'ug.userId    AS "userId"',
        'ug.groupId   AS "groupId"',
        'ug.created_at AS "createdAt"',
        'ug.updated_at AS "updatedAt"',
        'u.name        AS "userName"',
      ])
      .where('ug.groupId = :groupId', { groupId })
      .getRawMany();
  }

  async addUserToGroup(userId: number, groupId: number): Promise<void> {
    const entry = this.repository.create({ userId, groupId });
    await this.repository.save(entry);
  }

  async getUserGroups(userId: number): Promise<number[]> {
    const results = await this.repository.find({ where: { userId } });
    return results.map((r) => r.groupId);
  }

  async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
    const count = await this.repository.count({ where: { userId, groupId } });
    return count > 0;
  }
}

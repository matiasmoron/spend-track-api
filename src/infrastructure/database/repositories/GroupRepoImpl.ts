import { Repository } from 'typeorm';
import { Group } from '../../../domain/entities/group';
import { GroupRepository } from '../../../domain/repositories/group/GroupRepository';
import { AppDataSource } from '../DataSource';
import { GroupModel } from '../models/GroupModel';

export class GroupRepoImpl implements GroupRepository {
  private readonly ormRepo: Repository<GroupModel>;

  constructor() {
    this.ormRepo = AppDataSource.getRepository(GroupModel);
  }

  async save(group: Partial<Group>): Promise<Group> {
    const groupEntity = this.ormRepo.create(group);
    return await this.ormRepo.save(groupEntity);
  }

  async findById(id: number): Promise<Group | null> {
    return await this.ormRepo.findOneBy({ id });
  }

  async findByUserId(userId: number): Promise<Group[]> {
    return await this.ormRepo
      .createQueryBuilder('group')
      .innerJoin('user_groups', 'ug', 'ug.groupId = group.id')
      .where('ug.userId = :userId', { userId })
      .getMany();
  }
}

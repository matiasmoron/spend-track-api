import { Repository } from 'typeorm';
import { Group } from '../../../domain/entities/group';
import { GroupRepository } from '../../../domain/repositories/group/GroupRepository';
import { AppDataSource } from '../DataSource';
import { ExpenseModel } from '../models/ExpenseModel';
import { ExpenseParticipantModel } from '../models/ExpenseParticipantModel';
import { GroupModel } from '../models/GroupModel';
import { InvitationModel } from '../models/InvitationModel';
import { UserGroupModel } from '../models/UserGroupModel';

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

  /**
   * Delete group and all related data in a transaction
   */
  async delete(groupId: number): Promise<void> {
    await AppDataSource.transaction(async (manager) => {
      const expenseRepo = manager.getRepository(ExpenseModel);
      const expenseParticipantRepo = manager.getRepository(ExpenseParticipantModel);
      const userGroupRepo = manager.getRepository(UserGroupModel);
      const invitationRepo = manager.getRepository(InvitationModel);
      const groupRepo = manager.getRepository(GroupModel);

      // First, get all expenses for this group
      const expenses = await expenseRepo.find({ where: { groupId } });
      const expenseIds = expenses.map((expense) => expense.id);

      // Delete expense participants for all expenses in this group
      if (expenseIds.length > 0) {
        await expenseParticipantRepo
          .createQueryBuilder()
          .delete()
          .where('expenseId IN (:...expenseIds)', { expenseIds })
          .execute();
      }

      // Delete all expenses in this group
      await expenseRepo.delete({ groupId });

      // Delete all user-group associations
      await userGroupRepo.delete({ groupId });

      // Delete all invitations for this group
      await invitationRepo.delete({ groupId });

      // Finally, delete the group itself
      await groupRepo.delete({ id: groupId });
    });
  }
}

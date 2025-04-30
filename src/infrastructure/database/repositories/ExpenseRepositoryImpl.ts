import { Repository } from 'typeorm';
import { Expense } from '../../../domain/entities/expense/Expense';
import { ExpenseParticipant } from '../../../domain/entities/expense/ExpenseParticipant';
import { ExpenseRepository } from '../../../domain/repositories/expense/ExpenseRepository';
import { AppDataSource } from '../../../infrastructure/database/DataSource';
import { ExpenseModel } from '../../../infrastructure/database/models/ExpenseModel';
import { ExpenseParticipantModel } from '../../../infrastructure/database/models/ExpenseParticipantModel';

export class ExpenseRepositoryImpl implements ExpenseRepository {
  private ormRepo: Repository<ExpenseModel>;

  constructor() {
    this.ormRepo = AppDataSource.getRepository(ExpenseModel);
  }

  async create(expense: Expense, participants: ExpenseParticipant[]): Promise<Expense> {
    return await AppDataSource.transaction(async (manager) => {
      const expenseRepo = manager.getRepository(ExpenseModel);
      const participantRepo = manager.getRepository(ExpenseParticipantModel);

      const savedExpense = await expenseRepo.save({
        groupId: expense.groupId,
        description: expense.description,
        total: expense.total,
        currency: expense.currency,
        createdAt: expense.createdAt,
      });

      const participantEntities = participants.map((p) =>
        participantRepo.create({
          expenseId: savedExpense.id,
          userId: p.userId,
          amount: p.amount,
        })
      );

      await participantRepo.save(participantEntities);

      return new Expense({
        ...expense,
        id: savedExpense.id,
      });
    });
  }

  /**
   * Fetch all expenses for a given group
   */
  async findByGroupId(groupId: number): Promise<Expense[]> {
    const records = await this.ormRepo.find({ where: { groupId } });
    return records.map(
      (r) =>
        new Expense({
          id: r.id,
          groupId: r.groupId,
          description: r.description,
          total: r.total,
          currency: r.currency,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })
    );
  }
}

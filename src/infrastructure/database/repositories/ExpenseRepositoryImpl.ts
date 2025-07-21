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

  /**
   * Find expense by ID
   */
  async findById(id: number): Promise<Expense | null> {
    const record = await this.ormRepo.findOne({ where: { id } });
    if (!record) {
      return null;
    }

    return new Expense({
      id: record.id,
      groupId: record.groupId,
      description: record.description,
      total: record.total,
      currency: record.currency,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  /**
   * Delete expense and its participants in a transaction
   */
  async delete(id: number): Promise<void> {
    await AppDataSource.transaction(async (manager) => {
      const expenseRepo = manager.getRepository(ExpenseModel);
      const participantRepo = manager.getRepository(ExpenseParticipantModel);

      // First delete all participants
      await participantRepo.delete({ expenseId: id });

      // Then delete the expense
      await expenseRepo.delete({ id });
    });
  }
}

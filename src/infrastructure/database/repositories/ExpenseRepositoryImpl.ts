import { Expense } from '../../../domain/entities/expense/Expense';
import { ExpenseParticipant } from '../../../domain/entities/expense/ExpenseParticipant';
import { ExpenseRepository } from '../../../domain/repositories/expense/ExpenseRepository';
import { AppDataSource } from '../../../infrastructure/database/DataSource';
import { ExpenseModel } from '../../../infrastructure/database/models/ExpenseModel';
import { ExpenseParticipantModel } from '../../../infrastructure/database/models/ExpenseParticipantModel';

export class ExpenseRepositoryImpl implements ExpenseRepository {
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
}

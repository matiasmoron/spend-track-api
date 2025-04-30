import { Repository } from 'typeorm';
import {
  Expense,
  ExpenseParticipant,
  ExpenseParticipantProps,
} from '../../../domain/entities/expense';
import { ExpenseParticipantRepository } from '../../../domain/repositories/expense/ExpenseParticipantRepository';
import { AppDataSource } from '../DataSource';
import { ExpenseParticipantModel } from '../models/ExpenseParticipantModel';

export class ExpenseParticipantRepositoryImpl implements ExpenseParticipantRepository {
  private readonly ormRepo: Repository<ExpenseParticipantModel>;

  constructor() {
    this.ormRepo = AppDataSource.getRepository(ExpenseParticipantModel);
  }

  create(_expense: Expense, _participants: ExpenseParticipant[]): Promise<Expense> {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch all participants for a given expense from the database.
   */
  async findByExpenseId(expenseId: number): Promise<ExpenseParticipant[]> {
    const records = await this.ormRepo.find({ where: { expenseId } });

    return records.map(
      (r) =>
        new ExpenseParticipant(<ExpenseParticipantProps>{
          expenseId: r.expenseId,
          userId: r.userId,
          amount: r.amount,
        })
    );
  }
}

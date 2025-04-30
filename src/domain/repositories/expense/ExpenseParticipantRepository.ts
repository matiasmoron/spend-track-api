import { Expense } from '../../../domain/entities/expense/Expense';
import { ExpenseParticipant } from '../../../domain/entities/expense/ExpenseParticipant';

export interface ExpenseParticipantRepository {
  create(expense: Expense, participants: ExpenseParticipant[]): Promise<Expense>;
  findByExpenseId(expenseId: number): Promise<ExpenseParticipant[]>;
}

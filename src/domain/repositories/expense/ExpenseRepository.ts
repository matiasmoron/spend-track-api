import { Expense } from '../../../domain/entities/expense/Expense';
import { ExpenseParticipant } from '../../../domain/entities/expense/ExpenseParticipant';

export interface ExpenseRepository {
  create(expense: Expense, participants: ExpenseParticipant[]): Promise<Expense>;
}

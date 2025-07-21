import { Expense } from '../../../domain/entities/expense/Expense';
import { ExpenseParticipant } from '../../../domain/entities/expense/ExpenseParticipant';

export interface ExpenseRepository {
  create(expense: Expense, participants: ExpenseParticipant[]): Promise<Expense>;
  findByGroupId(groupId: number): Promise<Expense[]>;
  findById(id: number): Promise<Expense | null>;
  update(expense: Expense, participants: ExpenseParticipant[]): Promise<Expense>;
  delete(id: number): Promise<void>;
}

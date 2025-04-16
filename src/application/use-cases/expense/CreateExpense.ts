import { AppError } from '../../../application/errors/AppError';
import { Expense } from '../../../domain/entities/expense/Expense';
import { ExpenseParticipant } from '../../../domain/entities/expense/ExpenseParticipant';
import { ExpenseRepository } from '../../../domain/repositories/expense/ExpenseRepository';
import { Currency } from '../../../domain/value-objects/Currency';
import { log } from '../../../shared/utils';

export interface CreateExpenseInput {
  groupId: number;
  description: string;
  total: number;
  currency: Currency;
  paidBy: { userId: number; amount: number }[];
  splits: { userId: number; amount: number }[];
}

export async function createExpense(
  repository: ExpenseRepository,
  input: CreateExpenseInput
): Promise<Expense> {
  const { groupId, description, total, currency, paidBy, splits } = input;

  const totalPaid = paidBy.reduce((sum, p) => sum + p.amount, 0);
  const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);

  if (totalPaid !== total) {
    throw new AppError('Sum of paidBy amounts does not match total', 400);
  }

  if (totalSplit !== total) {
    throw new AppError('Sum of splits does not match total', 400);
  }

  const createdAt = new Date();
  const expense = new Expense({
    id: 0, // Placeholder, DB will assign real ID
    groupId,
    description,
    total,
    currency,
    createdAt,
  });

  const participants: ExpenseParticipant[] = [
    ...paidBy.map(
      (p) =>
        new ExpenseParticipant({
          expenseId: 0,
          userId: p.userId,
          amount: p.amount,
        })
    ),
    ...splits.map(
      (s) =>
        new ExpenseParticipant({
          expenseId: 0,
          userId: s.userId,
          amount: -s.amount,
        })
    ),
  ];

  log.info(expense);

  return repository.create(expense, participants);
}

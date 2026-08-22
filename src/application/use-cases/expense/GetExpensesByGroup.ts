import { ExpenseParticipant } from '@/domain/entities/expense';
import { ExpenseParticipantRepository } from '@/domain/repositories/expense/ExpenseParticipantRepository';
import { ExpenseRepository } from '@/domain/repositories/expense/ExpenseRepository';
import { Currency } from '@/domain/value-objects';

export interface ExpenseDetail {
  id: number;
  total: number;
  currency: Currency;
  participants: ExpenseParticipant[];
  createdAt: Date;
  updatedAt: Date;
  description: string;
}

export interface GetExpensesByGroupInput {
  groupId: number;
}

/**
 * Functional use-case: fetch all expenses for a given group,
 * including participant shares.
 */
export const getExpensesByGroup = async (
  input: GetExpensesByGroupInput,
  deps: {
    expenseRepository: ExpenseRepository;
    expenseParticipantRepository: ExpenseParticipantRepository;
  }
): Promise<ExpenseDetail[]> => {
  const { expenseRepository, expenseParticipantRepository } = deps;
  const expenses = await expenseRepository.findByGroupId(input.groupId);

  const results: ExpenseDetail[] = [];
  for (const exp of expenses) {
    const participants = await expenseParticipantRepository.findByExpenseId(exp.id);

    results.push({
      id: exp.id,
      description: exp.description,
      total: exp.total,
      currency: exp.currency,
      participants,
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
    });
  }

  return results;
};

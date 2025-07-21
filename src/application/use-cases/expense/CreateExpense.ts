import { AppError } from '../../../application/errors/AppError';
import { Expense } from '../../../domain/entities/expense/Expense';
import { ExpenseParticipant } from '../../../domain/entities/expense/ExpenseParticipant';
import { ExpenseRepository } from '../../../domain/repositories/expense/ExpenseRepository';
import { UserGroupRepository } from '../../../domain/repositories/group/UserGroupRepository';
import { Currency } from '../../../domain/value-objects/Currency';
import { getGroupMembers } from '../group/GetGroupMembers';
export interface CreateExpenseInput {
  groupId: number;
  userId: number;
  description: string;
  total: number;
  currency: Currency;
  paidBy: { userId: number; amount: number }[];
  splits: { userId: number; amount: number }[];
  createdAt?: Date;
}

const validateAllUsersBelongToGroup = (
  users: { userId: number; amount: number }[],
  groupMembers: { userId: number }[]
): boolean => {
  return users.every((user) => groupMembers.some((member) => member.userId === user.userId));
};

export async function createExpense(
  input: CreateExpenseInput,
  deps: {
    expenseRepository: ExpenseRepository;
    userGroupRepository: UserGroupRepository;
  }
): Promise<Expense> {
  const { expenseRepository, userGroupRepository } = deps;

  const { groupId, description, total, currency, paidBy, splits, userId, createdAt } = input;

  const totalPaid = paidBy.reduce((sum, p) => sum + p.amount, 0);
  const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);

  // Get group members to validate if all the users from paidBy and splits are in the group
  const groupMembers = await getGroupMembers({ groupId, userId }, { userGroupRepository });

  // Check if all paidBy users are in the group
  if (!validateAllUsersBelongToGroup(paidBy, groupMembers)) {
    throw new AppError('Some users in paidBy do not belong to the group', 400);
  }

  // Check if all splits users are in the group
  if (!validateAllUsersBelongToGroup(splits, groupMembers)) {
    throw new AppError('Some users in splits do not belong to the group', 400);
  }

  if (totalPaid !== total) {
    throw new AppError('Sum of paidBy amounts does not match total', 400);
  }

  if (totalSplit !== total) {
    throw new AppError('Sum of splits does not match total', 400);
  }

  const expenseCreatedAt = createdAt || new Date();

  const expense = new Expense({
    id: 0, // Placeholder, DB will assign real ID
    groupId,
    description,
    total,
    currency,
    createdAt: expenseCreatedAt,
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

  return expenseRepository.create(expense, participants);
}

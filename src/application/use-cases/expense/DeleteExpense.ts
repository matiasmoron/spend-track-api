import { AppError } from '@/application/errors/AppError';
import { ExpenseRepository } from '@/domain/repositories/expense/ExpenseRepository';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';

export interface DeleteExpenseInput {
  expenseId: number;
  userId: number;
}

export async function deleteExpense(
  input: DeleteExpenseInput,
  deps: {
    expenseRepository: ExpenseRepository;
    userGroupRepository: UserGroupRepository;
  }
): Promise<void> {
  const { expenseRepository, userGroupRepository } = deps;
  const { expenseId, userId } = input;

  // First, check if the expense exists
  const expense = await expenseRepository.findById(expenseId);
  if (!expense) {
    throw new AppError('Expense not found', 404);
  }

  // Check if the user belongs to the group that owns this expense
  const userGroups = await userGroupRepository.findByUserId(userId);
  const userBelongsToGroup = userGroups.some((ug) => ug.groupId === expense.groupId);

  if (!userBelongsToGroup) {
    throw new AppError('You do not have permission to delete this expense', 403);
  }

  // Delete the expense (this will also delete participants due to our transaction)
  await expenseRepository.delete(expenseId);
}

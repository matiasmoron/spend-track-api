import { TestDataGenerator } from '@tests/utils/TestDataGenerator';
import { AppError } from '@/application/errors/AppError';
import { deleteExpense } from '@/application/use-cases/expense/DeleteExpense';
import { ExpenseRepository } from '@/domain/repositories/expense/ExpenseRepository';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';

describe('deleteExpense use-case', () => {
  let testData: ReturnType<typeof TestDataGenerator.generateTestScenario>;

  beforeEach(() => {
    jest.clearAllMocks();
    testData = TestDataGenerator.generateTestScenario();
  });

  afterEach(() => {
    TestDataGenerator.clearTrackedIds();
  });

  it('deletes an expense when user belongs to the group', async () => {
    const { expense, user, group } = testData;

    const mockExpenseRepo: jest.Mocked<ExpenseRepository> = {
      create: jest.fn(),
      findByGroupId: jest.fn(),
      findById: jest.fn().mockResolvedValue({ ...expense, groupId: group.id } as any),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const mockUserGroupRepo: jest.Mocked<UserGroupRepository> = {
      addUserToGroup: jest.fn(),
      findByGroupId: jest.fn(),
      findByUserId: jest.fn().mockResolvedValue([{ groupId: group.id, userId: user.id } as any]),
      getUserGroups: jest.fn(),
      isUserInGroup: jest.fn(),
      save: jest.fn(),
    };

    await deleteExpense(
      { expenseId: expense.id, userId: user.id },
      { expenseRepository: mockExpenseRepo, userGroupRepository: mockUserGroupRepo }
    );

    expect(mockExpenseRepo.findById).toHaveBeenCalledWith(expense.id);
    expect(mockExpenseRepo.delete).toHaveBeenCalledWith(expense.id);
  });

  it('throws 404 when expense not found', async () => {
    const { user } = testData;

    const mockExpenseRepo: jest.Mocked<ExpenseRepository> = {
      create: jest.fn(),
      findByGroupId: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockUserGroupRepo: jest.Mocked<UserGroupRepository> = {
      addUserToGroup: jest.fn(),
      findByGroupId: jest.fn(),
      findByUserId: jest.fn(),
      getUserGroups: jest.fn(),
      isUserInGroup: jest.fn(),
      save: jest.fn(),
    };

    await expect(
      deleteExpense(
        { expenseId: 99999, userId: user.id },
        { expenseRepository: mockExpenseRepo, userGroupRepository: mockUserGroupRepo }
      )
    ).rejects.toThrow(new AppError('Expense not found', 404));
  });
});

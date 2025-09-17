import { TestDataGenerator } from '@tests/utils/TestDataGenerator';
import { AppError } from '@/application/errors/AppError';
import { updateExpense } from '@/application/use-cases/expense/UpdateExpense';
import { ExpenseRepository } from '@/domain/repositories/expense/ExpenseRepository';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { Currency } from '@/domain/value-objects';

describe('updateExpense use-case', () => {
  let testData: ReturnType<typeof TestDataGenerator.generateTestScenario>;

  beforeEach(() => {
    jest.clearAllMocks();
    testData = TestDataGenerator.generateTestScenario();
  });

  afterEach(() => {
    TestDataGenerator.clearTrackedIds();
  });

  it('updates an expense when user belongs to group and totals match', async () => {
    const { group, expense, user } = testData;

    const existingExpense = { ...expense, groupId: group.id };

    const input = {
      expenseId: expense.id,
      userId: user.id,
      description: 'Dinner',
      total: 50,
      currency: 'ARS' as Currency,
      paidBy: [{ userId: user.id, amount: 50 }],
      splits: [{ userId: user.id, amount: 50 }],
    };

    const mockExpenseRepo: jest.Mocked<ExpenseRepository> = {
      create: jest.fn(),
      findByGroupId: jest.fn(),
      findById: jest.fn().mockResolvedValue(existingExpense),
      update: jest
        .fn()
        .mockImplementation((expenseObj, _participants) => Promise.resolve(expenseObj)),
      delete: jest.fn(),
    };

    const mockUserGroupRepo: jest.Mocked<UserGroupRepository> = {
      addUserToGroup: jest.fn(),
      // getGroupMembers calls findByGroupId, ensure it returns at least the user
      findByGroupId: jest
        .fn()
        .mockResolvedValue([{ groupId: group.id, userId: user.id, userName: user.name } as any]),
      findByUserId: jest.fn().mockResolvedValue([{ groupId: group.id, userId: user.id } as any]),
      getUserGroups: jest.fn(),
      isUserInGroup: jest.fn(),
      save: jest.fn(),
    };

    const result = await updateExpense(input, {
      expenseRepository: mockExpenseRepo,
      userGroupRepository: mockUserGroupRepo,
    });

    expect(mockExpenseRepo.findById).toHaveBeenCalledWith(expense.id);
    expect(mockExpenseRepo.update).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('throws 404 when expense not found', async () => {
    const { user } = testData;

    const input = {
      expenseId: 999999,
      userId: user.id,
      description: 'Dinner',
      total: 50,
      currency: 'ARS' as Currency,
      paidBy: [{ userId: user.id, amount: 50 }],
      splits: [{ userId: user.id, amount: 50 }],
    };

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
      updateExpense(input, {
        expenseRepository: mockExpenseRepo,
        userGroupRepository: mockUserGroupRepo,
      })
    ).rejects.toThrow(new AppError('Expense not found', 404));
  });
});

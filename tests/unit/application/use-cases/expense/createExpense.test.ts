import { TestDataGenerator } from '@tests/utils/TestDataGenerator';
import { createExpense } from '@/application/use-cases/expense/CreateExpense';
import type { Expense as ExpenseEntity } from '@/domain/entities/expense/Expense';
import type { UserGroupWithUserName } from '@/domain/entities/group/UserGroup';
import { ExpenseRepository } from '@/domain/repositories/expense/ExpenseRepository';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { Currency } from '@/domain/value-objects';

describe('createExpense use-case', () => {
  let testData: ReturnType<typeof TestDataGenerator.generateTestScenario>;

  beforeEach(() => {
    jest.clearAllMocks();
    testData = TestDataGenerator.generateTestScenario();
  });

  afterEach(() => {
    TestDataGenerator.clearTrackedIds();
  });

  it('creates an expense when input is valid', async () => {
    const { group, user } = testData;

    const input = {
      groupId: group.id,
      userId: user.id,
      description: 'Lunch',
      total: 100,
      currency: 'ARS' as Currency,
      paidBy: [{ userId: user.id, amount: 100 }],
      splits: [{ userId: user.id, amount: 100 }],
      createdAt: new Date('2023-01-01T00:00:00.000Z'),
    };

    const mockExpenseRepo: jest.Mocked<ExpenseRepository> = {
      create: jest.fn().mockImplementation((expense: ExpenseEntity, _participants: any[]) => {
        const created: ExpenseEntity = {
          id: 1,
          groupId: expense.groupId,
          description: expense.description,
          total: expense.total,
          currency: expense.currency,
          createdAt: expense.createdAt,
          updatedAt: new Date(),
        };

        return Promise.resolve(created);
      }),
      findByGroupId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const groupMembers: UserGroupWithUserName[] = [
      { id: 1, groupId: group.id, userId: user.id, userName: user.name },
    ];

    const mockUserGroupRepo: jest.Mocked<UserGroupRepository> = {
      addUserToGroup: jest.fn(),
      findByGroupId: jest.fn().mockResolvedValue(groupMembers),
      findByUserId: jest.fn(),
      getUserGroups: jest.fn(),
      isUserInGroup: jest.fn(),
      save: jest.fn(),
    };

    const result = await createExpense(input, {
      expenseRepository: mockExpenseRepo,
      userGroupRepository: mockUserGroupRepo,
    });

    expect(mockExpenseRepo.create).toHaveBeenCalled();
    expect(result.id).toBe(1);
    expect(result.createdAt.toISOString()).toBe('2023-01-01T00:00:00.000Z');
  });

  it('throws if paidBy user not in group', async () => {
    const { group, user } = testData;

    const input = {
      groupId: group.id,
      userId: user.id,
      description: 'Lunch',
      total: 100,
      currency: 'ARS' as Currency,
      paidBy: [{ userId: 9999, amount: 100 }],
      splits: [{ userId: user.id, amount: 100 }],
    };

    const mockExpenseRepo: jest.Mocked<ExpenseRepository> = {
      create: jest.fn(),
      findByGroupId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const groupMembers2: UserGroupWithUserName[] = [
      { id: 2, groupId: group.id, userId: user.id, userName: user.name },
    ];

    const mockUserGroupRepo: jest.Mocked<UserGroupRepository> = {
      addUserToGroup: jest.fn(),
      findByGroupId: jest.fn().mockResolvedValue(groupMembers2),
      findByUserId: jest.fn(),
      getUserGroups: jest.fn(),
      isUserInGroup: jest.fn(),
      save: jest.fn(),
    };

    await expect(
      createExpense(input, {
        expenseRepository: mockExpenseRepo,
        userGroupRepository: mockUserGroupRepo,
      })
    ).rejects.toThrow();
  });
});

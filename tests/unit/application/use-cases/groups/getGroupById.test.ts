import { TestDataGenerator } from '@tests/utils/TestDataGenerator';
import { AppError } from '@/application/errors/AppError';
import { getGroupById } from '@/application/use-cases/group/GetGroupById';
import { ExpenseParticipantRepository } from '@/domain/repositories/expense/ExpenseParticipantRepository';
import { ExpenseRepository } from '@/domain/repositories/expense/ExpenseRepository';
import { GroupRepository } from '@/domain/repositories/group/GroupRepository';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';

const mockGroupRepository: jest.Mocked<GroupRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  delete: jest.fn(),
};

const mockUserGroupRepository: jest.Mocked<UserGroupRepository> = {
  addUserToGroup: jest.fn(),
  findByGroupId: jest.fn(),
  findByUserId: jest.fn(),
  getUserGroups: jest.fn(),
  isUserInGroup: jest.fn(),
  save: jest.fn(),
};

const mockExpenseRepository: jest.Mocked<ExpenseRepository> = {
  create: jest.fn(),
  findByGroupId: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockExpenseParticipantRepository: jest.Mocked<ExpenseParticipantRepository> = {
  create: jest.fn(),
  findByExpenseId: jest.fn(),
};

describe('getGroupById', () => {
  let testData: ReturnType<typeof TestDataGenerator.generateTestScenario>;

  beforeEach(() => {
    jest.clearAllMocks();
    testData = TestDataGenerator.generateTestScenario();
  });

  afterEach(() => {
    TestDataGenerator.clearTrackedIds();
  });

  it('should return group details including balances', async () => {
    const { group, user, userGroup, expense, participant } = testData;

    // Group exists
    mockGroupRepository.findById.mockResolvedValue(group);

    // One member in group and the requesting user
    const userGroupWithName = { ...userGroup, userName: user.name };
    mockUserGroupRepository.findByGroupId.mockResolvedValue([userGroupWithName]);

    // getExpensesByGroup is called internally via expense use-case; mock expense & participants
    mockExpenseRepository.findByGroupId.mockResolvedValue([expense]);
    mockExpenseParticipantRepository.findByExpenseId.mockResolvedValue([{ ...participant }]);

    const result = await getGroupById(
      { groupId: group.id, userId: user.id },
      {
        groupRepository: mockGroupRepository,
        userGroupRepository: mockUserGroupRepository,
        expenseRepository: mockExpenseRepository,
        expenseParticipantRepository: mockExpenseParticipantRepository,
      }
    );

    expect(mockGroupRepository.findById).toHaveBeenCalledWith(group.id);
    expect(result.id).toBe(group.id);
    expect(result.name).toBe(group.name);
    expect(Array.isArray(result.members)).toBe(true);
    expect(Array.isArray(result.expenses)).toBe(true);
  });

  it('should throw 404 when group not found', async () => {
    const { user } = testData;
    mockGroupRepository.findById.mockResolvedValue(null);

    await expect(
      getGroupById(
        { groupId: 9999999, userId: user.id },
        {
          groupRepository: mockGroupRepository,
          userGroupRepository: mockUserGroupRepository,
          expenseRepository: mockExpenseRepository,
          expenseParticipantRepository: mockExpenseParticipantRepository,
        }
      )
    ).rejects.toThrow(new AppError('Group not found', 404));
  });
});

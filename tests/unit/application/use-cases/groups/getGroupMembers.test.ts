import { TestDataGenerator } from '@tests/utils/TestDataGenerator';
import { AppError } from '@/application/errors/AppError';
import { getGroupMembers } from '@/application/use-cases/group/GetGroupMembers';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';

const mockUserGroupRepository: jest.Mocked<UserGroupRepository> = {
  addUserToGroup: jest.fn(),
  findByGroupId: jest.fn(),
  findByUserId: jest.fn(),
  getUserGroups: jest.fn(),
  isUserInGroup: jest.fn(),
  save: jest.fn(),
};

describe('getGroupMembers', () => {
  let testData: ReturnType<typeof TestDataGenerator.generateTestScenario>;

  beforeEach(() => {
    jest.clearAllMocks();
    testData = TestDataGenerator.generateTestScenario();
  });

  afterEach(() => {
    TestDataGenerator.clearTrackedIds();
  });

  it('should return members when user is part of group', async () => {
    const { group, user, userGroup } = testData;

    // Attach userName to satisfy UserGroupWithUserName type
    const userGroupWithName = { ...userGroup, userName: user.name };

    // findByGroupId returns all members
    mockUserGroupRepository.findByGroupId.mockResolvedValue([userGroupWithName]);

    const result = await getGroupMembers(
      { groupId: group.id, userId: user.id },
      { userGroupRepository: mockUserGroupRepository }
    );

    expect(mockUserGroupRepository.findByGroupId).toHaveBeenCalledWith(group.id);
    expect(result).toEqual([
      {
        userId: userGroupWithName.userId,
        name: user.name,
      },
    ]);
  });

  it('should throw 404 when group not found', async () => {
    const { user } = testData;
    mockUserGroupRepository.findByGroupId.mockResolvedValue([]);

    await expect(
      getGroupMembers(
        { groupId: 9999999, userId: user.id },
        { userGroupRepository: mockUserGroupRepository }
      )
    ).rejects.toThrow(new AppError('Group not found', 404));
  });

  it('should throw 403 when user not in group', async () => {
    const { group, user } = testData;
    // group exists but user not among members
    const differentUserGroup = { ...testData.userGroup, userId: 12345678, userName: 'Other User' };
    mockUserGroupRepository.findByGroupId.mockResolvedValue([differentUserGroup]);

    await expect(
      getGroupMembers(
        { groupId: group.id, userId: user.id },
        { userGroupRepository: mockUserGroupRepository }
      )
    ).rejects.toThrow(new AppError('The user is not a member of the group', 403));
  });
});

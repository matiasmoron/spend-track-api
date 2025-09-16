import { AppError } from '../../../../../src/application/errors/AppError';
import { deleteGroup } from '../../../../../src/application/use-cases/group/DeleteGroup';
import { GroupRepository } from '../../../../../src/domain/repositories/group/GroupRepository';
import { UserGroupRepository } from '../../../../../src/domain/repositories/group/UserGroupRepository';
import { TestDataGenerator } from '../../../../utils/TestDataGenerator';

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

describe('deleteGroup', () => {
  let testData: ReturnType<typeof TestDataGenerator.generateTestScenario>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Generate fresh random test data for each test with unit-testing tag
    testData = TestDataGenerator.generateTestScenario();
  });

  afterEach(() => {
    // Clean up any tracked test data (though unit tests shouldn't create real data)
    TestDataGenerator.clearTrackedIds();
  });

  it('should delete a group when user belongs to the group', async () => {
    const mockGroup = testData.group;
    const mockUser = testData.user;
    const mockUserGroup = testData.userGroup;

    mockGroupRepository.findById.mockResolvedValue(mockGroup);
    mockUserGroupRepository.findByUserId.mockResolvedValue([mockUserGroup]);
    mockGroupRepository.delete.mockResolvedValue();

    await deleteGroup(
      {
        groupId: mockGroup.id,
        userId: mockUser.id,
      },
      {
        groupRepository: mockGroupRepository,
        userGroupRepository: mockUserGroupRepository,
      }
    );

    expect(mockGroupRepository.findById).toHaveBeenCalledWith(mockGroup.id);
    expect(mockUserGroupRepository.findByUserId).toHaveBeenCalledWith(mockUser.id);
    expect(mockGroupRepository.delete).toHaveBeenCalledWith(mockGroup.id);
  });

  it('should throw 404 error when group does not exist', async () => {
    const mockUser = testData.user;
    const nonExistentGroupId = Math.floor(Math.random() * 1000000);

    mockGroupRepository.findById.mockResolvedValue(null);

    await expect(
      deleteGroup(
        {
          groupId: nonExistentGroupId,
          userId: mockUser.id,
        },
        {
          groupRepository: mockGroupRepository,
          userGroupRepository: mockUserGroupRepository,
        }
      )
    ).rejects.toThrow(new AppError('Group not found', 404));

    expect(mockGroupRepository.findById).toHaveBeenCalledWith(nonExistentGroupId);
    expect(mockUserGroupRepository.findByUserId).not.toHaveBeenCalled();
    expect(mockGroupRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw 403 error when user does not belong to the group', async () => {
    const mockGroup = testData.group;
    const mockUser = testData.user;

    mockGroupRepository.findById.mockResolvedValue(mockGroup);
    // Return empty array - user doesn't belong to any groups
    mockUserGroupRepository.findByUserId.mockResolvedValue([]);

    await expect(
      deleteGroup(
        {
          groupId: mockGroup.id,
          userId: mockUser.id,
        },
        {
          groupRepository: mockGroupRepository,
          userGroupRepository: mockUserGroupRepository,
        }
      )
    ).rejects.toThrow(new AppError('You do not have permission to delete this group', 403));

    expect(mockGroupRepository.findById).toHaveBeenCalledWith(mockGroup.id);
    expect(mockUserGroupRepository.findByUserId).toHaveBeenCalledWith(mockUser.id);
    expect(mockGroupRepository.delete).not.toHaveBeenCalled();
  });

  describe('repository errors', () => {
    it('should throw if groupRepository.findById fails', async () => {
      const mockUser = testData.user;
      const mockGroup = testData.group;

      mockGroupRepository.findById.mockRejectedValue(new Error('DB connection error'));

      await expect(
        deleteGroup(
          {
            groupId: mockGroup.id,
            userId: mockUser.id,
          },
          {
            groupRepository: mockGroupRepository,
            userGroupRepository: mockUserGroupRepository,
          }
        )
      ).rejects.toThrow('DB connection error');
    });

    it('should throw if userGroupRepository.findByUserId fails', async () => {
      const mockGroup = testData.group;
      const mockUser = testData.user;

      mockGroupRepository.findById.mockResolvedValue(mockGroup);
      mockUserGroupRepository.findByUserId.mockRejectedValue(new Error('User lookup failed'));

      await expect(
        deleteGroup(
          {
            groupId: mockGroup.id,
            userId: mockUser.id,
          },
          {
            groupRepository: mockGroupRepository,
            userGroupRepository: mockUserGroupRepository,
          }
        )
      ).rejects.toThrow('User lookup failed');
    });

    it('should throw if groupRepository.delete fails', async () => {
      const mockGroup = testData.group;
      const mockUser = testData.user;
      const mockUserGroup = testData.userGroup;

      mockGroupRepository.findById.mockResolvedValue(mockGroup);
      mockUserGroupRepository.findByUserId.mockResolvedValue([mockUserGroup]);
      mockGroupRepository.delete.mockRejectedValue(new Error('Delete operation failed'));

      await expect(
        deleteGroup(
          {
            groupId: mockGroup.id,
            userId: mockUser.id,
          },
          {
            groupRepository: mockGroupRepository,
            userGroupRepository: mockUserGroupRepository,
          }
        )
      ).rejects.toThrow('Delete operation failed');
    });
  });
});

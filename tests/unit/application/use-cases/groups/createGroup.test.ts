import { createGroup } from '../../../../../src/application/use-cases/group/CreateGroup';
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

describe('createGroup', () => {
  let testData: ReturnType<typeof TestDataGenerator.generateTestScenario>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Generate fresh random test data for each test
    testData = TestDataGenerator.generateTestScenario();
  });

  afterEach(() => {
    // Clean up any tracked test data (though unit tests shouldn't create real data)
    TestDataGenerator.clearTrackedIds();
  });

  it('should create a group and associate the user', async () => {
    // Use generated test data with unit-testing tag
    const mockGroup = testData.group;
    const mockUser = testData.user;
    const mockUserGroup = testData.userGroup;

    mockGroupRepository.save.mockResolvedValue(mockGroup);
    mockUserGroupRepository.save.mockResolvedValue(mockUserGroup);

    const result = await createGroup(mockGroupRepository, mockUserGroupRepository, {
      name: mockGroup.name,
      type: mockGroup.type,
      createdBy: mockUser.id,
    });

    console.log({ result });

    expect(mockGroupRepository.save).toHaveBeenCalledWith({
      name: mockGroup.name,
      type: mockGroup.type,
    });
    expect(mockUserGroupRepository.save).toHaveBeenCalledWith({
      userId: mockUser.id,
      groupId: mockGroup.id,
    });
    expect(result).toEqual({
      id: mockGroup.id,
      name: mockGroup.name,
      type: mockGroup.type,
      createdAt: mockGroup.createdAt,
    });
  });

  describe('repository errors', () => {
    it('should throw if groupRepository.save fails', async () => {
      // Use generated test data for error scenarios too
      const mockUser = testData.user;
      const mockGroup = testData.group;

      mockGroupRepository.save.mockRejectedValue(new Error('DB error'));

      await expect(
        createGroup(mockGroupRepository, mockUserGroupRepository, {
          name: mockGroup.name,
          type: mockGroup.type,
          createdBy: mockUser.id,
        })
      ).rejects.toThrow('DB error');
    });

    it('should throw if userGroupRepository.save fails', async () => {
      const mockGroup = testData.group;
      const mockUser = testData.user;

      mockGroupRepository.save.mockResolvedValue(mockGroup);
      mockUserGroupRepository.save.mockRejectedValue(new Error('Failed to associate user'));

      await expect(
        createGroup(mockGroupRepository, mockUserGroupRepository, {
          name: mockGroup.name,
          type: mockGroup.type,
          createdBy: mockUser.id,
        })
      ).rejects.toThrow('Failed to associate user');
    });
  });
});

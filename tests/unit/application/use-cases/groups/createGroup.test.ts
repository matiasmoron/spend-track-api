import { createGroup } from '../../../../../src/application/use-cases/group/CreateGroup';
import { GroupRepository } from '../../../../../src/domain/repositories/group/GroupRepository';
import { UserGroupRepository } from '../../../../../src/domain/repositories/group/UserGroupRepository';
import { GroupType } from '../../../../../src/domain/value-objects';

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a group and associate the user', async () => {
    const mockGroup = {
      id: 1,
      name: 'Trip to Chile',
      type: GroupType.TRIP,
      createdAt: new Date(),
    };

    mockGroupRepository.save.mockResolvedValue(mockGroup);
    mockUserGroupRepository.save.mockResolvedValue({
      id: 1,
      userId: 123,
      groupId: mockGroup.id,
    });

    const result = await createGroup(mockGroupRepository, mockUserGroupRepository, {
      name: 'Trip to Chile',
      type: GroupType.TRIP,
      createdBy: 123,
    });

    expect(mockGroupRepository.save).toHaveBeenCalledWith({
      name: 'Trip to Chile',
      type: GroupType.TRIP,
    });
    expect(mockUserGroupRepository.save).toHaveBeenCalledWith({
      userId: 123,
      groupId: mockGroup.id,
    });
    expect(result).toEqual({
      id: 1,
      name: 'Trip to Chile',
      type: GroupType.TRIP,
      createdAt: mockGroup.createdAt,
    });
  });

  describe('repository errors', () => {
    it('should throw if groupRepository.save fails', async () => {
      mockGroupRepository.save.mockRejectedValue(new Error('DB error'));

      await expect(
        createGroup(mockGroupRepository, mockUserGroupRepository, {
          name: 'Trip to Chile',
          type: GroupType.TRIP,
          createdBy: 123,
        })
      ).rejects.toThrow('DB error');
    });

    it('should throw if userGroupRepository.save fails', async () => {
      const mockGroup = {
        id: 1,
        name: 'Trip to Chile',
        type: GroupType.TRIP,
        createdAt: new Date(),
      };

      mockGroupRepository.save.mockResolvedValue(mockGroup);
      mockUserGroupRepository.save.mockRejectedValue(new Error('Failed to associate user'));

      await expect(
        createGroup(mockGroupRepository, mockUserGroupRepository, {
          name: 'Trip to Chile',
          type: GroupType.TRIP,
          createdBy: 123,
        })
      ).rejects.toThrow('Failed to associate user');
    });
  });
});

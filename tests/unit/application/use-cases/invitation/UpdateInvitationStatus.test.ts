import { AppError } from '@/application/errors/AppError';
import {
  updateInvitationStatus,
  UpdateInvitationInput,
} from '@/application/use-cases/invitation/UpdateInvitationStatus';
import { Invitation, InvitationStatus } from '@/domain/entities/invitation/Invitation';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { InvitationRepository } from '@/domain/repositories/invitation/InvitationRepository';

describe('UpdateInvitationStatus', () => {
  let mockInvitationRepository: jest.Mocked<InvitationRepository>;
  let mockUserGroupRepository: jest.Mocked<UserGroupRepository>;

  beforeEach(() => {
    mockInvitationRepository = {
      findByUserId: jest.fn(),
      findByIdAndUser: jest.fn(),
      findPendingByGroupAndUser: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    };

    mockUserGroupRepository = {
      addUserToGroup: jest.fn(),
      findByGroupId: jest.fn(),
      findByUserId: jest.fn(),
      getUserGroups: jest.fn(),
      isUserInGroup: jest.fn(),
      save: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('successful status updates', () => {
    it('should accept invitation successfully', async () => {
      // Arrange
      const input: UpdateInvitationInput = {
        id: 1,
        userId: 2,
        status: InvitationStatus.Accepted,
      };

      const mockInvitation = new Invitation({
        id: 1,
        groupId: 10,
        invitedById: 3,
        invitedUserId: 2,
        status: InvitationStatus.Pending,
        createdAt: new Date('2024-01-01'),
      });

      mockInvitationRepository.findByIdAndUser.mockResolvedValue(mockInvitation);
      mockInvitationRepository.updateStatus.mockResolvedValue();
      mockUserGroupRepository.addUserToGroup.mockResolvedValue();

      // Act
      const result = await updateInvitationStatus(
        mockInvitationRepository,
        mockUserGroupRepository,
        input
      );

      // Assert
      expect(result).toEqual({
        status: InvitationStatus.Accepted,
      });
      expect(mockInvitationRepository.findByIdAndUser).toHaveBeenCalledWith(1, 2);
      expect(mockInvitationRepository.updateStatus).toHaveBeenCalledWith(
        1,
        InvitationStatus.Accepted
      );
      expect(mockUserGroupRepository.addUserToGroup).toHaveBeenCalledWith(2, 10);
    });

    it('should reject invitation successfully', async () => {
      // Arrange
      const input: UpdateInvitationInput = {
        id: 1,
        userId: 2,
        status: InvitationStatus.Rejected,
      };

      const mockInvitation = new Invitation({
        id: 1,
        groupId: 10,
        invitedById: 3,
        invitedUserId: 2,
        status: InvitationStatus.Pending,
        createdAt: new Date('2024-01-01'),
      });

      mockInvitationRepository.findByIdAndUser.mockResolvedValue(mockInvitation);
      mockInvitationRepository.updateStatus.mockResolvedValue();

      // Act
      const result = await updateInvitationStatus(
        mockInvitationRepository,
        mockUserGroupRepository,
        input
      );

      // Assert
      expect(result).toEqual({
        status: InvitationStatus.Rejected,
      });
      expect(mockInvitationRepository.findByIdAndUser).toHaveBeenCalledWith(1, 2);
      expect(mockInvitationRepository.updateStatus).toHaveBeenCalledWith(
        1,
        InvitationStatus.Rejected
      );
      expect(mockUserGroupRepository.addUserToGroup).not.toHaveBeenCalled(); // Should not add to group when rejected
    });

    it('should update to pending status successfully', async () => {
      // Arrange
      const input: UpdateInvitationInput = {
        id: 1,
        userId: 2,
        status: InvitationStatus.Pending,
      };

      const mockInvitation = new Invitation({
        id: 1,
        groupId: 10,
        invitedById: 3,
        invitedUserId: 2,
        status: InvitationStatus.Pending,
        createdAt: new Date('2024-01-01'),
      });

      mockInvitationRepository.findByIdAndUser.mockResolvedValue(mockInvitation);
      mockInvitationRepository.updateStatus.mockResolvedValue();

      // Act
      const result = await updateInvitationStatus(
        mockInvitationRepository,
        mockUserGroupRepository,
        input
      );

      // Assert
      expect(result).toEqual({
        status: InvitationStatus.Pending,
      });
      expect(mockInvitationRepository.updateStatus).toHaveBeenCalledWith(
        1,
        InvitationStatus.Pending
      );
      expect(mockUserGroupRepository.addUserToGroup).not.toHaveBeenCalled();
    });
  });

  describe('validation errors', () => {
    it('should throw error when invitation not found', async () => {
      // Arrange
      const input: UpdateInvitationInput = {
        id: 999,
        userId: 2,
        status: InvitationStatus.Accepted,
      };

      mockInvitationRepository.findByIdAndUser.mockResolvedValue(null);

      // Act & Assert
      await expect(
        updateInvitationStatus(mockInvitationRepository, mockUserGroupRepository, input)
      ).rejects.toThrow(new AppError('Invitation not found', 404));

      expect(mockInvitationRepository.findByIdAndUser).toHaveBeenCalledWith(999, 2);
      expect(mockInvitationRepository.updateStatus).not.toHaveBeenCalled();
      expect(mockUserGroupRepository.addUserToGroup).not.toHaveBeenCalled();
    });

    it('should throw error when invitation is not pending', async () => {
      // Arrange
      const input: UpdateInvitationInput = {
        id: 1,
        userId: 2,
        status: InvitationStatus.Accepted,
      };

      const mockInvitation = new Invitation({
        id: 1,
        groupId: 10,
        invitedById: 3,
        invitedUserId: 2,
        status: InvitationStatus.Accepted, // Already accepted
        createdAt: new Date('2024-01-01'),
        respondedAt: new Date('2024-01-02'),
      });

      mockInvitationRepository.findByIdAndUser.mockResolvedValue(mockInvitation);

      // Act & Assert
      await expect(
        updateInvitationStatus(mockInvitationRepository, mockUserGroupRepository, input)
      ).rejects.toThrow(new AppError('Invitation is not pending', 400));

      expect(mockInvitationRepository.findByIdAndUser).toHaveBeenCalledWith(1, 2);
      expect(mockInvitationRepository.updateStatus).not.toHaveBeenCalled();
      expect(mockUserGroupRepository.addUserToGroup).not.toHaveBeenCalled();
    });

    it('should throw error when invitation is already rejected', async () => {
      // Arrange
      const input: UpdateInvitationInput = {
        id: 1,
        userId: 2,
        status: InvitationStatus.Accepted,
      };

      const mockInvitation = new Invitation({
        id: 1,
        groupId: 10,
        invitedById: 3,
        invitedUserId: 2,
        status: InvitationStatus.Rejected, // Already rejected
        createdAt: new Date('2024-01-01'),
        respondedAt: new Date('2024-01-02'),
      });

      mockInvitationRepository.findByIdAndUser.mockResolvedValue(mockInvitation);

      // Act & Assert
      await expect(
        updateInvitationStatus(mockInvitationRepository, mockUserGroupRepository, input)
      ).rejects.toThrow(new AppError('Invitation is not pending', 400));
    });
  });

  describe('database error scenarios', () => {
    it('should propagate error from updateStatus', async () => {
      // Arrange
      const input: UpdateInvitationInput = {
        id: 1,
        userId: 2,
        status: InvitationStatus.Accepted,
      };

      const mockInvitation = new Invitation({
        id: 1,
        groupId: 10,
        invitedById: 3,
        invitedUserId: 2,
        status: InvitationStatus.Pending,
        createdAt: new Date(),
      });

      mockInvitationRepository.findByIdAndUser.mockResolvedValue(mockInvitation);
      mockInvitationRepository.updateStatus.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(
        updateInvitationStatus(mockInvitationRepository, mockUserGroupRepository, input)
      ).rejects.toThrow('Database connection failed');

      expect(mockInvitationRepository.updateStatus).toHaveBeenCalledWith(
        1,
        InvitationStatus.Accepted
      );
      expect(mockUserGroupRepository.addUserToGroup).not.toHaveBeenCalled(); // Should not be called if updateStatus fails
    });

    it('should propagate error from addUserToGroup', async () => {
      // Arrange
      const input: UpdateInvitationInput = {
        id: 1,
        userId: 2,
        status: InvitationStatus.Accepted,
      };

      const mockInvitation = new Invitation({
        id: 1,
        groupId: 10,
        invitedById: 3,
        invitedUserId: 2,
        status: InvitationStatus.Pending,
        createdAt: new Date(),
      });

      mockInvitationRepository.findByIdAndUser.mockResolvedValue(mockInvitation);
      mockInvitationRepository.updateStatus.mockResolvedValue();
      mockUserGroupRepository.addUserToGroup.mockRejectedValue(
        new Error('Failed to add user to group')
      );

      // Act & Assert
      await expect(
        updateInvitationStatus(mockInvitationRepository, mockUserGroupRepository, input)
      ).rejects.toThrow('Failed to add user to group');

      expect(mockInvitationRepository.updateStatus).toHaveBeenCalledWith(
        1,
        InvitationStatus.Accepted
      );
      expect(mockUserGroupRepository.addUserToGroup).toHaveBeenCalledWith(2, 10);
    });

    it('should propagate error from findByIdAndUser', async () => {
      // Arrange
      const input: UpdateInvitationInput = {
        id: 1,
        userId: 2,
        status: InvitationStatus.Accepted,
      };

      mockInvitationRepository.findByIdAndUser.mockRejectedValue(
        new Error('Database query failed')
      );

      // Act & Assert
      await expect(
        updateInvitationStatus(mockInvitationRepository, mockUserGroupRepository, input)
      ).rejects.toThrow('Database query failed');

      expect(mockInvitationRepository.findByIdAndUser).toHaveBeenCalledWith(1, 2);
      expect(mockInvitationRepository.updateStatus).not.toHaveBeenCalled();
      expect(mockUserGroupRepository.addUserToGroup).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle zero IDs correctly', async () => {
      // Arrange
      const input: UpdateInvitationInput = {
        id: 0,
        userId: 0,
        status: InvitationStatus.Accepted,
      };

      const mockInvitation = new Invitation({
        id: 0,
        groupId: 0,
        invitedById: 1,
        invitedUserId: 0,
        status: InvitationStatus.Pending,
        createdAt: new Date(),
      });

      mockInvitationRepository.findByIdAndUser.mockResolvedValue(mockInvitation);
      mockInvitationRepository.updateStatus.mockResolvedValue();
      mockUserGroupRepository.addUserToGroup.mockResolvedValue();

      // Act
      const result = await updateInvitationStatus(
        mockInvitationRepository,
        mockUserGroupRepository,
        input
      );

      // Assert
      expect(result).toEqual({
        status: InvitationStatus.Accepted,
      });
      expect(mockInvitationRepository.findByIdAndUser).toHaveBeenCalledWith(0, 0);
      expect(mockUserGroupRepository.addUserToGroup).toHaveBeenCalledWith(0, 0);
    });

    it('should handle large IDs correctly', async () => {
      // Arrange
      const input: UpdateInvitationInput = {
        id: 999999,
        userId: 888888,
        status: InvitationStatus.Rejected,
      };

      const mockInvitation = new Invitation({
        id: 999999,
        groupId: 777777,
        invitedById: 666666,
        invitedUserId: 888888,
        status: InvitationStatus.Pending,
        createdAt: new Date(),
      });

      mockInvitationRepository.findByIdAndUser.mockResolvedValue(mockInvitation);
      mockInvitationRepository.updateStatus.mockResolvedValue();

      // Act
      const result = await updateInvitationStatus(
        mockInvitationRepository,
        mockUserGroupRepository,
        input
      );

      // Assert
      expect(result).toEqual({
        status: InvitationStatus.Rejected,
      });
      expect(mockInvitationRepository.findByIdAndUser).toHaveBeenCalledWith(999999, 888888);
      expect(mockInvitationRepository.updateStatus).toHaveBeenCalledWith(
        999999,
        InvitationStatus.Rejected
      );
      expect(mockUserGroupRepository.addUserToGroup).not.toHaveBeenCalled(); // Not called for rejection
    });

    it('should handle invitation with respondedAt date', async () => {
      // Arrange
      const input: UpdateInvitationInput = {
        id: 1,
        userId: 2,
        status: InvitationStatus.Accepted,
      };

      const mockInvitation = new Invitation({
        id: 1,
        groupId: 10,
        invitedById: 3,
        invitedUserId: 2,
        status: InvitationStatus.Pending,
        createdAt: new Date('2024-01-01'),
        respondedAt: undefined, // Pending invitation has no respondedAt
      });

      mockInvitationRepository.findByIdAndUser.mockResolvedValue(mockInvitation);
      mockInvitationRepository.updateStatus.mockResolvedValue();
      mockUserGroupRepository.addUserToGroup.mockResolvedValue();

      // Act
      const result = await updateInvitationStatus(
        mockInvitationRepository,
        mockUserGroupRepository,
        input
      );

      // Assert
      expect(result).toEqual({
        status: InvitationStatus.Accepted,
      });
      expect(mockInvitation.respondedAt).toBeUndefined(); // Original invitation shouldn't be mutated
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple status updates gracefully', async () => {
      // Arrange
      const input1: UpdateInvitationInput = {
        id: 1,
        userId: 2,
        status: InvitationStatus.Accepted,
      };

      const input2: UpdateInvitationInput = {
        id: 2,
        userId: 3,
        status: InvitationStatus.Rejected,
      };

      const mockInvitation1 = new Invitation({
        id: 1,
        groupId: 10,
        invitedById: 4,
        invitedUserId: 2,
        status: InvitationStatus.Pending,
        createdAt: new Date(),
      });

      const mockInvitation2 = new Invitation({
        id: 2,
        groupId: 11,
        invitedById: 5,
        invitedUserId: 3,
        status: InvitationStatus.Pending,
        createdAt: new Date(),
      });

      mockInvitationRepository.findByIdAndUser
        .mockResolvedValueOnce(mockInvitation1)
        .mockResolvedValueOnce(mockInvitation2);
      mockInvitationRepository.updateStatus.mockResolvedValue();
      mockUserGroupRepository.addUserToGroup.mockResolvedValue();

      // Act
      const [result1, result2] = await Promise.all([
        updateInvitationStatus(mockInvitationRepository, mockUserGroupRepository, input1),
        updateInvitationStatus(mockInvitationRepository, mockUserGroupRepository, input2),
      ]);

      // Assert
      expect(result1).toEqual({ status: InvitationStatus.Accepted });
      expect(result2).toEqual({ status: InvitationStatus.Rejected });
      expect(mockInvitationRepository.findByIdAndUser).toHaveBeenCalledTimes(2);
      expect(mockInvitationRepository.updateStatus).toHaveBeenCalledTimes(2);
      expect(mockUserGroupRepository.addUserToGroup).toHaveBeenCalledTimes(1); // Only for accepted invitation
    });
  });
});

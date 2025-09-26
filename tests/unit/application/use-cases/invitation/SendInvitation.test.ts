import { AppError } from '@/application/errors/AppError';
import {
  sendInvitation,
  SendInvitationInput,
} from '@/application/use-cases/invitation/SendInvitation';
import { Invitation, InvitationStatus } from '@/domain/entities/invitation/Invitation';
import { User } from '@/domain/entities/user/User';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { InvitationRepository } from '@/domain/repositories/invitation/InvitationRepository';
import { UserRepository } from '@/domain/repositories/user/UserRepository';

describe('SendInvitation', () => {
  let mockInvitationRepository: jest.Mocked<InvitationRepository>;
  let mockUserGroupRepository: jest.Mocked<UserGroupRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;

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

    mockUserRepository = {
      save: jest.fn(),
      getByEmail: jest.fn(),
      getById: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('successful invitation scenarios', () => {
    it('should send invitation successfully with invitedUserId', async () => {
      // Arrange
      const input: SendInvitationInput = {
        groupId: 1,
        invitedUserId: 2,
        invitedById: 3,
      };

      const mockInvitation = new Invitation({
        id: 1,
        groupId: 1,
        invitedById: 3,
        invitedUserId: 2,
        status: InvitationStatus.Accepted,
        createdAt: new Date(),
      });

      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(true); // inviter is member
      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(false); // invitee is not member
      mockInvitationRepository.findPendingByGroupAndUser.mockResolvedValue(null);
      mockInvitationRepository.create.mockResolvedValue(mockInvitation);
      mockUserGroupRepository.addUserToGroup.mockResolvedValue();

      // Act
      const result = await sendInvitation(
        mockInvitationRepository,
        mockUserGroupRepository,
        mockUserRepository,
        input
      );

      // Assert
      expect(result).toEqual(mockInvitation);
      expect(mockUserGroupRepository.isUserInGroup).toHaveBeenCalledWith(3, 1); // inviter check
      expect(mockUserGroupRepository.isUserInGroup).toHaveBeenCalledWith(2, 1); // invitee check
      expect(mockInvitationRepository.findPendingByGroupAndUser).toHaveBeenCalledWith(1, 2);
      expect(mockInvitationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: 1,
          invitedById: 3,
          invitedUserId: 2,
          status: InvitationStatus.Accepted,
        })
      );
      expect(mockUserGroupRepository.addUserToGroup).toHaveBeenCalledWith(2, 1);
    });

    it('should send invitation successfully with invitedUserEmail', async () => {
      // Arrange
      const input: SendInvitationInput = {
        groupId: 1,
        invitedUserEmail: 'user@example.com',
        invitedById: 3,
      };

      const mockUser = new User({
        id: 2,
        email: 'user@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: new Date(),
      });

      const mockInvitation = new Invitation({
        id: 1,
        groupId: 1,
        invitedById: 3,
        invitedUserId: 2,
        status: InvitationStatus.Accepted,
        createdAt: new Date(),
      });

      mockUserRepository.getByEmail.mockResolvedValue(mockUser);
      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(true); // inviter is member
      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(false); // invitee is not member
      mockInvitationRepository.findPendingByGroupAndUser.mockResolvedValue(null);
      mockInvitationRepository.create.mockResolvedValue(mockInvitation);
      mockUserGroupRepository.addUserToGroup.mockResolvedValue();

      // Act
      const result = await sendInvitation(
        mockInvitationRepository,
        mockUserGroupRepository,
        mockUserRepository,
        input
      );

      // Assert
      expect(result).toEqual(mockInvitation);
      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith('user@example.com');
      expect(mockUserGroupRepository.isUserInGroup).toHaveBeenCalledWith(3, 1);
      expect(mockUserGroupRepository.isUserInGroup).toHaveBeenCalledWith(2, 1);
      expect(mockInvitationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          invitedUserId: 2,
        })
      );
    });
  });

  describe('validation errors', () => {
    it('should throw error when neither invitedUserId nor invitedUserEmail is provided', async () => {
      // Arrange
      const input: SendInvitationInput = {
        groupId: 1,
        invitedById: 3,
      };

      // Act & Assert
      await expect(
        sendInvitation(mockInvitationRepository, mockUserGroupRepository, mockUserRepository, input)
      ).rejects.toThrow(
        new AppError('Either invitedUserId or invitedUserEmail must be provided', 400)
      );
    });

    it('should throw error when user not found by email', async () => {
      // Arrange
      const input: SendInvitationInput = {
        groupId: 1,
        invitedUserEmail: 'nonexistent@example.com',
        invitedById: 3,
      };

      mockUserRepository.getByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(
        sendInvitation(mockInvitationRepository, mockUserGroupRepository, mockUserRepository, input)
      ).rejects.toThrow(new AppError('No user found with the provided email', 404));

      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('should throw error when inviter is not a member of the group', async () => {
      // Arrange
      const input: SendInvitationInput = {
        groupId: 1,
        invitedUserId: 2,
        invitedById: 3,
      };

      mockUserGroupRepository.isUserInGroup.mockResolvedValue(false); // inviter is not member

      // Act & Assert
      await expect(
        sendInvitation(mockInvitationRepository, mockUserGroupRepository, mockUserRepository, input)
      ).rejects.toThrow(new AppError('User is not a member of the group', 403));

      expect(mockUserGroupRepository.isUserInGroup).toHaveBeenCalledWith(3, 1);
    });

    it('should throw error when user is already a member of the group', async () => {
      // Arrange
      const input: SendInvitationInput = {
        groupId: 1,
        invitedUserId: 2,
        invitedById: 3,
      };

      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(true); // inviter is member
      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(true); // invitee is already member

      // Act & Assert
      await expect(
        sendInvitation(mockInvitationRepository, mockUserGroupRepository, mockUserRepository, input)
      ).rejects.toThrow(new AppError('User is already a member of the group', 400));

      expect(mockUserGroupRepository.isUserInGroup).toHaveBeenCalledWith(3, 1);
      expect(mockUserGroupRepository.isUserInGroup).toHaveBeenCalledWith(2, 1);
    });

    it('should throw error when user already has a pending invitation', async () => {
      // Arrange
      const input: SendInvitationInput = {
        groupId: 1,
        invitedUserId: 2,
        invitedById: 3,
      };

      const existingInvitation = new Invitation({
        id: 1,
        groupId: 1,
        invitedById: 3,
        invitedUserId: 2,
        status: InvitationStatus.Pending,
        createdAt: new Date(),
      });

      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(true); // inviter is member
      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(false); // invitee is not member
      mockInvitationRepository.findPendingByGroupAndUser.mockResolvedValue(existingInvitation);

      // Act & Assert
      await expect(
        sendInvitation(mockInvitationRepository, mockUserGroupRepository, mockUserRepository, input)
      ).rejects.toThrow(new AppError('User already has a pending invitation to this group', 400));

      expect(mockInvitationRepository.findPendingByGroupAndUser).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('database error scenarios', () => {
    it('should throw error when invitation creation fails', async () => {
      // Arrange
      const input: SendInvitationInput = {
        groupId: 1,
        invitedUserId: 2,
        invitedById: 3,
      };

      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(true);
      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(false);
      mockInvitationRepository.findPendingByGroupAndUser.mockResolvedValue(null);
      mockInvitationRepository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        sendInvitation(mockInvitationRepository, mockUserGroupRepository, mockUserRepository, input)
      ).rejects.toThrow(new AppError('Error creating invitation', 500));
    });

    it('should throw error when adding user to group fails', async () => {
      // Arrange
      const input: SendInvitationInput = {
        groupId: 1,
        invitedUserId: 2,
        invitedById: 3,
      };

      const mockInvitation = new Invitation({
        id: 1,
        groupId: 1,
        invitedById: 3,
        invitedUserId: 2,
        status: InvitationStatus.Accepted,
        createdAt: new Date(),
      });

      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(true);
      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(false);
      mockInvitationRepository.findPendingByGroupAndUser.mockResolvedValue(null);
      mockInvitationRepository.create.mockResolvedValue(mockInvitation);
      mockUserGroupRepository.addUserToGroup.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        sendInvitation(mockInvitationRepository, mockUserGroupRepository, mockUserRepository, input)
      ).rejects.toThrow(new AppError('Error adding user to group', 500));
    });

    it('should handle error with status code from repository', async () => {
      // Arrange
      const input: SendInvitationInput = {
        groupId: 1,
        invitedUserId: 2,
        invitedById: 3,
      };

      const errorWithStatus = new Error('Specific database error');
      (errorWithStatus as any).statusCode = 503;

      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(true);
      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(false);
      mockInvitationRepository.findPendingByGroupAndUser.mockResolvedValue(null);
      mockInvitationRepository.create.mockRejectedValue(errorWithStatus);

      // Act & Assert
      await expect(
        sendInvitation(mockInvitationRepository, mockUserGroupRepository, mockUserRepository, input)
      ).rejects.toThrow(new AppError('Error creating invitation', 503));
    });
  });

  describe('edge cases', () => {
    it('should handle invitation with both invitedUserId and invitedUserEmail (prioritize invitedUserId)', async () => {
      // Arrange
      const input: SendInvitationInput = {
        groupId: 1,
        invitedUserId: 2,
        invitedUserEmail: 'user@example.com', // This should be ignored
        invitedById: 3,
      };

      const mockInvitation = new Invitation({
        id: 1,
        groupId: 1,
        invitedById: 3,
        invitedUserId: 2,
        status: InvitationStatus.Accepted,
        createdAt: new Date(),
      });

      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(true);
      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(false);
      mockInvitationRepository.findPendingByGroupAndUser.mockResolvedValue(null);
      mockInvitationRepository.create.mockResolvedValue(mockInvitation);
      mockUserGroupRepository.addUserToGroup.mockResolvedValue();

      // Act
      const result = await sendInvitation(
        mockInvitationRepository,
        mockUserGroupRepository,
        mockUserRepository,
        input
      );

      // Assert
      expect(result).toEqual(mockInvitation);
      expect(mockUserRepository.getByEmail).not.toHaveBeenCalled(); // Should not call getByEmail
      expect(mockInvitationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          invitedUserId: 2,
        })
      );
    });

    it('should handle large user IDs correctly', async () => {
      // Arrange
      const input: SendInvitationInput = {
        groupId: 999999,
        invitedUserId: 888888,
        invitedById: 777777,
      };

      const mockInvitation = new Invitation({
        id: 1,
        groupId: 999999,
        invitedById: 777777,
        invitedUserId: 888888,
        status: InvitationStatus.Accepted,
        createdAt: new Date(),
      });

      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(true);
      mockUserGroupRepository.isUserInGroup.mockResolvedValueOnce(false);
      mockInvitationRepository.findPendingByGroupAndUser.mockResolvedValue(null);
      mockInvitationRepository.create.mockResolvedValue(mockInvitation);
      mockUserGroupRepository.addUserToGroup.mockResolvedValue();

      // Act
      const result = await sendInvitation(
        mockInvitationRepository,
        mockUserGroupRepository,
        mockUserRepository,
        input
      );

      // Assert
      expect(result).toEqual(mockInvitation);
      expect(mockUserGroupRepository.isUserInGroup).toHaveBeenCalledWith(777777, 999999);
      expect(mockUserGroupRepository.isUserInGroup).toHaveBeenCalledWith(888888, 999999);
    });
  });
});

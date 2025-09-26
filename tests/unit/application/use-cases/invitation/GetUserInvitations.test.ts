import { getUserInvitations } from '@/application/use-cases/invitation/GetUserInvitations';
import { Invitation, InvitationStatus } from '@/domain/entities/invitation/Invitation';
import { InvitationRepository } from '@/domain/repositories/invitation/InvitationRepository';

describe('GetUserInvitations', () => {
  let mockInvitationRepository: jest.Mocked<InvitationRepository>;

  beforeEach(() => {
    mockInvitationRepository = {
      findByUserId: jest.fn(),
      findByIdAndUser: jest.fn(),
      findPendingByGroupAndUser: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when user has invitations', () => {
    it('should return all invitations for the user', async () => {
      // Arrange
      const userId = 1;
      const mockInvitations = [
        new Invitation({
          id: 1,
          groupId: 1,
          invitedById: 2,
          invitedUserId: userId,
          status: InvitationStatus.Pending,
          createdAt: new Date('2024-01-01'),
        }),
        new Invitation({
          id: 2,
          groupId: 2,
          invitedById: 3,
          invitedUserId: userId,
          status: InvitationStatus.Accepted,
          createdAt: new Date('2024-01-02'),
          respondedAt: new Date('2024-01-03'),
        }),
      ];

      mockInvitationRepository.findByUserId.mockResolvedValue(mockInvitations);

      // Act
      const result = await getUserInvitations(mockInvitationRepository, userId);

      // Assert
      expect(result).toEqual(mockInvitations);
      expect(mockInvitationRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockInvitationRepository.findByUserId).toHaveBeenCalledTimes(1);
    });

    it('should return invitations with different statuses', async () => {
      // Arrange
      const userId = 1;
      const mockInvitations = [
        new Invitation({
          id: 1,
          groupId: 1,
          invitedById: 2,
          invitedUserId: userId,
          status: InvitationStatus.Pending,
          createdAt: new Date('2024-01-01'),
        }),
        new Invitation({
          id: 2,
          groupId: 2,
          invitedById: 3,
          invitedUserId: userId,
          status: InvitationStatus.Rejected,
          createdAt: new Date('2024-01-02'),
          respondedAt: new Date('2024-01-03'),
        }),
      ];

      mockInvitationRepository.findByUserId.mockResolvedValue(mockInvitations);

      // Act
      const result = await getUserInvitations(mockInvitationRepository, userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(InvitationStatus.Pending);
      expect(result[1].status).toBe(InvitationStatus.Rejected);
      expect(mockInvitationRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('when user has no invitations', () => {
    it('should return empty array', async () => {
      // Arrange
      const userId = 1;
      mockInvitationRepository.findByUserId.mockResolvedValue([]);

      // Act
      const result = await getUserInvitations(mockInvitationRepository, userId);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockInvitationRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockInvitationRepository.findByUserId).toHaveBeenCalledTimes(1);
    });
  });

  describe('when repository throws an error', () => {
    it('should propagate the error', async () => {
      // Arrange
      const userId = 1;
      const repositoryError = new Error('Database connection failed');
      mockInvitationRepository.findByUserId.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(getUserInvitations(mockInvitationRepository, userId)).rejects.toThrow(
        'Database connection failed'
      );
      expect(mockInvitationRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('edge cases', () => {
    it('should handle userId as 0', async () => {
      // Arrange
      const userId = 0;
      mockInvitationRepository.findByUserId.mockResolvedValue([]);

      // Act
      const result = await getUserInvitations(mockInvitationRepository, userId);

      // Assert
      expect(result).toEqual([]);
      expect(mockInvitationRepository.findByUserId).toHaveBeenCalledWith(0);
    });

    it('should handle large userId', async () => {
      // Arrange
      const userId = 999999;
      const mockInvitations = [
        new Invitation({
          id: 1,
          groupId: 1,
          invitedById: 2,
          invitedUserId: userId,
          status: InvitationStatus.Pending,
          createdAt: new Date(),
        }),
      ];
      mockInvitationRepository.findByUserId.mockResolvedValue(mockInvitations);

      // Act
      const result = await getUserInvitations(mockInvitationRepository, userId);

      // Assert
      expect(result).toEqual(mockInvitations);
      expect(mockInvitationRepository.findByUserId).toHaveBeenCalledWith(999999);
    });
  });
});

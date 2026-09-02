import { AppError } from '@/application/errors/AppError';
import {
  addGuestMember,
  AddGuestMemberInput,
} from '@/application/use-cases/group/AddGuestMember';
import { Invitation, InvitationStatus } from '@/domain/entities/invitation/Invitation';
import { User } from '@/domain/entities/user/User';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { InvitationRepository } from '@/domain/repositories/invitation/InvitationRepository';
import { UserRepository } from '@/domain/repositories/user/UserRepository';
import { AuthService } from '@/infrastructure/database/services/AuthService';

describe('addGuestMember', () => {
  let mockInvitationRepository: jest.Mocked<InvitationRepository>;
  let mockUserGroupRepository: jest.Mocked<UserGroupRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockInvitationRepository = {
      findByUserId: jest.fn(),
      findByIdAndUser: jest.fn(),
      findPendingByGroupAndUser: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      reassignUser: jest.fn(),
    };

    mockUserGroupRepository = {
      addUserToGroup: jest.fn(),
      findByGroupId: jest.fn(),
      findByGroupIds: jest.fn(),
      findByUserId: jest.fn(),
      getUserGroups: jest.fn(),
      isUserInGroup: jest.fn(),
      save: jest.fn(),
      reassignUser: jest.fn(),
    };

    mockUserRepository = {
      save: jest.fn(),
      getByEmail: jest.fn(),
      getById: jest.fn(),
      findGuestsByClaimEmail: jest.fn(),
      delete: jest.fn(),
    };

    mockAuthService = {
      hashPassword: jest.fn().mockResolvedValue('hashed-random-password'),
      comparePasswords: jest.fn(),
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates a guest member and adds it to the group', async () => {
    const input: AddGuestMemberInput = {
      groupId: 1,
      name: 'Juan Amigo',
      addedById: 3,
    };

    const savedGuest = new User({
      id: 42,
      name: 'Juan Amigo',
      email: 'guest+abc@spendly.internal',
      password: 'hashed-random-password',
      isGuest: true,
      claimEmail: null,
    });

    mockUserGroupRepository.isUserInGroup.mockResolvedValue(true);
    mockUserRepository.save.mockResolvedValue(savedGuest);
    mockUserGroupRepository.addUserToGroup.mockResolvedValue();
    mockInvitationRepository.create.mockResolvedValue(
      new Invitation({
        id: 1,
        groupId: 1,
        invitedById: 3,
        invitedUserId: 42,
        status: InvitationStatus.Accepted,
        createdAt: new Date(),
      })
    );

    const result = await addGuestMember(
      mockInvitationRepository,
      mockUserGroupRepository,
      mockUserRepository,
      mockAuthService,
      input
    );

    expect(result).toEqual({ userId: 42, name: 'Juan Amigo', isGuest: true });
    expect(mockUserGroupRepository.isUserInGroup).toHaveBeenCalledWith(3, 1);
    expect(mockUserRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Juan Amigo', isGuest: true, claimEmail: null })
    );
    expect(mockUserGroupRepository.addUserToGroup).toHaveBeenCalledWith(42, 1);
    expect(mockInvitationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        groupId: 1,
        invitedById: 3,
        invitedUserId: 42,
        status: InvitationStatus.Accepted,
      })
    );
  });

  it('lowercases the optional claimEmail hint before saving', async () => {
    const input: AddGuestMemberInput = {
      groupId: 1,
      name: 'Ana',
      claimEmail: 'ANA@Example.com',
      addedById: 3,
    };

    mockUserGroupRepository.isUserInGroup.mockResolvedValue(true);
    mockUserRepository.save.mockResolvedValue(
      new User({
        id: 10,
        name: 'Ana',
        email: 'guest+xyz@spendly.internal',
        password: 'hashed-random-password',
        isGuest: true,
        claimEmail: 'ana@example.com',
      })
    );
    mockInvitationRepository.create.mockResolvedValue(
      new Invitation({
        id: 2,
        groupId: 1,
        invitedById: 3,
        invitedUserId: 10,
        status: InvitationStatus.Accepted,
        createdAt: new Date(),
      })
    );

    await addGuestMember(
      mockInvitationRepository,
      mockUserGroupRepository,
      mockUserRepository,
      mockAuthService,
      input
    );

    expect(mockUserRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ claimEmail: 'ana@example.com' })
    );
  });

  it('throws when the member adding the guest is not part of the group', async () => {
    const input: AddGuestMemberInput = {
      groupId: 1,
      name: 'Juan Amigo',
      addedById: 3,
    };

    mockUserGroupRepository.isUserInGroup.mockResolvedValue(false);

    await expect(
      addGuestMember(
        mockInvitationRepository,
        mockUserGroupRepository,
        mockUserRepository,
        mockAuthService,
        input
      )
    ).rejects.toThrow(new AppError('User is not a member of the group', 403));

    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });
});

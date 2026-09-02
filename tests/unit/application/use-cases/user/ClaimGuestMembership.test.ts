import { AppError } from '@/application/errors/AppError';
import {
  claimGuestMembership,
  ClaimGuestMembershipInput,
} from '@/application/use-cases/user/ClaimGuestMembership';
import { User } from '@/domain/entities/user/User';
import { ExpenseParticipantRepository } from '@/domain/repositories/expense/ExpenseParticipantRepository';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { InvitationRepository } from '@/domain/repositories/invitation/InvitationRepository';
import { UserRepository } from '@/domain/repositories/user/UserRepository';

describe('claimGuestMembership', () => {
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockUserGroupRepository: jest.Mocked<UserGroupRepository>;
  let mockExpenseParticipantRepository: jest.Mocked<ExpenseParticipantRepository>;
  let mockInvitationRepository: jest.Mocked<InvitationRepository>;

  const guest = new User({
    id: 42,
    name: 'Juan Amigo',
    email: 'guest+abc@spendly.internal',
    password: 'hashed',
    isGuest: true,
    claimEmail: 'juan@example.com',
  });

  const realUser = new User({
    id: 7,
    name: 'Juan Real',
    email: 'juan@example.com',
    password: 'hashed',
  });

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      getByEmail: jest.fn(),
      getById: jest.fn(),
      findGuestsByClaimEmail: jest.fn(),
      delete: jest.fn(),
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

    mockExpenseParticipantRepository = {
      create: jest.fn(),
      findByExpenseId: jest.fn(),
      findByExpenseIds: jest.fn(),
      reassignUser: jest.fn().mockResolvedValue([]),
    };

    mockInvitationRepository = {
      findByUserId: jest.fn(),
      findByIdAndUser: jest.fn(),
      findPendingByGroupAndUser: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      reassignUser: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const input: ClaimGuestMembershipInput = { guestUserId: 42, realUserId: 7 };

  it('reassigns group memberships, expense history and invitations, then removes the guest', async () => {
    mockUserRepository.getById.mockImplementation((id) =>
      Promise.resolve(id === 42 ? guest : realUser)
    );
    mockUserGroupRepository.getUserGroups.mockResolvedValue([1, 2]);
    mockExpenseParticipantRepository.reassignUser.mockResolvedValue([100, 101]);

    await claimGuestMembership(
      mockUserRepository,
      mockUserGroupRepository,
      mockExpenseParticipantRepository,
      mockInvitationRepository,
      input
    );

    expect(mockUserGroupRepository.reassignUser).toHaveBeenCalledWith(42, 7, 1);
    expect(mockUserGroupRepository.reassignUser).toHaveBeenCalledWith(42, 7, 2);
    expect(mockExpenseParticipantRepository.reassignUser).toHaveBeenCalledWith(42, 7);
    expect(mockInvitationRepository.reassignUser).toHaveBeenCalledWith(42, 7);
    expect(mockUserRepository.delete).toHaveBeenCalledWith(42);
  });

  it('throws 404 when the guest does not exist', async () => {
    mockUserRepository.getById.mockImplementation((id) =>
      Promise.resolve(id === 42 ? null : realUser)
    );

    await expect(
      claimGuestMembership(
        mockUserRepository,
        mockUserGroupRepository,
        mockExpenseParticipantRepository,
        mockInvitationRepository,
        input
      )
    ).rejects.toThrow(new AppError('Guest member not found', 404));

    expect(mockUserGroupRepository.reassignUser).not.toHaveBeenCalled();
  });

  it('throws 400 when the target user is not a guest', async () => {
    const notAGuest = new User({ ...guest, id: 42, isGuest: false });
    mockUserRepository.getById.mockImplementation((id) =>
      Promise.resolve(id === 42 ? notAGuest : realUser)
    );

    await expect(
      claimGuestMembership(
        mockUserRepository,
        mockUserGroupRepository,
        mockExpenseParticipantRepository,
        mockInvitationRepository,
        input
      )
    ).rejects.toThrow(new AppError('This member is not a guest', 400));
  });

  it('throws 403 when the claim email does not match the real user email', async () => {
    const mismatchedRealUser = new User({ ...realUser, email: 'someoneelse@example.com' });
    mockUserRepository.getById.mockImplementation((id) =>
      Promise.resolve(id === 42 ? guest : mismatchedRealUser)
    );

    await expect(
      claimGuestMembership(
        mockUserRepository,
        mockUserGroupRepository,
        mockExpenseParticipantRepository,
        mockInvitationRepository,
        input
      )
    ).rejects.toThrow(new AppError('This guest membership cannot be claimed by this account', 403));

    expect(mockUserGroupRepository.reassignUser).not.toHaveBeenCalled();
  });

  it('deduplicates membership when the real user already belongs to one of the guest groups', async () => {
    mockUserRepository.getById.mockImplementation((id) =>
      Promise.resolve(id === 42 ? guest : realUser)
    );
    mockUserGroupRepository.getUserGroups.mockResolvedValue([1]);

    await claimGuestMembership(
      mockUserRepository,
      mockUserGroupRepository,
      mockExpenseParticipantRepository,
      mockInvitationRepository,
      input
    );

    // Deduplication itself is UserGroupRepoImpl's responsibility; the use case
    // just has to delegate the reassignment per group unconditionally.
    expect(mockUserGroupRepository.reassignUser).toHaveBeenCalledWith(42, 7, 1);
  });
});

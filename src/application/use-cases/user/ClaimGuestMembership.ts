import { AppError } from '@/application/errors/AppError';
import { ExpenseParticipantRepository } from '@/domain/repositories/expense/ExpenseParticipantRepository';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { InvitationRepository } from '@/domain/repositories/invitation/InvitationRepository';
import { UserRepository } from '@/domain/repositories/user/UserRepository';

export interface ClaimGuestMembershipInput {
  guestUserId: number;
  realUserId: number;
}

export async function claimGuestMembership(
  userRepository: UserRepository,
  userGroupRepository: UserGroupRepository,
  expenseParticipantRepository: ExpenseParticipantRepository,
  invitationRepository: InvitationRepository,
  input: ClaimGuestMembershipInput
): Promise<void> {
  const { guestUserId, realUserId } = input;

  const [guest, realUser] = await Promise.all([
    userRepository.getById(guestUserId),
    userRepository.getById(realUserId),
  ]);

  if (!guest) {
    throw new AppError('Guest member not found', 404);
  }
  if (!guest.isGuest) {
    throw new AppError('This member is not a guest', 400);
  }
  if (!realUser) {
    throw new AppError('User not found', 404);
  }
  if (!guest.claimEmail || guest.claimEmail.toLowerCase() !== realUser.email.toLowerCase()) {
    throw new AppError('This guest membership cannot be claimed by this account', 403);
  }

  const guestGroupIds = await userGroupRepository.getUserGroups(guestUserId);

  for (const groupId of guestGroupIds) {
    await userGroupRepository.reassignUser(guestUserId, realUserId, groupId);
  }

  await expenseParticipantRepository.reassignUser(guestUserId, realUserId);
  await invitationRepository.reassignUser(guestUserId, realUserId);
  await userRepository.delete(guestUserId);
}

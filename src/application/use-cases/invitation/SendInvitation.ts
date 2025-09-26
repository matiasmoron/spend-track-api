import { AppError } from '@/application/errors/AppError';
import { Invitation } from '@/domain/entities/invitation/Invitation';
import { InvitationStatus } from '@/domain/entities/invitation/Invitation';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { InvitationRepository } from '@/domain/repositories/invitation/InvitationRepository';
import { UserRepository } from '@/domain/repositories/user/UserRepository';

export interface SendInvitationInput {
  groupId: number;
  invitedUserId?: number;
  invitedUserEmail?: string;
  invitedById: number;
}

export async function sendInvitation(
  invitationRepository: InvitationRepository,
  userGroupRepository: UserGroupRepository,
  userRepository: UserRepository,
  input: SendInvitationInput
): Promise<Invitation> {
  const { groupId, invitedUserId, invitedUserEmail, invitedById } = input;

  let resolvedUserId: number | undefined = invitedUserId;

  if (!resolvedUserId && invitedUserEmail) {
    const user = await userRepository.getByEmail(invitedUserEmail);

    if (!user) {
      throw new AppError('No user found with the provided email', 404);
    }
    resolvedUserId = user.id;
  }

  if (!resolvedUserId) {
    throw new AppError('Either invitedUserId or invitedUserEmail must be provided', 400);
  }

  // The inviter should be a member of the group
  const isTheInviterAMember = await userGroupRepository.isUserInGroup(invitedById, groupId);
  if (!isTheInviterAMember) {
    throw new AppError('User is not a member of the group', 403);
  }

  // The member is already in the group
  const isMember = await userGroupRepository.isUserInGroup(resolvedUserId, groupId);
  if (isMember) {
    throw new AppError('User is already a member of the group', 400);
  }

  // The user already has a pending invitation
  const existingInvitation = await invitationRepository.findPendingByGroupAndUser(
    groupId,
    resolvedUserId
  );

  if (existingInvitation) {
    throw new AppError('User already has a pending invitation to this group', 400);
  }

  const now = new Date();

  // The invitation is auto-accepted by default and the user is added to the group
  let invitation = new Invitation({
    id: 0, // will be set by the database
    groupId,
    invitedById,
    invitedUserId: resolvedUserId,
    status: InvitationStatus.Accepted,
    createdAt: now,
  });

  try {
    invitation = await invitationRepository.create(invitation);
  } catch (error) {
    throw new AppError('Error creating invitation', error?.statusCode || 500);
  }

  try {
    await userGroupRepository.addUserToGroup(resolvedUserId, invitation.groupId);
  } catch (error) {
    throw new AppError('Error adding user to group', error?.statusCode || 500);
  }

  return invitation;
}

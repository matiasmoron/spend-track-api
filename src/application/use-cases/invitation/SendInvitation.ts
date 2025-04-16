import { AppError } from '../../../application/errors/AppError';
import { Invitation } from '../../../domain/entities/invitation/Invitation';
import { InvitationStatus } from '../../../domain/entities/invitation/Invitation';
import { UserGroupRepository } from '../../../domain/repositories/group/UserGroupRepository';
import { InvitationRepository } from '../../../domain/repositories/invitation/InvitationRepository';

export interface SendInvitationInput {
  groupId: number;
  invitedUserId: number;
  invitedById: number;
}

export async function sendInvitation(
  invitationRepository: InvitationRepository,
  userGroupRepository: UserGroupRepository,
  input: SendInvitationInput
): Promise<Invitation> {
  const { groupId, invitedUserId, invitedById } = input;

  // Ya es miembro del grupo
  const isMember = await userGroupRepository.isUserInGroup(invitedUserId, groupId);
  if (isMember) {
    throw new AppError('User is already a member of the group', 400);
  }

  // Ya tiene invitación pendiente
  const existingInvitation = await invitationRepository.findPendingByGroupAndUser(
    groupId,
    invitedUserId
  );
  if (existingInvitation) {
    throw new AppError('User already has a pending invitation to this group', 400);
  }

  const now = new Date();

  const invitation = new Invitation({
    id: 0, // será reemplazado al persistir
    groupId,
    invitedById,
    invitedUserId,
    status: InvitationStatus.Pending,
    createdAt: now,
  });

  return invitationRepository.create(invitation);
}

import { AppError } from '../../../application/errors';
import { InvitationStatus } from '../../../domain/entities/invitation/Invitation';
import { UserGroupRepository } from '../../../domain/repositories/group/UserGroupRepository';
import { InvitationRepository } from '../../../domain/repositories/invitation/InvitationRepository';

export interface UpdateInvitationInput {
  id: number;
  userId: number;
  status: InvitationStatus;
}

export interface UpdateInvitationOutput {
  status: InvitationStatus;
}

export async function updateInvitationStatus(
  invitationRepository: InvitationRepository,
  userGroupRepository: UserGroupRepository,
  input: UpdateInvitationInput
): Promise<UpdateInvitationOutput> {
  const invitation = await invitationRepository.findByIdAndUser(input.id, input.userId);

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  if (invitation.status !== InvitationStatus.Pending) {
    throw new AppError('Invitation is not pending', 400);
  }

  await invitationRepository.updateStatus(invitation.id, input.status);

  if (input.status === InvitationStatus.Accepted) {
    await userGroupRepository.addUserToGroup(input.userId, invitation.groupId);
  }

  return {
    status: input.status,
  };
}

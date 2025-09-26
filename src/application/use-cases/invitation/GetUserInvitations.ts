import { Invitation } from '@/domain/entities/invitation/Invitation';
import { InvitationRepository } from '@/domain/repositories/invitation/InvitationRepository';

export async function getUserInvitations(
  invitationRepository: InvitationRepository,
  userId: number
): Promise<Invitation[]> {
  return invitationRepository.findByUserId(userId);
}

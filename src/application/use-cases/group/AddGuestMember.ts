import { randomUUID } from 'crypto';
import { AppError } from '@/application/errors/AppError';
import { GroupMemberInfo } from '@/domain/entities/group';
import { Invitation, InvitationStatus } from '@/domain/entities/invitation/Invitation';
import { User } from '@/domain/entities/user/User';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { InvitationRepository } from '@/domain/repositories/invitation/InvitationRepository';
import { UserRepository } from '@/domain/repositories/user/UserRepository';
import { AuthService } from '@/infrastructure/database/services/AuthService';

export interface AddGuestMemberInput {
  groupId: number;
  name: string;
  claimEmail?: string;
  addedById: number;
}

function generateGuestEmail(): string {
  return `guest+${randomUUID()}@spendly.internal`;
}

export async function addGuestMember(
  invitationRepository: InvitationRepository,
  userGroupRepository: UserGroupRepository,
  userRepository: UserRepository,
  authService: AuthService,
  input: AddGuestMemberInput
): Promise<GroupMemberInfo> {
  const { groupId, name, claimEmail, addedById } = input;

  const isAdderAMember = await userGroupRepository.isUserInGroup(addedById, groupId);
  if (!isAdderAMember) {
    throw new AppError('User is not a member of the group', 403);
  }

  const guestPasswordHash = await authService.hashPassword(randomUUID());

  const guest = new User({
    name,
    email: generateGuestEmail(),
    password: guestPasswordHash,
    isGuest: true,
    claimEmail: claimEmail ? claimEmail.toLowerCase() : null,
  });

  let savedGuest: User;
  try {
    savedGuest = await userRepository.save(guest);
  } catch (error) {
    throw new AppError('Error creating guest member', error?.statusCode || 500);
  }

  try {
    await userGroupRepository.addUserToGroup(savedGuest.id, groupId);
  } catch (error) {
    throw new AppError('Error adding guest member to group', error?.statusCode || 500);
  }

  try {
    await invitationRepository.create(
      new Invitation({
        id: 0,
        groupId,
        invitedById: addedById,
        invitedUserId: savedGuest.id,
        status: InvitationStatus.Accepted,
        createdAt: new Date(),
      })
    );
  } catch (error) {
    throw new AppError('Error recording guest invitation', error?.statusCode || 500);
  }

  return {
    userId: savedGuest.id,
    name: savedGuest.name,
    isGuest: true,
  };
}

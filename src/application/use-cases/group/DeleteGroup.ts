import { AppError } from '../../../application/errors/AppError';
import { GroupRepository } from '../../../domain/repositories/group/GroupRepository';
import { UserGroupRepository } from '../../../domain/repositories/group/UserGroupRepository';

export interface DeleteGroupInput {
  groupId: number;
  userId: number;
}

export async function deleteGroup(
  input: DeleteGroupInput,
  deps: {
    groupRepository: GroupRepository;
    userGroupRepository: UserGroupRepository;
  }
): Promise<void> {
  const { groupRepository, userGroupRepository } = deps;
  const { groupId, userId } = input;

  // First, check if the group exists
  const group = await groupRepository.findById(groupId);
  if (!group) {
    throw new AppError('Group not found', 404);
  }

  // Check if the user belongs to the group
  const userGroups = await userGroupRepository.findByUserId(userId);
  const userBelongsToGroup = userGroups.some((ug) => ug.groupId === groupId);

  if (!userBelongsToGroup) {
    throw new AppError('You do not have permission to delete this group', 403);
  }

  // Delete the group (this will also delete all related data due to our transaction)
  await groupRepository.delete(groupId);
}

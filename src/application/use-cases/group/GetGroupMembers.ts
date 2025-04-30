import { AppError } from '../../../application/errors';
import { GroupMemberInfo } from '../../../domain/entities/group';
import { UserGroupRepository } from '../../../domain/repositories/group/UserGroupRepository';

interface GetGroupMembersInput {
  groupId: number;
  userId: number;
}

export const getGroupMembers = async (
  input: GetGroupMembersInput,
  deps: {
    userGroupRepository: UserGroupRepository;
  }
): Promise<GroupMemberInfo[]> => {
  const { userGroupRepository } = deps;

  // Fetch group members
  const userGroups = await userGroupRepository.findByGroupId(input.groupId);

  if (!userGroups?.length) {
    throw new AppError('Group not found', 404);
  }

  // Check if user is in group, if not throw an error
  const isUserInGroup = userGroups.some((userGroup) => userGroup.userId === input.userId);
  if (!isUserInGroup) {
    throw new AppError('The user is not a member of the group', 403);
  }

  const members: GroupMemberInfo[] = userGroups.map((ug) => ({
    userId: ug.userId,
    name: ug.userName,
  }));

  return members;
};

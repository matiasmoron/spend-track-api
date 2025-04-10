import { UserGroupRepository } from 'domain/repositories/group/UserGroupRepository';
import { GroupType } from '../../../domain/entities/group/GroupType';
import { GroupRepository } from '../../../domain/repositories/group/GroupRepository';
import { GroupModel } from '../../../infrastructure/database/models/GroupModel';
import { UserGroupModel } from '../../../infrastructure/database/models/UserGroupModel';

interface GroupInput {
  name: string;
  type: GroupType;
  createdBy: number;
}

interface GroupOutput {
  id: number;
  name: string;
  type: GroupType;
  createdAt: Date;
}

export async function createGroup(
  groupRepository: GroupRepository,
  userGroupRepository: UserGroupRepository,
  data: GroupInput
): Promise<GroupOutput> {
  const { name, type, createdBy } = data;

  const group = new GroupModel();
  group.name = name;
  group.type = type;

  // Create the group
  const savedGroup = await groupRepository.save(group);

  // Create the association of the creator to the group, to be a member of the group
  const userGroup = new UserGroupModel();
  userGroup.groupId = savedGroup.id;
  userGroup.userId = createdBy;

  await userGroupRepository.save(userGroup);

  return {
    id: savedGroup.id,
    name: savedGroup.name,
    type: savedGroup.type,
    createdAt: savedGroup.createdAt,
  };
}

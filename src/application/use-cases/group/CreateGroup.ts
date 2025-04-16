import { UserGroupRepository } from 'domain/repositories/group/UserGroupRepository';
import { GroupRepository } from '../../../domain/repositories/group/GroupRepository';
import { GroupType } from '../../../domain/value-objects';
import { GroupModel } from '../../../infrastructure/database/models/GroupModel';
import { UserGroupModel } from '../../../infrastructure/database/models/UserGroupModel';

interface CreateGroupInput {
  name: string;
  type: GroupType;
  createdBy: number;
}

interface CreateGroupOutput {
  id: number;
  name: string;
  type: GroupType;
  createdAt: Date;
}

export async function createGroup(
  groupRepository: GroupRepository,
  userGroupRepository: UserGroupRepository,
  data: CreateGroupInput
): Promise<CreateGroupOutput> {
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

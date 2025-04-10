import { Group } from '../../../domain/entities/group';
import { GroupRepository } from '../../../domain/repositories/group/GroupRepository';

interface GetGroupsByUserInput {
  userId: number;
}

interface GetGroupsByUserOutput {
  groups: Group[];
}

export async function getGroupsByUser(
  { userId }: GetGroupsByUserInput,
  groupRepository: GroupRepository
): Promise<GetGroupsByUserOutput> {
  const groups = await groupRepository.findByUserId(userId);

  return {
    groups,
  };
}

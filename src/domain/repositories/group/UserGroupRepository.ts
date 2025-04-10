import { UserGroup } from '../../entities/group/UserGroup';

export interface UserGroupRepository {
  save(userGroup: Partial<UserGroup>): Promise<UserGroup>;
  findByUserId(userId: number): Promise<UserGroup[]>;
  findByGroupId(groupId: number): Promise<UserGroup[]>;
}

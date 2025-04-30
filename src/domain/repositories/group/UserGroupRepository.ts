import { UserGroup, UserGroupWithUserName } from '../../entities/group/UserGroup';

export interface UserGroupRepository {
  addUserToGroup(userId: number, groupId: number): Promise<void>;
  findByGroupId(groupId: number): Promise<UserGroupWithUserName[]>;
  findByUserId(userId: number): Promise<UserGroup[]>;
  getUserGroups(userId: number): Promise<number[]>;
  isUserInGroup(userId: number, groupId: number): Promise<boolean>;
  save(userGroup: Partial<UserGroup>): Promise<UserGroup>;
}

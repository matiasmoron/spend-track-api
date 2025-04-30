export interface UserGroup {
  id: number;
  userId: number;
  groupId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Extended UserGroup including the user’s display name
 */
export interface UserGroupWithUserName extends UserGroup {
  userName: string;
}

export interface GroupMemberInfo {
  userId: number;
  name: string;
}

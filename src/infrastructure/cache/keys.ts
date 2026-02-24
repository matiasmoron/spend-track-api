export const cacheKeys = {
  groupDetails: (groupId: number) => `group:${groupId}:details`,
  groupMembers: (groupId: number) => `group:${groupId}:members`,
  groupExpenses: (groupId: number) => `group:${groupId}:expenses`,
  expenseParticipants: (expenseId: number) => `expense:${expenseId}:participants`,
  userGroups: (userId: number) => `user:${userId}:groups`,
  /** Pattern that matches all keys belonging to a group */
  groupPattern: (groupId: number) => `group:${groupId}:*`,
};

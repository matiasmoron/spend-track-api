import { AppError } from '../../../application/errors';
import { GroupMemberInfo } from '../../../domain/entities/group';
import { ExpenseParticipantRepository } from '../../../domain/repositories/expense/ExpenseParticipantRepository';
import { ExpenseRepository } from '../../../domain/repositories/expense/ExpenseRepository';
import { GroupRepository } from '../../../domain/repositories/group/GroupRepository';
import { UserGroupRepository } from '../../../domain/repositories/group/UserGroupRepository';
import { GroupType } from '../../../domain/value-objects';
import { ExpenseDetail, getExpensesByGroup } from '../expense/GetExpensesByGroup';
import { getGroupMembers } from './GetGroupMembers';
import {
  calculateUserGroupBalance,
  ExpenseDetailFormatted,
  MemberBalanceEntry,
  UserBalanceSummaryEntry,
} from './calculateUserGroupBalance';

export interface GetGroupByIdInput {
  groupId: number;
  userId: number;
}

export interface GetGroupByIdOutput {
  id: number;
  name: string;
  type: GroupType;
  members: GroupMemberInfo[];
  balanceSummary: UserBalanceSummaryEntry[];
  memberBalances: MemberBalanceEntry[];
  expenses: ExpenseDetailFormatted[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Returns group details including per-user balances
 * for the requesting user.
 */
export const getGroupById = async (
  input: GetGroupByIdInput,
  deps: {
    groupRepository: GroupRepository;
    userGroupRepository: UserGroupRepository;
    expenseRepository: ExpenseRepository;
    expenseParticipantRepository: ExpenseParticipantRepository;
  }
): Promise<GetGroupByIdOutput> => {
  const { groupRepository, userGroupRepository, expenseRepository, expenseParticipantRepository } =
    deps;

  const { groupId, userId } = input;

  // Fetch group entity
  const group = await groupRepository.findById(groupId);
  if (!group) throw new AppError('Group not found', 404);

  // Get group members
  const groupMembers = await getGroupMembers({ groupId, userId }, { userGroupRepository });

  // Fetch expenses & prepare details
  const expensesRaw: ExpenseDetail[] = await getExpensesByGroup(
    { groupId: input.groupId },
    { expenseRepository, expenseParticipantRepository }
  );

  // Compute balances for the requesting user
  const userBalance = calculateUserGroupBalance(input.userId, groupMembers, expensesRaw, {
    simplify: false,
  });

  return {
    id: group.id,
    name: group.name,
    type: group.type,
    members: groupMembers,
    balanceSummary: userBalance.balanceSummary,
    memberBalances: userBalance.memberBalances,
    expenses: userBalance.expenses,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
};

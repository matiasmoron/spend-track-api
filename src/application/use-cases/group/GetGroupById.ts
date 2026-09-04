import { AppError } from '@/application/errors';
import {
  ExpenseDetail,
  getExpensesByGroup,
} from '@/application/use-cases/expense/GetExpensesByGroup';
import { getGroupMembers } from '@/application/use-cases/group/GetGroupMembers';
import {
  calculateUserGroupBalance,
  GroupActivityFormatted,
  GroupActivityItem,
  MemberBalanceEntry,
  UserBalanceSummaryEntry,
} from '@/application/use-cases/group/calculateUserGroupBalance';
import { getPaymentsByGroup, PaymentDetail } from '@/application/use-cases/payment/GetPaymentsByGroup';
import { GroupMemberInfo } from '@/domain/entities/group';
import { ExpenseParticipantRepository } from '@/domain/repositories/expense/ExpenseParticipantRepository';
import { ExpenseRepository } from '@/domain/repositories/expense/ExpenseRepository';
import { GroupRepository } from '@/domain/repositories/group/GroupRepository';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { PaymentRepository } from '@/domain/repositories/payment/PaymentRepository';
import { GroupType } from '@/domain/value-objects';

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
  activity: GroupActivityFormatted[];
  createdAt: Date;
  updatedAt: Date;
}

const toActivityItems = (expenses: ExpenseDetail[], payments: PaymentDetail[]): GroupActivityItem[] => {
  const expenseItems: GroupActivityItem[] = expenses.map(
    (e): GroupActivityItem => ({ ...e, type: 'expense' })
  );

  const paymentItems: GroupActivityItem[] = payments.map(
    (p): GroupActivityItem => ({
      ...p,
      type: 'payment',
      participants: [
        { userId: p.fromUserId, amount: p.amount },
        { userId: p.toUserId, amount: -p.amount },
      ],
    })
  );

  return [...expenseItems, ...paymentItems].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
};

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
    paymentRepository: PaymentRepository;
  }
): Promise<GetGroupByIdOutput> => {
  const {
    groupRepository,
    userGroupRepository,
    expenseRepository,
    expenseParticipantRepository,
    paymentRepository,
  } = deps;

  const { groupId, userId } = input;

  // Fetch group entity
  const group = await groupRepository.findById(groupId);
  if (!group) throw new AppError('Group not found', 404);

  // Get group members
  const groupMembers = await getGroupMembers({ groupId, userId }, { userGroupRepository });

  // Fetch expenses and payments
  const [expensesRaw, paymentsRaw] = await Promise.all([
    getExpensesByGroup({ groupId: input.groupId }, { expenseRepository, expenseParticipantRepository }),
    getPaymentsByGroup({ groupId: input.groupId }, { paymentRepository }),
  ]);

  const activityItems = toActivityItems(expensesRaw, paymentsRaw);

  // Compute balances for the requesting user
  const userBalance = calculateUserGroupBalance(input.userId, groupMembers, activityItems, {
    simplify: false,
  });

  return {
    id: group.id,
    name: group.name,
    type: group.type,
    members: groupMembers,
    balanceSummary: userBalance.balanceSummary,
    memberBalances: userBalance.memberBalances,
    activity: userBalance.activity,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
};

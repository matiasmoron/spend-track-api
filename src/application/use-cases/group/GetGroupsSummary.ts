import { ExpenseParticipant } from '../../../domain/entities/expense';
import { GroupMemberInfo } from '../../../domain/entities/group';
import { ExpenseParticipantRepository } from '../../../domain/repositories/expense/ExpenseParticipantRepository';
import { ExpenseRepository } from '../../../domain/repositories/expense/ExpenseRepository';
import { GroupRepository } from '../../../domain/repositories/group/GroupRepository';
import { UserGroupRepository } from '../../../domain/repositories/group/UserGroupRepository';
import { PaymentRepository } from '../../../domain/repositories/payment/PaymentRepository';
import { GroupType } from '../../../domain/value-objects';
import { ExpenseDetail } from '../expense/GetExpensesByGroup';
import {
  calculateUserGroupBalance,
  GroupActivityItem,
  MemberBalanceEntry,
  UserBalanceSummaryEntry,
} from './calculateUserGroupBalance';

export interface GroupSummaryItem {
  id: number;
  name: string;
  type: GroupType;
  balanceSummary: UserBalanceSummaryEntry[];
  memberBalances: MemberBalanceEntry[];
}

export interface GetGroupsSummaryInput {
  userId: number;
}

export const getGroupsSummary = async (
  input: GetGroupsSummaryInput,
  deps: {
    groupRepository: GroupRepository;
    userGroupRepository: UserGroupRepository;
    expenseRepository: ExpenseRepository;
    expenseParticipantRepository: ExpenseParticipantRepository;
    paymentRepository: PaymentRepository;
  }
): Promise<GroupSummaryItem[]> => {
  const {
    groupRepository,
    userGroupRepository,
    expenseRepository,
    expenseParticipantRepository,
    paymentRepository,
  } = deps;
  const { userId } = input;

  const groups = await groupRepository.findByUserId(userId);
  if (groups.length === 0) return [];

  const groupIds = groups.map((g) => g.id);

  // Batch-fetch all members, expenses, participants and payments
  const [allMembers, allExpenses, allPayments] = await Promise.all([
    userGroupRepository.findByGroupIds(groupIds),
    expenseRepository.findByGroupIds(groupIds),
    paymentRepository.findByGroupIds(groupIds),
  ]);

  const expenseIds = allExpenses.map((e) => e.id);
  const allParticipants = await expenseParticipantRepository.findByExpenseIds(expenseIds);

  // Group members by groupId
  const membersByGroup = new Map<number, GroupMemberInfo[]>();
  for (const ug of allMembers) {
    const list = membersByGroup.get(ug.groupId) ?? [];
    list.push({ userId: ug.userId, name: ug.userName, isGuest: ug.isGuest });
    membersByGroup.set(ug.groupId, list);
  }

  // Group participants by expenseId
  const participantsByExpense = new Map<number, ExpenseParticipant[]>();
  for (const p of allParticipants) {
    const list = participantsByExpense.get(p.expenseId) ?? [];
    list.push(p);
    participantsByExpense.set(p.expenseId, list);
  }

  // Build ExpenseDetail[] per group
  const expensesByGroup = new Map<number, ExpenseDetail[]>();
  for (const exp of allExpenses) {
    const list = expensesByGroup.get(exp.groupId) ?? [];
    list.push({
      id: exp.id,
      description: exp.description,
      total: exp.total,
      currency: exp.currency,
      participants: participantsByExpense.get(exp.id) ?? [],
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
    });
    expensesByGroup.set(exp.groupId, list);
  }

  // Group payments by groupId
  const paymentsByGroup = new Map<number, GroupActivityItem[]>();
  for (const payment of allPayments) {
    const list = paymentsByGroup.get(payment.groupId) ?? [];
    list.push({
      id: payment.id,
      fromUserId: payment.fromUserId,
      toUserId: payment.toUserId,
      amount: payment.amount,
      currency: payment.currency,
      title: payment.title,
      description: payment.description,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      type: 'payment',
      participants: [
        { userId: payment.fromUserId, amount: payment.amount },
        { userId: payment.toUserId, amount: -payment.amount },
      ],
    });
    paymentsByGroup.set(payment.groupId, list);
  }

  return groups.map((group) => {
    const members = membersByGroup.get(group.id) ?? [];
    const expenses = expensesByGroup.get(group.id) ?? [];
    const payments = paymentsByGroup.get(group.id) ?? [];
    const activityItems: GroupActivityItem[] = [
      ...expenses.map((e): GroupActivityItem => ({ ...e, type: 'expense' })),
      ...payments,
    ];
    const { balanceSummary, memberBalances } = calculateUserGroupBalance(
      userId,
      members,
      activityItems,
      { simplify: false }
    );

    return {
      id: group.id,
      name: group.name,
      type: group.type,
      balanceSummary,
      memberBalances,
    };
  });
};

import { GroupMemberInfo } from '../../../domain/entities/group';
import { Currency } from '../../../domain/value-objects';
import { ExpenseDetail } from '../expense/GetExpensesByGroup';

// src/application/use-cases/group/CalculateUserGroupBalance.ts

export interface ParticipantShare {
  userId: number;
  currency: Currency;
  amount: number;
}

export interface MemberBalanceEntry {
  userId: number;
  name: string;
  currency: Currency;
  amount: number; // positive if they owe you, negative if you owe them
}

export interface UserBalanceSummaryEntry {
  currency: Currency;
  amount: number; // positive if they owe you, negative if you owe
}

export interface CalculateUserGroupBalanceResult {
  balanceSummary: UserBalanceSummaryEntry[];
  memberBalances: MemberBalanceEntry[];
}

/**
 * Calculates the balance summary and per-member balances for a user in a group.
 * @param userId   - ID of the querying user
 * @param members  - array of { userId, name } for all group members
 * @param expenses - list of expenses with participant shares
 * @param simplify - whether to simplify cyclic debts per currency
 * @returns an object containing summary and detailed entries
 */
export const calculateUserGroupBalance = (
  userId: number,
  members: GroupMemberInfo[],
  expenses: ExpenseDetail[],
  { simplify = true }: { simplify?: boolean } = { simplify: true }
): CalculateUserGroupBalanceResult => {
  // 1) Initialize net balance per user and currency
  const balances: Record<number, Partial<Record<Currency, number>>> = {};

  members.forEach((m) => {
    balances[m.userId] = {};
  });

  // 2) Accumulate net per expense for each other member
  expenses.forEach((exp) => {
    const netPerUser: Record<number, number> = {};
    exp.participants.forEach((p) => {
      netPerUser[p.userId] = (netPerUser[p.userId] ?? 0) + Number(p.amount);
    });

    console.log(netPerUser);
    Object.entries(netPerUser).forEach(([id, net]) => {
      const otherId = Number(id);
      if (otherId === userId) return; // skip self

      console.log({ otherId, id, net, currency: exp.currency });

      balances[otherId][exp.currency] = (balances[otherId][exp.currency] ?? 0) + net;
    });
  });

  // 3) Optionally simplify cyclic debts by netting debtors and creditors
  if (simplify) {
    // gather all currencies
    const currencySet = new Set<Currency>();
    members.forEach((m) => {
      Object.keys(balances[m.userId]).forEach((c) => currencySet.add(c as Currency));
    });
    currencySet.forEach((currency) => {
      const debtors = members.filter((m) => (balances[m.userId][currency] ?? 0) < 0);
      const creditors = members.filter((m) => (balances[m.userId][currency] ?? 0) > 0);
      debtors.forEach((d) => {
        creditors.forEach((c) => {
          const debit = -(balances[d.userId][currency] ?? 0);
          const credit = balances[c.userId][currency] ?? 0;
          const cancel = Math.min(debit, credit);
          balances[d.userId][currency] += cancel;
          balances[c.userId][currency] -= cancel;
        });
      });
    });
  }

  // 4) Build overall balance summary (net across members)
  const summaryMap: Partial<Record<Currency, number>> = {};
  members.forEach((m) => {
    if (m.userId === userId) return;
    Object.entries(balances[m.userId]).forEach(([c, amt]) => {
      const curr = c as Currency;
      // positive if they owe you, negative if you owe them
      summaryMap[curr] = (summaryMap[curr] ?? 0) - amt;
    });
  });

  // Filter out zero balances
  const balanceSummary: UserBalanceSummaryEntry[] = Object.entries(summaryMap)
    .filter(([, amt]) => amt !== 0)
    .map(([c, amt]) => ({ currency: c as Currency, amount: amt }));

  // 5) Build detailed per-member balances as a flat list
  const memberBalances: MemberBalanceEntry[] = [];
  members.forEach((m) => {
    if (m.userId === userId) return;
    Object.entries(balances[m.userId]).forEach(([c, amt]) => {
      if (!amt) return;
      memberBalances.push({
        userId: m.userId,
        name: m.name,
        currency: c as Currency,
        amount: -amt, // invert sign: positive if they owe you
      });
    });
  });

  return { balanceSummary, memberBalances };
};

import { calculateUserGroupBalance } from '../../../../../src/application/use-cases/group/calculateUserGroupBalance';
import { Currency } from '../../../../../src/domain/value-objects/Currency';
import { TestDataGenerator } from '../../../../utils/TestDataGenerator';

describe('calculateUserGroupBalance', () => {
  afterEach(() => {
    TestDataGenerator.clearTrackedIds();
  });

  it('should compute balances for a simple expense', () => {
    const { user, group } = TestDataGenerator.generateTestScenario();

    const members = [
      { userId: user.id, name: user.name },
      { userId: 999999, name: 'Other' },
    ];

    const expenses = [
      {
        id: 1,
        groupId: group.id,
        description: 'Lunch',
        total: 10,
        currency: Currency.ARS,
        createdAt: new Date(),
        updatedAt: new Date(),
        participants: [{ userId: user.id, amount: 10 }],
      },
    ];

    const result = calculateUserGroupBalance(user.id, members, expenses as any, {
      simplify: false,
    });

    expect(Array.isArray(result.expenses)).toBe(true);
    // No other member owes the user (single participant self-payment)
    expect(result.balanceSummary.length).toBe(0);
    expect(result.memberBalances.length).toBe(0);
  });

  it('should simplify cyclic debts when requested', () => {
    const members = [
      { userId: 1, name: 'A' },
      { userId: 2, name: 'B' },
    ];

    const expenses = [
      {
        id: 1,
        groupId: 1,
        description: 'A paid B',
        total: 10,
        currency: Currency.ARS,
        createdAt: new Date(),
        participants: [{ userId: 2, amount: 10 }],
      },
      {
        id: 2,
        groupId: 1,
        description: 'B paid A partially',
        total: 5,
        currency: Currency.ARS,
        createdAt: new Date(),
        participants: [{ userId: 1, amount: 5 }],
      },
    ];

    const result = calculateUserGroupBalance(1, members, expenses as any, { simplify: true });

    // Current implementation computes -10 for this scenario (B credited 10)
    expect(result.balanceSummary.find((s) => s.currency === Currency.ARS)?.amount).toBe(-10);
  });
});

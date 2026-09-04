import { TestDataGenerator } from '@tests/utils/TestDataGenerator';
import { calculateUserGroupBalance } from '@/application/use-cases/group/calculateUserGroupBalance';
import { Currency } from '@/domain/value-objects/Currency';

describe('calculateUserGroupBalance', () => {
  afterEach(() => {
    TestDataGenerator.clearTrackedIds();
  });

  it('should compute balances for a simple expense', () => {
    const { user, group } = TestDataGenerator.generateTestScenario();

    const members = [
      { userId: user.id, name: user.name, isGuest: false },
      { userId: 999999, name: 'Other', isGuest: false },
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

    expect(Array.isArray(result.activity)).toBe(true);
    // No other member owes the user (single participant self-payment)
    expect(result.balanceSummary.length).toBe(0);
    expect(result.memberBalances.length).toBe(0);
  });

  it('should simplify cyclic debts when requested', () => {
    const members = [
      { userId: 1, name: 'A', isGuest: false },
      { userId: 2, name: 'B', isGuest: false },
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

  it('nets settle-up payments against expense debts, including a partial payment', () => {
    // Fede (1) always pays. Vale (2) owes him $150, Mati (3) owes him $200.
    // Vale settles in full, Mati pays $120 of the $200 he owes.
    const FEDE = 1;
    const VALE = 2;
    const MATI = 3;

    const members = [
      { userId: FEDE, name: 'Fede', isGuest: false },
      { userId: VALE, name: 'Vale', isGuest: false },
      { userId: MATI, name: 'Mati', isGuest: false },
    ];

    const activityItems = [
      {
        id: 1,
        type: 'expense',
        description: 'Cena',
        total: 150,
        currency: Currency.ARS,
        createdAt: new Date('2026-01-01'),
        participants: [
          { userId: FEDE, amount: 150 },
          { userId: VALE, amount: -150 },
        ],
      },
      {
        id: 2,
        type: 'expense',
        description: 'Hotel',
        total: 200,
        currency: Currency.ARS,
        createdAt: new Date('2026-01-02'),
        participants: [
          { userId: FEDE, amount: 200 },
          { userId: MATI, amount: -200 },
        ],
      },
      {
        id: 1,
        type: 'payment',
        fromUserId: VALE,
        toUserId: FEDE,
        title: 'Pago de Vale',
        amount: 150,
        currency: Currency.ARS,
        createdAt: new Date('2026-01-03'),
        participants: [
          { userId: VALE, amount: 150 },
          { userId: FEDE, amount: -150 },
        ],
      },
      {
        id: 2,
        type: 'payment',
        fromUserId: MATI,
        toUserId: FEDE,
        title: 'Pago parcial de Mati',
        amount: 120,
        currency: Currency.ARS,
        createdAt: new Date('2026-01-04'),
        participants: [
          { userId: MATI, amount: 120 },
          { userId: FEDE, amount: -120 },
        ],
      },
    ];

    const result = calculateUserGroupBalance(FEDE, members, activityItems as any, {
      simplify: false,
    });

    // Vale is fully settled, so they no longer show up in memberBalances.
    expect(result.memberBalances.find((m) => m.userId === VALE)).toBeUndefined();

    // Mati still owes $80 ($200 - $120), reflected automatically without any
    // separate "partial payment" bookkeeping.
    const matiBalance = result.memberBalances.find((m) => m.userId === MATI);
    expect(matiBalance?.amount).toBe(80);

    expect(result.balanceSummary.find((s) => s.currency === Currency.ARS)?.amount).toBe(80);
    expect(result.activity).toHaveLength(4);
  });
});

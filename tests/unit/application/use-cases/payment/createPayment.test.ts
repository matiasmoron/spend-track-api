import { TestDataGenerator } from '@tests/utils/TestDataGenerator';
import { createPayment } from '@/application/use-cases/payment/CreatePayment';
import type { UserGroupWithUserName } from '@/domain/entities/group/UserGroup';
import type { Payment as PaymentEntity } from '@/domain/entities/payment/Payment';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { PaymentRepository } from '@/domain/repositories/payment/PaymentRepository';
import { Currency } from '@/domain/value-objects';

describe('createPayment use-case', () => {
  let testData: ReturnType<typeof TestDataGenerator.generateTestScenario>;

  const OTHER_USER_ID = 424242;

  beforeEach(() => {
    jest.clearAllMocks();
    testData = TestDataGenerator.generateTestScenario();
  });

  afterEach(() => {
    TestDataGenerator.clearTrackedIds();
  });

  const buildDeps = (groupMembers: UserGroupWithUserName[]) => {
    const mockPaymentRepo: jest.Mocked<PaymentRepository> = {
      create: jest.fn().mockImplementation((payment: PaymentEntity) =>
        Promise.resolve({ ...payment, id: 1 })
      ),
      update: jest.fn(),
      findByGroupId: jest.fn(),
      findByGroupIds: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const mockUserGroupRepo: jest.Mocked<UserGroupRepository> = {
      addUserToGroup: jest.fn(),
      findByGroupId: jest.fn().mockResolvedValue(groupMembers),
      findByGroupIds: jest.fn(),
      findByUserId: jest.fn(),
      getUserGroups: jest.fn(),
      isUserInGroup: jest.fn(),
      save: jest.fn(),
      reassignUser: jest.fn(),
    };

    return { mockPaymentRepo, mockUserGroupRepo };
  };

  it('creates a payment when input is valid', async () => {
    const { group, user } = testData;

    const groupMembers: UserGroupWithUserName[] = [
      { id: 1, groupId: group.id, userId: user.id, userName: user.name, isGuest: false },
      { id: 2, groupId: group.id, userId: OTHER_USER_ID, userName: 'Other', isGuest: false },
    ];
    const { mockPaymentRepo, mockUserGroupRepo } = buildDeps(groupMembers);

    const result = await createPayment(
      {
        groupId: group.id,
        userId: user.id,
        fromUserId: OTHER_USER_ID,
        toUserId: user.id,
        amount: 120,
        currency: Currency.ARS,
        title: 'Pago parcial',
        clientRequestId: '11111111-1111-4111-8111-111111111111',
      },
      { paymentRepository: mockPaymentRepo, userGroupRepository: mockUserGroupRepo }
    );

    expect(mockPaymentRepo.create).toHaveBeenCalled();
    expect(result.id).toBe(1);
    expect(result.amount).toBe(120);
  });

  it('throws when fromUserId equals toUserId', async () => {
    const { group, user } = testData;
    const groupMembers: UserGroupWithUserName[] = [
      { id: 1, groupId: group.id, userId: user.id, userName: user.name, isGuest: false },
    ];
    const { mockPaymentRepo, mockUserGroupRepo } = buildDeps(groupMembers);

    await expect(
      createPayment(
        {
          groupId: group.id,
          userId: user.id,
          fromUserId: user.id,
          toUserId: user.id,
          amount: 50,
          currency: Currency.ARS,
          title: 'Pago',
          clientRequestId: '22222222-2222-4222-8222-222222222222',
        },
        { paymentRepository: mockPaymentRepo, userGroupRepository: mockUserGroupRepo }
      )
    ).rejects.toThrow('fromUserId and toUserId must be different');
  });

  it('throws when amount is not greater than 0', async () => {
    const { group, user } = testData;
    const groupMembers: UserGroupWithUserName[] = [
      { id: 1, groupId: group.id, userId: user.id, userName: user.name, isGuest: false },
      { id: 2, groupId: group.id, userId: OTHER_USER_ID, userName: 'Other', isGuest: false },
    ];
    const { mockPaymentRepo, mockUserGroupRepo } = buildDeps(groupMembers);

    await expect(
      createPayment(
        {
          groupId: group.id,
          userId: user.id,
          fromUserId: user.id,
          toUserId: OTHER_USER_ID,
          amount: 0,
          currency: Currency.ARS,
          title: 'Pago',
          clientRequestId: '33333333-3333-4333-8333-333333333333',
        },
        { paymentRepository: mockPaymentRepo, userGroupRepository: mockUserGroupRepo }
      )
    ).rejects.toThrow('Amount must be greater than 0');
  });

  it('throws when fromUserId or toUserId does not belong to the group', async () => {
    const { group, user } = testData;
    const groupMembers: UserGroupWithUserName[] = [
      { id: 1, groupId: group.id, userId: user.id, userName: user.name, isGuest: false },
    ];
    const { mockPaymentRepo, mockUserGroupRepo } = buildDeps(groupMembers);

    await expect(
      createPayment(
        {
          groupId: group.id,
          userId: user.id,
          fromUserId: user.id,
          toUserId: 9999999,
          amount: 50,
          currency: Currency.ARS,
          title: 'Pago',
          clientRequestId: '44444444-4444-4444-8444-444444444444',
        },
        { paymentRepository: mockPaymentRepo, userGroupRepository: mockUserGroupRepo }
      )
    ).rejects.toThrow('fromUserId and toUserId must belong to the group');

    expect(mockPaymentRepo.create).not.toHaveBeenCalled();
  });
});

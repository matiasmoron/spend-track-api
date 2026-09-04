import { TestDataGenerator } from '@tests/utils/TestDataGenerator';
import { AppError } from '@/application/errors/AppError';
import { updatePayment } from '@/application/use-cases/payment/UpdatePayment';
import type { UserGroupWithUserName } from '@/domain/entities/group/UserGroup';
import type { Payment as PaymentEntity } from '@/domain/entities/payment/Payment';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { PaymentRepository } from '@/domain/repositories/payment/PaymentRepository';
import { Currency } from '@/domain/value-objects';

describe('updatePayment use-case', () => {
  let testData: ReturnType<typeof TestDataGenerator.generateTestScenario>;

  const OTHER_USER_ID = 424242;
  const EXISTING_PAYMENT_ID = 777;

  beforeEach(() => {
    jest.clearAllMocks();
    testData = TestDataGenerator.generateTestScenario();
  });

  afterEach(() => {
    TestDataGenerator.clearTrackedIds();
  });

  const buildDeps = (
    groupMembers: UserGroupWithUserName[],
    existingPayment: PaymentEntity | null
  ) => {
    const mockPaymentRepo: jest.Mocked<PaymentRepository> = {
      create: jest.fn(),
      update: jest
        .fn()
        .mockImplementation((payment: PaymentEntity) => Promise.resolve(payment)),
      findByGroupId: jest.fn(),
      findByGroupIds: jest.fn(),
      findById: jest.fn().mockResolvedValue(existingPayment),
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

  it('updates a payment when input is valid', async () => {
    const { group, user } = testData;

    const groupMembers: UserGroupWithUserName[] = [
      { id: 1, groupId: group.id, userId: user.id, userName: user.name, isGuest: false },
      { id: 2, groupId: group.id, userId: OTHER_USER_ID, userName: 'Other', isGuest: false },
    ];
    const existingPayment = {
      id: EXISTING_PAYMENT_ID,
      groupId: group.id,
      fromUserId: OTHER_USER_ID,
      toUserId: user.id,
      amount: 120,
      currency: Currency.ARS,
      title: 'Pago viejo',
      createdAt: new Date('2026-01-01'),
    } as PaymentEntity;
    const { mockPaymentRepo, mockUserGroupRepo } = buildDeps(groupMembers, existingPayment);

    const result = await updatePayment(
      {
        paymentId: EXISTING_PAYMENT_ID,
        userId: user.id,
        fromUserId: OTHER_USER_ID,
        toUserId: user.id,
        amount: 200,
        currency: Currency.ARS,
        title: 'Pago corregido',
      },
      { paymentRepository: mockPaymentRepo, userGroupRepository: mockUserGroupRepo }
    );

    expect(mockPaymentRepo.update).toHaveBeenCalled();
    expect(result.amount).toBe(200);
  });

  it('throws 404 when payment not found', async () => {
    const { user } = testData;
    const { mockPaymentRepo, mockUserGroupRepo } = buildDeps([], null);

    await expect(
      updatePayment(
        {
          paymentId: 9999999,
          userId: user.id,
          fromUserId: user.id,
          toUserId: OTHER_USER_ID,
          amount: 50,
          currency: Currency.ARS,
          title: 'Pago',
        },
        { paymentRepository: mockPaymentRepo, userGroupRepository: mockUserGroupRepo }
      )
    ).rejects.toThrow(new AppError('Payment not found', 404));
  });

  it('throws when fromUserId equals toUserId', async () => {
    const { group, user } = testData;
    const groupMembers: UserGroupWithUserName[] = [
      { id: 1, groupId: group.id, userId: user.id, userName: user.name, isGuest: false },
    ];
    const existingPayment = {
      id: EXISTING_PAYMENT_ID,
      groupId: group.id,
      fromUserId: user.id,
      toUserId: OTHER_USER_ID,
      amount: 50,
      currency: Currency.ARS,
      title: 'Pago',
      createdAt: new Date(),
    } as PaymentEntity;
    const { mockPaymentRepo, mockUserGroupRepo } = buildDeps(groupMembers, existingPayment);

    await expect(
      updatePayment(
        {
          paymentId: EXISTING_PAYMENT_ID,
          userId: user.id,
          fromUserId: user.id,
          toUserId: user.id,
          amount: 50,
          currency: Currency.ARS,
          title: 'Pago',
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
    const existingPayment = {
      id: EXISTING_PAYMENT_ID,
      groupId: group.id,
      fromUserId: user.id,
      toUserId: OTHER_USER_ID,
      amount: 50,
      currency: Currency.ARS,
      title: 'Pago',
      createdAt: new Date(),
    } as PaymentEntity;
    const { mockPaymentRepo, mockUserGroupRepo } = buildDeps(groupMembers, existingPayment);

    await expect(
      updatePayment(
        {
          paymentId: EXISTING_PAYMENT_ID,
          userId: user.id,
          fromUserId: user.id,
          toUserId: OTHER_USER_ID,
          amount: 0,
          currency: Currency.ARS,
          title: 'Pago',
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
    const existingPayment = {
      id: EXISTING_PAYMENT_ID,
      groupId: group.id,
      fromUserId: user.id,
      toUserId: OTHER_USER_ID,
      amount: 50,
      currency: Currency.ARS,
      title: 'Pago',
      createdAt: new Date(),
    } as PaymentEntity;
    const { mockPaymentRepo, mockUserGroupRepo } = buildDeps(groupMembers, existingPayment);

    await expect(
      updatePayment(
        {
          paymentId: EXISTING_PAYMENT_ID,
          userId: user.id,
          fromUserId: user.id,
          toUserId: 9999999,
          amount: 50,
          currency: Currency.ARS,
          title: 'Pago',
        },
        { paymentRepository: mockPaymentRepo, userGroupRepository: mockUserGroupRepo }
      )
    ).rejects.toThrow('fromUserId and toUserId must belong to the group');

    expect(mockPaymentRepo.update).not.toHaveBeenCalled();
  });
});

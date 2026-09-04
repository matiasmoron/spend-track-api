import { TestDataGenerator } from '@tests/utils/TestDataGenerator';
import { AppError } from '@/application/errors/AppError';
import { deletePayment } from '@/application/use-cases/payment/DeletePayment';
import type { Payment as PaymentEntity } from '@/domain/entities/payment/Payment';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { PaymentRepository } from '@/domain/repositories/payment/PaymentRepository';
import { Currency } from '@/domain/value-objects';

describe('deletePayment use-case', () => {
  let testData: ReturnType<typeof TestDataGenerator.generateTestScenario>;

  const PAYMENT_ID = 555;

  beforeEach(() => {
    jest.clearAllMocks();
    testData = TestDataGenerator.generateTestScenario();
  });

  afterEach(() => {
    TestDataGenerator.clearTrackedIds();
  });

  it('deletes a payment when the user belongs to the group', async () => {
    const { group, user } = testData;

    const payment = {
      id: PAYMENT_ID,
      groupId: group.id,
      fromUserId: user.id,
      toUserId: 424242,
      amount: 100,
      currency: Currency.ARS,
      title: 'Pago',
      createdAt: new Date(),
    } as PaymentEntity;

    const mockPaymentRepo: jest.Mocked<PaymentRepository> = {
      create: jest.fn(),
      update: jest.fn(),
      findByGroupId: jest.fn(),
      findByGroupIds: jest.fn(),
      findById: jest.fn().mockResolvedValue(payment),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const mockUserGroupRepo: jest.Mocked<UserGroupRepository> = {
      addUserToGroup: jest.fn(),
      findByGroupId: jest.fn(),
      findByGroupIds: jest.fn(),
      findByUserId: jest.fn().mockResolvedValue([{ groupId: group.id, userId: user.id } as any]),
      getUserGroups: jest.fn(),
      isUserInGroup: jest.fn(),
      save: jest.fn(),
      reassignUser: jest.fn(),
    };

    await deletePayment(
      { paymentId: PAYMENT_ID, userId: user.id },
      { paymentRepository: mockPaymentRepo, userGroupRepository: mockUserGroupRepo }
    );

    expect(mockPaymentRepo.findById).toHaveBeenCalledWith(PAYMENT_ID);
    expect(mockPaymentRepo.delete).toHaveBeenCalledWith(PAYMENT_ID);
  });

  it('throws 404 when payment not found', async () => {
    const { user } = testData;

    const mockPaymentRepo: jest.Mocked<PaymentRepository> = {
      create: jest.fn(),
      update: jest.fn(),
      findByGroupId: jest.fn(),
      findByGroupIds: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      delete: jest.fn(),
    };

    const mockUserGroupRepo: jest.Mocked<UserGroupRepository> = {
      addUserToGroup: jest.fn(),
      findByGroupId: jest.fn(),
      findByGroupIds: jest.fn(),
      findByUserId: jest.fn(),
      getUserGroups: jest.fn(),
      isUserInGroup: jest.fn(),
      save: jest.fn(),
      reassignUser: jest.fn(),
    };

    await expect(
      deletePayment(
        { paymentId: 9999999, userId: user.id },
        { paymentRepository: mockPaymentRepo, userGroupRepository: mockUserGroupRepo }
      )
    ).rejects.toThrow(new AppError('Payment not found', 404));
  });

  it('throws 403 when the user does not belong to the group', async () => {
    const { group, user } = testData;

    const payment = {
      id: PAYMENT_ID,
      groupId: group.id,
      fromUserId: 424242,
      toUserId: 434343,
      amount: 100,
      currency: Currency.ARS,
      title: 'Pago',
      createdAt: new Date(),
    } as PaymentEntity;

    const mockPaymentRepo: jest.Mocked<PaymentRepository> = {
      create: jest.fn(),
      update: jest.fn(),
      findByGroupId: jest.fn(),
      findByGroupIds: jest.fn(),
      findById: jest.fn().mockResolvedValue(payment),
      delete: jest.fn(),
    };

    const mockUserGroupRepo: jest.Mocked<UserGroupRepository> = {
      addUserToGroup: jest.fn(),
      findByGroupId: jest.fn(),
      findByGroupIds: jest.fn(),
      findByUserId: jest.fn().mockResolvedValue([]),
      getUserGroups: jest.fn(),
      isUserInGroup: jest.fn(),
      save: jest.fn(),
      reassignUser: jest.fn(),
    };

    await expect(
      deletePayment(
        { paymentId: PAYMENT_ID, userId: user.id },
        { paymentRepository: mockPaymentRepo, userGroupRepository: mockUserGroupRepo }
      )
    ).rejects.toThrow(new AppError('You do not have permission to delete this payment', 403));

    expect(mockPaymentRepo.delete).not.toHaveBeenCalled();
  });
});

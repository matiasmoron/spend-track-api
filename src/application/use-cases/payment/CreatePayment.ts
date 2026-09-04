import { AppError } from '@/application/errors';
import { getGroupMembers } from '@/application/use-cases/group/GetGroupMembers';
import { Payment } from '@/domain/entities/payment/Payment';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { PaymentRepository } from '@/domain/repositories/payment/PaymentRepository';
import { Currency } from '@/domain/value-objects';

export interface CreatePaymentInput {
  groupId: number;
  userId: number;
  fromUserId: number;
  toUserId: number;
  amount: number;
  currency: Currency;
  title: string;
  description?: string;
  createdAt?: Date;
  clientRequestId: string;
}

export async function createPayment(
  input: CreatePaymentInput,
  deps: {
    paymentRepository: PaymentRepository;
    userGroupRepository: UserGroupRepository;
  }
): Promise<Payment> {
  const { paymentRepository, userGroupRepository } = deps;
  const {
    groupId,
    userId,
    fromUserId,
    toUserId,
    amount,
    currency,
    title,
    description,
    createdAt,
    clientRequestId,
  } = input;

  if (fromUserId === toUserId) {
    throw new AppError('fromUserId and toUserId must be different', 400);
  }

  if (amount <= 0) {
    throw new AppError('Amount must be greater than 0', 400);
  }

  // Validates the requesting user belongs to the group, and returns all members
  const groupMembers = await getGroupMembers({ groupId, userId }, { userGroupRepository });

  const belongsToGroup = (id: number) => groupMembers.some((member) => member.userId === id);
  if (!belongsToGroup(fromUserId) || !belongsToGroup(toUserId)) {
    throw new AppError('fromUserId and toUserId must belong to the group', 400);
  }

  const payment = new Payment({
    id: 0,
    groupId,
    fromUserId,
    toUserId,
    amount,
    currency,
    title,
    description,
    createdAt: createdAt ?? new Date(),
    clientRequestId,
  });

  return paymentRepository.create(payment);
}

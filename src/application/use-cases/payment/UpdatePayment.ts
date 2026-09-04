import { AppError } from '@/application/errors';
import { getGroupMembers } from '@/application/use-cases/group/GetGroupMembers';
import { Payment } from '@/domain/entities/payment/Payment';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { PaymentRepository } from '@/domain/repositories/payment/PaymentRepository';
import { Currency } from '@/domain/value-objects';

export interface UpdatePaymentInput {
  paymentId: number;
  userId: number;
  fromUserId: number;
  toUserId: number;
  amount: number;
  currency: Currency;
  title: string;
  description?: string;
  createdAt?: Date;
}

export async function updatePayment(
  input: UpdatePaymentInput,
  deps: {
    paymentRepository: PaymentRepository;
    userGroupRepository: UserGroupRepository;
  }
): Promise<Payment> {
  const { paymentRepository, userGroupRepository } = deps;
  const { paymentId, userId, fromUserId, toUserId, amount, currency, title, description, createdAt } =
    input;

  const existingPayment = await paymentRepository.findById(paymentId);
  if (!existingPayment) {
    throw new AppError('Payment not found', 404);
  }

  if (fromUserId === toUserId) {
    throw new AppError('fromUserId and toUserId must be different', 400);
  }

  if (amount <= 0) {
    throw new AppError('Amount must be greater than 0', 400);
  }

  const groupMembers = await getGroupMembers(
    { groupId: existingPayment.groupId, userId },
    { userGroupRepository }
  );

  const belongsToGroup = (id: number) => groupMembers.some((member) => member.userId === id);
  if (!belongsToGroup(fromUserId) || !belongsToGroup(toUserId)) {
    throw new AppError('fromUserId and toUserId must belong to the group', 400);
  }

  const payment = new Payment({
    id: paymentId,
    groupId: existingPayment.groupId,
    fromUserId,
    toUserId,
    amount,
    currency,
    title,
    description,
    createdAt: createdAt ?? existingPayment.createdAt,
    clientRequestId: existingPayment.clientRequestId,
  });

  return paymentRepository.update(payment);
}

import { AppError } from '@/application/errors';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';
import { PaymentRepository } from '@/domain/repositories/payment/PaymentRepository';

export interface DeletePaymentInput {
  paymentId: number;
  userId: number;
}

export async function deletePayment(
  input: DeletePaymentInput,
  deps: {
    paymentRepository: PaymentRepository;
    userGroupRepository: UserGroupRepository;
  }
): Promise<void> {
  const { paymentRepository, userGroupRepository } = deps;
  const { paymentId, userId } = input;

  const payment = await paymentRepository.findById(paymentId);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  const userGroups = await userGroupRepository.findByUserId(userId);
  const userBelongsToGroup = userGroups.some((ug) => ug.groupId === payment.groupId);

  if (!userBelongsToGroup) {
    throw new AppError('You do not have permission to delete this payment', 403);
  }

  await paymentRepository.delete(paymentId);
}

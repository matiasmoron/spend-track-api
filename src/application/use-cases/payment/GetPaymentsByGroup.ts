import { PaymentRepository } from '@/domain/repositories/payment/PaymentRepository';
import { Currency } from '@/domain/value-objects';

export interface PaymentDetail {
  id: number;
  fromUserId: number;
  toUserId: number;
  amount: number;
  currency: Currency;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GetPaymentsByGroupInput {
  groupId: number;
}

/**
 * Functional use-case: fetch all payments recorded for a given group.
 */
export const getPaymentsByGroup = async (
  input: GetPaymentsByGroupInput,
  deps: {
    paymentRepository: PaymentRepository;
  }
): Promise<PaymentDetail[]> => {
  const { paymentRepository } = deps;
  const payments = await paymentRepository.findByGroupId(input.groupId);

  return payments.map((p) => ({
    id: p.id,
    fromUserId: p.fromUserId,
    toUserId: p.toUserId,
    amount: p.amount,
    currency: p.currency,
    title: p.title,
    description: p.description,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
};

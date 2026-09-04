import { Payment } from '../../entities/payment/Payment';

export interface PaymentRepository {
  create(payment: Payment): Promise<Payment>;
  update(payment: Payment): Promise<Payment>;
  findByGroupId(groupId: number): Promise<Payment[]>;
  findByGroupIds(groupIds: number[]): Promise<Payment[]>;
  findById(id: number): Promise<Payment | null>;
  delete(id: number): Promise<void>;
}

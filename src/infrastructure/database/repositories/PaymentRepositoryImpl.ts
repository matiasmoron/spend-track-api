import { In, QueryFailedError, Repository } from 'typeorm';
import { Payment } from '../../../domain/entities/payment/Payment';
import { PaymentRepository } from '../../../domain/repositories/payment/PaymentRepository';
import { AppDataSource } from '../../../infrastructure/database/DataSource';
import {
  PAYMENT_CLIENT_REQUEST_ID_CONSTRAINT,
  PaymentModel,
} from '../../../infrastructure/database/models/PaymentModel';

const POSTGRES_UNIQUE_VIOLATION = '23505';

function isClientRequestIdConflict(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) return false;
  const driverError = (
    error as QueryFailedError & { driverError?: { code?: string; constraint?: string } }
  ).driverError;
  return (
    driverError?.code === POSTGRES_UNIQUE_VIOLATION &&
    driverError?.constraint === PAYMENT_CLIENT_REQUEST_ID_CONSTRAINT
  );
}

export class PaymentRepositoryImpl implements PaymentRepository {
  private ormRepo: Repository<PaymentModel>;

  constructor() {
    this.ormRepo = AppDataSource.getRepository(PaymentModel);
  }

  async create(payment: Payment): Promise<Payment> {
    if (payment.clientRequestId) {
      const existing = await this.ormRepo.findOneBy({ clientRequestId: payment.clientRequestId });
      if (existing) {
        return this.toDomainPayment(existing);
      }
    }

    try {
      const saved = await this.ormRepo.save({
        groupId: payment.groupId,
        fromUserId: payment.fromUserId,
        toUserId: payment.toUserId,
        amount: payment.amount,
        currency: payment.currency,
        title: payment.title,
        description: payment.description,
        createdAt: payment.createdAt,
        clientRequestId: payment.clientRequestId,
      });

      return this.toDomainPayment(saved);
    } catch (error) {
      // Another concurrent request may have already inserted the same
      // clientRequestId between our pre-check and this insert.
      if (isClientRequestIdConflict(error) && payment.clientRequestId) {
        const winner = await this.ormRepo.findOneBy({ clientRequestId: payment.clientRequestId });
        if (winner) {
          return this.toDomainPayment(winner);
        }
      }
      throw error;
    }
  }

  async update(payment: Payment): Promise<Payment> {
    const saved = await this.ormRepo.save({
      id: payment.id,
      groupId: payment.groupId,
      fromUserId: payment.fromUserId,
      toUserId: payment.toUserId,
      amount: payment.amount,
      currency: payment.currency,
      title: payment.title,
      description: payment.description,
      createdAt: payment.createdAt,
    });

    return this.toDomainPayment(saved);
  }

  async findByGroupId(groupId: number): Promise<Payment[]> {
    const records = await this.ormRepo.find({
      where: { groupId },
      order: { createdAt: 'DESC' },
    });
    return records.map((r) => this.toDomainPayment(r));
  }

  async findByGroupIds(groupIds: number[]): Promise<Payment[]> {
    if (groupIds.length === 0) return [];
    const records = await this.ormRepo.find({
      where: { groupId: In(groupIds) },
      order: { createdAt: 'DESC' },
    });
    return records.map((r) => this.toDomainPayment(r));
  }

  async findById(id: number): Promise<Payment | null> {
    const record = await this.ormRepo.findOne({ where: { id } });
    if (!record) return null;
    return this.toDomainPayment(record);
  }

  async delete(id: number): Promise<void> {
    await this.ormRepo.delete({ id });
  }

  private toDomainPayment(record: PaymentModel): Payment {
    return new Payment({
      id: record.id,
      groupId: record.groupId,
      fromUserId: record.fromUserId,
      toUserId: record.toUserId,
      amount: record.amount,
      currency: record.currency,
      title: record.title,
      description: record.description,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      clientRequestId: record.clientRequestId,
    });
  }
}

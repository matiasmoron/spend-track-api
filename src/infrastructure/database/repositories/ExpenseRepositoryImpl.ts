import { In, QueryFailedError, Repository } from 'typeorm';
import { Expense } from '../../../domain/entities/expense/Expense';
import { ExpenseParticipant } from '../../../domain/entities/expense/ExpenseParticipant';
import { ExpenseRepository } from '../../../domain/repositories/expense/ExpenseRepository';
import { AppDataSource } from '../../../infrastructure/database/DataSource';
import {
  EXPENSE_CLIENT_REQUEST_ID_CONSTRAINT,
  ExpenseModel,
} from '../../../infrastructure/database/models/ExpenseModel';
import { ExpenseParticipantModel } from '../../../infrastructure/database/models/ExpenseParticipantModel';

const POSTGRES_UNIQUE_VIOLATION = '23505';

function isClientRequestIdConflict(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) return false;
  const driverError = (error as QueryFailedError & { driverError?: { code?: string; constraint?: string } })
    .driverError;
  return (
    driverError?.code === POSTGRES_UNIQUE_VIOLATION &&
    driverError?.constraint === EXPENSE_CLIENT_REQUEST_ID_CONSTRAINT
  );
}

export class ExpenseRepositoryImpl implements ExpenseRepository {
  private ormRepo: Repository<ExpenseModel>;

  constructor() {
    this.ormRepo = AppDataSource.getRepository(ExpenseModel);
  }

  async create(expense: Expense, participants: ExpenseParticipant[]): Promise<Expense> {
    if (expense.clientRequestId) {
      const existing = await this.ormRepo.findOneBy({ clientRequestId: expense.clientRequestId });
      if (existing) {
        return this.toDomainExpense(existing);
      }
    }

    try {
      return await AppDataSource.transaction(async (manager) => {
        const expenseRepo = manager.getRepository(ExpenseModel);
        const participantRepo = manager.getRepository(ExpenseParticipantModel);

        const savedExpense = await expenseRepo.save({
          groupId: expense.groupId,
          description: expense.description,
          total: expense.total,
          currency: expense.currency,
          createdAt: expense.createdAt,
          clientRequestId: expense.clientRequestId,
        });

        const participantEntities = participants.map((p) =>
          participantRepo.create({
            expenseId: savedExpense.id,
            userId: p.userId,
            amount: p.amount,
          })
        );

        await participantRepo.save(participantEntities);

        return new Expense({
          ...expense,
          id: savedExpense.id,
        });
      });
    } catch (error) {
      // AppDataSource.transaction() has already rolled back by the time we get here,
      // so this fallback lookup runs on a fresh, non-transactional connection.
      if (isClientRequestIdConflict(error) && expense.clientRequestId) {
        const winner = await this.ormRepo.findOneBy({ clientRequestId: expense.clientRequestId });
        if (winner) {
          return this.toDomainExpense(winner);
        }
      }
      throw error;
    }
  }

  private toDomainExpense(record: ExpenseModel): Expense {
    return new Expense({
      id: record.id,
      groupId: record.groupId,
      description: record.description,
      total: record.total,
      currency: record.currency,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      clientRequestId: record.clientRequestId,
    });
  }

  async findByGroupIds(groupIds: number[]): Promise<Expense[]> {
    if (groupIds.length === 0) return [];
    const records = await this.ormRepo.find({
      where: { groupId: In(groupIds) },
      order: { createdAt: 'DESC' },
    });
    return records.map(
      (r) =>
        new Expense({
          id: r.id,
          groupId: r.groupId,
          description: r.description,
          total: r.total,
          currency: r.currency,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })
    );
  }

  /**
   * Fetch all expenses for a given group
   */
  async findByGroupId(groupId: number): Promise<Expense[]> {
    const records = await this.ormRepo.find({
      where: { groupId },
      order: { createdAt: 'DESC' },
    });
    return records.map(
      (r) =>
        new Expense({
          id: r.id,
          groupId: r.groupId,
          description: r.description,
          total: r.total,
          currency: r.currency,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })
    );
  }

  /**
   * Find expense by ID
   */
  async findById(id: number): Promise<Expense | null> {
    const record = await this.ormRepo.findOne({ where: { id } });
    if (!record) {
      return null;
    }

    return new Expense({
      id: record.id,
      groupId: record.groupId,
      description: record.description,
      total: record.total,
      currency: record.currency,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  /**
   * Update expense and its participants in a transaction
   */
  async update(expense: Expense, participants: ExpenseParticipant[]): Promise<Expense> {
    return await AppDataSource.transaction(async (manager) => {
      const expenseRepo = manager.getRepository(ExpenseModel);
      const participantRepo = manager.getRepository(ExpenseParticipantModel);

      // Update the expense
      await expenseRepo.update(expense.id, {
        groupId: expense.groupId,
        description: expense.description,
        total: expense.total,
        currency: expense.currency,
        createdAt: expense.createdAt,
      });

      // Delete existing participants
      await participantRepo.delete({ expenseId: expense.id });

      // Create new participants
      const participantEntities = participants.map((p) =>
        participantRepo.create({
          expenseId: expense.id,
          userId: p.userId,
          amount: p.amount,
        })
      );

      await participantRepo.save(participantEntities);

      // Return the updated expense
      return new Expense({
        ...expense,
      });
    });
  }

  /**
   * Delete expense and its participants in a transaction
   */
  async delete(id: number): Promise<void> {
    await AppDataSource.transaction(async (manager) => {
      const expenseRepo = manager.getRepository(ExpenseModel);
      const participantRepo = manager.getRepository(ExpenseParticipantModel);

      // First delete all participants
      await participantRepo.delete({ expenseId: id });

      // Then delete the expense
      await expenseRepo.delete({ id });
    });
  }
}

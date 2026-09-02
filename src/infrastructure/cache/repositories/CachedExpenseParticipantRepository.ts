import { CacheService } from '../CacheService';
import { cacheKeys } from '../keys';
import { Expense, ExpenseParticipant } from '@/domain/entities/expense';
import { ExpenseParticipantRepository } from '@/domain/repositories/expense/ExpenseParticipantRepository';

export class CachedExpenseParticipantRepository implements ExpenseParticipantRepository {
  constructor(
    private readonly repo: ExpenseParticipantRepository,
    private readonly cache: CacheService
  ) {}

  // Not used directly (handled by ExpenseRepositoryImpl in a transaction)
  create(expense: Expense, participants: ExpenseParticipant[]): Promise<Expense> {
    return this.repo.create(expense, participants);
  }

  async findByExpenseId(expenseId: number): Promise<ExpenseParticipant[]> {
    const key = cacheKeys.expenseParticipants(expenseId);
    const cached = await this.cache.get<ExpenseParticipant[]>(key);
    if (cached !== null) return cached;

    const participants = await this.repo.findByExpenseId(expenseId);
    await this.cache.set(key, participants);
    return participants;
  }

  async findByExpenseIds(expenseIds: number[]): Promise<ExpenseParticipant[]> {
    // Multi-expense batch lookup — not heavily read, delegate without caching
    return this.repo.findByExpenseIds(expenseIds);
  }

  async reassignUser(fromUserId: number, toUserId: number): Promise<number[]> {
    const affectedExpenseIds = await this.repo.reassignUser(fromUserId, toUserId);
    await Promise.all(
      affectedExpenseIds.map((expenseId) =>
        this.cache.del(cacheKeys.expenseParticipants(expenseId))
      )
    );
    return affectedExpenseIds;
  }
}

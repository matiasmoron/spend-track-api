import { CacheService } from '../CacheService';
import { cacheKeys } from '../keys';
import { Expense } from '@/domain/entities/expense/Expense';
import { ExpenseParticipant } from '@/domain/entities/expense/ExpenseParticipant';
import { ExpenseRepository } from '@/domain/repositories/expense/ExpenseRepository';

export class CachedExpenseRepository implements ExpenseRepository {
  constructor(
    private readonly repo: ExpenseRepository,
    private readonly cache: CacheService
  ) {}

  async create(expense: Expense, participants: ExpenseParticipant[]): Promise<Expense> {
    const created = await this.repo.create(expense, participants);
    // Invalidate the group's expense list and the composite group-detail view
    await this.cache.del(
      cacheKeys.groupExpenses(expense.groupId),
      cacheKeys.groupDetails(expense.groupId)
    );
    return created;
  }

  async findByGroupId(groupId: number): Promise<Expense[]> {
    const key = cacheKeys.groupExpenses(groupId);
    const cached = await this.cache.get<Expense[]>(key);
    if (cached !== null) return cached;

    const expenses = await this.repo.findByGroupId(groupId);
    await this.cache.set(key, expenses);
    return expenses;
  }

  async findById(id: number): Promise<Expense | null> {
    // Single expense lookup is infrequent — delegate to real repo
    return this.repo.findById(id);
  }

  async update(expense: Expense, participants: ExpenseParticipant[]): Promise<Expense> {
    const updated = await this.repo.update(expense, participants);
    await this.cache.del(
      cacheKeys.groupExpenses(expense.groupId),
      cacheKeys.groupDetails(expense.groupId),
      cacheKeys.expenseParticipants(expense.id)
    );
    return updated;
  }

  async delete(id: number): Promise<void> {
    // Fetch the expense first to know its groupId for cache invalidation
    const expense = await this.repo.findById(id);
    await this.repo.delete(id);

    if (expense) {
      await this.cache.del(
        cacheKeys.groupExpenses(expense.groupId),
        cacheKeys.groupDetails(expense.groupId),
        cacheKeys.expenseParticipants(id)
      );
    }
  }
}

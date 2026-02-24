import { CacheService } from '../CacheService';
import { cacheKeys } from '../keys';
import { Group } from '@/domain/entities/group';
import { GroupRepository } from '@/domain/repositories/group/GroupRepository';

export class CachedGroupRepository implements GroupRepository {
  constructor(
    private readonly repo: GroupRepository,
    private readonly cache: CacheService
  ) {}

  async save(group: Partial<Group>): Promise<Group> {
    const saved = await this.repo.save(group);
    // Invalidate user-groups list for the owner if userId is present
    if (saved.id) {
      await this.cache.del(cacheKeys.groupDetails(saved.id));
    }
    return saved;
  }

  async findById(id: number): Promise<Group | null> {
    const key = cacheKeys.groupDetails(id);
    const cached = await this.cache.get<Group>(key);
    if (cached !== null) return cached;

    const group = await this.repo.findById(id);
    if (group !== null) {
      await this.cache.set(key, group);
    }
    return group;
  }

  async findByUserId(userId: number): Promise<Group[]> {
    const key = cacheKeys.userGroups(userId);
    const cached = await this.cache.get<Group[]>(key);
    if (cached !== null) return cached;

    const groups = await this.repo.findByUserId(userId);
    await this.cache.set(key, groups);
    return groups;
  }

  async delete(id: number): Promise<void> {
    // Fetch the group first so we can invalidate user-level keys if needed
    const group = await this.repo.findById(id);
    await this.repo.delete(id);

    // Invalidate all group-scoped keys
    await this.cache.invalidatePattern(cacheKeys.groupPattern(id));

    if (group) {
      // We don't store ownerId on Group directly, so invalidate by pattern is enough.
      // If you later store members in cache, their user:{id}:groups keys are invalidated
      // by CachedUserGroupRepository on membership mutations.
      await this.cache.del(cacheKeys.groupDetails(id));
    }
  }
}

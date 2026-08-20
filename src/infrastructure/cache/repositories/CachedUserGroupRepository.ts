import { CacheService } from '../CacheService';
import { cacheKeys } from '../keys';
import { UserGroup, UserGroupWithUserName } from '@/domain/entities/group';
import { UserGroupRepository } from '@/domain/repositories/group/UserGroupRepository';

export class CachedUserGroupRepository implements UserGroupRepository {
  constructor(
    private readonly repo: UserGroupRepository,
    private readonly cache: CacheService
  ) {}

  async addUserToGroup(userId: number, groupId: number): Promise<void> {
    await this.repo.addUserToGroup(userId, groupId);
    // Invalidate member list and the user's group list
    await this.cache.del(cacheKeys.groupMembers(groupId), cacheKeys.userGroups(userId));
    // Also invalidate the full group details composite cache
    await this.cache.del(cacheKeys.groupDetails(groupId));
  }

  async findByGroupId(groupId: number): Promise<UserGroupWithUserName[]> {
    const key = cacheKeys.groupMembers(groupId);
    const cached = await this.cache.get<UserGroupWithUserName[]>(key);
    if (cached !== null) return cached;

    const members = await this.repo.findByGroupId(groupId);
    await this.cache.set(key, members);
    return members;
  }

  async findByGroupIds(groupIds: number[]): Promise<UserGroupWithUserName[]> {
    // Multi-group batch lookup — not heavily read, delegate without caching
    return this.repo.findByGroupIds(groupIds);
  }

  async findByUserId(userId: number): Promise<UserGroup[]> {
    // Not heavily read — delegate to real repo without caching
    return this.repo.findByUserId(userId);
  }

  async getUserGroups(userId: number): Promise<number[]> {
    return this.repo.getUserGroups(userId);
  }

  async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
    return this.repo.isUserInGroup(userId, groupId);
  }

  async save(userGroup: Partial<UserGroup>): Promise<UserGroup> {
    const saved = await this.repo.save(userGroup);
    if (saved.groupId) {
      await this.cache.del(cacheKeys.groupMembers(saved.groupId));
      await this.cache.del(cacheKeys.groupDetails(saved.groupId));
    }
    if (saved.userId) {
      await this.cache.del(cacheKeys.userGroups(saved.userId));
    }
    return saved;
  }
}

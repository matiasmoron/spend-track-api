import Redis from 'ioredis';
import { log } from '@/shared/utils/log';

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

export class CacheService {
  constructor(private readonly client: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (err) {
      log.warn('[Cache] get error', key, (err as Error).message);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      log.warn('[Cache] set error', key, (err as Error).message);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await this.client.del(...keys);
    } catch (err) {
      log.warn('[Cache] del error', keys.join(', '), (err as Error).message);
    }
  }

  /**
   * Deletes all keys matching the given glob pattern (e.g. "group:5:*").
   * Uses SCAN to avoid blocking Redis.
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (err) {
      log.warn('[Cache] invalidatePattern error', pattern, (err as Error).message);
    }
  }
}

import Redis from 'ioredis';
import { log } from '@/shared/utils/log';

let redisClient: Redis | null = null;

export function initRedis(): Redis | null {
  const url = process.env.REDIS_URL;

  if (!url) {
    log.info('[Cache] REDIS_URL not set — caching disabled');
    return null;
  }

  const client = new Redis(url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      // Stop retrying after 3 attempts to avoid blocking startup
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });

  client.on('connect', () => log.success('[Cache] Redis connected'));
  client.on('error', (err: Error) => log.warn('[Cache] Redis error:', err.message));
  client.on('close', () => log.warn('[Cache] Redis connection closed'));

  redisClient = client;
  return client;
}

export function getRedisClient(): Redis | null {
  return redisClient;
}

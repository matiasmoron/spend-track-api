import dotenv from 'dotenv';
import app from './app';
import { initDI } from './config/di'; // import this to initialize the dependency injection container
import { CacheService } from './infrastructure/cache/CacheService';
import { initRedis } from './infrastructure/cache/RedisClient';

dotenv.config();

const PORT = process.env.PORT || 8081;

export async function init() {
  // Initialize Redis (returns null if REDIS_URL is not set)
  const redisClient = initRedis();
  const cache = redisClient ? new CacheService(redisClient) : null;

  try {
    await initDI(cache);
  } catch (error) {
    console.error('Error initializing dependency injection:', error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

void init();

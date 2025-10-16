import { AppDataSource } from '../infrastructure/database/DataSource';

export const initDB = async () => {
  if (AppDataSource.isInitialized) return AppDataSource;

  try {
    await AppDataSource.initialize();
    console.log('✅ DB connection initialized.');
  } catch (err) {
    console.error('❌ DB connection error:', err);
    throw err;
  }

  return AppDataSource;
};

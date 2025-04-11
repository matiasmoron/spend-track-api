import { AppDataSource } from '../infrastructure/database/DataSource';

export const initDB = async () => {
  if (AppDataSource.isInitialized) return AppDataSource;

  try {
    await AppDataSource.initialize();
    console.log('✅ DB connection initialized.');
  } catch (err) {
    console.error('❌ Error al inicializar la DB:', err);
    throw err;
  }

  return AppDataSource;
};

// export async function ensureDataSourceInitialized() {
//   if (!AppDataSource.isInitialized) {
//     await AppDataSource.initialize();
//   }
//   return AppDataSource;
// }

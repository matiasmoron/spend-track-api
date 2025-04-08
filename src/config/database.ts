import { AppDataSource } from '../infrastructure/database/DataSource';

export const initDB = async () => {
  await AppDataSource.initialize()
    .then(async () => {
      console.log('✅ DB connection initialized.');

      // const tables = await AppDataSource.query('SHOW TABLES');
      // console.log('📦 Tablas en la DB:', tables);
    })
    .catch((err) => {
      console.error('❌ Error al inicializar la DB:', err);
    });
};

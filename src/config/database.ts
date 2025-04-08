import { AppDataSource } from '../infrastructure/database/DataSource';

AppDataSource.initialize()
  .then(async () => {
    console.log('✅ DB connection initialized.');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const tables = await AppDataSource.query('SHOW TABLES');
    console.log('📦 Tablas en la DB:', tables);
  })
  .catch((err) => {
    console.error('❌ Error al inicializar la DB:', err);
  });

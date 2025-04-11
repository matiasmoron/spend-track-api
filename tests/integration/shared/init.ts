import app from '../../../src/app';
import { initDI } from '../../../src/config/di';
import { AppDataSource } from '../../../src/infrastructure/database/DataSource';

const PORT_DEFAULT = process.env.PORT_TEST || 8082;

export const initTestEnvironment = async ({ PORT = PORT_DEFAULT } = { PORT: PORT_DEFAULT }) => {
  await initDI();

  console.log('🧪 AppDataSource.isInitialized:', AppDataSource.isInitialized);

  const server = app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });

  return {
    server,
  };
};

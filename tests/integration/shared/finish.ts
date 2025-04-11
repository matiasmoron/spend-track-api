import { Server } from 'http';
import { AppDataSource } from '../../../src/infrastructure/database/DataSource';

export const finishTestEnvironment = async ({ server }: { server: Server }) => {
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => {
        console.log('🛑 Server closed');
        resolve();
      });
    });
  }

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    await new Promise((r) => setTimeout(r, 500)); // <- delay to ensure the complete close
  }

  console.log('🧪 AppDataSource closed:', !AppDataSource.isInitialized);
};

import { Server } from 'http';
import { initExpress } from '../../../src/config/express';

const PORT_DEFAULT = Number(process.env.PORT_TEST || 8082);

export class TestServerSingleton {
  private static instance: TestServerSingleton;
  private server: Server | null = null;
  private refCount = 0;
  private port: number = PORT_DEFAULT;
  private app = initExpress();

  private constructor() {}

  static getInstance(): TestServerSingleton {
    if (!TestServerSingleton.instance) {
      TestServerSingleton.instance = new TestServerSingleton();
    }
    return TestServerSingleton.instance;
  }

  async start(port = PORT_DEFAULT, showLogs = false): Promise<Server> {
    this.port = port;

    if (this.refCount === 0) {
      await new Promise<void>((resolve) => {
        this.server = this.app.listen(this.port, () => {
          console.log(`Test server running on port ${this.port}`);
          resolve();
        });
      });
    } else {
      if (showLogs) console.log('✅ Reusing existing server instance');
      this.refCount++;
    }

    return this.server;
  }

  async stop(showLogs = false): Promise<void> {
    this.refCount--;

    if (this.refCount <= 0 && this.server) {
      await new Promise<void>((resolve) => {
        this.server.close(() => {
          if (showLogs) console.log('🛑 Server closed');
          this.server = null;
          resolve();
        });
      });
    } else if (showLogs) {
      console.log(`⚠️ Server still in use by ${this.refCount} environment(s)`);
    }
  }
}

export const TestServerInstance = TestServerSingleton.getInstance();

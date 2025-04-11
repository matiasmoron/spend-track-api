import { randomUUID } from 'crypto';
import { Server } from 'http';
import request from 'supertest';
import app from '../../../src/app';
import { LoginOutput } from '../../../src/application/use-cases/user';
import { initDI } from '../../../src/config/di';
import { AppDataSource } from '../../../src/infrastructure/database/DataSource';
import { BaseResponse } from '../../../src/interfaces/http/types/BaseResponseTypes';

const PORT_DEFAULT = Number(process.env.PORT_TEST || 8082);

interface TestEnvironmentProps {
  port?: number;
  showLogs?: boolean;
}

export class TestEnvironment {
  token: string;
  readonly userName: string = `userName-${randomUUID()}`;
  readonly userEmail: string = `userEmail-${randomUUID()}@gmail.com`;
  private server: Server | null = null;
  private readonly showLogs: boolean;
  private readonly port: number;

  constructor(props: TestEnvironmentProps = {}) {
    this.showLogs = props.showLogs ?? false;
    this.port = props.port ?? PORT_DEFAULT;
  }

  private log(message: string) {
    if (this.showLogs) {
      console.log(message);
    }
  }

  private error(message: string, err: unknown) {
    if (this.showLogs) {
      console.error(message, err);
    }
  }

  async init(): Promise<void> {
    try {
      await initDI();

      this.log(`🧪 AppDataSource.isInitialized: ${AppDataSource.isInitialized}`);

      this.server = app.listen(this.port, () => {
        this.log(`✅ Server is running on port ${this.port}`);
      });
    } catch (err) {
      this.error('❌ Error initializing test environment:', err);
      throw err;
    }
  }

  async finish(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server.close(() => {
          this.log('🛑 Server closed');
          resolve();
        });
      });
    }

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      await new Promise((r) => setTimeout(r, 500)); // <- delay to ensure the complete close
      this.log('🛑 AppDataSource closed');
    }
  }

  async createTestUser(): Promise<void> {
    const password = 'fake_integration_test_password';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await request(app).post('/api/users/register').send({
      name: this.userName,
      email: this.userEmail,
      password,
    });

    // console.log('REGIS', resp.status);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const loginRes = await request(app).post('/api/users/login').send({
      email: this.userEmail,
      password,
    });

    this.token = (loginRes.body as BaseResponse<LoginOutput>).data.token;
  }
}

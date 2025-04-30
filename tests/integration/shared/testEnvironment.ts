import { randomUUID } from 'crypto';
import request from 'supertest';
import { QueryRunner } from 'typeorm';
import app from '../../../src/app';
import { AppError } from '../../../src/application/errors';
import { LoginOutput } from '../../../src/application/use-cases/user';
import { initDI } from '../../../src/config/di';
import { AppDataSource } from '../../../src/infrastructure/database/DataSource';
import { BaseResponse } from '../../../src/interfaces/http/types/BaseResponseTypes';
import { TestServerInstance } from './TestServer';

const PORT_DEFAULT = Number(process.env.PORT_TEST || 8082);

export class TestEnvironment {
  token: string;
  readonly userName: string = `userName-${randomUUID()}`;
  readonly userEmail: string = `userEmail-${randomUUID()}@gmail.com`;
  private readonly showLogs: boolean;
  private readonly port: number;
  private _queryRunner: QueryRunner;
  private static refCount = 0;
  private static instance: TestEnvironment;

  private constructor(props: { port?: number; showLogs?: boolean } = {}) {
    this.showLogs = props.showLogs ?? false;
    this.port = props.port ?? PORT_DEFAULT;
  }

  public static getInstance(): TestEnvironment {
    if (!TestEnvironment.instance) {
      TestEnvironment.instance = new TestEnvironment();
    }
    return TestEnvironment.instance;
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

  get queryRunner(): QueryRunner {
    if (!this._queryRunner) {
      throw new AppError('QueryRunner not initialized. Call init() first.');
    }
    return this._queryRunner;
  }

  async init(): Promise<void> {
    if (TestEnvironment.refCount === 0) {
      const { dataSourceInstance } = await initDI();
      this._queryRunner = dataSourceInstance.createQueryRunner();
      await this.queryRunner.connect();

      await TestServerInstance.start(this.port, this.showLogs);
    }
    TestEnvironment.refCount++;
  }

  async finish(): Promise<void> {
    TestEnvironment.refCount--;
    if (TestEnvironment.refCount <= 0) {
      if (this.queryRunner?.isReleased === false) {
        await this.queryRunner.release();
      }

      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        await new Promise((r) => setTimeout(r, 500)); // <- delay to ensure the complete close
        this.log('🛑 AppDataSource closed');
      }

      await TestServerInstance.stop(this.showLogs);
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

export const TestEnvironmentInstance = TestEnvironment.getInstance();

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { randomUUID } from 'crypto';
import request from 'supertest';
import app from '../../../src/app';
import { AppDataSource } from '../../../src/infrastructure/database/DataSource';
import { UserModel } from '../../../src/infrastructure/database/models/UserModel';
import { TestEnvironmentInstance } from '../shared/testEnvironment';

const testEnv = TestEnvironmentInstance;
const ENDPOINT_ROUTE = '/api/users/register';

describe('Register endpoint', () => {
  let email: string;

  beforeAll(async () => {
    await testEnv.init();
  }, 15000);

  afterAll(async () => {
    await testEnv.finish();
  });

  beforeEach(async () => {
    email = `test-${randomUUID()}@gmail.com`;
    await testEnv.queryRunner?.startTransaction();
  });

  afterEach(async () => {
    await AppDataSource.manager.delete(UserModel, { email });
    await testEnv.queryRunner?.rollbackTransaction();
  });

  it('should register a user', async () => {
    const name = 'Test User';
    const password = 'test_password';

    const response = await request(app).post(ENDPOINT_ROUTE).send({
      name,
      email,
      password,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toMatchObject({ name, email });
  });
});


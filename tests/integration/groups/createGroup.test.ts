import { Server } from 'http';
import request from 'supertest';
import app from '../../../src/app';
import { LoginOutput } from '../../../src/application/use-cases/user';
import { initDI } from '../../../src/config/di';
import { GroupType } from '../../../src/domain/entities/group';
import { AppDataSource } from '../../../src/infrastructure/database/DataSource';
import { UserModel } from '../../../src/infrastructure/database/models/UserModel';
import { BaseResponse } from '../../../src/interfaces/http/types/BaseResponseTypes';

let server: Server;
const PORT = process.env.PORT_TEST || 8082;
let token: string;

beforeAll(async () => {
  await initDI();

  console.log('🧪 AppDataSource.isInitialized:', AppDataSource.isInitialized);

  server = app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
}, 15000);

afterAll(async () => {
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
});

beforeEach(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await request(app).post('/api/users/register').send({
    name: '337f7a5d-e2df-4b4e-9460-8f2c8335f70b', // randomUUID to avoid collisions
    email: '337f7a5d-e2df-4b4e-9460-8f2c8335f70b@example.com',
    password: 'no_hashed_password',
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const loginRes = await request(app).post('/api/users/login').send({
    email: '337f7a5d-e2df-4b4e-9460-8f2c8335f70b@example.com',
    password: 'no_hashed_password',
  });

  const loginResponseBody = loginRes.body as BaseResponse<LoginOutput>;
  token = loginResponseBody.data.token;
});

afterEach(async () => {
  // Borramos el grupo si se creó
  await AppDataSource.manager.delete('groups', {
    name: 'Integration Test Group',
  });

  // Borramos el usuario si existe
  await AppDataSource.manager.delete(UserModel, {
    email: 'integration@example.com',
  });
});

describe('POST /api/groups', () => {
  it('should create a group successfully', async () => {
    const groupName = 'group_337f7a5d-e2df-4b4e-9460-8f2c8335f70b';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const response = await request(app)
      .post('/api/groups/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: groupName,
        type: GroupType.TRIP,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('name', groupName);
  });
});

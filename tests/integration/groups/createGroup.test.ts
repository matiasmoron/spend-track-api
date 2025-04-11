import { randomUUID } from 'crypto';
import request from 'supertest';
import app from '../../../src/app';
import { GroupType } from '../../../src/domain/entities/group';
import { AppDataSource } from '../../../src/infrastructure/database/DataSource';
import { UserModel } from '../../../src/infrastructure/database/models/UserModel';
import { TestEnvironment } from '../shared/testEnvironment';

const testEnv = new TestEnvironment();

beforeAll(async () => {
  await testEnv.init();
}, 15000);

afterAll(async () => {
  await testEnv.finish();
});

beforeEach(async () => {
  await testEnv.createTestUser();
});

afterEach(async () => {
  // Borramos el grupo si se creó
  await AppDataSource.manager.delete('groups', {
    name: 'Integration Test Group',
  });

  // Borramos el usuario si existe
  await AppDataSource.manager.delete(UserModel, {
    email: testEnv.userEmail,
  });
});

describe('POST /api/groups', () => {
  describe('✅ Happy paths', () => {
    it('should create a group successfully with type trip', async () => {
      const groupName = `group_trip_${randomUUID()}`;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,, @typescript-eslint/no-unsafe-call
      const response = await request(app)
        .post('/api/groups/create')
        .set('Authorization', `Bearer ${testEnv.token}`)
        .send({
          name: groupName,
          type: GroupType.TRIP,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', groupName);
      expect(response.body.data).toHaveProperty('type', GroupType.TRIP);
    });

    it('should create a group successfully with type home', async () => {
      const groupName = `group_trip_${randomUUID()}`;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const response = await request(app)
        .post('/api/groups/create')
        .set('Authorization', `Bearer ${testEnv.token}`)
        .send({
          name: groupName,
          type: GroupType.HOUSE,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', groupName);
      expect(response.body.data).toHaveProperty('type', GroupType.HOUSE);
    });
  });
});

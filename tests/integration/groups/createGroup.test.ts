/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { randomUUID } from 'crypto';
import request from 'supertest';
import app from '../../../src/app';
import { ERROR_VALIDATION_MESSAGE, ERROR_VALIDATION_TYPE } from '../../../src/application/errors';
import { GroupType } from '../../../src/domain/entities/group';
import { AppDataSource } from '../../../src/infrastructure/database/DataSource';
import { UserModel } from '../../../src/infrastructure/database/models/UserModel';
import { TestEnvironment } from '../shared/testEnvironment';

const testEnv = new TestEnvironment();

const ENDPOINT_ROUTE = '/api/groups/create';
let groupName: string;

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
    name: groupName,
  });

  // Borramos el usuario si existe
  await AppDataSource.manager.delete(UserModel, {
    email: testEnv.userEmail,
  });
});

describe('POST /api/groups', () => {
  describe('✅ Happy paths', () => {
    it('should create a group successfully with type trip', async () => {
      groupName = `group_trip_${randomUUID()}`;

      const response = await request(app)
        .post(ENDPOINT_ROUTE)
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
      groupName = `group_trip_${randomUUID()}`;

      const response = await request(app)
        .post(ENDPOINT_ROUTE)
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

    it('should allow name with emojis and special characters', async () => {
      groupName = '🚀 Group! @#$%^&*()';

      const response = await request(app)
        .post(ENDPOINT_ROUTE)
        .set('Authorization', `Bearer ${testEnv.token}`)
        .send({
          name: groupName,
          type: GroupType.TRIP,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should allow name with SQL-like content', async () => {
      groupName = 'DROP TABLE users;';
      const response = await request(app)
        .post(ENDPOINT_ROUTE)
        .set('Authorization', `Bearer ${testEnv.token}`)
        .send({
          name: groupName,
          type: GroupType.TRIP,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('❌ Input validation', () => {
    function expectValidationError(response: request.Response) {
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe(ERROR_VALIDATION_TYPE);
      expect(response.body.error.message).toBe(ERROR_VALIDATION_MESSAGE);
    }

    it('should fail if name is missing', async () => {
      const response = await request(app)
        .post(ENDPOINT_ROUTE)
        .set('Authorization', `Bearer ${testEnv.token}`)
        .send({
          type: GroupType.TRIP,
        });

      expectValidationError(response);
      expect(response.body.error.details.errors).toEqual([
        {
          property: 'name',
          messages: expect.arrayContaining(['Group name is required']),
        },
      ]);
    });

    it('should fail if name is an empty string', async () => {
      const response = await request(app)
        .post(ENDPOINT_ROUTE)
        .set('Authorization', `Bearer ${testEnv.token}`)
        .send({
          name: '',
          type: GroupType.TRIP,
        });

      expectValidationError(response);
      expect(response.body.error.details.errors).toEqual([
        {
          property: 'name',
          messages: ['Group name cannot be empty or only spaces', 'Group name is required'],
        },
      ]);
    });

    it('should fail if name is only whitespace', async () => {
      const response = await request(app)
        .post(ENDPOINT_ROUTE)
        .set('Authorization', `Bearer ${testEnv.token}`)
        .send({
          name: '   ',
          type: GroupType.TRIP,
        });

      expectValidationError(response);
      expect(response.body.error.details.errors).toEqual([
        {
          property: 'name',
          messages: ['Group name cannot be empty or only spaces'],
        },
      ]);
    });

    it('should fail if type is missing', async () => {
      const response = await request(app)
        .post(ENDPOINT_ROUTE)
        .set('Authorization', `Bearer ${testEnv.token}`)
        .send({
          name: 'group_test',
        });

      expectValidationError(response);
      expect(response.body.error.details.errors).toEqual([
        {
          property: 'type',
          messages: expect.arrayContaining(['Group type is required']),
        },
      ]);
    });

    it('should fail if type is not a valid enum', async () => {
      const response = await request(app)
        .post(ENDPOINT_ROUTE)
        .set('Authorization', `Bearer ${testEnv.token}`)
        .send({
          name: 'group_test',
          type: 'invalid_type',
        });

      expectValidationError(response);
      expect(response.body.error.details.errors).toEqual([
        {
          property: 'type',
          messages: ['Group type must be one of: trip, house, couple, other'],
        },
      ]);
    });

    it('should fail if name exceeds max length', async () => {
      groupName = 'g'.repeat(300);

      const response = await request(app)
        .post(ENDPOINT_ROUTE)
        .set('Authorization', `Bearer ${testEnv.token}`)
        .send({
          name: groupName,
          type: GroupType.TRIP,
        });

      expectValidationError(response);
      expect(response.body.error.details.errors).toEqual([
        {
          property: 'name',
          messages: ['Group name must be shorter than or equal to 200 characters'],
        },
      ]);
    });

    it('should fail if type is a valid value but wrong casing', async () => {
      const response = await request(app)
        .post(ENDPOINT_ROUTE)
        .set('Authorization', `Bearer ${testEnv.token}`)
        .send({
          name: 'Group Wrong Type',
          type: 'Trip', // wrong casing
        });

      expectValidationError(response);
      expect(response.body.error.details.errors[0].property).toBe('type');
    });
  });
});

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { randomUUID } from 'crypto';
import request from 'supertest';
import app from '../../../src/app';
import { GroupType } from '../../../src/domain/value-objects';
import { AppDataSource } from '../../../src/infrastructure/database/DataSource';
import { ExpenseModel } from '../../../src/infrastructure/database/models/ExpenseModel';
import { ExpenseParticipantModel } from '../../../src/infrastructure/database/models/ExpenseParticipantModel';
import { GroupModel } from '../../../src/infrastructure/database/models/GroupModel';
import { TestEnvironmentInstance } from '../shared/testEnvironment';

const testEnv = TestEnvironmentInstance;
const EXPENSE_ENDPOINT = '/api/expenses/create';
const GROUP_ENDPOINT = '/api/groups/create';

describe('POST /expenses/create — clientRequestId idempotency', () => {
  let groupId: number;
  let userId: number;

  beforeAll(async () => {
    await testEnv.init();
    await testEnv.createTestUser();

    const groupResponse = await request(app)
      .post(GROUP_ENDPOINT)
      .set('Authorization', `Bearer ${testEnv.token}`)
      .send({ name: `idempotency-test-${randomUUID()}`, type: GroupType.OTHER });

    groupId = groupResponse.body.data.id;

    const meResponse = await request(app)
      .get(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${testEnv.token}`);
    userId = meResponse.body.data.members[0].userId;
  }, 20000);

  afterAll(async () => {
    await AppDataSource.manager.delete(GroupModel, { id: groupId });
    await testEnv.finish();
  });

  afterEach(async () => {
    await AppDataSource.manager.delete(ExpenseParticipantModel, {});
    await AppDataSource.manager.delete(ExpenseModel, { groupId });
  });

  function buildExpensePayload(clientRequestId: string) {
    return {
      groupId,
      description: 'Idempotency test expense',
      total: 100,
      currency: 'ARS',
      paidBy: [{ userId, amount: 100 }],
      splits: [{ userId, amount: 100 }],
      clientRequestId,
    };
  }

  it('returns the same expense when the same clientRequestId is sent twice sequentially', async () => {
    const clientRequestId = randomUUID();
    const payload = buildExpensePayload(clientRequestId);

    const first = await request(app)
      .post(EXPENSE_ENDPOINT)
      .set('Authorization', `Bearer ${testEnv.token}`)
      .send(payload);

    const second = await request(app)
      .post(EXPENSE_ENDPOINT)
      .set('Authorization', `Bearer ${testEnv.token}`)
      .send(payload);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.data.id).toBe(first.body.data.id);

    const expenseCount = await AppDataSource.manager.count(ExpenseModel, {
      where: { groupId },
    });
    expect(expenseCount).toBe(1);
  });

  it('creates a single expense when two requests with the same clientRequestId race concurrently', async () => {
    const clientRequestId = randomUUID();
    const payload = buildExpensePayload(clientRequestId);

    const [first, second] = await Promise.all([
      request(app).post(EXPENSE_ENDPOINT).set('Authorization', `Bearer ${testEnv.token}`).send(payload),
      request(app).post(EXPENSE_ENDPOINT).set('Authorization', `Bearer ${testEnv.token}`).send(payload),
    ]);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(first.body.data.id).toBe(second.body.data.id);

    const expenseCount = await AppDataSource.manager.count(ExpenseModel, {
      where: { groupId },
    });
    expect(expenseCount).toBe(1);

    const participantCount = await AppDataSource.manager.count(ExpenseParticipantModel, {
      where: { expenseId: first.body.data.id },
    });
    expect(participantCount).toBe(2);
  });

  it('rejects a create request without a clientRequestId', async () => {
    const { clientRequestId: _omit, ...payload } = buildExpensePayload(randomUUID());

    const response = await request(app)
      .post(EXPENSE_ENDPOINT)
      .set('Authorization', `Bearer ${testEnv.token}`)
      .send(payload);

    expect(response.status).toBe(400);
  });
});

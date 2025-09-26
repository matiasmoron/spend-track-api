import { TestDataGenerator } from '@tests/utils/TestDataGenerator';
import { getExpensesByGroup } from '@/application/use-cases/expense/GetExpensesByGroup';
import { ExpenseParticipantRepository } from '@/domain/repositories/expense/ExpenseParticipantRepository';
import { ExpenseRepository } from '@/domain/repositories/expense/ExpenseRepository';

describe('getExpensesByGroup use-case', () => {
  let testData: ReturnType<typeof TestDataGenerator.generateTestScenario>;

  beforeEach(() => {
    jest.clearAllMocks();
    testData = TestDataGenerator.generateTestScenario();
  });

  afterEach(() => {
    TestDataGenerator.clearTrackedIds();
  });

  it('returns expenses with participants for a group', async () => {
    const { group, expense, participant } = testData;

    const mockExpenseRepo: jest.Mocked<ExpenseRepository> = {
      create: jest.fn(),
      findByGroupId: jest.fn().mockResolvedValue([expense]),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockParticipantRepo: jest.Mocked<ExpenseParticipantRepository> = {
      create: jest.fn(),
      findByExpenseId: jest.fn().mockResolvedValue([participant]),
    };

    const result = await getExpensesByGroup(
      { groupId: group.id },
      { expenseRepository: mockExpenseRepo, expenseParticipantRepository: mockParticipantRepo }
    );

    expect(mockExpenseRepo.findByGroupId).toHaveBeenCalledWith(group.id);
    expect(mockParticipantRepo.findByExpenseId).toHaveBeenCalledWith(expense.id);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(expense.id);
    expect(result[0].participants).toEqual([participant]);
  });
});

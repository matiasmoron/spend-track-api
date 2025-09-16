import { getGroupsByUser } from '../../../../../src/application/use-cases/group/GetGroupsByUser';
import { GroupRepository } from '../../../../../src/domain/repositories/group/GroupRepository';
import { TestDataGenerator } from '../../../../utils/TestDataGenerator';

const mockGroupRepository: jest.Mocked<GroupRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  delete: jest.fn(),
};

describe('getGroupsByUser', () => {
  let testData: ReturnType<typeof TestDataGenerator.generateTestScenario>;

  beforeEach(() => {
    jest.clearAllMocks();
    testData = TestDataGenerator.generateTestScenario();
  });

  afterEach(() => {
    TestDataGenerator.clearTrackedIds();
  });

  it('should return groups for a user', async () => {
    const mockUser = testData.user;
    const mockGroup = testData.group;

    mockGroupRepository.findByUserId.mockResolvedValue([mockGroup]);

    const result = await getGroupsByUser({ userId: mockUser.id }, mockGroupRepository);

    expect(mockGroupRepository.findByUserId).toHaveBeenCalledWith(mockUser.id);
    expect(result).toEqual({ groups: [mockGroup] });
  });

  it('should propagate repository errors', async () => {
    const mockUser = testData.user;
    mockGroupRepository.findByUserId.mockRejectedValue(new Error('DB failure'));

    await expect(getGroupsByUser({ userId: mockUser.id }, mockGroupRepository)).rejects.toThrow(
      'DB failure'
    );
  });
});

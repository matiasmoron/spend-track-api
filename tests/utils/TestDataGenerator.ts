import { Currency } from '../../src/domain/value-objects/Currency';
import { GroupType } from '../../src/domain/value-objects/GroupType';

/**
 * Utility functions for generating random test data with 'unit-testing' tag
 * to identify test data that should be cleaned up
 */

export class TestDataGenerator {
  private static testRunId = `unit-testing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  private static createdIds: { [key: string]: number[] } = {
    users: [],
    groups: [],
    expenses: [],
    invitations: [],
  };

  static getTestRunId(): string {
    return this.testRunId;
  }

  static getCreatedIds(): { [key: string]: number[] } {
    return this.createdIds;
  }

  static trackCreatedId(type: string, id: number): void {
    if (!this.createdIds[type]) {
      this.createdIds[type] = [];
    }
    this.createdIds[type].push(id);
  }

  static clearTrackedIds(): void {
    this.createdIds = {
      users: [],
      groups: [],
      expenses: [],
      invitations: [],
    };
  }

  static generateRandomUser() {
    const randomId = Math.floor(Math.random() * 1000000);
    return {
      id: randomId,
      email: `${this.testRunId}-user-${randomId}@unit-testing.com`,
      password: 'hashedPassword123',
      name: `Test User ${randomId}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static generateRandomGroup() {
    const randomId = Math.floor(Math.random() * 1000000);
    const groupTypes = Object.values(GroupType);
    const randomType = groupTypes[Math.floor(Math.random() * groupTypes.length)];

    return {
      id: randomId,
      name: `${this.testRunId}-group-${randomId}`,
      type: randomType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static generateRandomExpense(groupId?: number) {
    const randomId = Math.floor(Math.random() * 1000000);
    const currencies = Object.values(Currency);
    const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];

    return {
      id: randomId,
      groupId: groupId || Math.floor(Math.random() * 1000000),
      description: `${this.testRunId}-expense-${randomId}`,
      total: Math.floor(Math.random() * 50000) / 100, // Random amount up to 500.00
      currency: randomCurrency,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static generateRandomExpenseParticipant(expenseId?: number, userId?: number) {
    return {
      expenseId: expenseId || Math.floor(Math.random() * 1000000),
      userId: userId || Math.floor(Math.random() * 1000000),
      amount: Math.floor(Math.random() * 10000) / 100, // Random amount up to 100.00
    };
  }

  static generateRandomInvitation(groupId?: number, invitedBy?: number) {
    const randomId = Math.floor(Math.random() * 1000000);
    return {
      id: randomId,
      groupId: groupId || Math.floor(Math.random() * 1000000),
      email: `${this.testRunId}-invited-${randomId}@unit-testing.com`,
      invitedBy: invitedBy || Math.floor(Math.random() * 1000000),
      status: 'PENDING' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static generateRandomUserGroup(userId?: number, groupId?: number) {
    const randomId = Math.floor(Math.random() * 1000000);
    return {
      id: randomId,
      userId: userId || Math.floor(Math.random() * 1000000),
      groupId: groupId || Math.floor(Math.random() * 1000000),
      joinedAt: new Date(),
    };
  }

  /**
   * Generate a batch of related test data
   */
  static generateTestScenario() {
    const user = this.generateRandomUser();
    const group = this.generateRandomGroup();
    const userGroup = this.generateRandomUserGroup(user.id, group.id);
    const expense = this.generateRandomExpense(group.id);
    const participant = this.generateRandomExpenseParticipant(expense.id, user.id);

    return {
      user,
      group,
      userGroup,
      expense,
      participant,
    };
  }
}

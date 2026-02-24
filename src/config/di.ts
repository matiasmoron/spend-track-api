// Use this file to configure your dependency injection container
// and register your services, repositories, etc.

import dotenv from 'dotenv';
import { ExpenseParticipantRepository } from '../domain/repositories/expense/ExpenseParticipantRepository';
import { ExpenseRepository } from '../domain/repositories/expense/ExpenseRepository';
import { GroupRepository } from '../domain/repositories/group/GroupRepository';
import { UserGroupRepository } from '../domain/repositories/group/UserGroupRepository';
import { CacheService } from '../infrastructure/cache/CacheService';
import { CachedExpenseParticipantRepository } from '../infrastructure/cache/repositories/CachedExpenseParticipantRepository';
import { CachedExpenseRepository } from '../infrastructure/cache/repositories/CachedExpenseRepository';
import { CachedGroupRepository } from '../infrastructure/cache/repositories/CachedGroupRepository';
import { CachedUserGroupRepository } from '../infrastructure/cache/repositories/CachedUserGroupRepository';
import { ExpenseParticipantRepositoryImpl } from '../infrastructure/database/repositories/ExpenseParticipantRepositoryImpl';
import { ExpenseRepositoryImpl } from '../infrastructure/database/repositories/ExpenseRepositoryImpl';
import { GroupRepoImpl } from '../infrastructure/database/repositories/GroupRepoImpl';
import { InvitationRepositoryImpl } from '../infrastructure/database/repositories/InvitationRepositoryImpl';
import { UserGroupRepoImpl } from '../infrastructure/database/repositories/UserGroupImpl';
import { UserRepoImpl } from '../infrastructure/database/repositories/UserRepoImpl';
import { AuthService } from '../infrastructure/database/services/AuthService';
import { initDB } from './database';
//
// load environment variables from .env file
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (typeof jwtSecret !== 'string' || jwtSecret.trim() === '') {
  throw new Error('JWT_SECRET must be a non-empty string');
}

export let authService: AuthService;
export let expenseRepository: ExpenseRepository;
export let expenseParticipantRepository: ExpenseParticipantRepository;
export let groupRepository: GroupRepository;
export let invitationRepository: InvitationRepositoryImpl;
export let userGroupRepository: UserGroupRepository;
export let userRepository: UserRepoImpl;
export let cacheService: CacheService | null = null;

const initInstances = (cache: CacheService | null) => {
  authService = new AuthService(jwtSecret);

  const rawExpenseRepo = new ExpenseRepositoryImpl();
  const rawExpenseParticipantRepo = new ExpenseParticipantRepositoryImpl();
  const rawGroupRepo = new GroupRepoImpl();
  const rawUserGroupRepo = new UserGroupRepoImpl();

  if (cache) {
    expenseRepository = new CachedExpenseRepository(rawExpenseRepo, cache);
    expenseParticipantRepository = new CachedExpenseParticipantRepository(
      rawExpenseParticipantRepo,
      cache
    );
    groupRepository = new CachedGroupRepository(rawGroupRepo, cache);
    userGroupRepository = new CachedUserGroupRepository(rawUserGroupRepo, cache);
  } else {
    expenseRepository = rawExpenseRepo;
    expenseParticipantRepository = rawExpenseParticipantRepo;
    groupRepository = rawGroupRepo;
    userGroupRepository = rawUserGroupRepo;
  }

  invitationRepository = new InvitationRepositoryImpl();
  userRepository = new UserRepoImpl();
};

// Initialize the instances and the database
export const initDI = async (cache: CacheService | null = null) => {
  cacheService = cache;
  const dataSourceInstance = await initDB();

  initInstances(cache);

  return {
    dataSourceInstance,
  };
};

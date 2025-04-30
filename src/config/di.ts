// Use this file to configure your dependency injection container
// and register your services, repositories, etc.

import dotenv from 'dotenv';
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
export let expenseRepository: ExpenseRepositoryImpl;
export let expenseParticipantRepository: ExpenseParticipantRepositoryImpl;
export let groupRepository: GroupRepoImpl;
export let invitationRepository: InvitationRepositoryImpl;
export let userGroupRepository: UserGroupRepoImpl;
export let userRepository: UserRepoImpl;

const initInstances = () => {
  authService = new AuthService(jwtSecret);
  expenseRepository = new ExpenseRepositoryImpl();
  expenseParticipantRepository = new ExpenseParticipantRepositoryImpl();
  groupRepository = new GroupRepoImpl();
  invitationRepository = new InvitationRepositoryImpl();
  userGroupRepository = new UserGroupRepoImpl();
  userRepository = new UserRepoImpl();
};

// Initialize the instances and the database
export const initDI = async () => {
  const dataSourceInstance = await initDB();

  initInstances();

  return {
    dataSourceInstance,
  };
};

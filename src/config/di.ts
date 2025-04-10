// Use this file to configure your dependency injection container
// and register your services, repositories, etc.

import dotenv from 'dotenv';
import { GroupRepoImpl } from '../infrastructure/database/repositories/GroupRepoImpl';
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
export let userRepository: UserRepoImpl;
export let groupRepository: GroupRepoImpl;
export let userGroupRepository: UserGroupRepoImpl;

const initInstances = () => {
  authService = new AuthService(jwtSecret);
  userRepository = new UserRepoImpl();
  groupRepository = new GroupRepoImpl();
  userGroupRepository = new UserGroupRepoImpl();
};

// Initialize the database connection
export const initDI = async () => {
  await initDB();

  initInstances();
};

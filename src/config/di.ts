// Use this file to configure your dependency injection container
// and register your services, repositories, etc.

import dotenv from 'dotenv';
import { AppDataSource } from '../infrastructure/database/DataSource';
import { UserRepoImpl } from '../infrastructure/database/repositories/UserRepoImpl';
import { AuthService } from '../infrastructure/database/services/AuthService';
import { initDB } from './database';
// import { AppDataSource } from './database';
//
// load environment variables from .env file
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (typeof jwtSecret !== 'string' || jwtSecret.trim() === '') {
  throw new Error('JWT_SECRET must be a non-empty string');
}

export let authService;
export let userRepository;

// Initialize the database connection
export const initDI = async () => {
  await initDB();
  authService = new AuthService(jwtSecret);
  userRepository = new UserRepoImpl();
};

// export const authService = new AuthService(jwtSecret);
// export const userRepository = new UserRepoImpl();

// Use this file to configure your dependency injection container
// and register your services, repositories, etc.

import dotenv from 'dotenv';
import OpenAI from 'openai';
import { AppDataSource } from '../infrastructure/database/DataSource';
import { InMemoryUserRepo } from '../infrastructure/database/repositories/InMemoryUserRepo';
// import { UserRepoImpl } from '../infrastructure/database/repositories/UserRepoImpl';
import { AuthService } from '../infrastructure/database/services/AuthService';

// load environment variables from .env file
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (typeof jwtSecret !== 'string' || jwtSecret.trim() === '') {
  throw new Error('JWT_SECRET must be a non-empty string');
}

export const authService = new AuthService(jwtSecret);
// export const userRepository = new UserRepoImpl();

export const userRepository = new InMemoryUserRepo(); // ✅ usar mock temporal

export const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

AppDataSource.initialize()
  .then(() => console.log('📦 Database connected'))
  .catch((err) => console.error('❌ Error connecting to DB:', err));

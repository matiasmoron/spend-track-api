// Use this file to configure your dependency injection container
// and register your services, repositories, etc.

import './database'; // inicializa AppDataSource
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { UserRepoImpl } from '../infrastructure/database/repositories/UserRepoImpl';
import { AuthService } from '../infrastructure/database/services/AuthService';

// load environment variables from .env file
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (typeof jwtSecret !== 'string' || jwtSecret.trim() === '') {
  throw new Error('JWT_SECRET must be a non-empty string');
}

export const authService = new AuthService(jwtSecret);
export const userRepository = new UserRepoImpl();

export const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

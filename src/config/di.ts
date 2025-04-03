// Use this file to configure your dependency injection container
// and register your services, repositories, etc.

import dotenv from 'dotenv';
import { AuthService } from '@/infrastructure/database/services/AuthService';

// load environment variables from .env file
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

if (process.env.JWT_SECRET == null)
  throw new Error('JWT_SECRET is not defined in the environment variables');

if (typeof JWT_SECRET !== 'string' || JWT_SECRET.trim() === '') {
  throw new Error('JWT_SECRET must be a non-empty string');
}

export const authService = new AuthService(JWT_SECRET);

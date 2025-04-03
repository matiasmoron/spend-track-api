// Use this file to configure your dependency injection container
// and register your services, repositories, etc.

import dotenv from 'dotenv';
import { AuthService } from '../infrastructure/database/services/AuthService';

// load environment variables from .env file
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('Falta definir JWT_SECRET en .env');
}

// Singleton - shared instance
export const authService = new AuthService(process.env.JWT_SECRET);

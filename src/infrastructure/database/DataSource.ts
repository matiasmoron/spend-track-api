import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { UserModel } from './models/UserModel';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  entities: [UserModel],
  synchronize: true, // ⚠️ Use only in development
  logging: false,
  // ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : {},
});

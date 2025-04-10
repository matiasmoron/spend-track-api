import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { GroupModel } from './models/GroupModel';
import { UserGroupModel } from './models/UserGroupModel';
import { UserModel } from './models/UserModel';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  entities: [UserModel, GroupModel, UserGroupModel],
  synchronize: true, // o false si usás migraciones
  // logging: true,
  ssl: {
    rejectUnauthorized: false, // Render requiere SSL pero sin verificación estricta
  },
});

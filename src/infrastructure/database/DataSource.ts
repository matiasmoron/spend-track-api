import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { ExpenseModel } from './models/ExpenseModel';
import { ExpenseParticipantModel } from './models/ExpenseParticipantModel';
import { GroupModel } from './models/GroupModel';
import { InvitationModel } from './models/InvitationModel';
import { UserGroupModel } from './models/UserGroupModel';
import { UserModel } from './models/UserModel';

dotenv.config();

class Database {
  private static _instance: DataSource;

  static getInstance(): DataSource {
    if (!Database._instance) {
      Database._instance = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || '',
        entities: [
          UserModel,
          GroupModel,
          UserGroupModel,
          ExpenseModel,
          ExpenseParticipantModel,
          InvitationModel,
        ],
        synchronize: true, // o false si usás migraciones
        ssl: {
          rejectUnauthorized: false, // Render requiere SSL pero sin verificación estricta
        },
      });
    }

    return Database._instance;
  }
}

export const AppDataSource = Database.getInstance();

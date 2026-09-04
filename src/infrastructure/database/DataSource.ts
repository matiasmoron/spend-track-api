import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { ExpenseModel } from './models/ExpenseModel';
import { ExpenseParticipantModel } from './models/ExpenseParticipantModel';
import { GroupModel } from './models/GroupModel';
import { InvitationModel } from './models/InvitationModel';
import { PaymentModel } from './models/PaymentModel';
import { UserGroupModel } from './models/UserGroupModel';
import { UserModel } from './models/UserModel';

dotenv.config();

const entities = [
  UserModel,
  GroupModel,
  UserGroupModel,
  ExpenseModel,
  ExpenseParticipantModel,
  InvitationModel,
  PaymentModel,
];

const sharedOptions = {
  type: 'postgres' as const,
  synchronize: true,
  ssl: { rejectUnauthorized: true, ca: process.env.DB_SSL_CA },
  entities,
};

function getRailwayConnectionOptions() {
  return { url: process.env.DATABASE_URL };
}

function getSupabaseConnectionOptions() {
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
  };
}

function buildDataSourceOptions() {
  const connectionOptions =
    process.env.USE_RAILWAY_DB_CONNECTION?.toLowerCase() === 'true'
      ? getRailwayConnectionOptions()
      : getSupabaseConnectionOptions();

  return { ...sharedOptions, ...connectionOptions };
}

export const AppDataSource = new DataSource(buildDataSourceOptions());

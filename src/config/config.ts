/* eslint-disable no-undef */
import dotenv from 'dotenv';

dotenv.config();

const environmentValues = {
  ENVIRONMENT: process.env.ENVIRONMENT || 'develop',
  PORT: process.env.PORT || 4000,
  DB_NAME: process.env.DB_NAME || '',
  DB_USERNAME: process.env.DB_USERNAME || '',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_DIALECT: process.env.DB_DIALECT || 'mysql',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

export default environmentValues;

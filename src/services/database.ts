import { initModels } from '../models/init-models';
import { Op as Operator, Sequelize, Dialect } from 'sequelize';
import environmentValues from '../config/config';

export const connectToDatabase = new Sequelize(
  environmentValues.DB_NAME,
  environmentValues.DB_USERNAME,
  environmentValues.DB_PASSWORD,
  {
    dialect: environmentValues.DB_DIALECT as Dialect,
    host: environmentValues.DB_HOST,
    logging: false,
  },
);

export const Op = Operator;

export const models = initModels(connectToDatabase);

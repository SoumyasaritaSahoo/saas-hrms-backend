import * as dotenv from 'dotenv';

import { Sequelize } from 'sequelize-typescript';

import { DATABASE_MODELS } from './models';

dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'postgres',

  host: process.env.POSTGRES_HOST || 'localhost',

  port: Number(process.env.POSTGRES_PORT || 5432),

  username: process.env.POSTGRES_USER,

  password: process.env.POSTGRES_PASSWORD,

  database: process.env.POSTGRES_DB,

  logging: false,

  models: DATABASE_MODELS,

  define: {
    underscored: true,
    timestamps: true,
    paranoid: true,
  },
});

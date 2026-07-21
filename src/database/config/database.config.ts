import * as dotenv from 'dotenv';
import type { Dialect } from 'sequelize';

dotenv.config();

const dialect: Dialect = 'postgres';

const config = {
  development: {
    url: process.env.DATABASE_URL,
    dialect,
    dialectOptions: {
      ssl: false,
    },
    define: {
      underscored: true,
      timestamps: true,
      paranoid: true,
    },
    logging: console.log,
  },
  staging: {
    url: process.env.DATABASE_URL,
    dialect,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    define: {
      underscored: true,
      timestamps: true,
      paranoid: true,
    },
    logging: false,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    define: {
      underscored: true,
      timestamps: true,
      paranoid: true,
    },
    logging: false,
  },
};

export default config;

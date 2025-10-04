require('dotenv').config();

// Use the same configuration structure as config.database.ts
const databaseConfig = {
  dialect: process.env.APP_BD_DIALECT || 'postgres',
  host: process.env.APP_BD_HOST || 'localhost',
  port: Number(process.env.APP_BD_PORT) || 5432,
  username: process.env.APP_BD_USERNAME || 'postgres',
  password: process.env.APP_BD_PASSWORD || 'admin',
  database: process.env.APP_BD_NAME || 'default_database',
  dialectOptions: {
    ssl: false, // Force SSL to false for local development
  },
};

module.exports = {
  development: {
    ...databaseConfig,
    logging: console.log,
  },
  test: {
    ...databaseConfig,
    database: process.env.APP_BD_NAME_TEST || databaseConfig.database,
    logging: false,
  },
  production: {
    ...databaseConfig,
    logging: false,
  },
};

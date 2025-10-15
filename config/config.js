require('dotenv').config();

// Use the same configuration structure as config.database.ts
const databaseConfig = {
  dialect: process.env.APP_BD_DIALECT || 'postgres',
  host: process.env.APP_BD_HOST || 'localhost',
  port: Number(process.env.APP_BD_PORT) || 5432,
  username: process.env.APP_BD_USERNAME || 'postgres',
  password: process.env.APP_BD_PASSWORD || 'admin',
  database: process.env.APP_BD_NAME || 'default_database',
  dialectOptions:
    process.env.NODE_ENV === 'production'
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : false,
  logging: false,
};

module.exports = {
  development: {
    ...databaseConfig,
    logging: false,
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

import { DatabaseConfig } from "src/app.interfaces";

const config: DatabaseConfig = {
    APP_BD_DIALECT: process.env.APP_BD_DIALECT || 'postgres',
    APP_BD_HOST: process.env.APP_BD_HOST || 'localhost',
    APP_BD_PORT: Number(process.env.APP_BD_PORT) || 5432,
    APP_BD_USERNAME: process.env.APP_BD_USERNAME || 'postgres',
    APP_BD_PASSWORD: process.env.APP_BD_PASSWORD || 'password',
    APP_BD_NAME: process.env.APP_BD_NAME || 'mydatabase',
};
  
export default config;
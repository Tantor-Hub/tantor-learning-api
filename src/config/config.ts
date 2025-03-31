import { log } from "console";
import { DatabaseConfig } from "src/interface/interface.databases";

const config: DatabaseConfig = {
    APP_BD_DIALECT: process.env.APP_BD_DIALECT || 'postgres',
    APP_BD_HOST: process.env.APP_BD_HOST || 'localhost',
    APP_BD_PORT: Number(process.env.APP_BD_PORT) || 5432,
    APP_BD_USERNAME: process.env.APP_BD_USERNAME || 'postgres',
    APP_BD_PASSWORD: process.env.APP_BD_PASSWORD || 'admin',
    APP_BD_NAME: process.env.APP_BD_NAME || 'default_database',
};

export default config;
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  dialect: process.env.APP_BD_DIALECT as 'postgres',
  host: process.env.APP_BD_HOST,
  port: Number(process.env.APP_BD_PORT),
  username: process.env.APP_BD_USERNAME,
  password: process.env.APP_BD_PASSWORD,
  database: process.env.APP_BD_NAME
}));
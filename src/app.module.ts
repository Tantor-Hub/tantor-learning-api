import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import config from './configs/config';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: config.APP_BD_DIALECT as any,
      host: config.APP_BD_HOST,
      port: config.APP_BD_PORT,
      username: config.APP_BD_USERNAME,
      password: config.APP_BD_PASSWORD,
      database: config.APP_BD_NAME,
      synchronize: true, 
    }),
    ConfigModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

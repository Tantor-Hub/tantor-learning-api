import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './configs/config';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    SequelizeModule.forRootAsync({
      useFactory: async () => {
        try {
          return {
            dialect: config.APP_BD_DIALECT as any,
            host: config.APP_BD_HOST,
            port: config.APP_BD_PORT,
            username: config.APP_BD_USERNAME,
            password: config.APP_BD_PASSWORD,
            database: config.APP_BD_NAME,
            autoLoadModels: true,
            synchronize: true,
            logging: console.log,
            timezone: "+02:00",
            retry: {
                match: [/Deadlock/i],
                max: 3,
                backoffBase: 1000,
                backoffExponent: 1.5
            },
            pool: {
                max: 50,
                min: 0,
                acquire: 1000000,
                idle: 200000
            },
          };
        } catch (error: any) {
          return error
        }
      }
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}

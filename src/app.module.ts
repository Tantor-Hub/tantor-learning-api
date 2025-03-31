import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import databaseConfig from './config/database.config';
import { Users } from './models/model.users';
import { Roles } from './models/model.roles';
import { HasRoles } from './models/model.userhasroles';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig]
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: configService.get<string>('database.dialect') as 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
    SequelizeModule.forFeature([Users, Roles, HasRoles]),
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}

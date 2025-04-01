import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import databaseConfig from './config/config.database';
import { Users } from './models/model.users';
import { Roles } from './models/model.roles';
import { HasRoles } from './models/model.userhasroles';
import { RolesModule } from './roles/roles.module';
import { Sequelize } from 'sequelize-typescript';
import { UsersModule } from './users/users.module';
import { HasrolesService } from './hasroles/hasroles.service';
import { HasrolesModule } from './hasroles/hasroles.module';

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
        logging: false,
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
        models: [Users, Roles, HasRoles]
      }),
    }),
    SequelizeModule.forFeature([Users, Roles, HasRoles]),
    RolesModule,
    UsersModule,
    HasrolesModule,
  ],
  controllers: [AppController],
  providers: [AppService, HasrolesService],
})

export class AppModule implements OnModuleInit {
  constructor(private readonly sequelize: Sequelize) { }
  async onModuleInit() {
    await this.sequelize.sync();
  }
}

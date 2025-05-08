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
import { FormationsModule } from './formations/formations.module';
import { CategoriesModule } from './categories/categories.module';
import { Categories } from './models/model.categoriesformations';
import { Formations } from './models/model.formations';
import { Thematiques } from './models/model.groupeformations';
import { log } from 'console';
import { SessionsModule } from './sessions/sessions.module';
import { SessionSuivi } from './models/model.suivisession';
import { WebrtcGatewayService } from './services/service.webrtc';
import { MediasoupService } from './services/service.mediasoup';
import { GoogleDriveService } from './services/service.googledrive';
import { DocsService } from './services/service.docs';
import { AllSercices } from './services/serices.all';
import { CmsController } from './cms/cms.controller';
import { CmsService } from './cms/cms.service';
import { CmsModule } from './cms/cms.module';
import { AppInfos } from './models/model.appinfos';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { CryptoService } from './services/service.crypto';
import { JwtService } from './services/service.jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: '.env.production',
      load: [databaseConfig]
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        url: 'postgresql://postgres:iZZcaUxykYDAKkVvYCIivHalCbPebRFK@caboose.proxy.rlwy.net:53988/__tantor__bd',
        // configService.get<string>('database.host'),
        username: 'postgres',
        // configService.get<string>('database.username'),
        // port: configService.get<number>('database.port'),
        // password: configService.get<string>('database.password'),
        // database: configService.get<string>('database.database'),
        autoLoadModels: false,
        synchronize: true,
        dialectOptions: {
          require: true,
          rejectUnauthorized: false
        },
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
          idle: 200000,
        },
        models: [Users, Roles, HasRoles, Categories, SessionSuivi, AppInfos]
      }),
    }),
    SequelizeModule.forFeature([Users, Roles, HasRoles, Categories, Formations, Thematiques, SessionSuivi, AppInfos]),
    RolesModule,
    UsersModule,
    FormationsModule,
    CategoriesModule,
    SessionsModule,
    CmsModule
  ],
  controllers: [AppController, CmsController],
  providers: [AppService, MediasoupService, WebrtcGatewayService, GoogleDriveService, DocsService, CmsService, AllSercices, JwtService, NestJwtService, CryptoService]
})

export class AppModule implements OnModuleInit {
  constructor(private readonly sequelize: Sequelize) { }
  async onModuleInit() { }
};

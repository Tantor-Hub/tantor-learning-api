import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Roles } from 'src/models/model.roles';
import { HasRoles } from 'src/models/model.userhasroles';
import { MailService } from 'src/services/service.mail';
import { Users } from 'src/models/model.users';
import { AllSercices } from 'src/services/serices.all';
import { CryptoService } from 'src/services/service.crypto';
import { JwtService } from 'src/services/service.jwt';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from 'src/strategy/startegy.googleauth';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { StagiaireHasSession } from 'src/models/model.stagiairehassession';
import { StagiaireHasSessionSeances } from 'src/models/model.stagiairesessionhasseances';
import { HomeWorks } from 'src/models/model.homeworks';

@Module({
  imports: [
    SequelizeModule.forFeature([Roles, HasRoles, Users, StagiaireHasSession, StagiaireHasSessionSeances, HomeWorks]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('APPJWTTOKEN', 'defaultSecret'),
        signOptions: {
          expiresIn: configService.get<string>('APPJWTMAXLIFE', '1h'),
        },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, MailService, AllSercices, CryptoService, JwtService, GoogleStrategy, GoogleDriveService],
})
export class UsersModule { }

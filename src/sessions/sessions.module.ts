import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { JwtService } from 'src/services/service.jwt';
import { MailService } from 'src/services/service.mail';
import { AllSercices } from 'src/services/serices.all';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Users } from 'src/models/model.users';
import { HasRoles } from 'src/models/model.userhasroles';
import { Roles } from 'src/models/model.roles';
import { FormateurHasSession } from 'src/models/model.formateurhassession';
import { SessionSuivi } from 'src/models/model.suivisession';
import { Formations } from 'src/models/model.formations';
import { Categories } from 'src/models/model.categoriesformations';
import { Thematiques } from 'src/models/model.groupeformations';
import { MediasoupService } from 'src/services/service.mediasoup';
import { StagiaireHasSession } from 'src/models/model.stagiairehassession';
import { DocsService } from 'src/services/service.docs';
import { SeanceSessions } from 'src/models/model.sessionhasseances';
import { HomeworksSession } from 'src/models/model.homework';
import { StagiaireHasHomeWork } from 'src/models/model.stagiairehashomeworks';

@Module({
  imports: [
    SequelizeModule.forFeature([SessionSuivi, Users, HasRoles, Roles, FormateurHasSession, Formations, Categories, Thematiques, StagiaireHasSession, SeanceSessions, HomeworksSession, StagiaireHasSession, StagiaireHasHomeWork]),
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
  controllers: [SessionsController],
  providers: [SessionsService, JwtService, GoogleDriveService, AllSercices, MailService, MediasoupService, DocsService]
})
export class SessionsModule { }

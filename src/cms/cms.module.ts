import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { AllSercices } from 'src/services/serices.all';
import { AppInfos } from 'src/models/model.appinfos';
import { JwtService } from 'src/services/service.jwt';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { CryptoService } from 'src/services/service.crypto';
import { MailService } from 'src/services/service.mail';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/models/model.users';
import { Roles } from 'src/models/model.roles';
import { HasRoles } from 'src/models/model.userhasroles';
import { StagiaireHasSession } from 'src/models/model.stagiairehassession';
import { Messages } from 'src/models/model.messages';
import { StagiaireHasSessionSeances } from 'src/models/model.stagiairesessionhasseances';
import { SeanceSessions } from 'src/models/model.courshasseances';
import { HomeworksSession } from 'src/models/model.homework';
import { StagiaireHasHomeWork } from 'src/models/model.stagiairehashomeworks';
import { Contacts } from 'src/models/model.contactform';
import { Planings } from 'src/models/model.planings';
import { Newsletter } from 'src/models/model.newsletter';

@Module({
  imports: [
    SequelizeModule.forFeature([AppInfos, Newsletter, Users, Roles, HasRoles, StagiaireHasSession, HomeworksSession, Messages, StagiaireHasSessionSeances, SeanceSessions, StagiaireHasHomeWork, Contacts, Planings]),
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
  controllers: [CmsController],
  providers: [AllSercices, CmsService, MailService, CryptoService, JwtService, GoogleDriveService, UsersService, MailService],
})
export class CmsModule { }

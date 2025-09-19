import { Module } from '@nestjs/common';
import { AllSercices } from 'src/services/serices.all';
import { LessonController } from './lesson.controller';
import { CmsService } from 'src/cms/cms.service';
import { MailService } from 'src/services/service.mail';
import { CryptoService } from 'src/services/service.crypto';
import { JwtModule } from '@nestjs/jwt';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { UsersService } from 'src/users/users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppInfos } from 'src/models/model.appinfos';
import { Users } from 'src/models/model.users';
import { StagiaireHasSession } from 'src/models/model.stagiairehassession';
import { HomeworksSession } from 'src/models/model.homework';
import { Messages } from 'src/models/model.messages';
import { StagiaireHasSessionSeances } from 'src/models/model.stagiairesessionhasseances';
import { SeanceSessions } from 'src/models/model.courshasseances';
import { StagiaireHasHomeWork } from 'src/models/model.stagiairehashomeworks';
import { Contacts } from 'src/models/model.contactform';
import { Planings } from 'src/models/model.planings';
import { JwtService } from 'src/services/service.jwt';
import { LessonService } from './lesson.service';
import { Lesson } from 'src/models/model.lesson';
import { SessionSuivi } from 'src/models/model.suivisession';
import { FormateurHasSession } from 'src/models/model.formateurhassession';
import { Documents } from 'src/models/model.documents';
import { Newsletter } from 'src/models/model.newsletter';
import { Chapitre } from 'src/models/model.chapitres';
import { Evaluation } from 'src/models/model.evaluation';
import { Question } from 'src/models/model.quiz';
import { Option } from 'src/models/model.optionsquiz';
import { Listcours } from 'src/models/model.cours';
import { Cours } from 'src/models/model.sessionshascours';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AppInfos,
      Chapitre,
      Newsletter,
      Documents,
      Users,
      Evaluation,
      Question,
      Option,
      StagiaireHasSession,
      HomeworksSession,
      Messages,
      StagiaireHasSessionSeances,
      SeanceSessions,
      StagiaireHasHomeWork,
      Contacts,
      Planings,
      Lesson,
      Listcours,
      Cours,
      SessionSuivi,
      FormateurHasSession,
    ]),
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
  controllers: [LessonController],
  providers: [
    AllSercices,
    CmsService,
    MailService,
    CryptoService,
    JwtService,
    GoogleDriveService,
    UsersService,
    LessonService,
  ],
})
export class LessonModule {}

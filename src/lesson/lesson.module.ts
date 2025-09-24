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
import { Messages } from 'src/models/model.messages';

import { Contacts } from 'src/models/model.contactform';
import { JwtService } from 'src/services/service.jwt';
import { LessonService } from './lesson.service';
import { Lesson } from 'src/models/model.lesson';
import { Newsletter } from 'src/models/model.newsletter';
import { Cours } from 'src/models/model.cours';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AppInfos,
      Newsletter,
      Users,
      Messages,

      Contacts,
      Lesson,
      Cours,
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

import { Module } from '@nestjs/common';
import { AllSercices } from 'src/services/serices.all';
import { LessonController } from './lesson.controller';
import { MailService } from 'src/services/service.mail';
import { CryptoService } from 'src/services/service.crypto';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryService } from 'src/services/service.cloudinary';
import { UsersService } from 'src/users/users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppInfos } from 'src/models/model.appinfos';
import { Users } from 'src/models/model.users';
import { Contacts } from 'src/models/model.contactform';
import { JwtService } from 'src/services/service.jwt';
import { LessonService } from './lesson.service';
import { Lesson } from 'src/models/model.lesson';
import { Lessondocument } from 'src/models/model.lessondocument';
import { Newsletter } from 'src/models/model.newsletter';
import { SessionCours } from 'src/models/model.sessioncours';
import { UserInSession } from 'src/models/model.userinsession';
import { TrainingSession } from 'src/models/model.trainingssession';
import { JwtAuthGuardAsStudentInSession } from 'src/guard/guard.asstudentinsession';
import { Otp } from 'src/models/model.otp';
import { Studentevaluation } from 'src/models/model.studentevaluation';
import { DocumentInstance } from 'src/models/model.documentinstance';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AppInfos,
      Newsletter,
      Users,
      Contacts,
      Lesson,
      Lessondocument,
      SessionCours,
      UserInSession,
      TrainingSession,
      Studentevaluation,
      Otp,
      DocumentInstance,
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
    MailService,
    CryptoService,
    JwtService,
    CloudinaryService,
    UsersService,
    LessonService,
    JwtAuthGuardAsStudentInSession,
  ],
})
export class LessonModule {}

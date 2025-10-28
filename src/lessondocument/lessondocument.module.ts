import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Lessondocument } from 'src/models/model.lessondocument';
import { Users } from 'src/models/model.users';
import { Lesson } from 'src/models/model.lesson';
import { SessionCours } from 'src/models/model.sessioncours';
import { UserInSession } from 'src/models/model.userinsession';
import { TrainingSession } from 'src/models/model.trainingssession';
import { LessondocumentController } from './lessondocument.controller';
import { LessondocumentService } from './lessondocument.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from 'src/services/service.jwt';
import { AllSercices } from 'src/services/serices.all';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { JwtAuthGuardAsInstructor } from 'src/guard/guard.asinstructor';
import { JwtAuthGuardAsStudentInSession } from 'src/guard/guard.asstudentinsession';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Lessondocument,
      Users,
      Lesson,
      SessionCours,
      UserInSession,
      TrainingSession,
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
  controllers: [LessondocumentController],
  providers: [
    LessondocumentService,
    JwtService,
    AllSercices,
    GoogleDriveService,
    JwtAuthGuardAsInstructor,
    JwtAuthGuardAsStudentInSession,
  ],
  exports: [LessondocumentService],
})
export class LessondocumentModule {}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SessionCoursService } from './sessioncours.service';
import { SessionCoursController } from './sessioncours.controller';
import { SessionCours } from 'src/models/model.sessioncours';
import { Users } from 'src/models/model.users';
import { UserRoles } from 'src/models/model.userroles';
import { TrainingSession } from 'src/models/model.trainingssession';
import { Lesson } from 'src/models/model.lesson';
import { Lessondocument } from 'src/models/model.lessondocument';
import { UserInSession } from 'src/models/model.userinsession';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';
import { JwtAuthGuardUniversalFactory } from 'src/guard/guard.universal-factory';
import { JwtAuthGuardUniversalMultiRole } from 'src/guard/guard.universal-multi-role';
import { JwtAuthGuardAsStudentInSession } from 'src/guard/guard.asstudentinsession';
import { Studentevaluation } from 'src/models/model.studentevaluation';

@Module({
  imports: [
    SequelizeModule.forFeature([
      SessionCours,
      Users,
      UserRoles,
      TrainingSession,
      Lesson,
      Lessondocument,
      UserInSession,
      Studentevaluation,
    ]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('APPJWTTOKEN', 'defaultSecret'),
        signOptions: {
          expiresIn: configService.get<string>('APPJWTMAXLIFE', '24h'),
        },
      }),
    }),
  ],
  controllers: [SessionCoursController],
  providers: [
    SessionCoursService,
    AllSercices,
    JwtService,
    JwtAuthGuardAsSuperviseur,
    JwtAuthGuardUniversalFactory,
    JwtAuthGuardUniversalMultiRole,
    JwtAuthGuardAsStudentInSession,
  ],
  exports: [SessionCoursService],
})
export class SessionCoursModule {}

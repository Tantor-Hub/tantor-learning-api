import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Event } from 'src/models/model.event';
import { Training } from 'src/models/model.trainings';
import { TrainingSession } from 'src/models/model.trainingssession';
import { SessionCours } from 'src/models/model.sessioncours';
import { Lesson } from 'src/models/model.lesson';
import { Lessondocument } from 'src/models/model.lessondocument';
import { Users } from 'src/models/model.users';
import { UserInSession } from 'src/models/model.userinsession';
import { UserRoles } from 'src/models/model.userroles';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';
import { JwtAuthGuardAsStudentInSession } from 'src/guard/guard.asstudentinsession';
import { JwtAuthGuardAsInstructor } from 'src/guard/guard.asinstructor';
import { Studentevaluation } from 'src/models/model.studentevaluation';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Event,
      Training,
      TrainingSession,
      SessionCours,
      Lesson,
      Lessondocument,
      Users,
      UserInSession,
      UserRoles,
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
  controllers: [EventController],
  providers: [
    EventService,
    AllSercices,
    JwtService,
    JwtAuthGuardAsStudentInSession,
    JwtAuthGuardAsInstructor,
  ],
  exports: [EventService],
})
export class EventModule {}

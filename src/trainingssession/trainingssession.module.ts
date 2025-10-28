import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TrainingSessionService } from './trainingssession.service';
import { TrainingSessionController } from './trainingssession.controller';
import { TrainingSession } from '../models/model.trainingssession';
import { Training } from '../models/model.trainings';
import { Users } from '../models/model.users';
import { UserInSession } from '../models/model.userinsession';
import { SessionCours } from '../models/model.sessioncours';
import { Lesson } from '../models/model.lesson';
import { Lessondocument } from '../models/model.lessondocument';
import { AllSercices } from '../services/serices.all';
import { JwtService } from '../services/service.jwt';
import { JwtAuthGuardAsStudentInSession } from '../guard/guard.asstudentinsession';

@Module({
  imports: [
    SequelizeModule.forFeature([
      TrainingSession,
      Training,
      Users,
      UserInSession,
      SessionCours,
      Lesson,
      Lessondocument,
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
  controllers: [TrainingSessionController],
  providers: [
    TrainingSessionService,
    AllSercices,
    JwtService,
    JwtAuthGuardAsStudentInSession,
  ],
  exports: [TrainingSessionService],
})
export class TrainingSessionModule {}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudentevaluationService } from './studentevaluation.service';
import { StudentevaluationController } from './studentevaluation.controller';
import { Studentevaluation } from 'src/models/model.studentevaluation';
import { Users } from 'src/models/model.users';
import { EvaluationQuestion } from 'src/models/model.evaluationquestion';
import { EvaluationQuestionOption } from 'src/models/model.evaluationquestionoption';
import { SessionCours } from 'src/models/model.sessioncours';
import { Lesson } from 'src/models/model.lesson';
import { Lessondocument } from 'src/models/model.lessondocument';
import { UserInSession } from 'src/models/model.userinsession';
import { TrainingSession } from 'src/models/model.trainingssession';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';
import { JwtAuthGuardAsStudentInSession } from 'src/guard/guard.asstudentinsession';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Studentevaluation,
      Users,
      EvaluationQuestion,
      EvaluationQuestionOption,
      SessionCours,
      Lesson,
      Lessondocument,
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
          expiresIn: configService.get<string>('APPJWTMAXLIFE', '24h'),
        },
      }),
    }),
  ],
  controllers: [StudentevaluationController],
  providers: [
    StudentevaluationService,
    AllSercices,
    JwtService,
    JwtAuthGuardAsStudentInSession,
  ],
  exports: [StudentevaluationService],
})
export class StudentevaluationModule {}

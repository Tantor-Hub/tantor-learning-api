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
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Studentevaluation,
      Users,
      EvaluationQuestion,
      EvaluationQuestionOption,
      SessionCours,
      Lesson,
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
  providers: [StudentevaluationService, AllSercices, JwtService],
  exports: [StudentevaluationService],
})
export class StudentevaluationModule {}

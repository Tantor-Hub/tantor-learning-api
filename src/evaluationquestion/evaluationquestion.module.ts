import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EvaluationQuestionService } from './evaluationquestion.service';
import { EvaluationQuestionController } from './evaluationquestion.controller';
import { EvaluationQuestion } from 'src/models/model.evaluationquestion';
import { Studentevaluation } from 'src/models/model.studentevaluation';
import { EvaluationQuestionOption } from 'src/models/model.evaluationquestionoption';
import { StudentAnswer } from 'src/models/model.studentanswer';
import { Users } from 'src/models/model.users';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([
      EvaluationQuestion,
      Studentevaluation,
      EvaluationQuestionOption,
      StudentAnswer,
      Users,
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
  controllers: [EvaluationQuestionController],
  providers: [EvaluationQuestionService, AllSercices, JwtService],
  exports: [EvaluationQuestionService],
})
export class EvaluationQuestionModule {}

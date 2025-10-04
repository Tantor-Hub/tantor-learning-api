import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EvaluationQuestionOptionService } from './evaluationquestionoption.service';
import { EvaluationQuestionOptionController } from './evaluationquestionoption.controller';
import { EvaluationQuestionOption } from 'src/models/model.evaluationquestionoption';
import { EvaluationQuestion } from 'src/models/model.evaluationquestion';
import { StudentAnswerOption } from 'src/models/model.studentansweroption';
import { Users } from 'src/models/model.users';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([
      EvaluationQuestionOption,
      EvaluationQuestion,
      StudentAnswerOption,
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
  controllers: [EvaluationQuestionOptionController],
  providers: [EvaluationQuestionOptionService, AllSercices, JwtService],
  exports: [EvaluationQuestionOptionService],
})
export class EvaluationQuestionOptionModule {}

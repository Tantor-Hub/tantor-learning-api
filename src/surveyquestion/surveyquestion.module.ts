import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SurveyQuestionService } from './surveyquestion.service';
import { SurveyQuestionController } from './surveyquestion.controller';
import { SurveyQuestion } from 'src/models/model.surveyquestion';
import { Users } from 'src/models/model.users';
import { TrainingSession } from 'src/models/model.trainingssession';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([SurveyQuestion, Users, TrainingSession]),
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
  controllers: [SurveyQuestionController],
  providers: [SurveyQuestionService, AllSercices, JwtService],
  exports: [SurveyQuestionService],
})
export class SurveyQuestionModule {}

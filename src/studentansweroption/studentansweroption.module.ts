import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudentAnswerOptionService } from './studentansweroption.service';
import { StudentAnswerOptionController } from './studentansweroption.controller';
import { StudentAnswerOption } from 'src/models/model.studentansweroption';
import { StudentAnswer } from 'src/models/model.studentanswer';
import { EvaluationQuestionOption } from 'src/models/model.evaluationquestionoption';
import { Users } from 'src/models/model.users';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([
      StudentAnswerOption,
      StudentAnswer,
      EvaluationQuestionOption,
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
  controllers: [StudentAnswerOptionController],
  providers: [StudentAnswerOptionService, AllSercices, JwtService],
  exports: [StudentAnswerOptionService],
})
export class StudentAnswerOptionModule {}

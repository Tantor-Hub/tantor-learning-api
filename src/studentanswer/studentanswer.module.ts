import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudentAnswerService } from './studentanswer.service';
import { StudentAnswerController } from './studentanswer.controller';
import { StudentAnswer } from 'src/models/model.studentanswer';
import { EvaluationQuestion } from 'src/models/model.evaluationquestion';
import { Studentevaluation } from 'src/models/model.studentevaluation';
import { Users } from 'src/models/model.users';
import { StudentAnswerOption } from 'src/models/model.studentansweroption';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([
      StudentAnswer,
      EvaluationQuestion,
      Studentevaluation,
      Users,
      StudentAnswerOption,
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
  controllers: [StudentAnswerController],
  providers: [StudentAnswerService, AllSercices, JwtService],
  exports: [StudentAnswerService],
})
export class StudentAnswerModule {}

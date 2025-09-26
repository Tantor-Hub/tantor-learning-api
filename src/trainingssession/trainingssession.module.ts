import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TrainingSessionService } from './trainingssession.service';
import { TrainingSessionController } from './trainingssession.controller';
import { TrainingSession } from '../models/model.trainingssession';
import { Training } from '../models/model.trainings';
import { Users } from '../models/model.users';
import { AllSercices } from '../services/serices.all';
import { JwtService } from '../services/service.jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([TrainingSession, Training, Users]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('APPJWTTOKEN', 'defaultSecret'),
        signOptions: {
          expiresIn: configService.get<string>('APPJWTMAXLIFE', '1h'),
        },
      }),
    }),
  ],
  controllers: [TrainingSessionController],
  providers: [TrainingSessionService, AllSercices, JwtService],
  exports: [TrainingSessionService],
})
export class TrainingSessionModule {}

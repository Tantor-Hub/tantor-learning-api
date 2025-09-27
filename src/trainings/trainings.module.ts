import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TrainingsService } from './trainings.service';
import { TrainingsController } from './trainings.controller';
import { Training } from '../models/model.trainings';
import { TrainingCategory } from '../models/model.trainingcategory';
import { Users } from '../models/model.users';
import { AllSercices } from '../services/serices.all';
import { JwtService } from '../services/service.jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([Training, TrainingCategory, Users]),
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
  controllers: [TrainingsController],
  providers: [TrainingsService, AllSercices, JwtService],
  exports: [TrainingsService],
})
export class TrainingsModule {}

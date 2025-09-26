import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StudentSession } from '../models/model.studentsession';
import { TrainingSession } from '../models/model.trainingssession';
import { Users } from '../models/model.users';
import { StudentSessionController } from './studentsession.controller';
import { StudentSessionService } from './studentsession.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '../services/service.jwt';
import { AllSercices } from '../services/serices.all';

@Module({
  imports: [
    SequelizeModule.forFeature([StudentSession, TrainingSession, Users]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [StudentSessionController],
  providers: [StudentSessionService, JwtService, AllSercices],
  exports: [StudentSessionService],
})
export class StudentSessionModule {}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Event } from 'src/models/model.event';
import { Training } from 'src/models/model.trainings';
import { TrainingSession } from 'src/models/model.trainingssession';
import { SessionCours } from 'src/models/model.sessioncours';
import { Lesson } from 'src/models/model.lesson';
import { Users } from 'src/models/model.users';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Event,
      Training,
      TrainingSession,
      SessionCours,
      Lesson,
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
  controllers: [EventController],
  providers: [EventService, AllSercices, JwtService],
  exports: [EventService],
})
export class EventModule {}

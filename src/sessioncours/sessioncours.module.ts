import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SessionCoursService } from './sessioncours.service';
import { SessionCoursController } from './sessioncours.controller';
import { SessionCours } from 'src/models/model.sessioncours';
import { Users } from 'src/models/model.users';
import { TrainingSession } from 'src/models/model.trainingssession';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([SessionCours, Users, TrainingSession]),
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
  controllers: [SessionCoursController],
  providers: [SessionCoursService, AllSercices, JwtService],
  exports: [SessionCoursService],
})
export class SessionCoursModule {}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserInSessionService } from './userinsession.service';
import { UserInSessionController } from './userinsession.controller';
import { UserInSession } from '../models/model.userinsession';
import { TrainingSession } from '../models/model.trainingssession';
import { Training } from '../models/model.trainings';
import { Users } from '../models/model.users';
import { AllSercices } from '../services/serices.all';
import { JwtService } from '../services/service.jwt';
import { MailService } from '../services/service.mail';
import { CloudinaryService } from '../services/service.cloudinary';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserInSession,
      TrainingSession,
      Training,
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
  controllers: [UserInSessionController],
  providers: [
    UserInSessionService,
    AllSercices,
    JwtService,
    MailService,
    CloudinaryService,
  ],
  exports: [UserInSessionService],
})
export class UserInSessionModule {}

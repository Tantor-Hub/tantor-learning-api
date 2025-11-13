import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { MailService } from 'src/services/service.mail';
import { Users } from 'src/models/model.users';
import { UserRoles } from 'src/models/model.userroles';
import { AllSercices } from 'src/services/serices.all';
import { CryptoService } from 'src/services/service.crypto';
import { JwtService } from 'src/services/service.jwt';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from 'src/strategy/startegy.googleauth';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { Otp } from 'src/models/model.otp';
import { OtpCleanupService } from 'src/services/service.otpcleanup';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';
import {
  JwtAuthGuardAdminOrSecretary,
  JwtAuthGuardSecretaryAndInstructor,
  JwtAuthGuardAdminAndSecretary,
} from 'src/guard/guard.multi-role';

@Module({
  imports: [
    SequelizeModule.forFeature([Users, UserRoles, Otp]),
    ScheduleModule.forRoot(),
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
  controllers: [UsersController],
  providers: [
    UsersService,
    MailService,
    AllSercices,
    CryptoService,
    JwtService,
    GoogleStrategy,
    GoogleDriveService,
    OtpCleanupService,
    JwtAuthGuardAsSuperviseur,
    JwtAuthGuardAdminOrSecretary,
    JwtAuthGuardSecretaryAndInstructor,
    JwtAuthGuardAdminAndSecretary,
  ],
  exports: [UsersService, SequelizeModule],
})
export class UsersModule {}

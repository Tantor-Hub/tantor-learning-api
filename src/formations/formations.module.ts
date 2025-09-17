import { Module } from '@nestjs/common';
import { FormationsService } from './formations.service';
import { FormationsController } from './formations.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Formations } from 'src/models/model.formations';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { AllSercices } from 'src/services/serices.all';
import { MailService } from 'src/services/service.mail';
import { JwtService } from 'src/services/service.jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([Formations]),
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
  controllers: [FormationsController],
  providers: [
    FormationsService,
    GoogleDriveService,
    AllSercices,
    MailService,
    JwtService,
  ],
})
export class FormationsModule {}

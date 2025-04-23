import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { JwtService } from 'src/services/service.jwt';
import { MailService } from 'src/services/service.mail';
import { AllSercices } from 'src/services/serices.all';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sessions } from 'src/models/model.sessions';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([Sessions]),
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
  controllers: [SessionsController],
  providers: [SessionsService, JwtService, GoogleDriveService, AllSercices, MailService,]
})
export class SessionsModule { }

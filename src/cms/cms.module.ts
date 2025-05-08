import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { AllSercices } from 'src/services/serices.all';
import { AppInfos } from 'src/models/model.appinfos';
import { JwtService } from 'src/services/service.jwt';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { CryptoService } from 'src/services/service.crypto';
import { MailService } from 'src/services/service.mail';

@Module({
  imports: [
    SequelizeModule.forFeature([AppInfos]),
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
  controllers: [CmsController],
  providers: [AllSercices, CmsService, MailService, CryptoService, JwtService, GoogleDriveService],
})
export class CmsModule { }

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { AllSercices } from 'src/services/serices.all';
import { AppInfos } from 'src/models/model.appinfos';
import { JwtService } from 'src/services/service.jwt';
import { CloudinaryService } from 'src/services/service.cloudinary';
import { CryptoService } from 'src/services/service.crypto';
import { MailService } from 'src/services/service.mail';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/models/model.users';

import { Contacts } from 'src/models/model.contactform';
import { Newsletter } from 'src/models/model.newsletter';
import { Otp } from 'src/models/model.otp';
import { DocumentInstance } from 'src/models/model.documentinstance';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AppInfos,
      Newsletter,
      Users,
      Contacts,
      Otp,
      DocumentInstance,
    ]),
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
  providers: [
    AllSercices,
    CmsService,
    MailService,
    CryptoService,
    JwtService,
    CloudinaryService,
    UsersService,
    MailService,
  ],
})
export class CmsModule {}

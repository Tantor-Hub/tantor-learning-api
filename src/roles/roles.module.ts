import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Roles } from 'src/models/model.roles';
import { HasRoles } from 'src/models/model.userhasroles';
import { Users } from 'src/models/model.users';
import { MailService } from 'src/services/service.mail';
import { CryptoService } from 'src/services/service.crypto';
import { AllSercices } from '../services/serices.all';
import { JwtService } from 'src/services/service.jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GoogleDriveService } from 'src/services/service.googledrive';

@Module({
  imports: [
    SequelizeModule.forFeature([Roles, HasRoles]),
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
    SequelizeModule.forFeature([Users]),
  ],
  controllers: [RolesController],
  providers: [
    RolesService,
    MailService,
    CryptoService,
    AllSercices,
    JwtService,
    GoogleDriveService,
  ],
})
export class RolesModule {}

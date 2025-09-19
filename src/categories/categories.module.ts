import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';

import { MailService } from 'src/services/service.mail';
import { CryptoService } from 'src/services/service.crypto';
import { AllSercices } from 'src/services/serices.all';
import { Users } from 'src/models/model.users';
import { Categories } from 'src/models/model.categoriesformations';
import { JwtService } from 'src/services/service.jwt';
import { Thematiques } from 'src/models/model.groupeformations';
import { GoogleDriveService } from 'src/services/service.googledrive';

@Module({
  imports: [
    SequelizeModule.forFeature([Users, Categories, Thematiques]),
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
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    // Removed RolesService as roles module is deleted
    // RolesService,
    MailService,
    CryptoService,
    AllSercices,
    JwtService,
    GoogleDriveService,
  ],
})
export class CategoriesModule {}

import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Roles } from 'src/models/model.roles';
import { HasRoles } from 'src/models/model.userhasroles';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RolesService } from 'src/roles/roles.service';
import { MailService } from 'src/services/service.mail';
import { CryptoService } from 'src/services/service.crypto';
import { AllSercices } from 'src/services/serices.all';
import { Users } from 'src/models/model.users';
import { Categories } from 'src/models/model.categoriesformations';

@Module({
  imports: [
    SequelizeModule.forFeature([Roles, HasRoles, Users, Categories]),
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
  providers: [CategoriesService, RolesService, MailService, CryptoService, AllSercices]
})
export class CategoriesModule { }

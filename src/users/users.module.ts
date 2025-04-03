import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Roles } from 'src/models/model.roles';
import { HasRoles } from 'src/models/model.userhasroles';
import { MailService } from 'src/services/service.mail';
import { Users } from 'src/models/model.users';
import { AllSercices } from 'src/services/serices.all';
import { CryptoService } from 'src/services/service.crypto';
import { JwtService } from 'src/services/service.jwt';

@Module({
  imports: [SequelizeModule.forFeature([Roles, HasRoles, Users])],
  controllers: [UsersController],
  providers: [UsersService, MailService, AllSercices, CryptoService, JwtService],
})
export class UsersModule { }

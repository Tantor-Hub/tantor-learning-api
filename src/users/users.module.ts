import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Roles } from 'src/models/model.roles';
import { HasRoles } from 'src/models/model.userhasroles';
import { MailService } from 'src/services/service.mail';
import { Users } from 'src/models/model.users';

@Module({
  imports: [SequelizeModule.forFeature([Roles, HasRoles, Users])],
  controllers: [UsersController],
  providers: [UsersService, MailService],
})
export class UsersModule { }

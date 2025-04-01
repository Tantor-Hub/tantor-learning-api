import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Roles } from 'src/models/model.roles';
import { HasRoles } from 'src/models/model.userhasroles';
import { MailService } from 'src/services/service.mail';

@Module({
  imports: [SequelizeModule.forFeature([Roles, HasRoles])],
  controllers: [RolesController],
  providers: [RolesService, MailService],
})
export class RolesModule {}
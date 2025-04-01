import { Module } from '@nestjs/common';
import { HasrolesController } from './hasroles.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { HasRoles } from 'src/models/model.userhasroles';

@Module({
  controllers: [HasrolesController],
  // exports: [HasRoles],
  imports: [SequelizeModule.forFeature([HasRoles])]
})
export class HasrolesModule { }

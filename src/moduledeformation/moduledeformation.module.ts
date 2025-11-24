import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ModuleDeFormation } from 'src/models/model.moduledeformation';
import { ModuleDeFormationService } from './moduledeformation.service';
import { ModuleDeFormationController } from './moduledeformation.controller';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { CloudinaryService } from 'src/services/service.cloudinary';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { Users } from 'src/models/model.users';

@Module({
  imports: [SequelizeModule.forFeature([ModuleDeFormation, Users])],
  providers: [
    ModuleDeFormationService,
    AllSercices,
    JwtService,
    NestJwtService,
    CloudinaryService,
    JwtAuthGuardAsManagerSystem,
  ],
  controllers: [ModuleDeFormationController],
  exports: [ModuleDeFormationService],
})
export class ModuleDeFormationModule {}

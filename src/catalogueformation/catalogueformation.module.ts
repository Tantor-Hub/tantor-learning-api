import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CatalogueFormationController } from './catalogueformation.controller';
import { CatalogueFormationService } from './catalogueformation.service';
import { CatalogueFormation } from 'src/models/model.catalogueformation';
import { Users } from 'src/models/model.users';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { JwtService } from 'src/services/service.jwt';
import { ConfigService } from '@nestjs/config';
import { AllSercices } from 'src/services/serices.all';
import { CloudinaryService } from 'src/services/service.cloudinary';

@Module({
  imports: [SequelizeModule.forFeature([CatalogueFormation, Users])],
  controllers: [CatalogueFormationController],
  providers: [
    CatalogueFormationService,
    JwtAuthGuardAsManagerSystem,
    JwtService,
    ConfigService,
    AllSercices,
    CloudinaryService,
  ],
  exports: [CatalogueFormationService],
})
export class CatalogueFormationModule {}

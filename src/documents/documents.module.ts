import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentTemplate } from '../models/model.documenttemplate';
import { DocumentInstance } from '../models/model.documentinstance';
import { Users } from '../models/model.users';
import { TrainingSession } from '../models/model.trainingssession';
import { JwtService } from '../services/service.jwt';
import { ConfigService } from '@nestjs/config';
import { AllSercices } from '../services/serices.all';
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';

@Module({
  imports: [
    SequelizeModule.forFeature([
      DocumentTemplate,
      DocumentInstance,
      Users,
      TrainingSession,
    ]),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    JwtService,
    ConfigService,
    AllSercices,
    JwtAuthGuardAsSecretary,
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}

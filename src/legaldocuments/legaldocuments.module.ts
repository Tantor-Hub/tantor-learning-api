import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LegalDocumentsController } from './legaldocuments.controller';
import { LegalDocumentsService } from './legaldocuments.service';
import { LegalDocument } from 'src/models/model.legaldocument';
import { Users } from 'src/models/model.users';
import { JwtService } from 'src/services/service.jwt';
import { AllSercices } from 'src/services/serices.all';

@Module({
  imports: [SequelizeModule.forFeature([LegalDocument, Users])],
  controllers: [LegalDocumentsController],
  providers: [LegalDocumentsService, JwtService, AllSercices],
  exports: [LegalDocumentsService],
})
export class LegalDocumentsModule {}

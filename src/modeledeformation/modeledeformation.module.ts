import { Module } from '@nestjs/common';
import { ModeledeformationController } from './modeledeformation.controller';
import { ModeledeformationService } from './modeledeformation.service';

@Module({
  controllers: [ModeledeformationController],
  providers: [ModeledeformationService],
})
export class ModeledeformationModule {}

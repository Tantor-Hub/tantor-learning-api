import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookCategoryController } from './bookcategory.controller';
import { BookCategoryService } from './bookcategory.service';
import { BookCategory } from 'src/models/model.bookcategory';
import { Users } from 'src/models/model.users';
import { JwtService } from 'src/services/service.jwt';
import { AllSercices } from 'src/services/serices.all';

@Module({
  imports: [SequelizeModule.forFeature([BookCategory, Users])],
  controllers: [BookCategoryController],
  providers: [BookCategoryService, JwtService, AllSercices],
  exports: [BookCategoryService],
})
export class BookCategoryModule {}


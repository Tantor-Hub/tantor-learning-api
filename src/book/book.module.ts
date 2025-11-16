import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { Book } from 'src/models/model.book';
import { BookCategory } from 'src/models/model.bookcategory';
import { Users } from 'src/models/model.users';
import { JwtService } from 'src/services/service.jwt';
import { AllSercices } from 'src/services/serices.all';
import { GoogleDriveService } from 'src/services/service.googledrive';

@Module({
  imports: [SequelizeModule.forFeature([Book, BookCategory, Users])],
  controllers: [BookController],
  providers: [BookService, JwtService, AllSercices, GoogleDriveService],
  exports: [BookService],
})
export class BookModule {}


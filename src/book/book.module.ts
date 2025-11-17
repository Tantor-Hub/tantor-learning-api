import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { Book } from 'src/models/model.book';
import { BookCategory } from 'src/models/model.bookcategory';
import { UserInSession } from 'src/models/model.userinsession';
import { Users } from 'src/models/model.users';
import { TrainingSession } from 'src/models/model.trainingssession';
import { JwtService } from 'src/services/service.jwt';
import { AllSercices } from 'src/services/serices.all';
import { GoogleDriveService } from 'src/services/service.googledrive';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Book,
      BookCategory,
      Users,
      UserInSession,
      TrainingSession,
    ]),
  ],
  controllers: [BookController],
  providers: [BookService, JwtService, AllSercices, GoogleDriveService],
  exports: [BookService],
})
export class BookModule {}


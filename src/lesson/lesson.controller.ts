import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsFormateur } from 'src/guard/guard.assecretaireandformateur';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoogleDriveService } from 'src/services/service.googledrive';

@Controller('lessons')
export class LessonController {
  constructor(
    private readonly lessonService: LessonService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.lessonService.findAllLessons();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.findLessonById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuardAsFormateur)
  async create(
    @User() user: IJwtSignin,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.lessonService.createLesson(createLessonDto, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuardAsFormateur)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonService.updateLesson(id, updateLessonDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsFormateur)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.deleteLesson(id);
  }

  @Get(':id/documents')
  @UseGuards(JwtAuthGuard)
  async getDocuments(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.getDocumentsByLesson(id);
  }

  @Post(':id/documents')
  @UseGuards(JwtAuthGuardAsFormateur)
  @UseInterceptors(
    FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }),
  )
  async addDocument(
    @User() user: IJwtSignin,
    @Param('id', ParseIntPipe) id: number,
    @Body() doc: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let piece_jointe: any = null;
    let type: string = '';
    if (file) {
      const result = await this.googleDriveService.uploadBufferFile(file);
      if (result) {
        const { id, name, link } = result;
        const extension = name.split('.').pop();
        type = extension ? extension.toLowerCase() : '';
        piece_jointe = link;
      }
    }
    return this.lessonService.addDocumentToLesson(
      {
        ...doc,
        id_lesson: id,
        piece_jointe,
        type,
      },
      user,
    );
  }
}

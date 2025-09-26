import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsFormateur } from 'src/guard/guard.assecretaireandformateur';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { DeleteLessonDto } from './dto/delete-lesson.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoogleDriveService } from 'src/services/service.googledrive';

@ApiTags('Lessons')
@Controller('lesson')
export class LessonController {
  constructor(
    private readonly lessonService: LessonService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all lessons' })
  @ApiResponse({
    status: 200,
    description: 'List of all lessons',
    schema: {
      example: {
        status: 200,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Introduction to Programming',
            description: 'Basic concepts of programming',
            id_cours: '550e8400-e29b-41d4-a716-446655440001',
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
          },
        ],
      },
    },
  })
  async findAll() {
    return this.lessonService.findAllLessons();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lesson by ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Lesson details',
    schema: {
      example: {
        status: 200,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Introduction to Programming',
          description: 'Basic concepts of programming',
          id_cours: '550e8400-e29b-41d4-a716-446655440001',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonService.findLessonById(id);
  }

  @Post('/create')
  @UseGuards(JwtAuthGuardAsFormateur)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiBody({ type: CreateLessonDto })
  @ApiResponse({
    status: 201,
    description: 'Lesson created successfully',
    schema: {
      example: {
        status: 201,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Introduction to Programming',
          description: 'Basic concepts of programming',
          id_cours: '550e8400-e29b-41d4-a716-446655440001',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  async create(
    @User() user: IJwtSignin,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.lessonService.createLesson(createLessonDto, user);
  }

  // @Post('create')
  // @UseGuards(JwtAuthGuardAsFormateur)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Create a new lesson (root route)' })
  // @ApiBody({ type: CreateLessonDto })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Lesson created successfully',
  //   schema: {
  //     example: {
  //       status: 201,
  //       data: {
  //         id: 1,
  //         title: 'Introduction to Programming',
  //         description: 'Basic concepts of programming',
  //         id_cours: 1,
  //         createdAt: '2025-01-15T10:30:00.000Z',
  //         updatedAt: '2025-01-15T10:30:00.000Z',
  //       },
  //     },
  //   },
  // })
  // async createRoot(
  //   @User() user: IJwtSignin,
  //   @Body() createLessonDto: CreateLessonDto,
  // ) {
  //   return this.lessonService.createLesson(createLessonDto, user);
  // }

  @Put('/update')
  @UseGuards(JwtAuthGuardAsFormateur)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lesson by ID' })
  @ApiBody({ type: UpdateLessonDto })
  @ApiResponse({
    status: 200,
    description: 'Lesson updated successfully',
    schema: {
      example: {
        status: 200,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Advanced Programming',
          description: 'Advanced concepts of programming',
          id_cours: '550e8400-e29b-41d4-a716-446655440001',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-16T10:30:00.000Z',
        },
      },
    },
  })
  async update(@Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonService.updateLesson(updateLessonDto);
  }

  // @Put(':id_lesson/update')
  // @UseGuards(JwtAuthGuardAsFormateur)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Update lesson by ID (root route)' })
  // @ApiParam({ name: 'id_lesson', description: 'Lesson ID', type: Number })
  // @ApiBody({ type: UpdateLessonDto })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Lesson updated successfully',
  //   schema: {
  //     example: {
  //       status: 200,
  //       data: {
  //         id: 1,
  //         title: 'Advanced Programming',
  //         description: 'Advanced concepts of programming',
  //         id_cours: 1,
  //         createdAt: '2025-01-15T10:30:00.000Z',
  //         updatedAt: '2025-01-16T10:30:00.000Z',
  //       },
  //     },
  //   },
  // })
  // async updateRoot(
  //   @Param('id_lesson', ParseIntPipe) id: number,
  //   @Body() updateLessonDto: UpdateLessonDto,
  // ) {
  //   return this.lessonService.updateLesson(id, updateLessonDto);
  // }

  @Delete('/delete')
  @UseGuards(JwtAuthGuardAsFormateur)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lesson by ID' })
  @ApiBody({ type: DeleteLessonDto })
  @ApiResponse({
    status: 200,
    description: 'Lesson deleted successfully',
    schema: {
      example: {
        status: 200,
        message: 'Lesson deleted successfully',
      },
    },
  })
  async remove(@Body() deleteLessonDto: DeleteLessonDto) {
    return this.lessonService.deleteLesson(deleteLessonDto.id);
  }
}

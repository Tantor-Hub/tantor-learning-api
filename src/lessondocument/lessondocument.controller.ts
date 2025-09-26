import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { LessondocumentService } from './lessondocument.service';
import { CreateLessondocumentDto } from './dto/create-lessondocument.dto';
import { UpdateLessondocumentDto } from './dto/update-lessondocument.dto';
import { JwtAuthGuard } from 'src/guard/guard.jwt';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';

@ApiTags('lessondocument')
@ApiBearerAuth()
@Controller('document')
@UseGuards(JwtAuthGuard)
export class LessondocumentController {
  constructor(private readonly lessondocumentService: LessondocumentService) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Create a new lesson document' })
  @ApiBody({
    type: CreateLessondocumentDto,
    examples: {
      default: {
        summary: 'Create lesson document example',
        value: {
          file_name: 'lesson-notes.pdf',
          url: 'https://example.com/documents/lesson-notes.pdf',
          type: 'PDF',
          id_lesson: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
      minimal: {
        summary: 'Minimal lesson document creation',
        value: {
          file_name: 'document.pdf',
          url: 'https://example.com/document.pdf',
          id_lesson: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Lesson document created successfully',
    schema: {
      example: {
        status: 201,
        message: 'Lesson document created successfully',
        data: {
          id: 1,
          file_name: 'lesson-notes.pdf',
          url: 'https://example.com/documents/lesson-notes.pdf',
          type: 'PDF',
          id_lesson: '550e8400-e29b-41d4-a716-446655440000',
          createdBy: 1,
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
          CreatedBy: {
            id: 1,
            fs_name: 'John',
            ls_name: 'Doe',
            email: 'john.doe@example.com',
          },
          lesson: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Introduction to Programming',
            description: 'Basic programming concepts',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data provided',
    schema: {
      example: {
        status: 400,
        data: 'File name and URL are required',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    schema: {
      example: {
        status: 404,
        data: 'Lesson not found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while creating lesson document',
          error: 'Error message',
        },
      },
    },
  })
  create(
    @User() user: IJwtSignin,
    @Body() createLessondocumentDto: CreateLessondocumentDto,
  ) {
    return this.lessondocumentService.create(user, createLessondocumentDto);
  }

  @Get('getall')
  @ApiOperation({ summary: 'Get all lesson documents' })
  @ApiResponse({
    status: 200,
    description: 'Lesson documents retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Lesson documents retrieved successfully',
        data: {
          lessondocuments: [
            {
              id: 1,
              file_name: 'lesson-notes.pdf',
              url: 'https://example.com/documents/lesson-notes.pdf',
              type: 'PDF',
              id_lesson: '550e8400-e29b-41d4-a716-446655440000',
              createdBy: 1,
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              CreatedBy: {
                id: 1,
                fs_name: 'John',
                ls_name: 'Doe',
                email: 'john.doe@example.com',
              },
              lesson: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                title: 'Introduction to Programming',
                description: 'Basic programming concepts',
              },
            },
          ],
          total: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while fetching lesson documents',
          error: 'Error message',
        },
      },
    },
  })
  findAll() {
    return this.lessondocumentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson document by ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson document retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Lesson document retrieved successfully',
        data: {
          id: 1,
          file_name: 'lesson-notes.pdf',
          url: 'https://example.com/documents/lesson-notes.pdf',
          type: 'PDF',
          id_lesson: '550e8400-e29b-41d4-a716-446655440000',
          createdBy: 1,
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
          CreatedBy: {
            id: 1,
            fs_name: 'John',
            ls_name: 'Doe',
            email: 'john.doe@example.com',
          },
          lesson: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Introduction to Programming',
            description: 'Basic programming concepts',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson document not found',
    schema: {
      example: {
        status: 404,
        data: 'Lesson document not found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while fetching lesson document',
          error: 'Error message',
        },
      },
    },
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessondocumentService.findOne(id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Update lesson document' })
  @ApiBody({
    type: UpdateLessondocumentDto,
    examples: {
      default: {
        summary: 'Update lesson document example',
        value: {
          file_name: 'updated-lesson-notes.pdf',
          url: 'https://example.com/documents/updated-lesson-notes.pdf',
          type: 'PDF',
        },
      },
      minimal: {
        summary: 'Minimal lesson document update',
        value: {
          file_name: 'new-document.pdf',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson document updated successfully',
    schema: {
      example: {
        status: 200,
        message: 'Lesson document updated successfully',
        data: {
          id: 1,
          file_name: 'updated-lesson-notes.pdf',
          url: 'https://example.com/documents/updated-lesson-notes.pdf',
          type: 'PDF',
          id_lesson: '550e8400-e29b-41d4-a716-446655440000',
          createdBy: 1,
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:30:00.000Z',
          CreatedBy: {
            id: 1,
            fs_name: 'John',
            ls_name: 'Doe',
            email: 'john.doe@example.com',
          },
          lesson: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Introduction to Programming',
            description: 'Basic programming concepts',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson document not found',
    schema: {
      example: {
        status: 404,
        data: 'Lesson document not found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while updating lesson document',
          error: 'Error message',
        },
      },
    },
  })
  update(
    @User() user: IJwtSignin,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessondocumentDto: UpdateLessondocumentDto,
  ) {
    return this.lessondocumentService.update(user, id, updateLessondocumentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Delete lesson document' })
  @ApiResponse({
    status: 200,
    description: 'Lesson document deleted successfully',
    schema: {
      example: {
        status: 200,
        message: 'Lesson document deleted successfully',
        data: { id: 1 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson document not found',
    schema: {
      example: {
        status: 404,
        data: 'Lesson document not found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while deleting lesson document',
          error: 'Error message',
        },
      },
    },
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessondocumentService.remove(id);
  }
}

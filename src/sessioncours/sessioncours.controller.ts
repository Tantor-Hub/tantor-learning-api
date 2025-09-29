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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import {
  SessionCoursCreateApiResponse,
  SessionCoursGetAllApiResponse,
  SessionCoursFindBySessionIdApiResponse,
  SessionCoursFindByFormateurIdApiResponse,
  SessionCoursGetByIdApiResponse,
  SessionCoursUpdateApiResponse,
  SessionCoursDeleteApiResponse,
} from '../swagger/swagger.sessioncours';
import { SessionCoursService } from './sessioncours.service';
import { CreateSessionCoursDto } from './dto/create-sessioncours.dto';
import { UpdateSessionCoursDto } from './dto/update-sessioncours.dto';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';

@ApiTags('Session Courses')
@Controller('sessioncours')
export class SessionCoursController {
  constructor(private readonly sessionCoursService: SessionCoursService) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Create a new session course' })
  @ApiBody({
    type: CreateSessionCoursDto,
    examples: {
      example1: {
        summary: 'Basic session course',
        value: {
          title: 'Advanced React Development',
          description: 'Learn advanced React concepts and best practices',
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          is_published: false,
          id_formateur: ['1', '2'],
        },
      },
      example2: {
        summary: 'Another session course',
        value: {
          title: 'Introduction to JavaScript',
          description: 'Basic JavaScript concepts and fundamentals',
          id_session: '550e8400-e29b-41d4-a716-446655440001',
          is_published: true,
          id_formateur: ['3'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Session course created successfully',
    schema: {
      example: {
        status: 201,
        message: 'Session course created successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Advanced React Development',
          description: 'Learn advanced React concepts and best practices',
          is_published: false,
          id_formateur: ['1', '2'],
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          createdBy: '550e8400-e29b-41d4-a716-446655440009',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
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
          message: 'Internal server error while creating session course',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  async create(
    @User() user: IJwtSignin,
    @Body() createSessionCoursDto: CreateSessionCoursDto,
  ) {
    return this.sessionCoursService.create(user, createSessionCoursDto);
  }

  @Get('getall')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Get all session courses' })
  @ApiResponse({
    status: 200,
    description: 'Session courses retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session courses retrieved successfully',
        data: {
          length: 2,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              title: 'Advanced React Development',
              description: 'Learn advanced React concepts and best practices',
              is_published: false,
              id_formateur: ['1', '2'],
              id_session: '550e8400-e29b-41d4-a716-446655440000',
              createdBy: '550e8400-e29b-41d4-a716-446655440009',
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              CreatedBy: {
                id: 1,
                fs_name: 'John',
                ls_name: 'Doe',
                email: 'john.doe@example.com',
              },
              trainingSession: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                title: 'Advanced React Development Session',
                nb_places: 30,
                available_places: 25,
                begining_date: '2024-03-15T09:00:00.000Z',
                ending_date: '2024-03-20T17:00:00.000Z',
              },
            },
          ],
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
          message: 'Internal server error while fetching session courses',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  async findAll() {
    return this.sessionCoursService.findAll();
  }

  @Get('session/:sessionId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Get all session courses by session ID' })
  @ApiResponse({
    status: 200,
    description: 'Session courses retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session courses retrieved successfully',
        data: {
          length: 2,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              title: 'Advanced React Development',
              description: 'Learn advanced React concepts and best practices',
              is_published: false,
              id_formateur: ['1', '2'],
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440002',
              title: 'Introduction to JavaScript',
              description: 'Basic JavaScript concepts and fundamentals',
              is_published: true,
              id_formateur: ['3'],
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
    schema: {
      example: {
        status: 404,
        message: 'Session not found',
        data: null,
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
          message: 'Internal server error while retrieving session courses',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  async findBySessionId(@Param('sessionId') sessionId: string) {
    return this.sessionCoursService.findBySessionId(sessionId);
  }

  @Get('formateur/:formateurId')
  @UseGuards(JwtAuthGuardAsSuperviseur)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get session courses by formateur ID' })
  @ApiParam({ name: 'formateurId', description: 'Formateur ID', type: String })
  @SessionCoursFindByFormateurIdApiResponse()
  async findByFormateurId(@Param('formateurId') formateurId: string) {
    return this.sessionCoursService.findByFormateurId(formateurId);
  }

  @Get(':id/lessons')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Get lessons by session course ID' })
  @ApiParam({ name: 'id', description: 'Session course ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Lessons retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Lessons retrieved successfully',
        data: {
          length: 3,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              title: 'Introduction to React',
              description: 'Basic concepts of React framework',
              id_cours: '550e8400-e29b-41d4-a716-446655440000',
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440002',
              title: 'React Components',
              description: 'Understanding React components and props',
              id_cours: '550e8400-e29b-41d4-a716-446655440000',
              createdAt: '2025-01-25T11:00:00.000Z',
              updatedAt: '2025-01-25T11:00:00.000Z',
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440003',
              title: 'React State Management',
              description: 'Managing state in React applications',
              id_cours: '550e8400-e29b-41d4-a716-446655440000',
              createdAt: '2025-01-25T12:00:00.000Z',
              updatedAt: '2025-01-25T12:00:00.000Z',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session course not found',
    schema: {
      example: {
        status: 404,
        message: 'Session course not found',
        data: null,
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
          message: 'Internal server error while retrieving lessons',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  async findLessonsByCourseId(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionCoursService.findLessonsByCourseId(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Get a session course by ID' })
  @ApiResponse({
    status: 200,
    description: 'Session course retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session course retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Advanced React Development',
          description: 'Learn advanced React concepts and best practices',
          is_published: false,
          id_formateur: ['1', '2'],
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          createdBy: '550e8400-e29b-41d4-a716-446655440009',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
          CreatedBy: {
            id: 1,
            fs_name: 'John',
            ls_name: 'Doe',
            email: 'john.doe@example.com',
          },
          trainingSession: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Advanced React Development Session',
            nb_places: 30,
            available_places: 25,
            begining_date: '2024-03-15T09:00:00.000Z',
            ending_date: '2024-03-20T17:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session course not found',
    schema: {
      example: {
        status: 404,
        data: 'Session course not found',
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
          message: 'Internal server error while fetching session course',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionCoursService.findOne(id);
  }

  @Patch('update')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Update a session course' })
  @ApiBody({
    type: UpdateSessionCoursDto,
    examples: {
      example1: {
        summary: 'Update session course',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Updated Advanced React Development',
          description: 'Updated description with new content',
          is_published: true,
          id_formateur: ['1', '3'],
        },
      },
      example2: {
        summary: 'Update only is_published',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          is_published: true,
        },
      },
      example3: {
        summary: 'Update only id_formateur',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          id_formateur: ['2', '4'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Session course updated successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session course updated successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Updated Advanced React Development',
          description: 'Updated description with new content',
          is_published: true,
          id_formateur: ['1', '3'],
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          createdBy: '550e8400-e29b-41d4-a716-446655440009',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T11:00:00.000Z',
          CreatedBy: {
            id: 1,
            fs_name: 'John',
            ls_name: 'Doe',
            email: 'john.doe@example.com',
          },
          trainingSession: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Advanced React Development Session',
            nb_places: 30,
            available_places: 25,
            begining_date: '2024-03-15T09:00:00.000Z',
            ending_date: '2024-03-20T17:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session course not found',
    schema: {
      example: {
        status: 404,
        data: 'Session course not found',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
    schema: {
      example: {
        status: 403,
        data: 'You do not have permission to update this session course',
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
          message: 'Internal server error while updating session course',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  async update(
    @User() user: IJwtSignin,
    @Body() updateSessionCoursDto: UpdateSessionCoursDto,
  ) {
    return this.sessionCoursService.update(
      user,
      updateSessionCoursDto.id,
      updateSessionCoursDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Delete a session course' })
  @ApiResponse({
    status: 200,
    description: 'Session course deleted successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session course deleted successfully',
        data: {
          message: 'Session course deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session course not found',
    schema: {
      example: {
        status: 404,
        data: 'Session course not found',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
    schema: {
      example: {
        status: 403,
        data: 'You do not have permission to delete this session course',
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
          message: 'Internal server error while deleting session course',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  async remove(
    @User() user: IJwtSignin,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sessionCoursService.remove(user, id);
  }
}

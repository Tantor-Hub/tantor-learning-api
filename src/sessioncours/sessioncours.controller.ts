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
import { JwtAuthGuardUniversalFactory } from 'src/guard/guard.universal-factory';
import {
  RequireAnyRole,
  RequireAllRoles,
  RequireAnyRoleStrict,
  UniversalRoles,
} from 'src/guard/decorators/universal-roles.decorator';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';

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
          ponderation: 2,
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
          ponderation: 1,
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
          formateurs: [
            {
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
            },
            {
              id: '2',
              firstName: 'Jane',
              lastName: 'Smith',
            },
          ],
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          ponderation: 2,
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
  @UseGuards(JwtAuthGuardUniversalFactory)
  @RequireAnyRole('admin', 'secretary')
  @ApiOperation({
    summary: 'Get all session courses (Admin OR Secretary)',
    description:
      'This endpoint can be accessed by users who have admin OR secretary role',
  })
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
              formateurs: [
                {
                  id: '1',
                  firstName: 'John',
                  lastName: 'Doe',
                },
                {
                  id: '2',
                  firstName: 'Jane',
                  lastName: 'Smith',
                },
              ],
              id_session: '550e8400-e29b-41d4-a716-446655440000',
              ponderation: 2,
              createdBy: '550e8400-e29b-41d4-a716-446655440009',
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              CreatedBy: {
                id: 1,
                fs_name: 'John',
                ls_name: 'Doe',
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
    status: 401,
    description: 'Unauthorized - Admin OR Secretary role required',
    schema: {
      example: {
        status: 401,
        message:
          "La clé d'authentification fournie n'a pas les droits requis pour accéder à ces ressources",
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
              formateurs: [
                {
                  id: '1',
                  firstName: 'John',
                  lastName: 'Doe',
                },
                {
                  id: '2',
                  firstName: 'Jane',
                  lastName: 'Smith',
                },
              ],
              ponderation: 2,
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440002',
              title: 'Introduction to JavaScript',
              description: 'Basic JavaScript concepts and fundamentals',
              is_published: true,
              formateurs: [
                {
                  id: '3',
                  firstName: 'Bob',
                  lastName: 'Johnson',
                },
              ],
              ponderation: 1,
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

  @Get('student/session/:sessionId')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get courses by session ID (Student access)',
    description:
      'Retrieves all courses for a specific training session. Students can access courses related to sessions they are enrolled in.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Training Session UUID',
    example: '3f51f834-7a3f-41c7-83ad-2da85589f503',
  })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Courses retrieved successfully',
        },
        data: {
          type: 'object',
          properties: {
            length: { type: 'number', example: 2 },
            rows: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    example: '550e8400-e29b-41d4-a716-446655440001',
                  },
                  title: {
                    type: 'string',
                    example: 'Advanced React Development',
                  },
                  description: {
                    type: 'string',
                    example: 'Learn advanced React concepts and best practices',
                  },
                  is_published: {
                    type: 'boolean',
                    example: true,
                  },
                  ponderation: {
                    type: 'number',
                    example: 2,
                  },
                  formateurs: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '1',
                        },
                        firstName: {
                          type: 'string',
                          example: 'John',
                        },
                        lastName: {
                          type: 'string',
                          example: 'Doe',
                        },
                      },
                    },
                  },
                  createdAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-01-25T10:00:00.000Z',
                  },
                  updatedAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-01-25T10:00:00.000Z',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Student access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found or no courses found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findBySessionIdForStudent(@Param('sessionId') sessionId: string) {
    return this.sessionCoursService.findBySessionId(sessionId);
  }

  @Get('instructor/mycourses')
  @UseGuards(JwtAuthGuardAsSuperviseur)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get session courses for the authenticated formateur',
  })
  @SessionCoursFindByFormateurIdApiResponse()
  async findByFormateurId(@User() user: IJwtSignin) {
    return this.sessionCoursService.findByFormateurId(user);
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
  @UseGuards(JwtAuthGuardUniversalFactory)
  @RequireAnyRole('secretary', 'instructor')
  @ApiOperation({
    summary: 'Get a session course by ID (Secretary OR Instructor)',
  })
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
          formateurs: [
            {
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
            },
            {
              id: '2',
              firstName: 'Jane',
              lastName: 'Smith',
            },
          ],
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          ponderation: 2,
          createdBy: '550e8400-e29b-41d4-a716-446655440009',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
          CreatedBy: {
            id: 1,
            fs_name: 'John',
            ls_name: 'Doe',
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
          ponderation: 3,
        },
      },
      example2: {
        summary: 'Update only is_published',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          is_published: true,
          ponderation: 2,
        },
      },
      example3: {
        summary: 'Update only id_formateur',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          id_formateur: ['2', '4'],
          ponderation: 1,
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
          formateurs: [
            {
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
            },
            {
              id: '3',
              firstName: 'Bob',
              lastName: 'Johnson',
            },
          ],
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          ponderation: 3,
          createdBy: '550e8400-e29b-41d4-a716-446655440009',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T11:00:00.000Z',
          CreatedBy: {
            id: 1,
            fs_name: 'John',
            ls_name: 'Doe',
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

  // Example endpoints demonstrating different role combinations

  @Get('examples/any-three-roles')
  @UseGuards(JwtAuthGuardUniversalFactory)
  @RequireAnyRole('admin', 'secretary', 'instructor')
  @ApiOperation({
    summary: 'Example: Any of 3 roles (Admin OR Secretary OR Instructor)',
    description:
      'This endpoint can be accessed by users who have admin OR secretary OR instructor role',
  })
  async exampleAnyThreeRoles() {
    return {
      message: 'Access granted: You have admin, secretary, or instructor role',
    };
  }

  @Get('examples/all-two-roles')
  @UseGuards(JwtAuthGuardUniversalFactory)
  @RequireAllRoles('admin', 'secretary')
  @ApiOperation({
    summary: 'Example: All of 2 roles (Admin AND Secretary)',
    description:
      'This endpoint can only be accessed by users who have BOTH admin AND secretary roles',
  })
  async exampleAllTwoRoles() {
    return {
      message: 'Access granted: You have both admin AND secretary roles',
    };
  }

  @Get('examples/custom-config')
  @UseGuards(JwtAuthGuardUniversalFactory)
  @UniversalRoles({
    requiredRoles: ['instructor', 'secretary'],
    requireAll: false,
    allowAdminOverride: false, // Even admin needs to meet the role requirements
  })
  @ApiOperation({
    summary:
      'Example: Custom configuration (Instructor OR Secretary, no admin override)',
    description:
      'This endpoint can be accessed by instructor OR secretary, but admin override is disabled',
  })
  async exampleCustomConfig() {
    return {
      message:
        'Access granted: You have instructor or secretary role (admin override disabled)',
    };
  }

  @Get('examples/strict-any')
  @UseGuards(JwtAuthGuardUniversalFactory)
  @RequireAnyRoleStrict('student', 'instructor')
  @ApiOperation({
    summary:
      'Example: Strict any role (Student OR Instructor, no admin override)',
    description:
      'This endpoint can be accessed by student OR instructor, but admin cannot override',
  })
  async exampleStrictAny() {
    return {
      message:
        'Access granted: You have student or instructor role (strict mode)',
    };
  }
}

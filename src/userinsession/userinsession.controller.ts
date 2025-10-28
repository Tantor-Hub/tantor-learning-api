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
import { UserInSessionService } from './userinsession.service';
import { CreateUserInSessionDto } from './dto/create-userinsession.dto';
import { UpdateUserInSessionDto } from './dto/update-userinsession.dto';
import { DeleteUserInSessionDto } from './dto/delete-userinsession.dto';
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';
import { JwtAuthGuardAsStudent } from '../guard/guard.asstudent';
import { UserInSessionStatus } from '../enums/user-in-session-status.enum';
import { User } from '../strategy/strategy.globaluser';
import { IJwtSignin } from '../interface/interface.payloadjwtsignin';

@ApiTags('User In Session')
@Controller('userinsession')
export class UserInSessionController {
  constructor(private readonly userInSessionService: UserInSessionService) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new user in session',
    description: `
**CreateUserInSessionDto Structure:**
\`\`\`typescript
{
  id_session: string;                    // Required - Training session ID
  status?: UserInSessionStatus;          // Optional - User status (default: pending)
  id_user: string;                       // Required - User ID
}
\`\`\`
    `,
  })
  @ApiBody({
    type: CreateUserInSessionDto,
    examples: {
      example1: {
        summary: 'Basic user in session creation',
        value: {
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          id_user: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
      example2: {
        summary: 'User in session with specific status',
        value: {
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          status: 'in',
          id_user: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User in session created successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: 'User in session created successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            id_session: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            status: {
              type: 'string',
              enum: ['refusedpayment', 'notpaid', 'pending', 'in', 'out'],
              example: 'pending',
            },
            id_user: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            trainingSession: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
                nb_places: { type: 'number' },
                available_places: { type: 'number' },
                begining_date: { type: 'string', format: 'date-time' },
                ending_date: { type: 'string', format: 'date-time' },
              },
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                firstName: { type: 'string' },
                lastname: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Training session or user not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'User already in session or no available places.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  create(@Body() createUserInSessionDto: CreateUserInSessionDto) {
    console.log(
      '[USER IN SESSION CONTROLLER] Create endpoint called with data:',
      createUserInSessionDto,
    );
    return this.userInSessionService.create(createUserInSessionDto);
  }

  @Post('create-free-session')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create UserInSession for free training session',
    description: `
# 🆓 Free Training Session Enrollment

**Creates a UserInSession for training sessions with price 0 (student access)**

## 📋 Process
1. **Validate Training Session**: Checks if session exists and has price 0
2. **Check Existing Enrollment**: Prevents duplicate enrollments
3. **Create UserInSession**: Creates enrollment record with IN status
4. **Reduce Available Places**: Updates session capacity
5. **Send Confirmation**: Sends enrollment confirmation email

## 🎯 Use Cases
- Free training sessions
- Student access programs
- Complimentary courses
- Trial sessions

## 📊 Request Body
\`\`\`json
{
  "id_session": "550e8400-e29b-41d4-a716-446655440000"
}
\`\`\`

## ✅ Response
\`\`\`json
{
  "status": 201,
  "data": {
    "id": "userinsession-id",
    "id_user": "user-id",
    "id_session": "session-id",
    "status": "IN",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Inscription gratuite créée avec succès"
}
\`\`\`

## ❌ Error Handling
- **Session Not Found**: Returns 404 if session doesn't exist
- **Not Free Session**: Returns 400 if session price is not 0
- **Already Enrolled**: Returns 400 if user already enrolled
- **No Available Places**: Returns 400 if session is full
    `,
  })
  @ApiBody({
    description: 'Free session enrollment data',
    schema: {
      type: 'object',
      required: ['id_session'],
      properties: {
        id_session: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440000',
          description: 'Training session ID for free enrollment',
        },
      },
    },
    examples: {
      example1: {
        summary: 'Free session enrollment',
        value: {
          id_session: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Free session enrollment created successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'userinsession-id' },
            id_user: { type: 'string', example: 'user-id' },
            id_session: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            status: { type: 'string', example: 'IN' },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          },
        },
        message: {
          type: 'string',
          example: 'Inscription gratuite créée avec succès',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - session not free or already enrolled',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        data: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: "Cette session de formation n'est pas gratuite",
            },
          },
        },
        message: {
          type: 'string',
          example: "Impossible de s'inscrire à cette session",
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Training session not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async createFreeSessionEnrollment(
    @Body() body: { id_session: string },
    @User() user: IJwtSignin,
  ) {
    console.log(
      '[FREE SESSION ENROLLMENT] Creating free session enrollment for:',
      body.id_session,
    );
    const userId = user.id_user;
    return this.userInSessionService.createFreeSessionEnrollment(
      body.id_session,
      userId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users in sessions (Root endpoint)',
    description:
      'Retrieve all user-session relationships. This is the main endpoint for getting all user sessions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users in sessions retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Users in sessions retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              id_session: { type: 'string', format: 'uuid' },
              status: {
                type: 'string',
                enum: ['refusedpayment', 'notpaid', 'pending', 'in', 'out'],
              },
              id_user: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              trainingSession: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  title: { type: 'string' },
                  nb_places: { type: 'number' },
                  available_places: { type: 'number' },
                  begining_date: { type: 'string', format: 'date-time' },
                  ending_date: { type: 'string', format: 'date-time' },
                },
              },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  firstName: { type: 'string' },
                  lastname: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
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
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findAll() {
    console.log(
      '[USER IN SESSION CONTROLLER] Root endpoint called - getting all user sessions',
    );
    return this.userInSessionService.findAll();
  }

  @Get('getall')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users in sessions (Legacy endpoint)' })
  @ApiResponse({
    status: 200,
    description: 'Users in sessions retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Users in sessions retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              id_session: { type: 'string', format: 'uuid' },
              status: {
                type: 'string',
                enum: ['refusedpayment', 'notpaid', 'pending', 'in', 'out'],
              },
              id_user: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              trainingSession: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  title: { type: 'string' },
                  nb_places: { type: 'number' },
                  available_places: { type: 'number' },
                  begining_date: { type: 'string', format: 'date-time' },
                  ending_date: { type: 'string', format: 'date-time' },
                },
              },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  firstName: { type: 'string' },
                  lastname: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
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
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findAllLegacy() {
    console.log('[USER IN SESSION CONTROLLER] Legacy getall endpoint called');
    return this.userInSessionService.findAll();
  }

  @Get('user')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user sessions by user ID (Student access)',
    description:
      'Retrieve all sessions for the authenticated user. The user ID is automatically extracted from the JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User sessions retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Opération réussie.',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['refusedpayment', 'notpaid', 'pending', 'in', 'out'],
                example: 'in',
              },
              trainingSession: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    example: 'd6ff1fd6-f795-47a3-9abd-24d911d06b22',
                  },
                  title: { type: 'string', example: 'hello javascript' },
                  begining_date: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-10-09T22:00:00.000Z',
                  },
                  ending_date: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-10-30T22:00:00.000Z',
                  },
                },
              },
              training: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'hello javascript' },
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
    description: 'Unauthorized - Student access required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findByUserId(@User() user: IJwtSignin) {
    console.log(
      `🎓 [STUDENT USER SESSIONS] Student requesting sessions for user: ${user.id_user}`,
    );

    return this.userInSessionService.findByUserId(user.id_user);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user sessions by specific user ID (Student access)',
    description:
      'Retrieve all sessions for a specific user by providing the user ID in the request. This endpoint allows students to query sessions for any user.',
  })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the user to get sessions for',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'User sessions retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Opération réussie.',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['refusedpayment', 'notpaid', 'pending', 'in', 'out'],
                example: 'in',
              },
              trainingSession: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    example: 'd6ff1fd6-f795-47a3-9abd-24d911d06b22',
                  },
                  title: { type: 'string', example: 'hello javascript' },
                  begining_date: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-10-09T22:00:00.000Z',
                  },
                  ending_date: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-10-30T22:00:00.000Z',
                  },
                },
              },
              training: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'hello javascript' },
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
    description: 'Unauthorized - Student access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findByUserIdParam(@Param('userId', ParseUUIDPipe) userId: string) {
    console.log(
      `🎓 [STUDENT USER SESSIONS BY ID] Student requesting sessions for user ID: ${userId}`,
    );

    return this.userInSessionService.findByUserId(userId);
  }

  @Get('session/:sessionId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get session participants by session ID',
    description: 'Retrieve all participants for a specific training session.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'UUID of the training session',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Session participants retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findBySessionId(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.userInSessionService.findBySessionId(sessionId);
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get users by status',
    description: 'Retrieve all users with a specific status.',
  })
  @ApiParam({
    name: 'status',
    description: 'User status in session',
    enum: UserInSessionStatus,
    example: 'pending',
  })
  @ApiResponse({
    status: 200,
    description: 'Users by status retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findByStatus(@Param('status') status: UserInSessionStatus) {
    return this.userInSessionService.findByStatus(status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user in session by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user in session',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User in session retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User in session not found.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userInSessionService.findOne(id);
  }

  @Patch('update')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a user in session',
    description: `
**UpdateUserInSessionDto Structure:**
\`\`\`typescript
{
  id: string;                           // Required (to identify which user in session)
  id_session?: string;                  // Optional
  status?: UserInSessionStatus;         // Optional
  id_user?: string;                     // Optional
}
\`\`\`
    `,
  })
  @ApiBody({
    type: UpdateUserInSessionDto,
    examples: {
      example1: {
        summary: 'Update user status',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'in',
        },
      },
      example2: {
        summary: 'Update user and status',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          id_user: '550e8400-e29b-41d4-a716-446655440002',
          status: 'out',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User in session updated successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 404,
    description: 'User in session, training session, or user not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  update(@Body() updateUserInSessionDto: UpdateUserInSessionDto) {
    return this.userInSessionService.update(updateUserInSessionDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user in session' })
  @ApiBody({
    type: DeleteUserInSessionDto,
    examples: {
      example1: {
        summary: 'Delete user in session by ID',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User in session deleted successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 404,
    description: 'User in session not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  remove(@Body() deleteUserInSessionDto: DeleteUserInSessionDto) {
    return this.userInSessionService.remove(deleteUserInSessionDto);
  }

  @Delete('delete-all')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete all users in sessions' })
  @ApiResponse({
    status: 200,
    description: 'All users in sessions deleted successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  deleteAll() {
    return this.userInSessionService.deleteAll();
  }
}

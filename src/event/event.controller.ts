import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { User } from 'src/strategy/strategy.globaluser';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';
import { JwtAuthGuardAsInstructor } from 'src/guard/guard.asinstructor';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { JwtAuthGuardAsStudentInSession } from 'src/guard/guard.asstudentinsession';
import { JwtAuthGuardMultiRole, JwtAuthGuardAdminOrSecretary } from 'src/guard/guard.multi-role';
import { MultiRole } from 'src/guard/decorators/multi-role.decorator';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { EventSwagger } from './swagger.event';

@ApiTags('Events')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('create-for-course/:courseId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.createForCourse.summary,
    description: EventSwagger.createForCourse.description,
  })
  @ApiParam(EventSwagger.createForCourse.param)
  @ApiBody(EventSwagger.createForCourse.body)
  @ApiResponse(EventSwagger.createForCourse.responses[201])
  @ApiResponse(EventSwagger.createForCourse.responses[400])
  @ApiResponse(EventSwagger.createForCourse.responses[401])
  @ApiResponse(EventSwagger.createForCourse.responses[403])
  @ApiResponse(EventSwagger.createForCourse.responses[404])
  createForCourse(
    @Param('courseId') courseId: string,
    @Body()
    createEventDto: Omit<CreateEventDto, 'id_cible_cours' | 'createdBy'>,
    @User() user: IJwtSignin,
  ) {
    const eventData = {
      ...createEventDto,
      id_cible_cours: courseId,
      createdBy: user.id_user,
    };
    return this.eventService.create(eventData);
  }

  @Post('create-for-session/:sessionId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.createForSession.summary,
    description: EventSwagger.createForSession.description,
  })
  @ApiParam(EventSwagger.createForSession.param)
  @ApiBody(EventSwagger.createForSession.body)
  @ApiResponse(EventSwagger.createForSession.responses[201])
  @ApiResponse(EventSwagger.createForSession.responses[400])
  @ApiResponse(EventSwagger.createForSession.responses[401])
  @ApiResponse(EventSwagger.createForSession.responses[403])
  @ApiResponse(EventSwagger.createForSession.responses[404])
  createForSession(
    @Param('sessionId') sessionId: string,
    @Body() createEventDto: Omit<CreateEventDto, 'id_cible_session'>,
  ) {
    const eventData = {
      ...createEventDto,
      id_cible_session: sessionId,
    };
    return this.eventService.create(eventData);
  }

  @Post('create-for-lesson')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.createForLesson.summary,
    description: EventSwagger.createForLesson.description,
  })
  @ApiBody(EventSwagger.createForLesson.body)
  @ApiResponse(EventSwagger.createForLesson.responses[201])
  @ApiResponse(EventSwagger.createForLesson.responses[400])
  @ApiResponse(EventSwagger.createForLesson.responses[401])
  @ApiResponse(EventSwagger.createForLesson.responses[403])
  @ApiResponse(EventSwagger.createForLesson.responses[404])
  createForLesson(@Body() createEventDto: CreateEventDto) {
    return this.eventService.createForLesson(createEventDto);
  }

  @Post('create-for-user/:userId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.createForUser.summary,
    description: EventSwagger.createForUser.description,
  })
  @ApiParam(EventSwagger.createForUser.param)
  @ApiBody(EventSwagger.createForUser.body)
  @ApiResponse(EventSwagger.createForUser.responses[201])
  @ApiResponse(EventSwagger.createForUser.responses[400])
  @ApiResponse(EventSwagger.createForUser.responses[401])
  @ApiResponse(EventSwagger.createForUser.responses[403])
  @ApiResponse(EventSwagger.createForUser.responses[404])
  createForUser(
    @Param('userId') userId: string,
    @Body() createEventDto: Omit<CreateEventDto, 'id_cible_user'>,
  ) {
    const eventData = {
      ...createEventDto,
      id_cible_user: [userId], // Note: id_cible_user is an array
    };
    return this.eventService.create(eventData);
  }

  @Get('getall')
  @UseGuards(JwtAuthGuardAdminOrSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.findAll.summary,
    description: EventSwagger.findAll.description,
  })
  @ApiResponse(EventSwagger.findAll.responses[200])
  @ApiResponse(EventSwagger.findAll.responses[401])
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Secretary role required' })
  findAll() {
    return this.eventService.findAll();
  }

  @Get('secretary/:id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get event by ID (Secretary access)',
    description:
      'Retrieve a specific event by its ID with all related entities and participation information. Includes all students in the session with their participation status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Event UUID',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Event retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            sessionId: { type: 'string', format: 'uuid', nullable: true },
            participationInfo: {
              type: 'object',
              properties: {
                students: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      email: { type: 'string' },
                      phone: { type: 'string', nullable: true },
                      avatar: { type: 'string', nullable: true },
                      userInSessionId: { type: 'string', format: 'uuid' },
                      status: { type: 'string' },
                      participated: { type: 'boolean' },
                    },
                  },
                },
                totalInSession: { type: 'number' },
                participantsCount: { type: 'number' },
                absentCount: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Secretary role required' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOneForSecretary(@Param('id') id: string) {
    return this.eventService.findOneForSecretary(id);
  }

  @Get('training/:trainingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.findByTraining.summary,
    description: EventSwagger.findByTraining.description,
  })
  @ApiParam(EventSwagger.findByTraining.param)
  @ApiResponse(EventSwagger.findByTraining.responses[200])
  @ApiResponse(EventSwagger.findByTraining.responses[401])
  @ApiResponse(EventSwagger.findByTraining.responses[404])
  findByTraining(@Param('trainingId') trainingId: string) {
    return this.eventService.findByTraining(trainingId);
  }

  @Get('session/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.findBySession.summary,
    description: EventSwagger.findBySession.description,
  })
  @ApiParam(EventSwagger.findBySession.param)
  @ApiResponse(EventSwagger.findBySession.responses[200])
  @ApiResponse(EventSwagger.findBySession.responses[401])
  @ApiResponse(EventSwagger.findBySession.responses[404])
  findBySession(@Param('sessionId') sessionId: string) {
    return this.eventService.findBySession(sessionId);
  }

  @Get('student/session/:sessionId')
  @UseGuards(JwtAuthGuardAsStudentInSession)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.findBySessionForStudent.summary,
    description: EventSwagger.findBySessionForStudent.description,
  })
  @ApiParam(EventSwagger.findBySessionForStudent.param)
  @ApiResponse(EventSwagger.findBySessionForStudent.responses[200])
  @ApiResponse(EventSwagger.findBySessionForStudent.responses[403])
  @ApiResponse(EventSwagger.findBySessionForStudent.responses[401])
  @ApiResponse(EventSwagger.findBySessionForStudent.responses[404])
  @ApiResponse(EventSwagger.findBySessionForStudent.responses[500])
  findBySessionForStudent(@Param('sessionId') sessionId: string) {
    return this.eventService.findBySessionForStudent(sessionId);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.findByUser.summary,
    description: EventSwagger.findByUser.description,
  })
  @ApiResponse(EventSwagger.findByUser.responses[200])
  @ApiResponse(EventSwagger.findByUser.responses[401])
  @ApiResponse(EventSwagger.findByUser.responses[404])
  findByUser(@User() user: IJwtSignin) {
    return this.eventService.findByUser(user.id_user);
  }

  @Get('date-range')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.findByDateRange.summary,
    description: EventSwagger.findByDateRange.description,
  })
  @ApiQuery(EventSwagger.findByDateRange.queries.startDate)
  @ApiQuery(EventSwagger.findByDateRange.queries.endDate)
  @ApiResponse(EventSwagger.findByDateRange.responses[200])
  @ApiResponse(EventSwagger.findByDateRange.responses[401])
  @ApiResponse(EventSwagger.findByDateRange.responses[400])
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.eventService.findByDateRange(startDate, endDate);
  }

  @Get(':eventId/absent-students')
  @UseGuards(JwtAuthGuardMultiRole)
  @MultiRole({
    requiredRoles: ['admin', 'secretary', 'instructor'],
    requireAll: false, // User needs admin OR secretary OR instructor
    allowAdminOverride: true, // Admin can always access
  })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get absent students for an event',
    description:
      'Retrieve students who are enrolled in the event session but did not attend the event. Compares users in the session (UserInSession) with event participants and returns those who are in the session but not in the participants list. The session ID is determined from id_cible_session, or derived from id_cible_cours, or from id_cible_lesson if the direct session reference is not available.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'UUID of the event',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Absent students retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Absent students retrieved successfully',
        },
        data: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            eventTitle: {
              type: 'string',
              example: 'Introduction to React',
            },
            sessionId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            absentCount: {
              type: 'number',
              example: 5,
              description: 'Number of absent students',
            },
            totalInSession: {
              type: 'number',
              example: 20,
              description: 'Total number of students in the session',
            },
            participantsCount: {
              type: 'number',
              example: 15,
              description: 'Number of students who attended the event',
            },
            absentStudents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    example: '550e8400-e29b-41d4-a716-446655440002',
                  },
                  firstName: {
                    type: 'string',
                    example: 'John',
                  },
                  lastName: {
                    type: 'string',
                    example: 'Doe',
                  },
                  email: {
                    type: 'string',
                    example: 'john.doe@example.com',
                  },
                  phone: {
                    type: 'string',
                    example: '+1234567890',
                  },
                  avatar: {
                    type: 'string',
                    nullable: true,
                    example: 'https://example.com/avatar.jpg',
                  },
                  userInSessionId: {
                    type: 'string',
                    format: 'uuid',
                    example: '550e8400-e29b-41d4-a716-446655440003',
                  },
                  status: {
                    type: 'string',
                    enum: ['refusedpayment', 'notpaid', 'pending', 'in', 'out'],
                    example: 'in',
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
    status: 400,
    description:
      'Bad Request - Event does not have an associated session. Cannot determine session from id_cible_session, id_cible_cours, or id_cible_lesson.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin, Secretary, or Instructor role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  getAbsentStudents(@Param('eventId') eventId: string) {
    return this.eventService.getAbsentStudents(eventId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.findOne.summary,
    description: EventSwagger.findOne.description,
  })
  @ApiParam(EventSwagger.findOne.param)
  @ApiResponse(EventSwagger.findOne.responses[200])
  @ApiResponse(EventSwagger.findOne.responses[401])
  @ApiResponse(EventSwagger.findOne.responses[404])
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.update.summary,
    description: EventSwagger.update.description,
  })
  @ApiParam(EventSwagger.update.param)
  @ApiBody(EventSwagger.update.body)
  @ApiResponse(EventSwagger.update.responses[200])
  @ApiResponse(EventSwagger.update.responses[400])
  @ApiResponse(EventSwagger.update.responses[401])
  @ApiResponse(EventSwagger.update.responses[403])
  @ApiResponse(EventSwagger.update.responses[404])
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    console.log('=== Event Controller Update Debug ===');
    console.log('Controller received id:', id, 'Type:', typeof id);
    console.log('Controller received body:', updateEventDto);
    return this.eventService.update(id, updateEventDto);
  }

  @Get('session/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.findBySession.summary,
    description: EventSwagger.findBySession.description,
  })
  @ApiParam(EventSwagger.findBySession.param)
  @ApiResponse(EventSwagger.findBySession.responses[200])
  @ApiResponse(EventSwagger.findBySession.responses[401])
  @ApiResponse(EventSwagger.findBySession.responses[404])
  getEventsBySession(@Param('sessionId') sessionId: string) {
    return this.eventService.findBySession(sessionId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.remove.summary,
    description: EventSwagger.remove.description,
  })
  @ApiParam(EventSwagger.remove.param)
  @ApiResponse(EventSwagger.remove.responses[200])
  @ApiResponse(EventSwagger.remove.responses[401])
  @ApiResponse(EventSwagger.remove.responses[403])
  @ApiResponse(EventSwagger.remove.responses[404])
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }

  @Get('instructor/mycourses')
  @UseGuards(JwtAuthGuardAsSuperviseur)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.getEventsForInstructorCourses.summary,
    description: EventSwagger.getEventsForInstructorCourses.description,
  })
  @ApiResponse(EventSwagger.getEventsForInstructorCourses.responses[200])
  @ApiResponse(EventSwagger.getEventsForInstructorCourses.responses[401])
  @ApiResponse(EventSwagger.getEventsForInstructorCourses.responses[403])
  @ApiResponse(EventSwagger.getEventsForInstructorCourses.responses[500])
  async getEventsForInstructorCourses(@User() user: IJwtSignin) {
    return this.eventService.findByInstructorCourses(user);
  }

  @Post('student/:eventId/join')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Join event as student',
    description:
      'Add the authenticated student to the list of participants for a specific event. The student ID is automatically extracted from the authentication token.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'Event UUID - The unique identifier of the event',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Student joined event successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Student added to event successfully',
        },
        data: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            studentId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            totalParticipants: { type: 'number', example: 5 },
            participant: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              example: [
                '550e8400-e29b-41d4-a716-446655440001',
                '550e8400-e29b-41d4-a716-446655440002',
              ],
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Student is already a participant in this event',
    schema: {
      example: {
        status: 400,
        message: 'Student is already a participant in this event',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid authentication token',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student access required',
    schema: {
      example: {
        status: 403,
        message: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
    schema: {
      example: {
        status: 404,
        message: 'Event not found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        message: 'Error adding student to event',
      },
    },
  })
  async joinEvent(@Param('eventId') eventId: string, @User() user: IJwtSignin) {
    return this.eventService.addStudentToEvent(eventId, user.id_user);
  }

  @Get('instructor/students-attendance')
  @UseGuards(JwtAuthGuardAsInstructor)
  @ApiBearerAuth()
  @ApiOperation({
    summary: EventSwagger.getStudentsAttendanceForInstructor.summary,
    description: EventSwagger.getStudentsAttendanceForInstructor.description,
  })
  @ApiResponse(EventSwagger.getStudentsAttendanceForInstructor.responses[200])
  @ApiResponse(EventSwagger.getStudentsAttendanceForInstructor.responses[401])
  @ApiResponse(EventSwagger.getStudentsAttendanceForInstructor.responses[403])
  @ApiResponse(EventSwagger.getStudentsAttendanceForInstructor.responses[500])
  async getStudentsAttendanceForInstructor(@User() user: IJwtSignin) {
    return this.eventService.getStudentsAttendanceForInstructor(user);
  }

  @Get('instructor/past-events')
  @UseGuards(JwtAuthGuardAsInstructor)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get past events ordered by beginning date (Instructor)',
    description:
      'Retrieve all events that have already happened, ordered by their beginning_date in ascending order. Each event includes the number of participants. Only instructors can access this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Past events retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            length: { type: 'number', example: 10 },
            rows: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    example: '550e8400-e29b-41d4-a716-446655440000',
                  },
                  title: {
                    type: 'string',
                    example: 'Introduction to React',
                  },
                  description: {
                    type: 'string',
                    example: 'Learn the basics of React',
                  },
                  begining_date: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-01-15T09:00:00.000Z',
                  },
                  participantCount: {
                    type: 'number',
                    example: 15,
                    description:
                      'Number of participants who attended the event',
                  },
                },
              },
            },
          },
        },
        message: {
          type: 'string',
          example: 'Past events retrieved successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Instructor access required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  getPastEventsOrderedByDate() {
    return this.eventService.getPastEventsOrderedByDate();
  }
}

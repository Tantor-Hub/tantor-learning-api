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
} from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';

@ApiTags('Events')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('create-for-course/:courseId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Create an event for a specific course',
    description:
      'Create a new event that targets a specific course (SessionCours) by its ID. The createdBy field is automatically set to the authenticated user.',
  })
  @ApiParam({
    name: 'courseId',
    description: 'UUID of the course (SessionCours)',
    example: 'dc22d5a5-4ab5-4691-97b0-31228c94cb67',
  })
  @ApiBody({
    description: 'Event data for course-specific event',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the event',
          example: 'Course Launch Event',
        },
        description: {
          type: 'string',
          description: 'Description of the event',
          example: 'Launch event for the React course',
        },
        begining_date: {
          type: 'string',
          format: 'date',
          description: 'Date of the event',
          example: '2025-02-10',
        },
        beginning_hour: {
          type: 'string',
          description: 'Start time (HH:MM format)',
          example: '09:00',
        },
        ending_hour: {
          type: 'string',
          description: 'End time (HH:MM format)',
          example: '12:00',
        },
      },
      required: ['title', 'begining_date', 'beginning_hour', 'ending_hour'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Course event created successfully',
    schema: {
      example: {
        status: 201,
        message: 'Event created successfully',
        data: {
          id: 'event-uuid',
          title: 'Course Launch Event',
          description: 'Launch event for the React course',
          id_cible_cours: 'dc22d5a5-4ab5-4691-97b0-31228c94cb67',
          createdBy: 'user-uuid-1',
          begining_date: '2025-02-10T00:00:00.000Z',
          beginning_hour: '09:00',
          ending_hour: '12:00',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid course ID or data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Course not found' })
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
  @ApiOperation({
    summary: 'Create an event for a specific training session',
    description:
      'Create a new event that targets a specific training session by its ID',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'UUID of the training session',
    example: '3f51f834-7a3f-41c7-83ad-2da85589f503',
  })
  @ApiBody({
    description: 'Event data for session-specific event',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the event',
          example: 'Session Kickoff Event',
        },
        description: {
          type: 'string',
          description: 'Description of the event',
          example: 'Introduction session for new participants',
        },
        begining_date: {
          type: 'string',
          format: 'date',
          description: 'Date of the event',
          example: '2025-02-15',
        },
        beginning_hour: {
          type: 'string',
          description: 'Start time (HH:MM format)',
          example: '10:00',
        },
        ending_hour: {
          type: 'string',
          description: 'End time (HH:MM format)',
          example: '12:00',
        },
      },
      required: ['title', 'begining_date', 'beginning_hour', 'ending_hour'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Session event created successfully',
    schema: {
      example: {
        status: 201,
        message: 'Event created successfully',
        data: {
          id: 'event-uuid',
          title: 'Session Kickoff Event',
          description: 'Introduction session for new participants',
          id_cible_session: '3f51f834-7a3f-41c7-83ad-2da85589f503',
          begining_date: '2025-02-15T00:00:00.000Z',
          beginning_hour: '10:00',
          ending_hour: '12:00',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid session ID or data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Training session not found' })
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

  @Post('create-for-lesson/:lessonId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Create an event for a specific lesson',
    description: 'Create a new event that targets a specific lesson by its ID',
  })
  @ApiParam({
    name: 'lessonId',
    description: 'UUID of the lesson',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({
    description: 'Event data for lesson-specific event',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the event',
          example: 'Lesson Deep Dive Event',
        },
        description: {
          type: 'string',
          description: 'Description of the event',
          example: 'Special session on React hooks',
        },
        begining_date: {
          type: 'string',
          format: 'date',
          description: 'Date of the event',
          example: '2025-02-12',
        },
        beginning_hour: {
          type: 'string',
          description: 'Start time (HH:MM format)',
          example: '14:00',
        },
        ending_hour: {
          type: 'string',
          description: 'End time (HH:MM format)',
          example: '16:00',
        },
      },
      required: ['title', 'begining_date', 'beginning_hour', 'ending_hour'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Lesson event created successfully',
    schema: {
      example: {
        status: 201,
        message: 'Event created successfully',
        data: {
          id: 'event-uuid',
          title: 'Lesson Deep Dive Event',
          description: 'Special session on React hooks',
          id_cible_lesson: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          begining_date: '2025-02-12T00:00:00.000Z',
          beginning_hour: '14:00',
          ending_hour: '16:00',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid lesson ID or data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  createForLesson(
    @Param('lessonId') lessonId: string,
    @Body() createEventDto: Omit<CreateEventDto, 'id_cible_lesson'>,
  ) {
    const eventData = {
      ...createEventDto,
      id_cible_lesson: lessonId,
    };
    return this.eventService.create(eventData);
  }

  @Post('create-for-user/:userId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Create an event for a specific user',
    description: 'Create a new event that targets a specific user by their ID',
  })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'Event data for user-specific event',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the event',
          example: 'Individual Assessment Event',
        },
        description: {
          type: 'string',
          description: 'Description of the event',
          example: 'One-on-one assessment session with the user',
        },
        begining_date: {
          type: 'string',
          format: 'date',
          description: 'Date of the event',
          example: '2025-02-20',
        },
        beginning_hour: {
          type: 'string',
          description: 'Start time (HH:MM format)',
          example: '14:00',
        },
        ending_hour: {
          type: 'string',
          description: 'End time (HH:MM format)',
          example: '16:00',
        },
      },
      required: ['title', 'begining_date', 'beginning_hour', 'ending_hour'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User event created successfully',
    schema: {
      example: {
        status: 201,
        message: 'Event created successfully',
        data: {
          id: 'event-uuid',
          title: 'Individual Assessment Event',
          description: 'One-on-one assessment session with the user',
          id_cible_user: ['550e8400-e29b-41d4-a716-446655440000'],
          begining_date: '2025-02-20T00:00:00.000Z',
          beginning_hour: '14:00',
          ending_hour: '16:00',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid user ID or data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all events' })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    example: {
      status: 200,
      message: 'Events retrieved successfully',
      data: [
        {
          id: 'event-uuid-1',
          title: 'React Training Workshop',
          description: 'A comprehensive workshop on React fundamentals',
          id_cible_training: ['550e8400-e29b-41d4-a716-446655440000'],
          id_cible_session: '3f51f834-7a3f-41c7-83ad-2da85589f503',
          id_cible_cours: 'dc22d5a5-4ab5-4691-97b0-31228c94cb67',
          id_cible_lesson: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          begining_date: '2025-02-01T00:00:00.000Z',
          beginning_hour: '09:00',
          ending_hour: '17:00',
          trainings: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'React Fundamentals',
            },
          ],
          trainingSession: {
            id: '3f51f834-7a3f-41c7-83ad-2da85589f503',
            title: 'React Training Session 2025',
          },
          sessionCours: {
            id: 'dc22d5a5-4ab5-4691-97b0-31228c94cb67',
            title: 'React Fundamentals Course',
          },
          lesson: {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            title: 'Introduction to React',
          },
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.eventService.findAll();
  }

  @Get('training/:trainingId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get events by training ID' })
  @ApiParam({
    name: 'trainingId',
    description: 'Training UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    example: {
      status: 200,
      message: 'Events retrieved successfully',
      data: [
        {
          id: 'event-uuid-1',
          title: 'React Training Workshop',
          description: 'A comprehensive workshop on React fundamentals',
          id_cible_training: ['550e8400-e29b-41d4-a716-446655440000'],
          id_cible_session: '3f51f834-7a3f-41c7-83ad-2da85589f503',
          begining_date: '2025-02-01T00:00:00.000Z',
          beginning_hour: '09:00',
          ending_hour: '17:00',
          trainings: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'React Fundamentals',
            },
          ],
          trainingSession: {
            id: '3f51f834-7a3f-41c7-83ad-2da85589f503',
            title: 'React Training Session 2025',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Training not found' })
  findByTraining(@Param('trainingId') trainingId: string) {
    return this.eventService.findByTraining(trainingId);
  }

  @Get('session/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get events by session ID',
    description:
      'Retrieves events that are either directly linked to the session (id_cible_session) or linked through a course that belongs to the session (sessionCours.id_session)',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Training Session UUID',
    example: '3f51f834-7a3f-41c7-83ad-2da85589f503',
  })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    example: {
      status: 200,
      message: 'Events retrieved successfully',
      data: [
        {
          id: 'event-uuid-2',
          title: 'Training Session Kickoff',
          description: 'Introduction session for new training participants',
          id_cible_session: '3f51f834-7a3f-41c7-83ad-2da85589f503',
          id_cible_cours: 'dc22d5a5-4ab5-4691-97b0-31228c94cb67',
          begining_date: '2025-02-15T00:00:00.000Z',
          beginning_hour: '10:00',
          ending_hour: '12:00',
          trainingSession: {
            id: '3f51f834-7a3f-41c7-83ad-2da85589f503',
            title: 'React Training Session 2025',
          },
          sessionCours: {
            id: 'dc22d5a5-4ab5-4691-97b0-31228c94cb67',
            title: 'React Fundamentals Course',
            id_session: '3f51f834-7a3f-41c7-83ad-2da85589f503',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  findBySession(@Param('sessionId') sessionId: string) {
    return this.eventService.findBySession(sessionId);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get events created by current user',
    description:
      'Retrieve all events that were created by the currently authenticated user (based on createdBy field)',
  })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    example: {
      status: 200,
      message: 'Events retrieved successfully',
      data: [
        {
          id: 'event-uuid-3',
          title: 'Individual Assessment',
          description: 'One-on-one assessment session',
          createdBy: 'user-uuid-1',
          id_cible_session: '3f51f834-7a3f-41c7-83ad-2da85589f503',
          begining_date: '2025-02-20T00:00:00.000Z',
          beginning_hour: '14:00',
          ending_hour: '16:00',
          creator: {
            id: 'user-uuid-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
          trainingSession: {
            id: '3f51f834-7a3f-41c7-83ad-2da85589f503',
            title: 'React Training Session 2025',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findByUser(@User() user: IJwtSignin) {
    return this.eventService.findByUser(user.id_user);
  }

  @Get('date-range')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get events by date range' })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date (ISO string)',
    example: '2025-02-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date (ISO string)',
    example: '2025-02-28T23:59:59.999Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    example: {
      status: 200,
      message: 'Events retrieved successfully',
      data: [
        {
          id: 'event-uuid-1',
          title: 'React Training Workshop',
          description: 'A comprehensive workshop on React fundamentals',
          id_cible_training: ['550e8400-e29b-41d4-a716-446655440000'],
          id_cible_session: '3f51f834-7a3f-41c7-83ad-2da85589f503',
          begining_date: '2025-02-01T00:00:00.000Z',
          beginning_hour: '09:00',
          ending_hour: '17:00',
        },
        {
          id: 'event-uuid-2',
          title: 'Training Session Kickoff',
          description: 'Introduction session for new training participants',
          id_cible_session: '3f51f834-7a3f-41c7-83ad-2da85589f503',
          begining_date: '2025-02-15T00:00:00.000Z',
          beginning_hour: '10:00',
          ending_hour: '12:00',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid date format',
  })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.eventService.findByDateRange(startDate, endDate);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiParam({
    name: 'id',
    description: 'Event UUID',
    example: 'event-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    example: {
      status: 200,
      message: 'Event retrieved successfully',
      data: {
        id: 'event-uuid-1',
        title: 'React Training Workshop',
        description:
          'A comprehensive workshop on React fundamentals and best practices',
        id_cible_training: ['550e8400-e29b-41d4-a716-446655440000'],
        id_cible_session: '3f51f834-7a3f-41c7-83ad-2da85589f503',
        id_cible_cours: 'dc22d5a5-4ab5-4691-97b0-31228c94cb67',
        id_cible_lesson: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        id_cible_user: ['user-uuid-1', 'user-uuid-2'],
        begining_date: '2025-02-01T00:00:00.000Z',
        beginning_hour: '09:00',
        ending_hour: '17:00',
        trainings: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'React Fundamentals',
          },
        ],
        trainingSession: {
          id: '3f51f834-7a3f-41c7-83ad-2da85589f503',
          title: 'React Training Session 2025',
        },
        sessionCours: {
          id: 'dc22d5a5-4ab5-4691-97b0-31228c94cb67',
          title: 'React Fundamentals Course',
        },
        lesson: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          title: 'Introduction to React',
        },
        users: [
          {
            id: 'user-uuid-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
          {
            id: 'user-uuid-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
        ],
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Update event by ID' })
  @ApiParam({
    name: 'id',
    description: 'Event UUID',
    example: 'event-uuid-1',
  })
  @ApiBody({
    type: UpdateEventDto,
    description: 'Event update data - all fields are optional',
    examples: {
      basicUpdate: {
        summary: 'Basic Event Update',
        description: 'Update basic event information',
        value: {
          title: 'Course Launch Event',
          description: 'Launch event for the React course',
          begining_date: '2025-02-10',
          beginning_hour: '09:00',
          ending_hour: '12:00',
        },
      },
      updateTitle: {
        summary: 'Update Title Only',
        description: 'Update just the event title',
        value: {
          title: 'Updated React Training Workshop',
        },
      },
      updateDates: {
        summary: 'Update Dates and Times',
        description: 'Update event schedule',
        value: {
          begining_date: '2025-02-02',
          beginning_hour: '09:00',
          ending_hour: '17:00',
        },
      },
      updateTargets: {
        summary: 'Update Target Arrays',
        description: 'Update event targets (trainings, users)',
        value: {
          id_cible_training: [
            '550e8400-e29b-41d4-a716-446655440000',
            '550e8400-e29b-41d4-a716-446655440001',
          ],
          id_cible_user: ['user-uuid-1', 'user-uuid-2', 'user-uuid-3'],
        },
      },
      updateRelationships: {
        summary: 'Update Relationships',
        description: 'Update event relationships (session, course, lesson)',
        value: {
          id_cible_session: '3f51f834-7a3f-41c7-83ad-2da85589f503',
          id_cible_cours: 'dc22d5a5-4ab5-4691-97b0-31228c94cb67',
          id_cible_lesson: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    example: {
      status: 200,
      message: 'Event updated successfully',
      data: {
        id: 'event-uuid-1',
        title: 'Updated React Training Workshop',
        description:
          'A comprehensive workshop on React fundamentals and best practices',
        id_cible_training: ['550e8400-e29b-41d4-a716-446655440000'],
        id_cible_session: '3f51f834-7a3f-41c7-83ad-2da85589f503',
        id_cible_cours: 'dc22d5a5-4ab5-4691-97b0-31228c94cb67',
        id_cible_lesson: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        begining_date: '2025-02-02T00:00:00.000Z',
        beginning_hour: '09:00',
        ending_hour: '17:00',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-16T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Delete event by ID' })
  @ApiParam({
    name: 'id',
    description: 'Event UUID',
    example: 'event-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Event deleted successfully',
    example: {
      status: 200,
      message: 'Event deleted successfully',
      data: null,
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }
}

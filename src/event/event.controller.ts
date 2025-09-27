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

@ApiTags('Events')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({
    type: CreateEventDto,
    examples: {
      trainingEvent: {
        summary: 'Training Event',
        value: {
          title: 'React Training Workshop',
          description:
            'A comprehensive workshop on React fundamentals and best practices',
          id_cible_training: ['550e8400-e29b-41d4-a716-446655440000'],
          id_cible_session: ['3f51f834-7a3f-41c7-83ad-2da85589f503'],
          begining_date: '2025-02-01T09:00:00.000Z',
          ending_date: '2025-02-01T17:00:00.000Z',
        },
      },
      sessionEvent: {
        summary: 'Session Event',
        value: {
          title: 'Training Session Kickoff',
          description: 'Introduction session for new training participants',
          id_cible_session: ['3f51f834-7a3f-41c7-83ad-2da85589f503'],
          begining_date: '2025-02-15T10:00:00.000Z',
        },
      },
      courseEvent: {
        summary: 'Course Event',
        value: {
          title: 'Advanced React Course Launch',
          description: 'Launch event for the advanced React course',
          id_cible_cours: ['dc22d5a5-4ab5-4691-97b0-31228c94cb67'],
          begining_date: '2025-02-10T09:00:00.000Z',
          ending_date: '2025-02-10T12:00:00.000Z',
        },
      },
      lessonEvent: {
        summary: 'Lesson Event',
        value: {
          title: 'Hooks Deep Dive Lesson',
          description: 'Special session on React hooks',
          id_cible_lesson: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
          begining_date: '2025-02-12T14:00:00.000Z',
          ending_date: '2025-02-12T16:00:00.000Z',
        },
      },
      userEvent: {
        summary: 'User-Specific Event',
        value: {
          title: 'Individual Assessment',
          description: 'One-on-one assessment session',
          id_cible_user: ['user-uuid-1', 'user-uuid-2'],
          begining_date: '2025-02-20T14:00:00.000Z',
          ending_date: '2025-02-20T16:00:00.000Z',
        },
      },
      comprehensiveEvent: {
        summary: 'Comprehensive Event',
        value: {
          title: 'Full Training Program Event',
          description: 'Event targeting multiple entities',
          id_cible_training: ['550e8400-e29b-41d4-a716-446655440000'],
          id_cible_session: ['3f51f834-7a3f-41c7-83ad-2da85589f503'],
          id_cible_cours: ['dc22d5a5-4ab5-4691-97b0-31228c94cb67'],
          id_cible_lesson: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
          id_cible_user: ['user-uuid-1'],
          begining_date: '2025-02-25T09:00:00.000Z',
          ending_date: '2025-02-25T17:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    example: {
      status: 201,
      message: 'Event created successfully',
      data: {
        id: 'event-uuid',
        title: 'React Training Workshop',
        description:
          'A comprehensive workshop on React fundamentals and best practices',
        id_cible_training: ['550e8400-e29b-41d4-a716-446655440000'],
        begining_date: '2025-02-01T09:00:00.000Z',
        ending_date: '2025-02-01T17:00:00.000Z',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
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
          begining_date: '2025-02-01T09:00:00.000Z',
          ending_date: '2025-02-01T17:00:00.000Z',
          trainings: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'React Fundamentals',
            },
          ],
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
          begining_date: '2025-02-01T09:00:00.000Z',
          ending_date: '2025-02-01T17:00:00.000Z',
          trainings: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'React Fundamentals',
            },
          ],
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
  @ApiOperation({ summary: 'Get events by session ID' })
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
          id_cible_session: ['3f51f834-7a3f-41c7-83ad-2da85589f503'],
          begining_date: '2025-02-15T10:00:00.000Z',
          trainingSessions: [
            {
              id: '3f51f834-7a3f-41c7-83ad-2da85589f503',
              title: 'React Training Session 2025',
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  findBySession(@Param('sessionId') sessionId: string) {
    return this.eventService.findBySession(sessionId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get events by user ID' })
  @ApiParam({
    name: 'userId',
    description: 'User UUID',
    example: 'user-uuid-1',
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
          id_cible_user: ['user-uuid-1'],
          begining_date: '2025-02-20T14:00:00.000Z',
          ending_date: '2025-02-20T16:00:00.000Z',
          users: [
            {
              uuid: 'user-uuid-1',
              fs_name: 'John',
              ls_name: 'Doe',
              email: 'john@example.com',
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findByUser(@Param('userId') userId: string) {
    return this.eventService.findByUser(userId);
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
          begining_date: '2025-02-01T09:00:00.000Z',
          ending_date: '2025-02-01T17:00:00.000Z',
        },
        {
          id: 'event-uuid-2',
          title: 'Training Session Kickoff',
          description: 'Introduction session for new training participants',
          begining_date: '2025-02-15T10:00:00.000Z',
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
        id_cible_session: ['3f51f834-7a3f-41c7-83ad-2da85589f503'],
        id_cible_user: ['user-uuid-1', 'user-uuid-2'],
        begining_date: '2025-02-01T09:00:00.000Z',
        ending_date: '2025-02-01T17:00:00.000Z',
        trainings: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'React Fundamentals',
          },
        ],
        trainingSessions: [
          {
            id: '3f51f834-7a3f-41c7-83ad-2da85589f503',
            title: 'React Training Session 2025',
          },
        ],
        users: [
          {
            uuid: 'user-uuid-1',
            fs_name: 'John',
            ls_name: 'Doe',
            email: 'john@example.com',
          },
          {
            uuid: 'user-uuid-2',
            fs_name: 'Jane',
            ls_name: 'Smith',
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
    examples: {
      updateTitle: {
        summary: 'Update Title Only',
        value: {
          title: 'Updated React Training Workshop',
        },
      },
      updateDates: {
        summary: 'Update Dates',
        value: {
          begining_date: '2025-02-02T09:00:00.000Z',
          ending_date: '2025-02-02T17:00:00.000Z',
        },
      },
      updateTargets: {
        summary: 'Update Target Arrays',
        value: {
          id_cible_training: [
            '550e8400-e29b-41d4-a716-446655440000',
            '550e8400-e29b-41d4-a716-446655440001',
          ],
          id_cible_user: ['user-uuid-1', 'user-uuid-2', 'user-uuid-3'],
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
        begining_date: '2025-02-02T09:00:00.000Z',
        ending_date: '2025-02-02T17:00:00.000Z',
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

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateEventSwaggerDto {
  @ApiProperty({
    description: 'Title of the event',
    example: 'React Training Workshop',
    required: true,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the event',
    example:
      'A comprehensive workshop on React fundamentals and best practices',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Array of training IDs that this event targets',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  id_cible_training?: string[];

  @ApiProperty({
    description: 'Array of training session IDs that this event targets',
    example: [
      '3f51f834-7a3f-41c7-83ad-2da85589f503',
      '3f51f834-7a3f-41c7-83ad-2da85589f504',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  id_cible_session?: string[];

  @ApiProperty({
    description: 'Array of course IDs that this event targets',
    example: [
      'dc22d5a5-4ab5-4691-97b0-31228c94cb67',
      'dc22d5a5-4ab5-4691-97b0-31228c94cb68',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  id_cible_cours?: string[];

  @ApiProperty({
    description: 'Array of lesson IDs that this event targets',
    example: [
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      'a1b2c3d4-e5f6-7890-abcd-ef1234567891',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  id_cible_lesson?: string[];

  @ApiProperty({
    description: 'Array of user IDs that this event targets',
    example: ['user-uuid-1', 'user-uuid-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  id_cible_user?: string[];

  @ApiProperty({
    description: 'Beginning date of the event',
    example: '2025-02-01T09:00:00.000Z',
    required: true,
  })
  @IsDateString()
  begining_date: string;

  @ApiProperty({
    description: 'Ending date of the event',
    example: '2025-02-01T17:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  ending_date?: string;
}

export class UpdateEventSwaggerDto {
  @ApiProperty({
    description: 'Title of the event',
    example: 'Updated React Training Workshop',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Description of the event',
    example:
      'An updated comprehensive workshop on React fundamentals and best practices',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Array of training IDs that this event targets',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  id_cible_training?: string[];

  @ApiProperty({
    description: 'Array of training session IDs that this event targets',
    example: [
      '3f51f834-7a3f-41c7-83ad-2da85589f503',
      '3f51f834-7a3f-41c7-83ad-2da85589f504',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  id_cible_session?: string[];

  @ApiProperty({
    description: 'Array of course IDs that this event targets',
    example: [
      'dc22d5a5-4ab5-4691-97b0-31228c94cb67',
      'dc22d5a5-4ab5-4691-97b0-31228c94cb68',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  id_cible_cours?: string[];

  @ApiProperty({
    description: 'Array of lesson IDs that this event targets',
    example: [
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      'a1b2c3d4-e5f6-7890-abcd-ef1234567891',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  id_cible_lesson?: string[];

  @ApiProperty({
    description: 'Array of user IDs that this event targets',
    example: ['user-uuid-1', 'user-uuid-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  id_cible_user?: string[];

  @ApiProperty({
    description: 'Beginning date of the event',
    example: '2025-02-02T09:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  begining_date?: string;

  @ApiProperty({
    description: 'Ending date of the event',
    example: '2025-02-02T17:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  ending_date?: string;
}

export class EventResponseDto {
  @ApiProperty({
    description: 'Event ID',
    example: 'event-uuid-1',
  })
  id: string;

  @ApiProperty({
    description: 'Event title',
    example: 'React Training Workshop',
  })
  title: string;

  @ApiProperty({
    description: 'Event description',
    example:
      'A comprehensive workshop on React fundamentals and best practices',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Array of training IDs that this event targets',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    required: false,
    type: [String],
  })
  id_cible_training?: string[];

  @ApiProperty({
    description: 'Array of training session IDs that this event targets',
    example: ['3f51f834-7a3f-41c7-83ad-2da85589f503'],
    required: false,
    type: [String],
  })
  id_cible_session?: string[];

  @ApiProperty({
    description: 'Array of course IDs that this event targets',
    example: ['dc22d5a5-4ab5-4691-97b0-31228c94cb67'],
    required: false,
    type: [String],
  })
  id_cible_cours?: string[];

  @ApiProperty({
    description: 'Array of lesson IDs that this event targets',
    example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
    required: false,
    type: [String],
  })
  id_cible_lesson?: string[];

  @ApiProperty({
    description: 'Array of user IDs that this event targets',
    example: ['user-uuid-1', 'user-uuid-2'],
    required: false,
    type: [String],
  })
  id_cible_user?: string[];

  @ApiProperty({
    description: 'Beginning date of the event',
    example: '2025-02-01T09:00:00.000Z',
  })
  begining_date: Date;

  @ApiProperty({
    description: 'Ending date of the event',
    example: '2025-02-01T17:00:00.000Z',
    required: false,
  })
  ending_date?: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Related training objects',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        title: { type: 'string', example: 'React Fundamentals' },
      },
    },
  })
  trainings?: any[];

  @ApiProperty({
    description: 'Related training session objects',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '3f51f834-7a3f-41c7-83ad-2da85589f503' },
        title: { type: 'string', example: 'React Training Session 2025' },
      },
    },
  })
  trainingSessions?: any[];

  @ApiProperty({
    description: 'Related course objects',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'dc22d5a5-4ab5-4691-97b0-31228c94cb67' },
        title: { type: 'string', example: 'React Course Module 1' },
      },
    },
  })
  sessionCours?: any[];

  @ApiProperty({
    description: 'Related lesson objects',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
        title: { type: 'string', example: 'Introduction to React' },
      },
    },
  })
  lessons?: any[];

  @ApiProperty({
    description: 'Related user objects',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        uuid: { type: 'string', example: 'user-uuid-1' },
        fs_name: { type: 'string', example: 'John' },
        ls_name: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john@example.com' },
      },
    },
  })
  users?: any[];
}

export const EventApiOperations = {
  CREATE: {
    summary: 'Create a new event',
    description:
      'Create a new event with optional target arrays for trainings, sessions, courses, lessons, and users. Events can target multiple entities simultaneously.',
  },
  GET_ALL: {
    summary: 'Get all events',
    description:
      'Retrieve all events with their related entities (trainings, sessions, courses, lessons, users).',
  },
  GET_BY_TRAINING: {
    summary: 'Get events by training ID',
    description: 'Retrieve all events that target a specific training.',
  },
  GET_BY_SESSION: {
    summary: 'Get events by session ID',
    description: 'Retrieve all events that target a specific training session.',
  },
  GET_BY_USER: {
    summary: 'Get events by user ID',
    description: 'Retrieve all events that target a specific user.',
  },
  GET_BY_DATE_RANGE: {
    summary: 'Get events by date range',
    description:
      'Retrieve all events within a specific date range based on beginning_date.',
  },
  GET_BY_ID: {
    summary: 'Get event by ID',
    description:
      'Retrieve a specific event by its ID with all related entities.',
  },
  UPDATE: {
    summary: 'Update event by ID',
    description:
      'Update an existing event. All fields are optional for partial updates.',
  },
  DELETE: {
    summary: 'Delete event by ID',
    description: 'Delete an event by its ID. This action cannot be undone.',
  },
};

export const EventApiResponses = {
  CREATED: {
    status: 201,
    description: 'Event created successfully',
    type: EventResponseDto,
  },
  OK: {
    status: 200,
    description: 'Operation successful',
    type: EventResponseDto,
  },
  OK_ARRAY: {
    status: 200,
    description: 'Events retrieved successfully',
    type: [EventResponseDto],
  },
  BAD_REQUEST: {
    status: 400,
    description: 'Bad Request - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        data: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'Title is required',
                'Beginning date must be a valid date',
              ],
            },
          },
        },
      },
    },
  },
  UNAUTHORIZED: {
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        data: { type: 'null', example: null },
      },
    },
  },
  FORBIDDEN: {
    status: 403,
    description:
      'Forbidden - Insufficient permissions (requires secretary or admin role)',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Insufficient permissions' },
        data: { type: 'null', example: null },
      },
    },
  },
  NOT_FOUND: {
    status: 404,
    description: 'Event not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Event not found' },
        data: { type: 'null', example: null },
      },
    },
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    description: 'Internal Server Error',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
        data: { type: 'null', example: null },
      },
    },
  },
};

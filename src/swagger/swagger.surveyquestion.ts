import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsArray,
  IsEnum,
  IsObject,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

// Question Option DTO for Swagger
export class QuestionOptionDto {
  @ApiProperty({
    example: 'opt1',
    description: 'Unique identifier for the option',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: 'Beginner',
    description: 'Text content of the option',
  })
  @IsString()
  text: string;
}

// Survey Question Data DTO for Swagger
export class SurveyQuestionDataDto {
  @ApiProperty({
    example: 'q1',
    description: 'Unique identifier for the question',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: 'multiple_choice',
    description: 'Type of question',
    enum: ['multiple_choice', 'text'],
  })
  @IsEnum(['multiple_choice', 'text'])
  type: 'multiple_choice' | 'text';

  @ApiProperty({
    example: 'What is your current experience level with React?',
    description: 'The question text',
  })
  @IsString()
  question: string;

  @ApiProperty({
    type: [QuestionOptionDto],
    description: 'Array of options for multiple choice questions',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];

  @ApiProperty({
    example: true,
    description: 'Whether the question is required',
  })
  @IsBoolean()
  required: boolean;

  @ApiProperty({
    example: 1,
    description: 'Order of the question in the survey',
  })
  @IsNumber()
  order: number;

  @ApiProperty({
    example: 1,
    description:
      'Maximum number of options that can be selected (for multiple choice)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  maxSelections?: number;
}

// Create Survey Question DTO for Swagger
export class CreateSurveyQuestionSwaggerDto {
  @ApiProperty({
    example: 'Pre-Training Assessment Survey',
    description: 'Title of the survey',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the training session this survey belongs to',
  })
  @IsUUID()
  id_session: string;

  @ApiProperty({
    type: [SurveyQuestionDataDto],
    description: 'Array of survey questions with their options',
    example: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'What is your current experience level with React?',
        options: [
          { id: 'opt1', text: 'Beginner' },
          { id: 'opt2', text: 'Intermediate' },
          { id: 'opt3', text: 'Advanced' },
        ],
        required: true,
        order: 1,
        maxSelections: 1,
      },
      {
        id: 'q2',
        type: 'text',
        question: 'What are your main learning objectives?',
        required: true,
        order: 2,
      },
      {
        id: 'q3',
        type: 'text',
        question: 'What was your overall satisfaction with the training?',
        required: true,
        order: 3,
      },
      {
        id: 'q4',
        type: 'multiple_choice',
        question: 'Would you recommend this training to others?',
        options: [
          { id: 'opt1', text: 'Yes, definitely' },
          { id: 'opt2', text: 'Yes, probably' },
          { id: 'opt3', text: 'No, probably not' },
          { id: 'opt4', text: 'No, definitely not' },
        ],
        required: true,
        order: 4,
        maxSelections: 1,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SurveyQuestionDataDto)
  questions: SurveyQuestionDataDto[];

  @ApiProperty({
    example: 'before',
    description: 'Category of the survey question',
    enum: ['before', 'during', 'after'],
  })
  @IsEnum(['before', 'during', 'after'])
  categories: 'before' | 'during' | 'after';
}

// Update Survey Question DTO for Swagger
export class UpdateSurveyQuestionSwaggerDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the survey question to update',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({
    example: 'Updated Pre-Training Assessment Survey',
    description: 'Title of the survey',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the training session this survey belongs to',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  id_session?: string;

  @ApiProperty({
    type: [SurveyQuestionDataDto],
    description: 'Array of survey questions with their options',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SurveyQuestionDataDto)
  questions?: SurveyQuestionDataDto[];

  @ApiProperty({
    example: 'during',
    description: 'Category of the survey question',
    enum: ['before', 'during', 'after'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['before', 'during', 'after'])
  categories?: 'before' | 'during' | 'after';
}

// Response DTO for Swagger
export class SurveyQuestionResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier of the survey question',
  })
  id: string;

  @ApiProperty({
    example: 'Pre-Training Assessment Survey',
    description: 'Title of the survey',
  })
  title: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the training session this survey belongs to',
  })
  id_session: string;

  @ApiProperty({
    type: [SurveyQuestionDataDto],
    description: 'Array of survey questions with their options',
  })
  questions: SurveyQuestionDataDto[];

  @ApiProperty({
    example: 'before',
    description: 'Category of the survey question',
    enum: ['before', 'during', 'after'],
  })
  categories: 'before' | 'during' | 'after';

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the user who created the survey',
  })
  createdBy: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}

// API Tags and Operations
export const SurveyQuestionApiTags = {
  CONTROLLER: 'Survey Questions',
  CREATE: 'Create Survey Question',
  FIND_ALL: 'Get All Survey Questions',
  FIND_ONE: 'Get Survey Question by ID',
  UPDATE: 'Update Survey Question',
  DELETE: 'Delete Survey Question',
  FIND_BY_SESSION: 'Get Survey Questions by Session',
  FIND_BY_CATEGORY: 'Get Survey Questions by Category',
};

export const SurveyQuestionApiOperations = {
  CREATE: {
    summary: 'Create a new survey question',
    description:
      'Create a new survey question with support for multiple question types: multiple choice (with options) and text input. Each question can be marked as required and ordered within the survey.',
  },
  FIND_ALL: {
    summary: 'Get all survey questions',
    description: 'Retrieve all survey questions with pagination support',
  },
  FIND_ONE: {
    summary: 'Get survey question by ID',
    description: 'Retrieve a specific survey question by its ID',
  },
  UPDATE: {
    summary: 'Update survey question',
    description: 'Update an existing survey question',
  },
  DELETE: {
    summary: 'Delete survey question',
    description: 'Delete a survey question by ID',
  },
  FIND_BY_SESSION: {
    summary: 'Get survey questions by session',
    description:
      'Retrieve all survey questions for a specific training session',
  },
  FIND_BY_CATEGORY: {
    summary: 'Get survey questions by category',
    description:
      'Retrieve survey questions filtered by category: "before" (pre-training), "during" (mid-training), or "after" (post-training)',
  },
};

export const SurveyQuestionApiResponses = {
  CREATED: {
    status: 201,
    description: 'Survey question created successfully',
    type: SurveyQuestionResponseDto,
  },
  OK: {
    status: 200,
    description: 'Operation successful',
    type: SurveyQuestionResponseDto,
  },
  OK_ARRAY: {
    status: 200,
    description: 'List of survey questions retrieved successfully',
    type: [SurveyQuestionResponseDto],
  },
  BAD_REQUEST: {
    status: 400,
    description: 'Bad request - Invalid input data',
  },
  UNAUTHORIZED: {
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  },
  FORBIDDEN: {
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  },
  NOT_FOUND: {
    status: 404,
    description: 'Survey question not found',
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    description: 'Internal server error',
  },
};

// Comprehensive examples for different question types
export const SurveyQuestionExamples = {
  MULTIPLE_CHOICE: {
    summary: 'Multiple Choice Question',
    value: {
      id: 'q1',
      type: 'multiple_choice',
      question: 'What is your preferred learning method?',
      options: [
        { id: 'opt1', text: 'Visual (diagrams, charts)' },
        { id: 'opt2', text: 'Auditory (lectures, discussions)' },
        { id: 'opt3', text: 'Kinesthetic (hands-on practice)' },
        { id: 'opt4', text: 'Reading/Writing (texts, notes)' },
      ],
      required: true,
      order: 1,
      maxSelections: 1,
    },
  },
  TEXT_INPUT: {
    summary: 'Text Input Question',
    value: {
      id: 'q2',
      type: 'text',
      question:
        'Please describe your main learning objectives for this training.',
      required: true,
      order: 2,
    },
  },
  RATING_SCALE: {
    summary: 'Rating Scale Question',
    value: {
      id: 'q3',
      type: 'text',
      question: 'Describe your current skill level in this subject',
      required: true,
      order: 3,
    },
  },
  SINGLE_CHOICE: {
    summary: 'Single Choice Question',
    value: {
      id: 'q4',
      type: 'multiple_choice',
      question: 'Have you attended similar training before?',
      options: [
        { id: 'opt1', text: 'Yes, multiple times' },
        { id: 'opt2', text: 'Yes, once' },
        { id: 'opt3', text: 'No, this is my first time' },
      ],
      required: true,
      order: 4,
      maxSelections: 1,
    },
  },
  MULTIPLE_SELECTION: {
    summary: 'Multiple Selection Question',
    value: {
      id: 'q5',
      type: 'multiple_choice',
      question:
        'Which topics are you most interested in? (Select all that apply)',
      options: [
        { id: 'opt1', text: 'Advanced concepts' },
        { id: 'opt2', text: 'Practical applications' },
        { id: 'opt3', text: 'Best practices' },
        { id: 'opt4', text: 'Case studies' },
        { id: 'opt5', text: 'Tools and technologies' },
      ],
      required: false,
      order: 5,
      maxSelections: 3,
    },
  },
};

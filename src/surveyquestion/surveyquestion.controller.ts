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
  ApiParam,
} from '@nestjs/swagger';
import { SurveyQuestionService } from './surveyquestion.service';
import { CreateSurveyQuestionDto } from './dto/create-surveyquestion.dto';
import { UpdateSurveyQuestionDto } from './dto/update-surveyquestion.dto';
import {
  CreateSurveyQuestionSwaggerDto,
  UpdateSurveyQuestionSwaggerDto,
  SurveyQuestionResponseDto,
  SurveyQuestionApiOperations,
  SurveyQuestionApiResponses,
} from 'src/swagger/swagger.surveyquestion';
import { JwtAuthGuard } from 'src/guard/guard.jwt';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';

@ApiTags('Survey Questions')
@ApiBearerAuth()
@Controller('surveyquestion')
export class SurveyQuestionController {
  constructor(private readonly surveyQuestionService: SurveyQuestionService) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation(SurveyQuestionApiOperations.CREATE)
  @ApiBody({
    type: CreateSurveyQuestionSwaggerDto,
    examples: {
      multipleChoice: {
        summary: 'Multiple Choice Survey',
        value: {
          title: 'Pre-Training Assessment Survey',
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          categories: 'before',
          questions: [
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
          ],
        },
      },
      mixedTypes: {
        summary: 'Mixed Question Types Survey',
        value: {
          title: 'Training Feedback Survey',
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          categories: 'after',
          questions: [
            {
              id: 'q1',
              type: 'text',
              question: 'What was your overall satisfaction with the training?',
              required: true,
              order: 1,
            },
            {
              id: 'q2',
              type: 'multiple_choice',
              question: 'Would you recommend this training to others?',
              options: [
                { id: 'opt1', text: 'Yes, definitely' },
                { id: 'opt2', text: 'Yes, probably' },
                { id: 'opt3', text: 'No, probably not' },
                { id: 'opt4', text: 'No, definitely not' },
              ],
              maxSelections: 1,
              required: true,
              order: 2,
            },
            {
              id: 'q3',
              type: 'multiple_choice',
              question: 'What was the most valuable part of the training?',
              options: [
                { id: 'opt1', text: 'Hands-on exercises' },
                { id: 'opt2', text: 'Theory explanations' },
                { id: 'opt3', text: 'Q&A sessions' },
                { id: 'opt4', text: 'Practical examples' },
              ],
              required: true,
              order: 3,
              maxSelections: 2,
            },
            {
              id: 'q4',
              type: 'text',
              question: 'Any additional comments or suggestions?',
              required: false,
              order: 4,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Survey question created successfully',
    type: SurveyQuestionResponseDto,
    schema: {
      example: {
        status: 201,
        message: 'Survey question created successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          title: 'Pre-Training Assessment Survey',
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          categories: 'before',
          questions: [
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
          ],
          createdBy: '550e8400-e29b-41d4-a716-446655440001',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Training session not found',
    schema: {
      example: {
        status: 400,
        message: 'Training session not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
      },
    },
  })
  async create(
    @User() user: IJwtSignin,
    @Body() createSurveyQuestionDto: CreateSurveyQuestionDto,
  ) {
    return this.surveyQuestionService.create(createSurveyQuestionDto, user);
  }

  @Get('getall')
  @ApiOperation({ summary: 'Get all survey questions' })
  @ApiResponse({
    status: 200,
    description: 'Survey questions retrieved successfully',
    type: [SurveyQuestionResponseDto],
    schema: {
      example: {
        status: 200,
        message: 'Survey questions retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            title: 'Pre-Training Assessment Survey',
            id_session: '550e8400-e29b-41d4-a716-446655440000',
            categories: 'before',
            questions: [
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
                type: 'rating',
                question: 'Rate your current skill level (1-10)',
                required: true,
                order: 3,
              },
              {
                id: 'q4',
                type: 'yes_no',
                question: 'Have you worked with React before?',
                required: true,
                order: 4,
              },
            ],
            createdBy: '550e8400-e29b-41d4-a716-446655440001',
            trainingSession: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'Advanced React Development Session',
            },
            creator: {
              uuid: '550e8400-e29b-41d4-a716-446655440001',
              fs_name: 'John',
              ls_name: 'Doe',
              email: 'john.doe@example.com',
            },
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
          },
        ],
      },
    },
  })
  async findAll() {
    return this.surveyQuestionService.findAll();
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get survey questions by training session ID' })
  @ApiParam({
    name: 'sessionId',
    description: 'Training session UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Survey questions retrieved successfully',
    type: [SurveyQuestionResponseDto],
    schema: {
      example: {
        status: 200,
        message: 'Survey questions retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            title: 'Pre-Training Assessment Survey',
            id_session: '550e8400-e29b-41d4-a716-446655440000',
            categories: 'before',
            questions: [
              {
                id: 'q1',
                type: 'multiple_choice',
                question: 'What is your current experience level with React?',
                options: [
                  { id: 'opt1', text: 'Beginner (0-1 years)' },
                  { id: 'opt2', text: 'Intermediate (1-3 years)' },
                  { id: 'opt3', text: 'Advanced (3+ years)' },
                  { id: 'opt4', text: 'Expert (5+ years)' },
                ],
                required: true,
                order: 1,
                maxSelections: 1,
              },
              {
                id: 'q2',
                type: 'text',
                question:
                  'What are your main learning objectives for this training?',
                required: true,
                order: 2,
              },
              {
                id: 'q3',
                type: 'text',
                question: 'Describe your current skill level in React',
                required: true,
                order: 3,
              },
              {
                id: 'q4',
                type: 'yes_no',
                question: 'Have you worked with React before?',
                required: true,
                order: 4,
              },
              {
                id: 'q5',
                type: 'multiple_choice',
                question:
                  'Which topics are you most interested in? (Select all that apply)',
                options: [
                  { id: 'opt1', text: 'Component Lifecycle' },
                  { id: 'opt2', text: 'State Management' },
                  { id: 'opt3', text: 'Hooks' },
                  { id: 'opt4', text: 'Performance Optimization' },
                  { id: 'opt5', text: 'Testing' },
                ],
                required: false,
                order: 5,
                maxSelections: 3,
              },
            ],
            createdBy: '550e8400-e29b-41d4-a716-446655440001',
            creator: {
              uuid: '550e8400-e29b-41d4-a716-446655440001',
              fs_name: 'John',
              ls_name: 'Doe',
              email: 'john.doe@example.com',
            },
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            title: 'Mid-Training Progress Survey',
            id_session: '550e8400-e29b-41d4-a716-446655440000',
            categories: 'during',
            questions: [
              {
                id: 'q1',
                type: 'text',
                question: 'How well do you understand the current topic?',
                required: true,
                order: 1,
              },
              {
                id: 'q2',
                type: 'multiple_choice',
                question: 'Are you finding the pace appropriate?',
                options: [
                  { id: 'opt1', text: 'Yes, perfect pace' },
                  { id: 'opt2', text: 'Yes, but could be faster' },
                  { id: 'opt3', text: 'Yes, but could be slower' },
                  { id: 'opt4', text: 'No, not appropriate' },
                ],
                maxSelections: 1,
                required: true,
                order: 2,
              },
              {
                id: 'q3',
                type: 'text',
                question: 'What questions do you have about the current topic?',
                required: false,
                order: 3,
              },
              {
                id: 'q4',
                type: 'multiple_choice',
                question: 'What would help you learn better?',
                options: [
                  { id: 'opt1', text: 'More examples' },
                  { id: 'opt2', text: 'Hands-on practice' },
                  { id: 'opt3', text: 'Slower pace' },
                  { id: 'opt4', text: 'Additional resources' },
                ],
                required: true,
                order: 4,
                maxSelections: 2,
              },
            ],
            createdBy: '550e8400-e29b-41d4-a716-446655440001',
            creator: {
              uuid: '550e8400-e29b-41d4-a716-446655440001',
              fs_name: 'John',
              ls_name: 'Doe',
              email: 'john.doe@example.com',
            },
            createdAt: '2025-01-15T11:30:00.000Z',
            updatedAt: '2025-01-15T11:30:00.000Z',
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440004',
            title: 'Post-Training Feedback Survey',
            id_session: '550e8400-e29b-41d4-a716-446655440000',
            categories: 'after',
            questions: [
              {
                id: 'q1',
                type: 'text',
                question:
                  'What was your overall satisfaction with the training?',
                required: true,
                order: 1,
              },
              {
                id: 'q2',
                type: 'yes_no',
                question: 'Would you recommend this training to others?',
                required: true,
                order: 2,
              },
              {
                id: 'q3',
                type: 'multiple_choice',
                question: 'What was the most valuable part of the training?',
                options: [
                  { id: 'opt1', text: 'Theory explanations' },
                  { id: 'opt2', text: 'Hands-on exercises' },
                  { id: 'opt3', text: 'Q&A sessions' },
                  { id: 'opt4', text: 'Practical examples' },
                  { id: 'opt5', text: 'Group discussions' },
                ],
                required: true,
                order: 3,
                maxSelections: 2,
              },
              {
                id: 'q4',
                type: 'text',
                question:
                  'What suggestions do you have for improving this training?',
                required: false,
                order: 4,
              },
              {
                id: 'q5',
                type: 'multiple_choice',
                question:
                  'How confident do you feel applying what you learned?',
                options: [
                  { id: 'opt1', text: 'Very confident' },
                  { id: 'opt2', text: 'Somewhat confident' },
                  { id: 'opt3', text: 'Neutral' },
                  { id: 'opt4', text: 'Not very confident' },
                  { id: 'opt5', text: 'Not confident at all' },
                ],
                required: true,
                order: 5,
                maxSelections: 1,
              },
            ],
            createdBy: '550e8400-e29b-41d4-a716-446655440001',
            creator: {
              uuid: '550e8400-e29b-41d4-a716-446655440001',
              fs_name: 'John',
              ls_name: 'Doe',
              email: 'john.doe@example.com',
            },
            createdAt: '2025-01-15T12:30:00.000Z',
            updatedAt: '2025-01-15T12:30:00.000Z',
          },
        ],
      },
    },
  })
  async findBySessionId(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.surveyQuestionService.findBySessionId(sessionId);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get survey questions by category' })
  @ApiParam({
    name: 'category',
    description: 'Survey category',
    example: 'before',
    enum: ['before', 'during', 'after'],
  })
  @ApiResponse({
    status: 200,
    description: 'Survey questions retrieved successfully',
    type: [SurveyQuestionResponseDto],
  })
  async findByCategory(
    @Param('category') category: 'before' | 'during' | 'after',
  ) {
    return this.surveyQuestionService.findByCategory(category);
  }

  @Get('creator/:creatorId')
  @ApiOperation({ summary: 'Get survey questions by creator ID' })
  @ApiParam({
    name: 'creatorId',
    description: 'Creator UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Survey questions retrieved successfully',
    type: [SurveyQuestionResponseDto],
    schema: {
      example: {
        status: 200,
        message: 'Survey questions retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            title: 'Pre-Training Assessment Survey',
            id_session: '550e8400-e29b-41d4-a716-446655440000',
            categories: 'before',
            questions: [
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
                type: 'rating',
                question: 'Rate your current skill level (1-10)',
                required: true,
                order: 3,
              },
              {
                id: 'q4',
                type: 'yes_no',
                question: 'Have you worked with React before?',
                required: true,
                order: 4,
              },
            ],
            createdBy: '550e8400-e29b-41d4-a716-446655440001',
            trainingSession: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'Advanced React Development Session',
            },
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
          },
        ],
      },
    },
  })
  async findByCreator(@Param('creatorId', ParseUUIDPipe) creatorId: string) {
    return this.surveyQuestionService.findByCreator(creatorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get survey question by ID' })
  @ApiParam({
    name: 'id',
    description: 'Survey question UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiResponse({
    status: 200,
    description: 'Survey question retrieved successfully',
    type: SurveyQuestionResponseDto,
    schema: {
      example: {
        status: 200,
        message: 'Survey question retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          title: 'Pre-Training Assessment Survey',
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          categories: 'before',
          questions: [
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
              question: 'Describe your current skill level',
              required: true,
              order: 3,
            },
            {
              id: 'q4',
              type: 'multiple_choice',
              question: 'Have you worked with React before?',
              options: [
                { id: 'opt1', text: 'Yes, extensively' },
                { id: 'opt2', text: 'Yes, some experience' },
                { id: 'opt3', text: 'No, this is my first time' },
              ],
              maxSelections: 1,
              required: true,
              order: 4,
            },
          ],
          createdBy: '550e8400-e29b-41d4-a716-446655440001',
          trainingSession: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Advanced React Development Session',
          },
          creator: {
            uuid: '550e8400-e29b-41d4-a716-446655440001',
            fs_name: 'John',
            ls_name: 'Doe',
            email: 'john.doe@example.com',
          },
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Survey question not found',
    schema: {
      example: {
        status: 404,
        message: 'Survey question not found',
      },
    },
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.surveyQuestionService.findOne(id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Update survey question by ID' })
  @ApiParam({
    name: 'id',
    description: 'Survey question UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiBody({
    type: UpdateSurveyQuestionDto,
    examples: {
      updateTitle: {
        summary: 'Update survey title',
        value: {
          title: 'Updated Pre-Training Assessment Survey',
        },
      },
      updateQuestions: {
        summary: 'Update survey questions',
        value: {
          questions: [
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
              question: 'Any additional comments or feedback?',
              required: false,
              order: 3,
            },
          ],
        },
      },
      updateAll: {
        summary: 'Update all fields',
        value: {
          title: 'Comprehensive Training Survey',
          categories: 'during',
          questions: [
            {
              id: 'q1',
              type: 'text',
              question: 'Describe your current skill level',
              required: true,
              order: 1,
            },
            {
              id: 'q2',
              type: 'multiple_choice',
              question: 'What topics interest you most?',
              options: [
                { id: 'opt1', text: 'Advanced concepts' },
                { id: 'opt2', text: 'Practical applications' },
                { id: 'opt3', text: 'Best practices' },
              ],
              required: true,
              order: 2,
              maxSelections: 2,
            },
            {
              id: 'q3',
              type: 'text',
              question: 'How do you prefer to learn?',
              required: true,
              order: 3,
            },
            {
              id: 'q4',
              type: 'text',
              question: 'Any specific challenges you face?',
              required: false,
              order: 4,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Survey question updated successfully',
    type: SurveyQuestionResponseDto,
    schema: {
      example: {
        status: 200,
        message: 'Survey question updated successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          title: 'Updated Pre-Training Assessment Survey',
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          categories: 'before',
          questions: [
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
              question: 'Any additional comments or feedback?',
              required: false,
              order: 3,
            },
          ],
          createdBy: '550e8400-e29b-41d4-a716-446655440001',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-16T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update surveys you created',
    schema: {
      example: {
        status: 403,
        message: 'You can only update surveys you created',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Survey question not found',
    schema: {
      example: {
        status: 404,
        message: 'Survey question not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
      },
    },
  })
  async update(
    @User() user: IJwtSignin,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSurveyQuestionDto: UpdateSurveyQuestionDto,
  ) {
    return this.surveyQuestionService.update(user, id, updateSurveyQuestionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Delete survey question by ID' })
  @ApiParam({
    name: 'id',
    description: 'Survey question UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiResponse({
    status: 200,
    description: 'Survey question deleted successfully',
    schema: {
      example: {
        status: 200,
        message: 'Survey question deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only delete surveys you created',
    schema: {
      example: {
        status: 403,
        message: 'You can only delete surveys you created',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Survey question not found',
    schema: {
      example: {
        status: 404,
        message: 'Survey question not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
      },
    },
  })
  async remove(
    @User() user: IJwtSignin,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.surveyQuestionService.remove(user, id);
  }
}

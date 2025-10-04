import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { EvaluationQuestionService } from './evaluationquestion.service';
import { CreateEvaluationQuestionDto } from './dto/create-evaluationquestion.dto';
import { UpdateEvaluationQuestionDto } from './dto/update-evaluationquestion.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';

@ApiTags('Evaluation Questions')
@Controller('evaluationquestion')
export class EvaluationQuestionController {
  constructor(
    private readonly evaluationQuestionService: EvaluationQuestionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Create a new evaluation question',
    description: 'Create a new question for an evaluation',
  })
  @ApiBody({
    type: CreateEvaluationQuestionDto,
    description: 'Evaluation question data',
    examples: {
      multipleChoice: {
        summary: 'Multiple Choice Question',
        description: 'Create a multiple choice question',
        value: {
          evaluationId: 'eval-uuid-1',
          type: 'multiple_choice',
          text: 'What is the correct way to create a React component?',
          isImmediateResult: false,
          points: 1,
        },
      },
      textQuestion: {
        summary: 'Text Question',
        description: 'Create a text-based question',
        value: {
          evaluationId: 'eval-uuid-1',
          type: 'text',
          text: 'Explain the concept of React hooks and provide examples.',
          isImmediateResult: false,
          points: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Evaluation question created successfully',
    example: {
      status: 201,
      message: 'Evaluation question created successfully',
      data: {
        id: 'question-uuid-1',
        evaluationId: 'eval-uuid-1',
        type: 'multiple_choice',
        text: 'What is the correct way to create a React component?',
        isImmediateResult: false,
        points: 1,
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createEvaluationQuestionDto: CreateEvaluationQuestionDto) {
    return this.evaluationQuestionService.create(createEvaluationQuestionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all evaluation questions' })
  @ApiResponse({
    status: 200,
    description: 'Evaluation questions retrieved successfully',
    example: {
      status: 200,
      message: 'Evaluation questions retrieved successfully',
      data: [
        {
          id: 'question-uuid-1',
          evaluationId: 'eval-uuid-1',
          type: 'multiple_choice',
          text: 'What is the correct way to create a React component?',
          isImmediateResult: false,
          points: 1,
          evaluation: {
            id: 'eval-uuid-1',
            title: 'React Fundamentals Assessment',
          },
          options: [
            {
              id: 'option-uuid-1',
              text: 'Using function components with hooks',
              isCorrect: true,
            },
            {
              id: 'option-uuid-2',
              text: 'Using class components only',
              isCorrect: false,
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
    return this.evaluationQuestionService.findAll();
  }

  @Get('evaluation/:evaluationId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get questions by evaluation ID' })
  @ApiParam({
    name: 'evaluationId',
    description: 'Evaluation UUID',
    example: 'eval-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation questions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByEvaluation(@Param('evaluationId') evaluationId: string) {
    return this.evaluationQuestionService.findByEvaluation(evaluationId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get evaluation question by ID' })
  @ApiParam({
    name: 'id',
    description: 'Evaluation question UUID',
    example: 'question-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation question retrieved successfully',
    example: {
      status: 200,
      message: 'Evaluation question retrieved successfully',
      data: {
        id: 'question-uuid-1',
        evaluationId: 'eval-uuid-1',
        type: 'multiple_choice',
        text: 'What is the correct way to create a React component?',
        isImmediateResult: false,
        points: 1,
        evaluation: {
          id: 'eval-uuid-1',
          title: 'React Fundamentals Assessment',
        },
        options: [
          {
            id: 'option-uuid-1',
            text: 'Using function components with hooks',
            isCorrect: true,
          },
          {
            id: 'option-uuid-2',
            text: 'Using class components only',
            isCorrect: false,
          },
        ],
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Evaluation question not found' })
  findOne(@Param('id') id: string) {
    return this.evaluationQuestionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Update evaluation question by ID' })
  @ApiParam({
    name: 'id',
    description: 'Evaluation question UUID',
    example: 'question-uuid-1',
  })
  @ApiBody({
    type: UpdateEvaluationQuestionDto,
    description: 'Evaluation question update data',
    examples: {
      basic: {
        summary: 'Basic Update',
        description: 'Update basic question information',
        value: {
          text: 'Updated question text',
          points: 2,
          isImmediateResult: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation question updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Evaluation question not found' })
  update(
    @Param('id') id: string,
    @Body() updateEvaluationQuestionDto: UpdateEvaluationQuestionDto,
  ) {
    return this.evaluationQuestionService.update(
      id,
      updateEvaluationQuestionDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Delete evaluation question by ID' })
  @ApiParam({
    name: 'id',
    description: 'Evaluation question UUID',
    example: 'question-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation question deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Evaluation question not found' })
  remove(@Param('id') id: string) {
    return this.evaluationQuestionService.remove(id);
  }
}

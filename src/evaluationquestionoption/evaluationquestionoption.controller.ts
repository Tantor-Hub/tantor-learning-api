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
import { EvaluationQuestionOptionService } from './evaluationquestionoption.service';
import { CreateEvaluationQuestionOptionDto } from './dto/create-evaluationquestionoption.dto';
import { UpdateEvaluationQuestionOptionDto } from './dto/update-evaluationquestionoption.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';

@ApiTags('Evaluation Question Options')
@Controller('evaluationquestionoption')
export class EvaluationQuestionOptionController {
  constructor(
    private readonly evaluationQuestionOptionService: EvaluationQuestionOptionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Create a new evaluation question option',
    description: 'Create a new option for a multiple choice question',
  })
  @ApiBody({
    type: CreateEvaluationQuestionOptionDto,
    description: 'Evaluation question option data',
    examples: {
      correctOption: {
        summary: 'Correct Option',
        description: 'Create a correct answer option',
        value: {
          questionId: 'question-uuid-1',
          text: 'Using function components with hooks',
          isCorrect: true,
        },
      },
      incorrectOption: {
        summary: 'Incorrect Option',
        description: 'Create an incorrect answer option',
        value: {
          questionId: 'question-uuid-1',
          text: 'Using class components only',
          isCorrect: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Evaluation question option created successfully',
    example: {
      status: 201,
      message: 'Evaluation question option created successfully',
      data: {
        id: 'option-uuid-1',
        questionId: 'question-uuid-1',
        text: 'Using function components with hooks',
        isCorrect: true,
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Body()
    createEvaluationQuestionOptionDto: CreateEvaluationQuestionOptionDto,
  ) {
    return this.evaluationQuestionOptionService.create(
      createEvaluationQuestionOptionDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all evaluation question options' })
  @ApiResponse({
    status: 200,
    description: 'Evaluation question options retrieved successfully',
    example: {
      status: 200,
      message: 'Evaluation question options retrieved successfully',
      data: [
        {
          id: 'option-uuid-1',
          questionId: 'question-uuid-1',
          text: 'Using function components with hooks',
          isCorrect: true,
          question: {
            id: 'question-uuid-1',
            text: 'What is the correct way to create a React component?',
            type: 'multiple_choice',
          },
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.evaluationQuestionOptionService.findAll();
  }

  @Get('question/:questionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get options by question ID' })
  @ApiParam({
    name: 'questionId',
    description: 'Question UUID',
    example: 'question-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation question options retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByQuestion(@Param('questionId') questionId: string) {
    return this.evaluationQuestionOptionService.findByQuestion(questionId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get evaluation question option by ID' })
  @ApiParam({
    name: 'id',
    description: 'Evaluation question option UUID',
    example: 'option-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation question option retrieved successfully',
    example: {
      status: 200,
      message: 'Evaluation question option retrieved successfully',
      data: {
        id: 'option-uuid-1',
        questionId: 'question-uuid-1',
        text: 'Using function components with hooks',
        isCorrect: true,
        question: {
          id: 'question-uuid-1',
          text: 'What is the correct way to create a React component?',
          type: 'multiple_choice',
        },
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Evaluation question option not found',
  })
  findOne(@Param('id') id: string) {
    return this.evaluationQuestionOptionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Update evaluation question option by ID' })
  @ApiParam({
    name: 'id',
    description: 'Evaluation question option UUID',
    example: 'option-uuid-1',
  })
  @ApiBody({
    type: UpdateEvaluationQuestionOptionDto,
    description: 'Evaluation question option update data',
    examples: {
      basic: {
        summary: 'Basic Update',
        description: 'Update basic option information',
        value: {
          text: 'Updated option text',
          isCorrect: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation question option updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({
    status: 404,
    description: 'Evaluation question option not found',
  })
  update(
    @Param('id') id: string,
    @Body()
    updateEvaluationQuestionOptionDto: UpdateEvaluationQuestionOptionDto,
  ) {
    return this.evaluationQuestionOptionService.update(
      id,
      updateEvaluationQuestionOptionDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Delete evaluation question option by ID' })
  @ApiParam({
    name: 'id',
    description: 'Evaluation question option UUID',
    example: 'option-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation question option deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({
    status: 404,
    description: 'Evaluation question option not found',
  })
  remove(@Param('id') id: string) {
    return this.evaluationQuestionOptionService.remove(id);
  }
}

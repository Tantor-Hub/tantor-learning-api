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
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';

@ApiTags('Evaluation Question Options')
@Controller('evaluationquestionoption')
export class EvaluationQuestionOptionController {
  constructor(
    private readonly evaluationQuestionOptionService: EvaluationQuestionOptionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuardAsSuperviseur)
  @ApiOperation({
    summary: 'Create a new evaluation question option',
    description:
      'Create a new option for a multiple choice question (Supervisor access required)',
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Supervisor access required',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Only supervisors (admin, secretary, instructor) can create evaluation question options',
  })
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
            points: 1,
            isImmediateResult: false,
          },
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
        {
          id: 'option-uuid-2',
          questionId: 'question-uuid-1',
          text: 'Using class components only',
          isCorrect: false,
          question: {
            id: 'question-uuid-1',
            text: 'What is the correct way to create a React component?',
            type: 'multiple_choice',
            points: 1,
            isImmediateResult: false,
          },
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question not found' })
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
  @UseGuards(JwtAuthGuardAsSuperviseur)
  @ApiOperation({
    summary:
      'Update evaluation question option by ID (Supervisor access required)',
  })
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Supervisor access required',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Only supervisors (admin, secretary, instructor) can update evaluation question options',
  })
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
  @UseGuards(JwtAuthGuardAsSuperviseur)
  @ApiOperation({
    summary:
      'Delete evaluation question option by ID (Supervisor access required)',
    description:
      'Delete a specific evaluation question option. Options with student answers cannot be deleted to maintain data integrity. Only supervisors can delete options.',
  })
  @ApiParam({
    name: 'id',
    description: 'Evaluation question option UUID',
    example: 'option-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation question option deleted successfully',
    example: {
      status: 200,
      message: 'Evaluation question option deleted successfully.',
      data: {
        deletedOption: {
          id: 'option-uuid-1',
          text: 'Using function components with hooks',
          isCorrect: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Option cannot be deleted due to existing student answers',
    example: {
      status: 400,
      message:
        'Cannot delete evaluation question option. This option has been used by 3 student answer(s). To maintain data integrity, options with student answers cannot be deleted.',
      data: {
        optionId: 'option-uuid-1',
        optionText: 'Using function components with hooks',
        studentAnswerCount: 3,
        reason: 'Option has associated student answers',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Supervisor access required',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Only supervisors (admin, secretary, instructor) can delete evaluation question options',
  })
  @ApiResponse({
    status: 404,
    description: 'Evaluation question option not found',
  })
  remove(@Param('id') id: string) {
    return this.evaluationQuestionOptionService.remove(id);
  }
}

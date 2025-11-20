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
import { StudentAnswerOptionService } from './studentansweroption.service';
import { CreateStudentAnswerOptionDto } from './dto/create-studentansweroption.dto';
import { UpdateStudentAnswerOptionDto } from './dto/update-studentansweroption.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';

@ApiTags('Student Answer Options')
@Controller('studentansweroption')
export class StudentAnswerOptionController {
  constructor(
    private readonly studentAnswerOptionService: StudentAnswerOptionService,
  ) {}

  @Post('')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({
    summary: 'Select an option for a student answer',
    description:
      'Select a specific option for a multiple choice question answer. The isCorrect and points fields are automatically set based on the evaluation question option. Points are set to the full question points if correct, 0 if incorrect. Both questionId and optionId must be provided in the request body.',
  })
  @ApiBody({
    type: CreateStudentAnswerOptionDto,
    description: 'Student answer option data',
    examples: {
      selectOption: {
        summary: 'Select Option (Auto-scoring)',
        description:
          'Select an option for a multiple choice answer. isCorrect and points are automatically set based on the evaluation question option. The studentId is automatically extracted from the authentication token.',
        value: {
          questionId: 'question-uuid-1',
          optionId: 'option-uuid-1',
        },
      },
      selectOptionWithCustomPoints: {
        summary: 'Select Option with Custom Points',
        description:
          'Select an option with custom points (must not exceed question maximum points). The studentId is automatically extracted from the authentication token.',
        value: {
          questionId: 'question-uuid-1',
          optionId: 'option-uuid-1',
          points: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Student answer option created successfully',
    example: {
      status: 201,
      message: 'Option de réponse étudiante créée avec succès',
      data: {
        id: 'answer-option-uuid-1',
        questionId: 'question-uuid-1',
        optionId: 'option-uuid-1',
        isCorrect: true,
        points: 5,
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Body() createStudentAnswerOptionDto: CreateStudentAnswerOptionDto,
    @User() user: IJwtSignin,
  ) {
    return this.studentAnswerOptionService.create(
      createStudentAnswerOptionDto,
      user.id_user,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all student answer options' })
  @ApiResponse({
    status: 200,
    description: 'Student answer options retrieved successfully',
    example: {
      status: 200,
      message: 'Student answer options retrieved successfully',
      data: [
        {
          id: 'answer-option-uuid-1',
          questionId: 'question-uuid-1',
          optionId: 'option-uuid-1',
          isCorrect: true,
          points: 5,
          option: {
            id: 'option-uuid-1',
            text: 'Using function components with hooks',
            isCorrect: true,
          },
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.studentAnswerOptionService.findAll();
  }

  @Get('option/:optionId')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({
    summary: 'Get student answer options by evaluation question option ID',
    description:
      'Retrieve all student answer options for a specific evaluation question option. Students can access options for questions they are enrolled in.',
  })
  @ApiParam({
    name: 'optionId',
    description: 'Evaluation Question Option UUID',
    example: 'option-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student answer options retrieved successfully',
    examples: {
      withOptions: {
        summary: 'When options exist for the question option',
        value: {
          status: 200,
          message: 'Options de réponse étudiante récupérées avec succès',
          data: {
            answerOptions: [
              {
                id: 'answer-option-uuid-1',
                questionId: 'question-uuid-1',
                optionId: 'option-uuid-1',
                isCorrect: true,
                points: 5,
                option: {
                  id: 'option-uuid-1',
                  text: 'A JavaScript library for building user interfaces',
                  isCorrect: true,
                },
                createdAt: '2025-01-15T10:30:00.000Z',
                updatedAt: '2025-01-15T10:30:00.000Z',
              },
            ],
            total: 1,
            questionId: 'question-uuid-1',
            optionId: 'option-uuid-1',
          },
        },
      },
      noOptions: {
        summary: 'When no options exist for the question option',
        value: {
          status: 200,
          message: 'Options de réponse étudiante récupérées avec succès',
          data: {
            answerOptions: [],
            total: 0,
            questionId: 'question-uuid-1',
            optionId: 'option-uuid-1',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Student access required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student access required',
  })
  @ApiResponse({ status: 404, description: 'Question option not found' })
  findByOptionId(@Param('optionId') optionId: string) {
    return this.studentAnswerOptionService.findByOptionId(optionId);
  }

  @Get('question/:questionId')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({
    summary: 'Get student answer options by evaluation question ID',
    description:
      'Retrieve all student answer options for a specific evaluation question. Students can access options for questions they are enrolled in.',
  })
  @ApiParam({
    name: 'questionId',
    description: 'Evaluation Question UUID',
    example: 'question-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student answer options retrieved successfully',
    examples: {
      withOptions: {
        summary: 'When options exist for the question',
        value: {
          status: 200,
          message: 'Options de réponse étudiante récupérées avec succès',
          data: {
            answerOptions: [
              {
                id: 'answer-option-uuid-1',
                questionId: 'question-uuid-1',
                optionId: 'option-uuid-1',
                isCorrect: true,
                points: 5,
                option: {
                  id: 'option-uuid-1',
                  text: 'A JavaScript library for building user interfaces',
                  isCorrect: true,
                },
                createdAt: '2025-01-15T10:30:00.000Z',
                updatedAt: '2025-01-15T10:30:00.000Z',
              },
            ],
            total: 1,
            questionId: 'question-uuid-1',
          },
        },
      },
      noOptions: {
        summary: 'When no options exist for the question',
        value: {
          status: 200,
          message: 'Options de réponse étudiante récupérées avec succès',
          data: {
            answerOptions: [],
            total: 0,
            questionId: 'question-uuid-1',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Student access required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student access required',
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  findByQuestionId(@Param('questionId') questionId: string) {
    return this.studentAnswerOptionService.findByQuestionId(questionId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get student answer option by ID' })
  @ApiParam({
    name: 'id',
    description: 'Student answer option UUID',
    example: 'answer-option-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student answer option retrieved successfully',
    example: {
      status: 200,
      message: 'Student answer option retrieved successfully',
      data: {
        id: 'answer-option-uuid-1',
        questionId: 'question-uuid-1',
        optionId: 'option-uuid-1',
        isCorrect: true,
        points: 5,
        option: {
          id: 'option-uuid-1',
          text: 'Using function components with hooks',
          isCorrect: true,
        },
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Student answer option not found' })
  findOne(@Param('id') id: string) {
    return this.studentAnswerOptionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({ summary: 'Update student answer option by ID' })
  @ApiParam({
    name: 'id',
    description: 'Student answer option UUID',
    example: 'answer-option-uuid-1',
  })
  @ApiBody({
    type: UpdateStudentAnswerOptionDto,
    description: 'Student answer option update data',
    examples: {
      changeOption: {
        summary: 'Change Option',
        description: 'Change the selected option',
        value: {
          optionId: 'option-uuid-2',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Student answer option updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student answer option not found' })
  update(
    @Param('id') id: string,
    @Body() updateStudentAnswerOptionDto: UpdateStudentAnswerOptionDto,
  ) {
    return this.studentAnswerOptionService.update(
      id,
      updateStudentAnswerOptionDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({ summary: 'Delete student answer option by ID' })
  @ApiParam({
    name: 'id',
    description: 'Student answer option UUID',
    example: 'answer-option-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student answer option deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student answer option not found' })
  remove(@Param('id') id: string) {
    return this.studentAnswerOptionService.remove(id);
  }
}

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
import { StudentAnswerService } from './studentanswer.service';
import { CreateStudentAnswerDto } from './dto/create-studentanswer.dto';
import { UpdateStudentAnswerDto } from './dto/update-studentanswer.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';

@ApiTags('Student Answers')
@Controller('studentanswer')
export class StudentAnswerController {
  constructor(private readonly studentAnswerService: StudentAnswerService) {}

  @Post()
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({
    summary: 'Submit a student answer',
    description:
      'Submit an answer to an evaluation question. The studentId is automatically set to the authenticated user.',
  })
  @ApiBody({
    type: CreateStudentAnswerDto,
    description: 'Student answer data',
    examples: {
      textAnswer: {
        summary: 'Text Answer',
        description: 'Submit a text-based answer',
        value: {
          questionId: 'question-uuid-1',
          evaluationId: 'eval-uuid-1',
          answerText:
            'React hooks are functions that let you use state and other React features in functional components.',
        },
      },
      multipleChoiceAnswer: {
        summary: 'Multiple Choice Answer',
        description: 'Submit a multiple choice answer (answerText not needed)',
        value: {
          questionId: 'question-uuid-1',
          evaluationId: 'eval-uuid-1',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Student answer submitted successfully',
    example: {
      status: 201,
      message: 'Student answer submitted successfully',
      data: {
        id: 'answer-uuid-1',
        questionId: 'question-uuid-1',
        studentId: 'student-uuid-1',
        evaluationId: 'eval-uuid-1',
        answerText:
          'React hooks are functions that let you use state and other React features in functional components.',
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
    @Body() createStudentAnswerDto: Omit<CreateStudentAnswerDto, 'studentId'>,
    @User() user: IJwtSignin,
  ) {
    const answerData = {
      ...createStudentAnswerDto,
      studentId: user.id_user,
    };
    return this.studentAnswerService.create(answerData);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all student answers' })
  @ApiResponse({
    status: 200,
    description: 'Student answers retrieved successfully',
    example: {
      status: 200,
      message: 'Student answers retrieved successfully',
      data: [
        {
          id: 'answer-uuid-1',
          questionId: 'question-uuid-1',
          studentId: 'student-uuid-1',
          evaluationId: 'eval-uuid-1',
          answerText:
            'React hooks are functions that let you use state and other React features in functional components.',
          isCorrect: true,
          question: {
            id: 'question-uuid-1',
            text: 'Explain the concept of React hooks.',
            type: 'text',
          },
          student: {
            id: 'student-uuid-1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
          },
          evaluation: {
            id: 'eval-uuid-1',
            title: 'React Fundamentals Assessment',
          },
          selectedOptions: [],
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.studentAnswerService.findAll();
  }

  @Get('student/my-answers')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({
    summary: 'Get answers submitted by current student',
    description:
      'Retrieve all answers submitted by the currently authenticated student',
  })
  @ApiResponse({
    status: 200,
    description: 'Student answers retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByStudent(@User() user: IJwtSignin) {
    return this.studentAnswerService.findByStudent(user.id_user);
  }

  @Get('evaluation/:evaluationId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get answers by evaluation ID' })
  @ApiParam({
    name: 'evaluationId',
    description: 'Evaluation UUID',
    example: 'eval-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student answers retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByEvaluation(@Param('evaluationId') evaluationId: string) {
    return this.studentAnswerService.findByEvaluation(evaluationId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get student answer by ID' })
  @ApiParam({
    name: 'id',
    description: 'Student answer UUID',
    example: 'answer-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student answer retrieved successfully',
    example: {
      status: 200,
      message: 'Student answer retrieved successfully',
      data: {
        id: 'answer-uuid-1',
        questionId: 'question-uuid-1',
        studentId: 'student-uuid-1',
        evaluationId: 'eval-uuid-1',
        answerText:
          'React hooks are functions that let you use state and other React features in functional components.',
        isCorrect: true,
        question: {
          id: 'question-uuid-1',
          text: 'Explain the concept of React hooks.',
          type: 'text',
        },
        student: {
          id: 'student-uuid-1',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
        },
        evaluation: {
          id: 'eval-uuid-1',
          title: 'React Fundamentals Assessment',
        },
        selectedOptions: [],
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Student answer not found' })
  findOne(@Param('id') id: string) {
    return this.studentAnswerService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({ summary: 'Update student answer by ID' })
  @ApiParam({
    name: 'id',
    description: 'Student answer UUID',
    example: 'answer-uuid-1',
  })
  @ApiBody({
    type: UpdateStudentAnswerDto,
    description: 'Student answer update data',
    examples: {
      basic: {
        summary: 'Basic Update',
        description: 'Update basic answer information',
        value: {
          answerText: 'Updated answer text',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Student answer updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student answer not found' })
  update(
    @Param('id') id: string,
    @Body() updateStudentAnswerDto: UpdateStudentAnswerDto,
  ) {
    return this.studentAnswerService.update(id, updateStudentAnswerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({ summary: 'Delete student answer by ID' })
  @ApiParam({
    name: 'id',
    description: 'Student answer UUID',
    example: 'answer-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student answer deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student answer not found' })
  remove(@Param('id') id: string) {
    return this.studentAnswerService.remove(id);
  }
}

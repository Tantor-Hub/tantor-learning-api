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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentAnswerService } from './studentanswer.service';
import { CreateStudentAnswerDto } from './dto/create-studentanswer.dto';
import { UpdateStudentAnswerDto } from './dto/update-studentanswer.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { JwtAuthGuardAsInstructor } from 'src/guard/guard.asinstructor';
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
      'Submit an answer to an evaluation question. The studentId is automatically set to the authenticated user. Students can submit multiple answers for the same evaluation as long as they are for different questions.',
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
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data or validation error',
    example: {
      status: 400,
      message:
        'Les points attribués (5) ne peuvent pas dépasser le maximum de points de la question (3)',
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - Student has already submitted an answer for this specific question in this evaluation',
    example: {
      status: 409,
      message:
        'Vous avez déjà soumis une réponse pour cette question dans cette évaluation',
    },
  })
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

  @Get('question/:questionId')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({
    summary: 'Get student answers by question ID',
    description:
      'Retrieve all student answers for a specific evaluation question. Students can access answers for questions they are enrolled in.',
  })
  @ApiParam({
    name: 'questionId',
    description: 'Evaluation Question UUID',
    example: 'question-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student answers retrieved successfully',
    examples: {
      withAnswers: {
        summary: 'When answers exist for the question',
        value: {
          status: 200,
          message: "Réponses d'étudiants récupérées avec succès",
          data: {
            answers: [
              {
                id: 'answer-uuid-1',
                questionId: 'question-uuid-1',
                studentId: 'student-uuid-1',
                evaluationId: 'eval-uuid-1',
                answerText:
                  'React hooks are functions that let you use state and other React features.',
                isCorrect: true,
                points: 5,
                question: {
                  id: 'question-uuid-1',
                  text: 'Explain the concept of React hooks.',
                  type: 'text',
                  points: 5,
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
            total: 1,
            questionId: 'question-uuid-1',
          },
        },
      },
      noAnswers: {
        summary: 'When no answers exist for the question',
        value: {
          status: 200,
          message: "Réponses d'étudiants récupérées avec succès",
          data: {
            answers: [],
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
  findByQuestion(@Param('questionId') questionId: string) {
    return this.studentAnswerService.findByQuestion(questionId);
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

  @Patch('instructor/:answerId/points')
  @UseGuards(JwtAuthGuardAsInstructor)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update student answer points (Instructor)',
    description:
      "Update the points awarded for a specific student answer. Only instructors assigned to the evaluation's session course can update points. Points cannot exceed the question's maximum points or be negative. Instructors can update the points multiple times for the same answer, but only as long as the evaluation's marking status is 'pending' or 'in_progress'.",
  })
  @ApiParam({
    name: 'answerId',
    description: 'Answer UUID - The unique identifier of the student answer',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        points: {
          type: 'number',
          example: 8,
          description:
            'Points to award for this answer (0 or greater, cannot exceed question maximum). This can be updated multiple times by the instructor.',
          minimum: 0,
        },
      },
      required: ['points'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Student answer points updated successfully',
    example: {
      status: 200,
      message: 'Points de la réponse étudiante mis à jour avec succès',
      data: {
        id: 'answer-uuid-1',
        questionId: 'question-uuid-1',
        studentId: 'student-uuid-1',
        evaluationId: 'eval-uuid-1',
        answerText: 'React is a JavaScript library',
        isCorrect: true,
        points: 8,
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T11:00:00.000Z',
        student: {
          id: 'student-uuid-1',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          avatar: 'https://example.com/avatar.jpg',
        },
        question: {
          id: 'question-uuid-1',
          type: 'text',
          text: 'What is React?',
          points: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid points value or evaluation marking status is not pending',
    examples: {
      invalidPoints: {
        summary: 'Points dépassent le maximum',
        value: {
          status: 400,
          message: "Les points (15) ne peuvent pas dépasser le maximum de points de la question (10)",
        },
      },
      markingStatusNotAllowed: {
        summary: 'Statut de correction non autorisé',
        value: {
          status: 400,
          message:
            "Impossible de mettre à jour les points. Le statut de correction de l'évaluation doit être 'en attente' ou 'en cours'. Statut actuel : 'publié'",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description:
      "Forbidden - You are not assigned as an instructor for this evaluation's session course",
    example: {
      status: 403,
      message:
        "Vous n'êtes pas assigné comme formateur pour la session de cours de cette évaluation",
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Student answer not found',
    example: {
      status: 404,
      message: 'Réponse étudiante non trouvée',
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    example: {
      status: 500,
      message: 'Erreur lors de la mise à jour des points de la réponse étudiante',
    },
  })
  updateStudentAnswerPoints(
    @Param('answerId') answerId: string,
    @Body('points') points: number,
    @User() user: IJwtSignin,
  ) {
    return this.studentAnswerService.updateStudentAnswerPoints(
      answerId,
      points,
      user.id_user,
    );
  }
}

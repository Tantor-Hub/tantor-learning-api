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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentevaluationService } from './studentevaluation.service';
import { CreateStudentevaluationDto } from './dto/create-studentevaluation.dto';
import { UpdateStudentevaluationDto } from './dto/update-studentevaluation.dto';
import { UpdateEvaluationStatusDto } from './dto/update-evaluation-status.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsInstructor } from 'src/guard/guard.asinstructor';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { JwtAuthGuardAsStudentInSession } from 'src/guard/guard.asstudentinsession';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';

@ApiTags('Student Evaluations')
@Controller('studentevaluation')
export class StudentevaluationController {
  constructor(
    private readonly studentevaluationService: StudentevaluationService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuardAsInstructor)
  @ApiOperation({
    summary: 'Create a new student evaluation',
    description:
      'Create a new student evaluation. Only instructors can create evaluations. The createdBy field is automatically set from the JWT token.',
  })
  @ApiBody({
    type: CreateStudentevaluationDto,
    description: 'Student evaluation data',
    examples: {
      basic: {
        summary: 'Basic Student Evaluation with Session Course',
        description:
          'Create a basic student evaluation linked to a session course',
        value: {
          title: 'React Fundamentals Assessment',
          description:
            'This evaluation tests students on React fundamentals including components, state, and props.',
          type: 'quiz',
          points: 100,
          sessionCoursId: '550e8400-e29b-41d4-a716-446655440000',
          lessonId: [
            '550e8400-e29b-41d4-a716-446655440001',
            '550e8400-e29b-41d4-a716-446655440002',
          ],
          submittiondate: '2025-12-31T23:59:59.000Z',
          beginningTime: '09:00',
          endingTime: '11:00',
          ispublish: false,
          isImmediateResult: false,
        },
      },
      sessionCourse: {
        summary: 'Student Evaluation with Session Course',
        description: 'Create a student evaluation linked to a session course',
        value: {
          title: 'JavaScript Fundamentals Quiz',
          description:
            'A comprehensive quiz covering JavaScript basics and advanced concepts.',
          type: 'quiz',
          points: 50,
          sessionCoursId: '550e8400-e29b-41d4-a716-446655440000',
          lessonId: [
            '550e8400-e29b-41d4-a716-446655440003',
            '550e8400-e29b-41d4-a716-446655440004',
          ],
          submittiondate: '2025-12-31T23:59:59.000Z',
          beginningTime: '14:00',
          endingTime: '15:00',
          ispublish: true,
          isImmediateResult: true,
        },
      },
      sessionCourseOnly: {
        summary: 'Student Evaluation with Session Course Only (No Lessons)',
        description:
          'Create a student evaluation linked only to a session course without specific lessons',
        value: {
          title: 'General Programming Assessment',
          description:
            'A general assessment covering programming fundamentals.',
          type: 'test',
          points: 75,
          sessionCoursId: '550e8400-e29b-41d4-a716-446655440000',
          submittiondate: '2025-12-31T23:59:59.000Z',
          beginningTime: '10:00',
          endingTime: '12:00',
          ispublish: false,
          isImmediateResult: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Student evaluation created successfully',
    example: {
      status: 201,
      message: 'Student evaluation created successfully',
      data: {
        id: 'eval-uuid-1',
        title: 'React Fundamentals Assessment',
        description:
          'This evaluation tests students on React fundamentals including components, state, and props.',
        createdBy: ['lecturer-uuid-1'],
        isImmediateResult: false,
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
    createStudentevaluationDto: CreateStudentevaluationDto,
    @User() user: IJwtSignin,
  ) {
    const evaluationData = {
      ...createStudentevaluationDto,
      createdBy: user.id_user,
    };
    return this.studentevaluationService.create(evaluationData);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all student evaluations' })
  @ApiResponse({
    status: 200,
    description: 'Student evaluations retrieved successfully',
    example: {
      status: 200,
      message: 'Student evaluations retrieved successfully',
      data: [
        {
          id: 'eval-uuid-1',
          title: 'React Fundamentals Assessment',
          description:
            'This evaluation tests students on React fundamentals including components, state, and props.',
          createdBy: ['lecturer-uuid-1'],
          isImmediateResult: false,
          lecturer: {
            id: 'lecturer-uuid-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
          questions: [
            {
              id: 'question-uuid-1',
              type: 'multiple_choice',
              text: 'What is the correct way to create a React component?',
              points: 1,
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
    return this.studentevaluationService.findAll();
  }

  @Get('lecturer/my-evaluations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get evaluations created by current lecturer',
    description:
      'Retrieve all evaluations created by the currently authenticated lecturer',
  })
  @ApiResponse({
    status: 200,
    description: 'Student evaluations retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByLecturer(@User() user: IJwtSignin) {
    return this.studentevaluationService.findByLecturer(user.id_user);
  }

  @Get(':evaluationId/creator')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get creator for a specific evaluation',
    description: 'Retrieve the user who created a specific student evaluation',
  })
  @ApiParam({
    name: 'evaluationId',
    description:
      'Student evaluation UUID - The unique identifier of the student evaluation',
    example: 'eval-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Lecturers retrieved successfully',
    example: {
      status: 200,
      message: 'Lecturers retrieved successfully',
      data: [
        {
          id: 'lecturer-uuid-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        {
          id: 'lecturer-uuid-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Student evaluation not found' })
  getCreatorForEvaluation(@Param('evaluationId') evaluationId: string) {
    return this.studentevaluationService.getCreatorForEvaluation(evaluationId);
  }

  @Get('lesson/:lessonId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get student evaluations by lesson ID',
    description:
      'Retrieve all student evaluations associated with a specific lesson',
  })
  @ApiParam({
    name: 'lessonId',
    description: 'Lesson UUID - The unique identifier of the lesson',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Student evaluations for lesson retrieved successfully',
    example: {
      status: 200,
      message: 'Student evaluations for lesson retrieved successfully',
      data: {
        evaluations: [
          {
            id: 'eval-uuid-1',
            title: 'React Fundamentals Assessment',
            description:
              'This evaluation tests students on React fundamentals including components, state, and props.',
            type: 'quiz',
            points: 100,
            createdBy: ['lecturer-uuid-1'],
            submittiondate: '2025-12-31T23:59:59.000Z',
            ispublish: false,
            isImmediateResult: false,
            lessonId: '550e8400-e29b-41d4-a716-446655440000',
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
            sessionCours: null,
            lesson: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'Introduction to Programming',
              description: 'Basic programming concepts',
            },
            questions: [
              {
                id: 'question-uuid-1',
                type: 'multiple_choice',
                text: 'What is the correct way to create a React component?',
                points: 1,
              },
            ],
          },
        ],
        total: 1,
        lesson: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Introduction to Programming',
          description: 'Basic programming concepts',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    example: {
      status: 404,
      message: 'Lesson not found',
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    example: {
      status: 500,
      message: 'Error retrieving student evaluations for lesson',
    },
  })
  findByLessonId(@Param('lessonId') lessonId: string) {
    return this.studentevaluationService.findByLessonId(lessonId);
  }

  @Get('sessioncours/:sessionCoursId')
  @UseGuards(JwtAuthGuardAsStudentInSession)
  @ApiOperation({
    summary: 'Get student evaluations by session course ID',
    description:
      'Retrieve all student evaluations associated with a specific session course',
  })
  @ApiParam({
    name: 'sessionCoursId',
    description:
      'Session Course UUID - The unique identifier of the session course',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description:
      'Student evaluations for session course retrieved successfully',
    example: {
      status: 200,
      message: 'Student evaluations for session course retrieved successfully',
      data: {
        evaluations: [
          {
            id: 'eval-uuid-1',
            title: 'React Fundamentals Assessment',
            description:
              'This evaluation tests students on React fundamentals including components, state, and props.',
            type: 'quiz',
            points: 100,
            createdBy: 'user-uuid-1',
            submittiondate: '2025-12-31T23:59:59.000Z',
            ispublish: false,
            isImmediateResult: false,
            sessionCoursId: '550e8400-e29b-41d4-a716-446655440000',
            lessonId: [
              '550e8400-e29b-41d4-a716-446655440001',
              '550e8400-e29b-41d4-a716-446655440002',
            ],
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
            sessionCours: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'Introduction to Programming',
              description: 'Basic programming concepts',
            },
            lessons: [
              {
                id: '550e8400-e29b-41d4-a716-446655440001',
                title: 'Variables and Data Types',
                description: 'Understanding basic data types',
              },
              {
                id: '550e8400-e29b-41d4-a716-446655440002',
                title: 'Control Structures',
                description: 'If statements and loops',
              },
            ],
            questions: [
              {
                id: 'question-uuid-1',
                type: 'multiple_choice',
                text: 'What is the correct way to create a React component?',
                points: 1,
              },
            ],
          },
        ],
        total: 1,
        sessionCours: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Introduction to Programming',
          description: 'Basic programming concepts',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Session course not found',
    example: {
      status: 404,
      message: 'Session course not found',
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    example: {
      status: 500,
      message: 'Error retrieving student evaluations for session course',
    },
  })
  findBySessionCoursId(@Param('sessionCoursId') sessionCoursId: string) {
    return this.studentevaluationService.findBySessionCoursId(sessionCoursId);
  }

  @Get('instructor/sessioncours/:sessionCoursId')
  @UseGuards(JwtAuthGuardAsInstructor)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get student evaluations by session course ID (Instructor)',
    description:
      'Retrieve all student evaluations (both published and unpublished) associated with a specific session course. Only instructors assigned to the session course can access this endpoint.',
  })
  @ApiParam({
    name: 'sessionCoursId',
    description:
      'Session Course UUID - The unique identifier of the session course',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description:
      'Student evaluations for session course retrieved successfully',
    example: {
      status: 200,
      message: 'Student evaluations for session course retrieved successfully',
      data: {
        evaluations: [
          {
            id: 'eval-uuid-1',
            title: 'React Fundamentals Assessment',
            description:
              'This evaluation tests students on React fundamentals including components, state, and props.',
            type: 'quiz',
            points: 100,
            createdBy: 'user-uuid-1',
            submittiondate: '2025-12-31T23:59:59.000Z',
            ispublish: false,
            isImmediateResult: false,
            markingStatus: 'pending',
            sessionCoursId: '550e8400-e29b-41d4-a716-446655440000',
            lessonId: [
              '550e8400-e29b-41d4-a716-446655440001',
              '550e8400-e29b-41d4-a716-446655440002',
            ],
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
            sessionCours: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'Introduction to Programming',
              description: 'Basic programming concepts',
            },
            creator: {
              id: 'user-uuid-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
            },
            lessons: [
              {
                id: '550e8400-e29b-41d4-a716-446655440001',
                title: 'Variables and Data Types',
                description: 'Understanding basic data types',
                ispublish: true,
              },
            ],
            questions: [
              {
                id: 'question-uuid-1',
                type: 'multiple_choice',
                text: 'What is the correct way to create a React component?',
                points: 1,
              },
            ],
          },
        ],
        total: 1,
        published: 0,
        unpublished: 1,
        sessionCours: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Introduction to Programming',
          description: 'Basic programming concepts',
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
      'Forbidden - You are not assigned as an instructor for this session course',
    example: {
      status: 403,
      message: 'You are not assigned as an instructor for this session course',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session course not found',
    example: {
      status: 404,
      message: 'Session course not found',
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    example: {
      status: 500,
      message: 'Error retrieving student evaluations for session course',
    },
  })
  findBySessionCoursIdForInstructor(
    @Param('sessionCoursId') sessionCoursId: string,
    @User() user: IJwtSignin,
  ) {
    return this.studentevaluationService.findBySessionCoursIdForInstructor(
      sessionCoursId,
      user.id_user,
    );
  }

  @Get('instructor/evaluation/:evaluationId/students')
  @UseGuards(JwtAuthGuardAsInstructor)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get all students who answered questions in an evaluation (Instructor)',
    description:
      "Retrieve a list of all unique students who have answered any question in a specific evaluation. Each student appears only once in the response. Only instructors assigned to the evaluation's session course can access this endpoint. Includes the evaluation data.",
  })
  @ApiParam({
    name: 'evaluationId',
    description:
      'Evaluation UUID - The unique identifier of the student evaluation',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Students who answered questions retrieved successfully',
    example: {
      status: 200,
      message:
        'Students who answered questions in evaluation retrieved successfully',
      data: {
        evaluation: {
          id: 'eval-uuid-1',
          title: 'React Fundamentals Assessment',
          description: 'This evaluation tests students on React fundamentals',
          type: 'quiz',
          points: 100,
          ispublish: true,
          markingStatus: 'completed',
          sessionCoursId: 'sessioncours-uuid',
          sessionCours: {
            id: 'sessioncours-uuid',
            title: 'React Course',
            description: 'Introduction to React',
          },
          creator: {
            id: 'instructor-uuid',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
          lessons: [
            {
              id: 'lesson-uuid-1',
              title: 'React Basics',
              description: 'Introduction to React',
              ispublish: true,
            },
          ],
        },
        students: [
          {
            id: 'student-uuid-1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            avatar: 'https://example.com/avatar.jpg',
            totalAnswers: 10,
            markedAnswers: 8,
            markedPercentage: 80.0,
          },
          {
            id: 'student-uuid-2',
            firstName: 'Bob',
            lastName: 'Johnson',
            email: 'bob.johnson@example.com',
            avatar: null,
            totalAnswers: 10,
            markedAnswers: 5,
            markedPercentage: 50.0,
          },
        ],
        totalStudents: 2,
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
        "You are not assigned as an instructor for this evaluation's session course",
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Evaluation not found',
    example: {
      status: 404,
      message: 'Evaluation not found',
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    example: {
      status: 500,
      message: 'Error retrieving students who answered evaluation',
    },
  })
  getStudentsWhoAnsweredEvaluation(
    @Param('evaluationId') evaluationId: string,
    @User() user: IJwtSignin,
  ) {
    return this.studentevaluationService.getStudentsWhoAnsweredEvaluation(
      evaluationId,
      user.id_user,
    );
  }

  @Get('instructor/evaluation/:evaluationId/student/:studentId/answers')
  @UseGuards(JwtAuthGuardAsInstructor)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get all student answers for an evaluation by student (Instructor)',
    description:
      "Retrieve all student answers for a specific evaluation and student with question data included. This makes it easy to mark answers. Only instructors assigned to the evaluation's session course can access this endpoint. Includes the evaluation data and question information for each answer.",
  })
  @ApiParam({
    name: 'evaluationId',
    description:
      'Evaluation UUID - The unique identifier of the student evaluation',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student UUID - The unique identifier of the student',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'All student answers for evaluation retrieved successfully',
    example: {
      status: 200,
      message: 'All student answers for evaluation retrieved successfully',
      data: {
        evaluation: {
          id: 'eval-uuid-1',
          title: 'React Fundamentals Assessment',
          description: 'This evaluation tests students on React fundamentals',
          type: 'quiz',
          points: 100,
          ispublish: true,
          markingStatus: 'completed',
          sessionCours: {
            id: 'sessioncours-uuid',
            title: 'React Course',
            description: 'Introduction to React',
          },
          questions: [
            {
              id: 'question-uuid-1',
              type: 'multiple_choice',
              text: 'What is React?',
              points: 10,
            },
          ],
        },
        answers: [
          {
            id: 'answer-uuid-1',
            questionId: 'question-uuid-1',
            studentId: 'student-uuid-1',
            evaluationId: 'eval-uuid-1',
            answerText: null,
            isCorrect: true,
            points: 10,
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
            student: {
              id: 'student-uuid-1',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane.smith@example.com',
              avatar: 'https://example.com/avatar.jpg',
            },
            question: {
              id: 'question-uuid-1',
              type: 'multiple_choice',
              text: 'What is React?',
              points: 10,
              options: [
                {
                  id: 'option-uuid-1',
                  text: 'A JavaScript library',
                  isCorrect: true,
                },
                {
                  id: 'option-uuid-2',
                  text: 'A programming language',
                  isCorrect: false,
                },
              ],
            },
          },
        ],
        totalAnswers: 1,
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
        "You are not assigned as an instructor for this evaluation's session course",
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Evaluation not found',
    example: {
      status: 404,
      message: 'Evaluation not found',
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    example: {
      status: 500,
      message: 'Error retrieving all student answers for evaluation',
    },
  })
  getAllStudentAnswersForEvaluation(
    @Param('evaluationId') evaluationId: string,
    @Param('studentId') studentId: string,
    @User() user: IJwtSignin,
  ) {
    return this.studentevaluationService.getAllStudentAnswersForEvaluation(
      evaluationId,
      user.id_user,
      studentId,
    );
  }

  @Get('student/sessioncours/:sessionCoursId')
  @UseGuards(JwtAuthGuardAsStudentInSession)
  @ApiOperation({
    summary: 'Get student evaluations by session course ID (Student access)',
    description:
      'Retrieves all evaluations for a specific session course. Students can access evaluations related to courses they are enrolled in.',
  })
  @ApiParam({
    name: 'sessionCoursId',
    description:
      'Session Course UUID - The unique identifier of the session course',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Student evaluations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Student evaluations retrieved successfully',
        },
        data: {
          type: 'object',
          properties: {
            evaluations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    example: 'eval-uuid-1',
                  },
                  title: {
                    type: 'string',
                    example: 'React Fundamentals Assessment',
                  },
                  description: {
                    type: 'string',
                    example:
                      'This evaluation tests students on React fundamentals including components, state, and props.',
                  },
                  type: {
                    type: 'string',
                    example: 'quiz',
                  },
                  points: {
                    type: 'number',
                    example: 100,
                  },
                  submittiondate: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-12-31T23:59:59.000Z',
                  },
                  beginningTime: {
                    type: 'string',
                    example: '09:00',
                  },
                  endingTime: {
                    type: 'string',
                    example: '11:00',
                  },
                  ispublish: {
                    type: 'boolean',
                    example: true,
                  },
                  isImmediateResult: {
                    type: 'boolean',
                    example: false,
                  },
                  lessons: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          format: 'uuid',
                          example: '550e8400-e29b-41d4-a716-446655440001',
                        },
                        title: {
                          type: 'string',
                          example: 'Variables and Data Types',
                        },
                        description: {
                          type: 'string',
                          example: 'Understanding basic data types',
                        },
                      },
                    },
                  },
                },
              },
            },
            total: { type: 'number', example: 2 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session course not found',
    schema: {
      example: {
        status: 404,
        data: 'Session course not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Student access required',
    schema: {
      example: {
        status: 401,
        data: 'Seuls les étudiants peuvent accéder à cette ressource',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while fetching student evaluations',
          error: 'Error message',
        },
      },
    },
  })
  async findBySessionCoursIdForStudent(
    @Param('sessionCoursId') sessionCoursId: string,
    @User() user: IJwtSignin,
  ) {
    console.log(
      'Fetching student evaluations by session course ID for student:',
      sessionCoursId,
      'Student ID:',
      user.id_user,
    );
    return this.studentevaluationService.findBySessionCoursIdForStudent(
      sessionCoursId,
      user.id_user,
    );
  }

  @Get('student/session/:sessionId/statistics')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get student statistics for a specific session',
    description:
      'Retrieve student statistics including average points, percentage, and future homework count for a specific session the student is enrolled in.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'UUID of the training session',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Student statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Student statistics retrieved successfully',
        },
        data: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
              description: 'The session ID for which statistics are calculated',
            },
            averagePoints: {
              type: 'number',
              example: 85.5,
              description:
                'Average points earned per evaluation for this session',
            },
            percentage: {
              type: 'number',
              example: 85.5,
              description:
                'Percentage of points earned out of total possible points',
            },
            totalPointsEarned: {
              type: 'number',
              example: 855,
              description: 'Total points earned across all evaluations',
            },
            totalPossiblePoints: {
              type: 'number',
              example: 1000,
              description: 'Total possible points across all evaluations',
            },
            futureHomeworkCount: {
              type: 'number',
              example: 5,
              description:
                'Number of homework evaluations with submission date in the future',
            },
            sessionCoursCount: {
              type: 'number',
              example: 3,
              description: 'Number of sessioncours in this session',
            },
            evaluationCount: {
              type: 'number',
              example: 10,
              description: 'Total number of evaluations',
            },
          },
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
      'Forbidden - Student access required or student not enrolled in session',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found or student not enrolled',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  getStudentStatisticsBySession(
    @Param('sessionId') sessionId: string,
    @User() user: IJwtSignin,
  ) {
    return this.studentevaluationService.getStudentStatisticsBySession(
      user.id_user,
      sessionId,
    );
  }

  @Get('student/:evaluationId/questions')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({
    summary:
      'Get evaluation questions by student evaluation ID (Student access)',
    description:
      'Retrieves all questions and options for a specific student evaluation. Students can access questions for evaluations they are enrolled in.',
  })
  @ApiParam({
    name: 'evaluationId',
    description:
      'Student evaluation UUID - The unique identifier of the student evaluation',
    example: 'eval-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation questions retrieved successfully',
    example: {
      status: 200,
      message: 'Evaluation questions retrieved successfully',
      data: {
        id: 'eval-uuid-1',
        title: 'React Fundamentals Assessment',
        description: 'This evaluation tests students on React fundamentals',
        type: 'quiz',
        points: 100,
        submittiondate: '2025-12-31T23:59:59.000Z',
        beginningTime: '09:00',
        endingTime: '11:00',
        ispublish: true,
        isImmediateResult: false,
        questions: [
          {
            id: 'question-uuid-1',
            type: 'multiple_choice',
            text: 'What is the correct way to create a React component?',
            points: 1,
            isImmediateResult: false,
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
              {
                id: 'option-uuid-3',
                text: 'Using jQuery',
                isCorrect: false,
              },
            ],
          },
          {
            id: 'question-uuid-2',
            type: 'text',
            text: 'Explain the concept of state in React.',
            points: 5,
            isImmediateResult: false,
            options: [],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Student evaluation not found',
    example: {
      status: 404,
      message: 'Student evaluation not found',
      data: null,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Student access required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student not enrolled in this evaluation',
  })
  async getEvaluationQuestionsForStudent(
    @Param('evaluationId') evaluationId: string,
    @User() user: IJwtSignin,
  ) {
    return this.studentevaluationService.getEvaluationQuestionsForStudent(
      evaluationId,
      user.id_user,
    );
  }

  @Get(':evaluationId/students')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get students who participated in an evaluation',
    description:
      'Retrieve all students who have participated in a specific student evaluation',
  })
  @ApiParam({
    name: 'evaluationId',
    description:
      'Student evaluation UUID - The unique identifier of the student evaluation',
    example: 'eval-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description:
      'Students who participated in evaluation retrieved successfully',
    example: {
      status: 200,
      message: 'Students who participated in evaluation retrieved successfully',
      data: [
        {
          id: 'student-uuid-1',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
        },
        {
          id: 'student-uuid-2',
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob.johnson@example.com',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Student evaluation not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  getStudentsForEvaluation(@Param('evaluationId') evaluationId: string) {
    return this.studentevaluationService.getStudentsForEvaluation(evaluationId);
  }

  @Post(':evaluationId/students')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Join evaluation as student',
    description:
      'Add the authenticated student to the list of participants for a specific evaluation',
  })
  @ApiParam({
    name: 'evaluationId',
    description:
      'Student evaluation UUID - The unique identifier of the student evaluation',
    example: 'eval-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student joined evaluation successfully',
    example: {
      status: 200,
      message: 'Student joined evaluation successfully',
      data: {
        evaluationId: 'eval-uuid-1',
        studentId: 'student-uuid-1',
        totalStudents: 3,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Student is already participating in this evaluation',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Student evaluation not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  joinEvaluation(
    @Param('evaluationId') evaluationId: string,
    @User() user: IJwtSignin,
  ) {
    return this.studentevaluationService.addStudentToEvaluation(
      evaluationId,
      user.id_user,
    );
  }

  @Delete(':evaluationId/students')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Leave evaluation as student',
    description:
      'Remove the authenticated student from the list of participants for a specific evaluation',
  })
  @ApiParam({
    name: 'evaluationId',
    description:
      'Student evaluation UUID - The unique identifier of the student evaluation',
    example: 'eval-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student left evaluation successfully',
    example: {
      status: 200,
      message: 'Student left evaluation successfully',
      data: {
        evaluationId: 'eval-uuid-1',
        studentId: 'student-uuid-1',
        totalStudents: 2,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Student is not participating in this evaluation',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Student evaluation not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  leaveEvaluation(
    @Param('evaluationId') evaluationId: string,
    @User() user: IJwtSignin,
  ) {
    return this.studentevaluationService.removeStudentFromEvaluation(
      evaluationId,
      user.id_user,
    );
  }

  @Get(':evaluationId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get student evaluation by ID' })
  @ApiParam({
    name: 'evaluationId',
    description:
      'Student evaluation UUID - The unique identifier of the student evaluation',
    example: 'eval-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student evaluation retrieved successfully',
    example: {
      status: 200,
      message: 'Student evaluation retrieved successfully',
      data: {
        id: 'eval-uuid-1',
        title: 'React Fundamentals Assessment',
        description:
          'This evaluation tests students on React fundamentals including components, state, and props.',
        createdBy: ['lecturer-uuid-1'],
        isImmediateResult: false,
        lecturer: {
          id: 'lecturer-uuid-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        questions: [
          {
            id: 'question-uuid-1',
            type: 'multiple_choice',
            text: 'What is the correct way to create a React component?',
            points: 1,
            isImmediateResult: false,
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
          },
        ],
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Student evaluation not found' })
  findOne(@Param('evaluationId') evaluationId: string) {
    return this.studentevaluationService.findOne(evaluationId);
  }

  @Patch(':evaluationId')
  @UseGuards(JwtAuthGuardAsInstructor)
  @ApiOperation({
    summary: 'Update student evaluation by ID',
    description:
      'Update an existing student evaluation. Only instructors can update evaluations.',
  })
  @ApiParam({
    name: 'evaluationId',
    description:
      'Student evaluation UUID - The unique identifier of the student evaluation',
    example: 'eval-uuid-1',
  })
  @ApiBody({
    type: UpdateStudentevaluationDto,
    description: 'Student evaluation update data',
    examples: {
      complete: {
        summary: 'Complete Update',
        description: 'Update all evaluation fields',
        value: {
          title: 'React Fundamentals Assessment',
          description:
            'This evaluation tests students on React fundamentals including components, state, and props.',
          type: 'quiz',
          points: 100,
          sessionCoursId: '550e8400-e29b-41d4-a716-446655440000',
          lessonId: [
            '550e8400-e29b-41d4-a716-446655440001',
            '550e8400-e29b-41d4-a716-446655440002',
          ],
          submittiondate: '2025-12-31T23:59:59.000Z',
          beginningTime: '09:00',
          endingTime: '11:00',
          ispublish: false,
          isImmediateResult: false,
        },
      },
      partial: {
        summary: 'Partial Update',
        description: 'Update only specific fields',
        value: {
          title: 'Updated React Fundamentals Assessment',
          description: 'Updated description for the React assessment.',
          points: 150,
          ispublish: true,
          isImmediateResult: true,
        },
      },
      minimal: {
        summary: 'Minimal Update',
        description: 'Update only the points for an evaluation',
        value: {
          points: 200,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Student evaluation updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student evaluation not found' })
  update(
    @Param('evaluationId') evaluationId: string,
    @Body() updateStudentevaluationDto: UpdateStudentevaluationDto,
  ) {
    return this.studentevaluationService.update(
      evaluationId,
      updateStudentevaluationDto,
    );
  }

  @Patch(':evaluationId/marking-status')
  @UseGuards(JwtAuthGuardAsInstructor)
  @ApiOperation({
    summary: 'Update marking status for student evaluation',
    description:
      'Update the marking status of a student evaluation. Only instructors can update marking status. Status progression: pending -> in_progress -> completed -> published',
  })
  @ApiParam({
    name: 'evaluationId',
    description:
      'Student evaluation UUID - The unique identifier of the student evaluation',
    example: 'eval-uuid-1',
  })
  @ApiBody({
    description: 'Marking status update data',
    schema: {
      type: 'object',
      properties: {
        markingStatus: {
          type: 'string',
          enum: ['pending', 'in_progress', 'completed', 'published'],
          description: 'New marking status for the evaluation',
          example: 'completed',
        },
      },
      required: ['markingStatus'],
    },
    examples: {
      markInProgress: {
        summary: 'Mark as In Progress',
        description: 'Set evaluation marking status to in_progress',
        value: {
          markingStatus: 'in_progress',
        },
      },
      markCompleted: {
        summary: 'Mark as Completed',
        description: 'Set evaluation marking status to completed',
        value: {
          markingStatus: 'completed',
        },
      },
      publishResults: {
        summary: 'Publish Results',
        description: 'Set evaluation marking status to published',
        value: {
          markingStatus: 'published',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Marking status updated successfully',
    example: {
      status: 200,
      message: 'Marking status updated successfully',
      data: {
        evaluation: {
          id: 'eval-uuid-1',
          title: 'React Fundamentals Assessment',
          markingStatus: 'completed',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
        message: 'Marking status updated successfully',
        details: {
          id: 'eval-uuid-1',
          title: 'React Fundamentals Assessment',
          markingStatus: 'completed',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid marking status',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Instructor access required',
  })
  @ApiResponse({ status: 404, description: 'Student evaluation not found' })
  updateMarkingStatus(
    @Param('evaluationId') evaluationId: string,
    @Body() body: { markingStatus: string },
  ) {
    return this.studentevaluationService.updateMarkingStatus(
      evaluationId,
      body.markingStatus,
    );
  }

  @Patch(':evaluationId/status')
  @UseGuards(JwtAuthGuardAsInstructor)
  @ApiOperation({
    summary: 'Update student evaluation status',
    description:
      'Update various status fields of a student evaluation. Only instructors can update evaluation status. Can update: ispublish, isImmediateResult, and markingStatus.',
  })
  @ApiParam({
    name: 'evaluationId',
    description:
      'Student evaluation UUID - The unique identifier of the student evaluation',
    example: 'eval-uuid-1',
  })
  @ApiBody({
    type: UpdateEvaluationStatusDto,
    description: 'Evaluation status update data',
    examples: {
      publishEvaluation: {
        summary: 'Publish Evaluation',
        description: 'Publish the evaluation to make it visible to students',
        value: {
          ispublish: true,
        },
      },
      enableImmediateResults: {
        summary: 'Enable Immediate Results',
        description:
          'Allow students to see results immediately after submission',
        value: {
          isImmediateResult: true,
        },
      },
      completeMarking: {
        summary: 'Complete Marking Process',
        description:
          'Mark the evaluation as completed and ready for publishing',
        value: {
          markingStatus: 'completed',
        },
      },
      fullStatusUpdate: {
        summary: 'Full Status Update',
        description: 'Update multiple status fields at once',
        value: {
          ispublish: true,
          isImmediateResult: false,
          markingStatus: 'published',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation status updated successfully',
    example: {
      status: 200,
      message: 'Evaluation status updated successfully',
      data: {
        evaluation: {
          id: 'eval-uuid-1',
          title: 'React Fundamentals Assessment',
          ispublish: true,
          isImmediateResult: false,
          markingStatus: 'completed',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
        message: 'Evaluation status updated successfully',
        details: {
          id: 'eval-uuid-1',
          title: 'React Fundamentals Assessment',
          ispublish: true,
          isImmediateResult: false,
          markingStatus: 'completed',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - No status fields provided or invalid values',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Instructor access required',
  })
  @ApiResponse({ status: 404, description: 'Student evaluation not found' })
  updateEvaluationStatus(
    @Param('evaluationId') evaluationId: string,
    @Body() updateStatusDto: UpdateEvaluationStatusDto,
  ) {
    return this.studentevaluationService.updateEvaluationStatus(
      evaluationId,
      updateStatusDto,
    );
  }

  @Delete(':evaluationId')
  @UseGuards(JwtAuthGuardAsInstructor)
  @ApiOperation({
    summary: 'Delete student evaluation by ID',
    description:
      'Delete a specific student evaluation and all associated questions and options (cascade deletion). Only instructors can delete evaluations.',
  })
  @ApiParam({
    name: 'evaluationId',
    description:
      'Student evaluation UUID - The unique identifier of the student evaluation',
    example: 'eval-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description:
      'Student evaluation and all associated data deleted successfully',
    example: {
      status: 200,
      message:
        'Student evaluation and all associated data deleted successfully. Deleted 3 questions and 12 options.',
      data: {
        deletedEvaluation: {
          id: 'eval-uuid-1',
          title: 'React Fundamentals Assessment',
        },
        deletedQuestions: 3,
        deletedOptions: 12,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student evaluation not found' })
  remove(@Param('evaluationId') evaluationId: string) {
    return this.studentevaluationService.remove(evaluationId);
  }

  @Get('secretary/statistics')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get student evaluation statistics (Secretary only)',
    description:
      'Get average points and percentage for student evaluations. Filter by training, trainingsession, sessioncours, or lesson. Can get statistics for all students or a specific student.',
  })
  @ApiResponse({
    status: 200,
    description: 'Student evaluation statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Student evaluation statistics retrieved successfully',
        },
        data: {
          type: 'object',
          properties: {
            students: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  studentId: { type: 'string', format: 'uuid' },
                  studentName: { type: 'string', example: 'John Doe' },
                  studentEmail: {
                    type: 'string',
                    example: 'john.doe@example.com',
                  },
                  studentAvatar: { type: 'string', nullable: true },
                  averagePoints: { type: 'number', example: 85.5 },
                  percentage: { type: 'number', example: 85.5 },
                  totalPointsEarned: { type: 'number', example: 855 },
                  totalPossiblePoints: { type: 'number', example: 1000 },
                  evaluationCount: { type: 'number', example: 10 },
                },
              },
            },
            filters: {
              type: 'object',
              properties: {
                trainingId: { type: 'string', format: 'uuid', nullable: true },
                trainingsessionId: {
                  type: 'string',
                  format: 'uuid',
                  nullable: true,
                },
                sessioncoursId: {
                  type: 'string',
                  format: 'uuid',
                  nullable: true,
                },
                lessonId: { type: 'string', format: 'uuid', nullable: true },
                studentId: { type: 'string', format: 'uuid', nullable: true },
              },
            },
            totalEvaluations: { type: 'number', example: 10 },
            totalPossiblePoints: { type: 'number', example: 1000 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only secretaries can access this endpoint',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  getSecretaryStatistics(
    @Query('trainingId') trainingId?: string,
    @Query('trainingsessionId') trainingsessionId?: string,
    @Query('sessioncoursId') sessioncoursId?: string,
    @Query('lessonId') lessonId?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.studentevaluationService.getSecretaryStudentStatistics({
      trainingId,
      trainingsessionId,
      sessioncoursId,
      lessonId,
      studentId,
    });
  }
}

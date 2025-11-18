import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { StudentevaluationType } from 'src/interface/interface.studentevaluation';

// Student Evaluation Swagger Documentation
export const StudentevaluationSwagger = {
  controller: {
    tag: 'Student Evaluations',
    description:
      'APIs for managing student evaluations, including creation, updates, and retrieval',
  },

  methods: {
    create: {
      operation: {
        summary: 'Create a new student evaluation',
        description:
          'Create a new student evaluation. Only instructors can create evaluations. The createdBy field is automatically set from the JWT token.',
      },
      body: {
        type: 'object',
        required: [
          'title',
          'type',
          'points',
          'submittiondate',
          'ispublish',
          'sessionCoursId',
        ],
        properties: {
          title: {
            type: 'string',
            description: 'Title of the student evaluation',
            example: 'React Fundamentals Assessment',
          },
          description: {
            type: 'string',
            description: 'Description of the student evaluation',
            example:
              'This evaluation tests students on React fundamentals including components, state, and props.',
          },
          type: {
            type: 'string',
            enum: Object.values(StudentevaluationType),
            description: 'Type of the evaluation',
            example: StudentevaluationType.QUIZ,
          },
          points: {
            type: 'integer',
            minimum: 1,
            description: 'Total points for this evaluation',
            example: 100,
          },
          lessonId: {
            type: 'array',
            items: { type: 'string', format: 'uuid' },
            description:
              'Array of lesson IDs this evaluation is linked to (optional)',
            example: [
              '550e8400-e29b-41d4-a716-446655440001',
              '550e8400-e29b-41d4-a716-446655440002',
            ],
          },
          submittiondate: {
            type: 'string',
            format: 'date-time',
            description: 'Submission deadline for this evaluation',
            example: '2025-12-31T23:59:59.000Z',
          },
          beginningTime: {
            type: 'string',
            pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
            description:
              'Beginning time for this evaluation in HH:MM format (optional)',
            example: '09:00',
          },
          endingTime: {
            type: 'string',
            pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
            description:
              'Ending time for this evaluation in HH:MM format (optional)',
            example: '11:00',
          },
          ispublish: {
            type: 'boolean',
            description:
              'Whether this evaluation is published and visible to students',
            example: false,
          },
          isImmediateResult: {
            type: 'boolean',
            description:
              'Whether results should be shown immediately after submission',
            example: false,
          },
          sessionCoursId: {
            type: 'string',
            format: 'uuid',
            description:
              'ID of the session course this evaluation is linked to (required)',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
        },
      },
      responses: {
        201: {
          description: 'Student evaluation created successfully',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 201 },
              message: {
                type: 'string',
                example: 'Student evaluation created successfully',
              },
              data: {
                type: 'object',
                properties: {
                  evaluation: {
                    type: 'object',
                    description: 'Full created evaluation object',
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
                          'This evaluation tests students on React fundamentals.',
                      },
                      type: { type: 'string', example: 'quiz' },
                      points: { type: 'integer', example: 100 },
                      createdBy: {
                        type: 'string',
                        format: 'uuid',
                        example: 'lecturer-uuid-1',
                      },
                      submittiondate: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-12-31T23:59:59.000Z',
                      },
                      beginningTime: { type: 'string', example: '09:00' },
                      endingTime: { type: 'string', example: '11:00' },
                      ispublish: { type: 'boolean', example: false },
                      isImmediateResult: { type: 'boolean', example: false },
                      sessionCoursId: {
                        type: 'string',
                        format: 'uuid',
                        example: 'session-uuid-1',
                      },
                      lessonId: {
                        type: 'array',
                        items: { type: 'string', format: 'uuid' },
                        example: ['lesson-uuid-1', 'lesson-uuid-2'],
                      },
                      createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-01-15T10:30:00.000Z',
                      },
                      updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-01-15T10:30:00.000Z',
                      },
                    },
                  },
                  message: {
                    type: 'string',
                    example: 'Student evaluation created successfully',
                  },
                  details: {
                    type: 'object',
                    description: 'Key details for easy access',
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
                      type: { type: 'string', example: 'quiz' },
                      points: { type: 'integer', example: 100 },
                      sessionCoursId: {
                        type: 'string',
                        format: 'uuid',
                        example: 'session-uuid-1',
                      },
                      lessonId: {
                        type: 'array',
                        items: { type: 'string', format: 'uuid' },
                        example: ['lesson-uuid-1', 'lesson-uuid-2'],
                      },
                      createdBy: {
                        type: 'string',
                        format: 'uuid',
                        example: 'lecturer-uuid-1',
                      },
                      ispublish: { type: 'boolean', example: false },
                      createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-01-15T10:30:00.000Z',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Bad Request - Invalid input data',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 400 },
              message: {
                type: 'string',
                example: 'Bad Request - Invalid input data',
              },
              data: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'SequelizeValidationError',
                  },
                  message: {
                    type: 'string',
                    example: 'Validation error details',
                  },
                  details: { type: 'object', example: null },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - Only instructors can create evaluations',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 401 },
              message: {
                type: 'string',
                example:
                  'Unauthorized - Only instructors can create evaluations',
              },
            },
          },
        },
        403: {
          description: 'Forbidden - Insufficient permissions',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 403 },
              message: {
                type: 'string',
                example: 'Forbidden - Insufficient permissions',
              },
            },
          },
        },
        500: {
          description: 'Internal Server Error',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 500 },
              message: {
                type: 'string',
                example: 'Error creating student evaluation',
              },
              data: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'SequelizeDatabaseError' },
                  message: {
                    type: 'string',
                    example: 'Database error details',
                  },
                  details: { type: 'object', example: null },
                },
              },
            },
          },
        },
      },
    },

    findAll: {
      operation: {
        summary: 'Get all student evaluations',
        description:
          'Retrieve all student evaluations with their associated data',
      },
      responses: {
        200: {
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
                    type: { type: 'string', example: 'quiz' },
                    points: { type: 'integer', example: 100 },
                    createdBy: {
                      type: 'array',
                      items: { type: 'string', format: 'uuid' },
                      example: ['lecturer-uuid-1'],
                    },
                    submittiondate: {
                      type: 'string',
                      format: 'date-time',
                      example: '2025-12-31T23:59:59.000Z',
                    },
                    ispublish: { type: 'boolean', example: false },
                    isImmediateResult: { type: 'boolean', example: false },
                    sessionCours: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                      },
                    },
                    lessons: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          title: { type: 'string' },
                          description: { type: 'string' },
                        },
                      },
                    },
                    questions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          type: { type: 'string' },
                          text: { type: 'string' },
                          points: { type: 'integer' },
                        },
                      },
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },

    findByLecturer: {
      operation: {
        summary: 'Get evaluations created by current user',
        description:
          'Retrieve all evaluations created by the currently authenticated user',
      },
      responses: {
        200: {
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
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    type: { type: 'string' },
                    points: { type: 'integer' },
                    createdBy: {
                      type: 'string',
                      format: 'uuid',
                    },
                    submittiondate: { type: 'string', format: 'date-time' },
                    ispublish: { type: 'boolean' },
                    isImmediateResult: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },

    getLecturersForEvaluation: {
      operation: {
        summary: 'Get creator for a specific evaluation',
        description:
          'Retrieve the user who created a specific student evaluation',
      },
      param: {
        name: 'evaluationId',
        description:
          'Student evaluation UUID - The unique identifier of the student evaluation',
        example: 'eval-uuid-1',
      },
      responses: {
        200: {
          description: 'Creator retrieved successfully',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 200 },
              message: {
                type: 'string',
                example: 'Creator retrieved successfully',
              },
              data: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    example: 'user-uuid-1',
                  },
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'Student evaluation not found' },
      },
    },

    findByLessonId: {
      operation: {
        summary: 'Get student evaluations by lesson ID',
        description:
          'Retrieve all student evaluations associated with a specific lesson',
      },
      param: {
        name: 'lessonId',
        description: 'Lesson UUID - The unique identifier of the lesson',
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
      responses: {
        200: {
          description: 'Student evaluations for lesson retrieved successfully',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 200 },
              message: {
                type: 'string',
                example:
                  'Student evaluations for lesson retrieved successfully',
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
                        type: { type: 'string', example: 'quiz' },
                        points: { type: 'integer', example: 100 },
                        createdBy: {
                          type: 'string',
                          format: 'uuid',
                          example: 'lecturer-uuid-1',
                        },
                        submittiondate: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-12-31T23:59:59.000Z',
                        },
                        ispublish: { type: 'boolean', example: false },
                        isImmediateResult: { type: 'boolean', example: false },
                        lessonId: {
                          type: 'array',
                          items: { type: 'string', format: 'uuid' },
                          example: [
                            '550e8400-e29b-41d4-a716-446655440000',
                            '550e8400-e29b-41d4-a716-446655440001',
                          ],
                        },
                        createdAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-01-15T10:30:00.000Z',
                        },
                        updatedAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-01-15T10:30:00.000Z',
                        },
                        sessionCours: { type: 'null' },
                        lessons: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'string',
                                format: 'uuid',
                                example: '550e8400-e29b-41d4-a716-446655440000',
                              },
                              title: {
                                type: 'string',
                                example: 'Introduction to Programming',
                              },
                              description: {
                                type: 'string',
                                example: 'Basic programming concepts',
                              },
                            },
                          },
                        },
                        questions: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'string',
                                format: 'uuid',
                                example: 'question-uuid-1',
                              },
                              type: {
                                type: 'string',
                                example: 'multiple_choice',
                              },
                              text: {
                                type: 'string',
                                example:
                                  'What is the correct way to create a React component?',
                              },
                              points: { type: 'integer', example: 1 },
                            },
                          },
                        },
                      },
                    },
                  },
                  total: { type: 'number', example: 1 },
                  lessons: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          format: 'uuid',
                          example: '550e8400-e29b-41d4-a716-446655440000',
                        },
                        title: {
                          type: 'string',
                          example: 'Introduction to Programming',
                        },
                        description: {
                          type: 'string',
                          example: 'Basic programming concepts',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'Lesson not found' },
        500: { description: 'Internal server error' },
      },
    },

    findBySessionCoursId: {
      operation: {
        summary: 'Get student evaluations by session course ID',
        description:
          'Retrieve all student evaluations associated with a specific session course',
      },
      param: {
        name: 'sessionCoursId',
        description:
          'Session Course UUID - The unique identifier of the session course',
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
      responses: {
        200: {
          description:
            'Student evaluations for session course retrieved successfully',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 200 },
              message: {
                type: 'string',
                example:
                  'Student evaluations for session course retrieved successfully',
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
                        type: { type: 'string', example: 'quiz' },
                        points: { type: 'integer', example: 100 },
                        createdBy: {
                          type: 'string',
                          format: 'uuid',
                          example: 'user-uuid-1',
                        },
                        submittiondate: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-12-31T23:59:59.000Z',
                        },
                        ispublish: { type: 'boolean', example: false },
                        isImmediateResult: { type: 'boolean', example: false },
                        sessionCoursId: {
                          type: 'string',
                          format: 'uuid',
                          example: '550e8400-e29b-41d4-a716-446655440000',
                        },
                        lessonId: {
                          type: 'array',
                          items: { type: 'string', format: 'uuid' },
                          example: [
                            '550e8400-e29b-41d4-a716-446655440001',
                            '550e8400-e29b-41d4-a716-446655440002',
                          ],
                        },
                        createdAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-01-15T10:30:00.000Z',
                        },
                        updatedAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-01-15T10:30:00.000Z',
                        },
                        sessionCours: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              format: 'uuid',
                              example: '550e8400-e29b-41d4-a716-446655440000',
                            },
                            title: {
                              type: 'string',
                              example: 'Introduction to Programming',
                            },
                            description: {
                              type: 'string',
                              example: 'Basic programming concepts',
                            },
                          },
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
                        questions: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'string',
                                format: 'uuid',
                                example: 'question-uuid-1',
                              },
                              type: {
                                type: 'string',
                                example: 'multiple_choice',
                              },
                              text: {
                                type: 'string',
                                example:
                                  'What is the correct way to create a React component?',
                              },
                              points: { type: 'integer', example: 1 },
                            },
                          },
                        },
                      },
                    },
                  },
                  total: { type: 'number', example: 1 },
                  sessionCours: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        format: 'uuid',
                        example: '550e8400-e29b-41d4-a716-446655440000',
                      },
                      title: {
                        type: 'string',
                        example: 'Introduction to Programming',
                      },
                      description: {
                        type: 'string',
                        example: 'Basic programming concepts',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'Session course not found' },
        500: { description: 'Internal server error' },
      },
    },

    getStudentsForEvaluation: {
      operation: {
        summary: 'Get students who participated in an evaluation',
        description:
          'Retrieve all students who have participated in a specific student evaluation',
      },
      param: {
        name: 'evaluationId',
        description:
          'Student evaluation UUID - The unique identifier of the student evaluation',
        example: 'eval-uuid-1',
      },
      responses: {
        200: {
          description:
            'Students who participated in evaluation retrieved successfully',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 200 },
              message: {
                type: 'string',
                example:
                  'Students who participated in evaluation retrieved successfully',
              },
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                      example: 'student-uuid-1',
                    },
                    firstName: { type: 'string', example: 'Jane' },
                    lastName: { type: 'string', example: 'Smith' },
                    email: {
                      type: 'string',
                      example: 'jane.smith@example.com',
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'Student evaluation not found' },
        500: { description: 'Internal server error' },
      },
    },

    joinEvaluation: {
      operation: {
        summary: 'Join evaluation as student',
        description:
          'Add the authenticated student to the list of participants for a specific evaluation',
      },
      param: {
        name: 'evaluationId',
        description:
          'Student evaluation UUID - The unique identifier of the student evaluation',
        example: 'eval-uuid-1',
      },
      responses: {
        200: {
          description: 'Student joined evaluation successfully',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 200 },
              message: {
                type: 'string',
                example: 'Student joined evaluation successfully',
              },
              data: {
                type: 'object',
                properties: {
                  evaluationId: { type: 'string', example: 'eval-uuid-1' },
                  studentId: { type: 'string', example: 'student-uuid-1' },
                  totalStudents: { type: 'number', example: 3 },
                },
              },
            },
          },
        },
        400: {
          description: 'Student is already participating in this evaluation',
        },
        401: { description: 'Unauthorized' },
        404: { description: 'Student evaluation not found' },
        500: { description: 'Internal server error' },
      },
    },

    leaveEvaluation: {
      operation: {
        summary: 'Leave evaluation as student',
        description:
          'Remove the authenticated student from the list of participants for a specific evaluation',
      },
      param: {
        name: 'evaluationId',
        description:
          'Student evaluation UUID - The unique identifier of the student evaluation',
        example: 'eval-uuid-1',
      },
      responses: {
        200: {
          description: 'Student left evaluation successfully',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 200 },
              message: {
                type: 'string',
                example: 'Student left evaluation successfully',
              },
              data: {
                type: 'object',
                properties: {
                  evaluationId: { type: 'string', example: 'eval-uuid-1' },
                  studentId: { type: 'string', example: 'student-uuid-1' },
                  totalStudents: { type: 'number', example: 2 },
                },
              },
            },
          },
        },
        400: { description: 'Student is not participating in this evaluation' },
        401: { description: 'Unauthorized' },
        404: { description: 'Student evaluation not found' },
        500: { description: 'Internal server error' },
      },
    },

    findOne: {
      operation: {
        summary: 'Get student evaluation by ID',
        description:
          'Retrieve a specific student evaluation with all its details including questions and options',
      },
      param: {
        name: 'evaluationId',
        description:
          'Student evaluation UUID - The unique identifier of the student evaluation',
        example: 'eval-uuid-1',
      },
      responses: {
        200: {
          description: 'Student evaluation retrieved successfully',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 200 },
              message: {
                type: 'string',
                example: 'Student evaluation retrieved successfully',
              },
              data: {
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
                  type: { type: 'string', example: 'quiz' },
                  points: { type: 'integer', example: 100 },
                  createdBy: {
                    type: 'string',
                    format: 'uuid',
                    example: 'lecturer-uuid-1',
                  },
                  submittiondate: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-12-31T23:59:59.000Z',
                  },
                  beginningTime: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-01-15T09:00:00.000Z',
                  },
                  endingTime: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-01-15T11:00:00.000Z',
                  },
                  ispublish: { type: 'boolean', example: false },
                  isImmediateResult: { type: 'boolean', example: false },
                  sessionCours: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      title: { type: 'string' },
                      description: { type: 'string' },
                    },
                  },
                  lessons: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                      },
                    },
                  },
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        type: { type: 'string' },
                        text: { type: 'string' },
                        points: { type: 'integer' },
                        isImmediateResult: { type: 'boolean' },
                        options: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', format: 'uuid' },
                              text: { type: 'string' },
                              isCorrect: { type: 'boolean' },
                            },
                          },
                        },
                      },
                    },
                  },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'Student evaluation not found' },
      },
    },

    update: {
      operation: {
        summary: 'Update student evaluation by ID',
        description:
          'Update an existing student evaluation with new data. Only instructors can update evaluations.',
      },
      param: {
        name: 'evaluationId',
        description:
          'Student evaluation UUID - The unique identifier of the student evaluation',
        example: 'eval-uuid-1',
      },
      body: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the student evaluation',
            example: 'React Fundamentals Assessment',
          },
          description: {
            type: 'string',
            description: 'Description of the student evaluation',
            example:
              'This evaluation tests students on React fundamentals including components, state, and props.',
          },
          type: {
            type: 'string',
            enum: Object.values(StudentevaluationType),
            description: 'Type of the evaluation',
            example: StudentevaluationType.QUIZ,
          },
          points: {
            type: 'integer',
            minimum: 1,
            description: 'Total points for this evaluation',
            example: 100,
          },
          studentId: {
            type: 'array',
            items: { type: 'string', format: 'uuid' },
            description:
              'Array of student IDs who participated in this evaluation',
            example: [
              '550e8400-e29b-41d4-a716-446655440002',
              '550e8400-e29b-41d4-a716-446655440003',
            ],
          },
          submittiondate: {
            type: 'string',
            format: 'date-time',
            description: 'Submission deadline for this evaluation',
            example: '2025-12-31T23:59:59.000Z',
          },
          beginningTime: {
            type: 'string',
            pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
            description:
              'Beginning time for this evaluation in HH:MM format (optional)',
            example: '09:00',
          },
          endingTime: {
            type: 'string',
            pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
            description:
              'Ending time for this evaluation in HH:MM format (optional)',
            example: '11:00',
          },
          ispublish: {
            type: 'boolean',
            description:
              'Whether this evaluation is published and visible to students',
            example: false,
          },
          isImmediateResult: {
            type: 'boolean',
            description:
              'Whether results should be shown immediately after submission',
            example: false,
          },
          sessionCoursId: {
            type: 'string',
            format: 'uuid',
            description:
              'ID of the session course this evaluation is linked to (required)',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          lessonId: {
            type: 'array',
            items: { type: 'string', format: 'uuid' },
            description:
              'Array of lesson IDs this evaluation is linked to (optional)',
            example: [
              '550e8400-e29b-41d4-a716-446655440001',
              '550e8400-e29b-41d4-a716-446655440002',
            ],
          },
        },
      },
      responses: {
        200: {
          description: 'Student evaluation updated successfully',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 200 },
              message: {
                type: 'string',
                example: 'Student evaluation updated successfully',
              },
              data: {
                type: 'object',
                properties: {
                  evaluation: {
                    type: 'object',
                    description: 'Full updated evaluation object',
                    properties: {
                      id: {
                        type: 'string',
                        format: 'uuid',
                        example: 'eval-uuid-1',
                      },
                      title: {
                        type: 'string',
                        example: 'Updated React Fundamentals Assessment',
                      },
                      description: {
                        type: 'string',
                        example:
                          'Updated description for the React assessment.',
                      },
                      type: { type: 'string', example: 'quiz' },
                      points: { type: 'integer', example: 150 },
                      createdBy: {
                        type: 'string',
                        format: 'uuid',
                        example: 'lecturer-uuid-1',
                      },
                      submittiondate: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-12-31T23:59:59.000Z',
                      },
                      beginningTime: { type: 'string', example: '09:00' },
                      endingTime: { type: 'string', example: '11:00' },
                      ispublish: { type: 'boolean', example: true },
                      isImmediateResult: { type: 'boolean', example: true },
                      sessionCoursId: {
                        type: 'string',
                        format: 'uuid',
                        example: 'session-uuid-1',
                      },
                      lessonId: {
                        type: 'array',
                        items: { type: 'string', format: 'uuid' },
                        example: ['lesson-uuid-1', 'lesson-uuid-2'],
                      },
                      createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-01-15T10:30:00.000Z',
                      },
                      updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-01-15T11:45:00.000Z',
                      },
                    },
                  },
                  message: {
                    type: 'string',
                    example: 'Student evaluation updated successfully',
                  },
                  details: {
                    type: 'object',
                    description: 'Key details for easy access',
                    properties: {
                      id: {
                        type: 'string',
                        format: 'uuid',
                        example: 'eval-uuid-1',
                      },
                      title: {
                        type: 'string',
                        example: 'Updated React Fundamentals Assessment',
                      },
                      type: { type: 'string', example: 'quiz' },
                      points: { type: 'integer', example: 150 },
                      sessionCoursId: {
                        type: 'string',
                        format: 'uuid',
                        example: 'session-uuid-1',
                      },
                      lessonId: {
                        type: 'array',
                        items: { type: 'string', format: 'uuid' },
                        example: ['lesson-uuid-1', 'lesson-uuid-2'],
                      },
                      createdBy: {
                        type: 'string',
                        format: 'uuid',
                        example: 'lecturer-uuid-1',
                      },
                      ispublish: { type: 'boolean', example: true },
                      updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-01-15T11:45:00.000Z',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Bad Request - Invalid input data',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 400 },
              message: {
                type: 'string',
                example: 'Bad Request - Invalid input data',
              },
              data: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'SequelizeValidationError',
                  },
                  message: {
                    type: 'string',
                    example: 'Validation error details',
                  },
                  details: { type: 'object', example: null },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - Only instructors can update evaluations',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 401 },
              message: {
                type: 'string',
                example:
                  'Unauthorized - Only instructors can update evaluations',
              },
            },
          },
        },
        403: {
          description: 'Forbidden - Insufficient permissions',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 403 },
              message: {
                type: 'string',
                example: 'Forbidden - Insufficient permissions',
              },
            },
          },
        },
        404: {
          description: 'Student evaluation not found',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 404 },
              message: {
                type: 'string',
                example: 'Student evaluation not found',
              },
            },
          },
        },
        500: {
          description: 'Internal Server Error',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 500 },
              message: {
                type: 'string',
                example: 'Error updating student evaluation',
              },
              data: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'SequelizeDatabaseError' },
                  message: {
                    type: 'string',
                    example: 'Database error details',
                  },
                  details: { type: 'object', example: null },
                },
              },
            },
          },
        },
      },
    },

    remove: {
      operation: {
        summary: 'Delete student evaluation by ID',
        description:
          'Delete a specific student evaluation. Only instructors can delete evaluations.',
      },
      param: {
        name: 'evaluationId',
        description:
          'Student evaluation UUID - The unique identifier of the student evaluation',
        example: 'eval-uuid-1',
      },
      responses: {
        200: {
          description: 'Student evaluation deleted successfully',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 200 },
              message: {
                type: 'string',
                example: 'Student evaluation deleted successfully',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - Only instructors can delete evaluations',
        },
        403: { description: 'Forbidden - Insufficient permissions' },
        404: { description: 'Student evaluation not found' },
      },
    },

    getSecretaryStatistics: {
      operation: {
        summary: 'Get student evaluation statistics (Secretary only)',
        description: `Get average points and percentage for student evaluations. Filter by training, trainingsession, sessioncours, or lesson. Can get statistics for all students or a specific student.
        
        **When filtering by training (trainingId):**
        - Returns the training period (start and end dates)
        - Calculates total hours from all events related to sessions the student is enrolled in
        - Includes all session titles the student was in
        - Hours are calculated only from events in sessions where the student is enrolled
        - Provides per-session statistics including:
          - Student's points in each session
          - Average points from all students in each session
          - Total maximum points possible in each session`,
      },
      query: {
        trainingId: {
          type: 'string',
          format: 'uuid',
          description: 'Filter by training ID',
          required: false,
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        trainingsessionId: {
          type: 'string',
          format: 'uuid',
          description: 'Filter by training session ID',
          required: false,
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        sessioncoursId: {
          type: 'string',
          format: 'uuid',
          description: 'Filter by session course ID',
          required: false,
          example: '550e8400-e29b-41d4-a716-446655440002',
        },
        lessonId: {
          type: 'string',
          format: 'uuid',
          description: 'Filter by lesson ID',
          required: false,
          example: '550e8400-e29b-41d4-a716-446655440003',
        },
        studentId: {
          type: 'string',
          format: 'uuid',
          description: 'Filter by specific student ID',
          required: false,
          example: '550e8400-e29b-41d4-a716-446655440004',
        },
      },
      responses: {
        200: {
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
                        studentId: {
                          type: 'string',
                          format: 'uuid',
                          example: '550e8400-e29b-41d4-a716-446655440004',
                        },
                        studentName: {
                          type: 'string',
                          example: 'John Doe',
                        },
                        studentEmail: {
                          type: 'string',
                          example: 'john.doe@example.com',
                        },
                        studentAvatar: {
                          type: 'string',
                          nullable: true,
                          example: 'https://example.com/avatar.jpg',
                        },
                        averagePoints: {
                          type: 'number',
                          example: 85.5,
                          description: 'Average points per evaluation',
                        },
                        percentage: {
                          type: 'number',
                          example: 85.5,
                          description: 'Percentage of total possible points',
                        },
                        totalPointsEarned: {
                          type: 'number',
                          example: 855,
                        },
                        totalPossiblePoints: {
                          type: 'number',
                          example: 1000,
                        },
                        evaluationCount: {
                          type: 'number',
                          example: 10,
                        },
                        sessionTitles: {
                          type: 'array',
                          items: { type: 'string' },
                          description:
                            'Session titles the student was in (only when trainingId filter is provided)',
                          example: ['Session 1', 'Session 2'],
                        },
                        totalHours: {
                          type: 'number',
                          description:
                            'Total hours from all events in sessions the student is in (only when trainingId filter is provided)',
                          example: 120.5,
                        },
                        sessionStats: {
                          type: 'array',
                          description:
                            'Per-session statistics including student points, session average, and total max points (only when trainingId filter is provided)',
                          items: {
                            type: 'object',
                            properties: {
                              sessionId: {
                                type: 'string',
                                format: 'uuid',
                                example: '550e8400-e29b-41d4-a716-446655440001',
                              },
                              sessionTitle: {
                                type: 'string',
                                example: 'Session 1',
                              },
                              studentPoints: {
                                type: 'number',
                                description: 'Points earned by this student in this session',
                                example: 85,
                              },
                              sessionAverage: {
                                type: 'number',
                                description:
                                  'Average points from all students in this session',
                                example: 82.5,
                              },
                              totalMaxPoints: {
                                type: 'number',
                                description:
                                  'Total maximum points possible in this session',
                                example: 100,
                              },
                            },
                          },
                          example: [
                            {
                              sessionId: '550e8400-e29b-41d4-a716-446655440001',
                              sessionTitle: 'Session 1',
                              studentPoints: 85,
                              sessionAverage: 82.5,
                              totalMaxPoints: 100,
                            },
                            {
                              sessionId: '550e8400-e29b-41d4-a716-446655440002',
                              sessionTitle: 'Session 2',
                              studentPoints: 90,
                              sessionAverage: 88.3,
                              totalMaxPoints: 100,
                            },
                          ],
                        },
                      },
                    },
                  },
                  filters: {
                    type: 'object',
                    properties: {
                      trainingId: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                      },
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
                      lessonId: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                      },
                      studentId: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                      },
                    },
                  },
                  totalEvaluations: {
                    type: 'number',
                    example: 10,
                  },
                  totalPossiblePoints: {
                    type: 'number',
                    example: 1000,
                  },
                  trainingPeriod: {
                    type: 'object',
                    description:
                      'Training period (start and end dates) - only present when trainingId filter is provided',
                    nullable: true,
                    properties: {
                      startDate: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-01-01T00:00:00.000Z',
                      },
                      endDate: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-12-31T23:59:59.000Z',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - Secretary access required',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 401 },
              message: {
                type: 'string',
                example: 'Unauthorized - Secretary access required',
              },
            },
          },
        },
        403: {
          description: 'Forbidden - Only secretaries can access this endpoint',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 403 },
              message: {
                type: 'string',
                example:
                  'Forbidden - Only secretaries can access this endpoint',
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 500 },
              message: {
                type: 'string',
                example: 'Error retrieving student evaluation statistics',
              },
              data: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Error message' },
                },
              },
            },
          },
        },
      },
    },
  },
};

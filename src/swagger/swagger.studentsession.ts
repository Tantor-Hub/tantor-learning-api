import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

// StudentSession DTOs with Swagger decorators
export class CreateStudentSessionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Student UUID',
  })
  id_student: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Training session UUID',
  })
  id_session: string;

  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
    description: 'Session start date',
    required: false,
  })
  date_debut?: Date;

  @ApiProperty({
    example: '2024-01-15T12:00:00Z',
    description: 'Session end date',
    required: false,
  })
  date_fin?: Date;

  @ApiProperty({
    example: 'active',
    description: 'Session status',
    enum: ['active', 'completed', 'cancelled'],
    required: false,
  })
  status?: string;
}

export class UpdateStudentSessionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Student UUID',
    required: false,
  })
  id_student?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Training session UUID',
    required: false,
  })
  id_session?: string;

  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
    description: 'Session start date',
    required: false,
  })
  date_debut?: Date;

  @ApiProperty({
    example: '2024-01-15T12:00:00Z',
    description: 'Session end date',
    required: false,
  })
  date_fin?: Date;

  @ApiProperty({
    example: 'completed',
    description: 'Session status',
    enum: ['active', 'completed', 'cancelled'],
    required: false,
  })
  status?: string;
}

// StudentSession Controller Swagger Configuration
export const StudentSessionSwagger = {
  controller: {
    tag: 'Student Sessions',
    bearerAuth: true,
  },

  methods: {
    create: {
      operation: {
        summary: 'Create new student session',
        description: 'Assign a student to a training session',
      },
      body: { type: CreateStudentSessionDto },
      responses: {
        201: {
          description: 'Student session created successfully',
        },
        400: {
          description: 'Bad request - Invalid data provided',
        },
        404: {
          description: 'Student or session not found',
        },
      },
    },

    findAll: {
      operation: {
        summary: 'Get all student sessions',
        description: 'Retrieve all student sessions with optional filtering',
      },
      responses: {
        200: {
          description: 'Student sessions retrieved successfully',
        },
      },
    },

    findOne: {
      operation: {
        summary: 'Get student session by ID',
        description: 'Retrieve a specific student session by its ID',
      },
      responses: {
        200: {
          description: 'Student session found successfully',
        },
        404: {
          description: 'Student session not found',
        },
      },
    },

    update: {
      operation: {
        summary: 'Update student session',
        description: 'Update an existing student session',
      },
      body: { type: UpdateStudentSessionDto },
      responses: {
        200: {
          description: 'Student session updated successfully',
        },
        404: {
          description: 'Student session not found',
        },
      },
    },

    remove: {
      operation: {
        summary: 'Delete student session',
        description: 'Remove a student session',
      },
      responses: {
        200: {
          description: 'Student session deleted successfully',
        },
        404: {
          description: 'Student session not found',
        },
      },
    },

    findByStudent: {
      operation: {
        summary: 'Get sessions by student ID',
        description: 'Retrieve all sessions for a specific student',
      },
      responses: {
        200: {
          description: 'Student sessions retrieved successfully',
        },
        404: {
          description: 'Student not found',
        },
      },
    },

    findBySession: {
      operation: {
        summary: 'Get students by session ID',
        description: 'Retrieve all students enrolled in a specific session',
      },
      responses: {
        200: {
          description: 'Students retrieved successfully',
        },
        404: {
          description: 'Session not found',
        },
      },
    },
  },
};

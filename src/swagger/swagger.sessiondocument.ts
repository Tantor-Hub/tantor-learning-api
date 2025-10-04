import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

// SessionDocument DTOs with Swagger decorators
export class CreateSessionDocumentDto {
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
    example: 'passport.pdf',
    description: 'Document filename',
  })
  filename: string;

  @ApiProperty({
    example: 'application/pdf',
    description: 'Document MIME type',
  })
  mimetype: string;

  @ApiProperty({
    example: 1024000,
    description: 'Document size in bytes',
  })
  size: number;

  @ApiProperty({
    example: 'pending',
    description: 'Document validation status',
    enum: ['pending', 'rejected', 'validated'],
    required: false,
  })
  status?: string;

  @ApiProperty({
    example: 'Identity document required for training',
    description: 'Document description',
    required: false,
  })
  description?: string;
}

export class UpdateSessionDocumentDto {
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
    example: 'passport_updated.pdf',
    description: 'Document filename',
    required: false,
  })
  filename?: string;

  @ApiProperty({
    example: 'application/pdf',
    description: 'Document MIME type',
    required: false,
  })
  mimetype?: string;

  @ApiProperty({
    example: 1024000,
    description: 'Document size in bytes',
    required: false,
  })
  size?: number;

  @ApiProperty({
    example: 'validated',
    description: 'Document validation status',
    enum: ['pending', 'rejected', 'validated'],
    required: false,
  })
  status?: string;

  @ApiProperty({
    example: 'Identity document validated',
    description: 'Document description',
    required: false,
  })
  description?: string;
}

// SessionDocument Controller Swagger Configuration
export const SessionDocumentSwagger = {
  controller: {
    tag: 'Session Documents',
    bearerAuth: true,
  },

  methods: {
    create: {
      operation: {
        summary: 'Upload session document',
        description: 'Upload a document for a student session',
      },
      body: { type: CreateSessionDocumentDto },
      responses: {
        201: {
          description: 'Document uploaded successfully',
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
        summary: 'Get all session documents',
        description: 'Retrieve all session documents with optional filtering',
      },
      responses: {
        200: {
          description: 'Session documents retrieved successfully',
        },
      },
    },

    findOne: {
      operation: {
        summary: 'Get session document by ID',
        description: 'Retrieve a specific session document by its ID',
      },
      responses: {
        200: {
          description: 'Session document found successfully',
        },
        404: {
          description: 'Session document not found',
        },
      },
    },

    update: {
      operation: {
        summary: 'Update session document',
        description: 'Update an existing session document',
      },
      body: { type: UpdateSessionDocumentDto },
      responses: {
        200: {
          description: 'Session document updated successfully',
        },
        404: {
          description: 'Session document not found',
        },
      },
    },

    remove: {
      operation: {
        summary: 'Delete session document',
        description: 'Remove a session document',
      },
      responses: {
        200: {
          description: 'Session document deleted successfully',
        },
        404: {
          description: 'Session document not found',
        },
      },
    },

    findByStudent: {
      operation: {
        summary: 'Get documents by student ID',
        description: 'Retrieve all documents for a specific student',
      },
      responses: {
        200: {
          description: 'Student documents retrieved successfully',
        },
        404: {
          description: 'Student not found',
        },
      },
    },

    findBySession: {
      operation: {
        summary: 'Get documents by session ID',
        description: 'Retrieve all documents for a specific session',
      },
      responses: {
        200: {
          description: 'Session documents retrieved successfully',
        },
        404: {
          description: 'Session not found',
        },
      },
    },

    validateDocument: {
      operation: {
        summary: 'Validate session document',
        description: 'Validate or reject a session document',
      },
      responses: {
        200: {
          description: 'Document validation status updated successfully',
        },
        404: {
          description: 'Session document not found',
        },
      },
    },
  },
};

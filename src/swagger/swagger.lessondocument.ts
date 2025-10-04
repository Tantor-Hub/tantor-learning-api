import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

// LessonDocument DTOs with Swagger decorators
export class CreateLessonDocumentDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Lesson UUID',
  })
  id_lesson: string;

  @ApiProperty({
    example: 'lesson_material.pdf',
    description: 'Document filename',
  })
  filename: string;

  @ApiProperty({
    example: 'application/pdf',
    description: 'Document MIME type',
  })
  mimetype: string;

  @ApiProperty({
    example: 2048000,
    description: 'Document size in bytes',
  })
  size: number;

  @ApiProperty({
    example: 'Lesson material for chapter 1',
    description: 'Document description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'material',
    description: 'Document type',
    enum: ['material', 'exercise', 'solution', 'video', 'audio'],
    required: false,
  })
  type?: string;

  @ApiProperty({
    example: 1,
    description: 'Document order in lesson',
    required: false,
  })
  order?: number;
}

export class UpdateLessonDocumentDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Lesson UUID',
    required: false,
  })
  id_lesson?: string;

  @ApiProperty({
    example: 'lesson_material_updated.pdf',
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
    example: 2048000,
    description: 'Document size in bytes',
    required: false,
  })
  size?: number;

  @ApiProperty({
    example: 'Updated lesson material for chapter 1',
    description: 'Document description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'material',
    description: 'Document type',
    enum: ['material', 'exercise', 'solution', 'video', 'audio'],
    required: false,
  })
  type?: string;

  @ApiProperty({
    example: 1,
    description: 'Document order in lesson',
    required: false,
  })
  order?: number;
}

// LessonDocument Controller Swagger Configuration
export const LessonDocumentSwagger = {
  controller: {
    tag: 'Lesson Documents',
    bearerAuth: true,
  },

  methods: {
    create: {
      operation: {
        summary: 'Upload lesson document',
        description: 'Upload a document for a lesson',
      },
      body: { type: CreateLessonDocumentDto },
      responses: {
        201: {
          description: 'Document uploaded successfully',
        },
        400: {
          description: 'Bad request - Invalid data provided',
        },
        404: {
          description: 'Lesson not found',
        },
      },
    },

    findAll: {
      operation: {
        summary: 'Get all lesson documents',
        description: 'Retrieve all lesson documents with optional filtering',
      },
      responses: {
        200: {
          description: 'Lesson documents retrieved successfully',
        },
      },
    },

    findOne: {
      operation: {
        summary: 'Get lesson document by ID',
        description: 'Retrieve a specific lesson document by its ID',
      },
      responses: {
        200: {
          description: 'Lesson document found successfully',
        },
        404: {
          description: 'Lesson document not found',
        },
      },
    },

    update: {
      operation: {
        summary: 'Update lesson document',
        description: 'Update an existing lesson document',
      },
      body: { type: UpdateLessonDocumentDto },
      responses: {
        200: {
          description: 'Lesson document updated successfully',
        },
        404: {
          description: 'Lesson document not found',
        },
      },
    },

    remove: {
      operation: {
        summary: 'Delete lesson document',
        description: 'Remove a lesson document',
      },
      responses: {
        200: {
          description: 'Lesson document deleted successfully',
        },
        404: {
          description: 'Lesson document not found',
        },
      },
    },

    findByLesson: {
      operation: {
        summary: 'Get documents by lesson ID',
        description: 'Retrieve all documents for a specific lesson',
      },
      responses: {
        200: {
          description: 'Lesson documents retrieved successfully',
        },
        404: {
          description: 'Lesson not found',
        },
      },
    },

    download: {
      operation: {
        summary: 'Download lesson document',
        description: 'Download a lesson document file',
      },
      responses: {
        200: {
          description: 'Document downloaded successfully',
        },
        404: {
          description: 'Lesson document not found',
        },
      },
    },
  },
};

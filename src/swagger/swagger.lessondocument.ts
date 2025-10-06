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

    findByCreator: {
      operation: {
        summary: 'Get lesson documents created by current instructor',
        description:
          'Retrieve all lesson documents created by the currently authenticated instructor',
      },
      responses: {
        200: {
          description:
            'Lesson documents created by instructor retrieved successfully',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 200 },
              message: {
                type: 'string',
                example:
                  'Lesson documents created by instructor retrieved successfully',
              },
              data: {
                type: 'object',
                properties: {
                  lessondocuments: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          format: 'uuid',
                          example: '550e8400-e29b-41d4-a716-446655440001',
                        },
                        file_name: {
                          type: 'string',
                          example: 'lesson-notes.pdf',
                        },
                        piece_jointe: {
                          type: 'string',
                          example:
                            'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
                        },
                        type: { type: 'string', example: 'PDF' },
                        title: {
                          type: 'string',
                          example: 'Introduction to Programming Concepts',
                        },
                        description: {
                          type: 'string',
                          example:
                            'This document covers the fundamental concepts of programming including variables, loops, and functions.',
                        },
                        id_lesson: {
                          type: 'string',
                          format: 'uuid',
                          example: '550e8400-e29b-41d4-a716-446655440000',
                        },
                        createdBy: {
                          type: 'string',
                          format: 'uuid',
                          example: '550e8400-e29b-41d4-a716-446655440002',
                        },
                        createdAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-01-25T10:00:00.000Z',
                        },
                        updatedAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-01-25T10:00:00.000Z',
                        },
                        download_url: {
                          type: 'string',
                          example:
                            'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
                        },
                        creator: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              format: 'uuid',
                              example: '550e8400-e29b-41d4-a716-446655440002',
                            },
                            firstName: { type: 'string', example: 'John' },
                            lastName: { type: 'string', example: 'Doe' },
                            email: {
                              type: 'string',
                              example: 'john.doe@example.com',
                            },
                          },
                        },
                        lesson: {
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
                  total: { type: 'number', example: 2 },
                  creator: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        format: 'uuid',
                        example: '550e8400-e29b-41d4-a716-446655440002',
                      },
                      firstName: { type: 'string', example: 'John' },
                      lastName: { type: 'string', example: 'Doe' },
                      email: {
                        type: 'string',
                        example: 'john.doe@example.com',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - Instructor access required',
        },
        404: {
          description: 'Creator not found',
        },
        500: {
          description: 'Internal server error',
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

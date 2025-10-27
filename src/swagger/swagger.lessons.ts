import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
  ApiParam,
} from '@nestjs/swagger';
import { LessonResponse, DocumentResponse } from './swagger.responses';

// Lesson DTOs with Swagger decorators
export class CreateLessonDto {
  @ApiProperty({
    description: 'The title of the lesson',
    example: 'Introduction to JavaScript',
  })
  title: string;

  @ApiProperty({
    description: 'The description of the lesson',
    example: 'Learn the basics of JavaScript programming',
  })
  description: string;

  @ApiProperty({
    description: 'The UUID of the course this lesson belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id_cours: string;

  @ApiProperty({
    description: 'The duration of the lesson',
    example: '60h',
    required: false,
  })
  duree?: string;
}

export class UpdateLessonDto {
  @ApiProperty({
    description: 'The UUID of the lesson to update',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'The title of the lesson',
    example: 'Advanced JavaScript',
    required: false,
  })
  title?: string;

  @ApiProperty({
    description: 'The description of the lesson',
    example: 'Advanced JavaScript concepts',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'The UUID of the course this lesson belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  id_cours?: string;

  @ApiProperty({
    description: 'The duration of the lesson',
    example: '60h',
    required: false,
  })
  duree?: string;
}

export class DeleteLessonDto {
  @ApiProperty({
    description: 'The UUID of the lesson to delete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;
}

// Lessons Controller Swagger Configuration
export const LessonsSwagger = {
  controller: {
    tag: 'Lessons',
    bearerAuth: true,
  },

  methods: {
    findAll: {
      operation: {
        summary: 'Get all lessons',
        description: 'Retrieve all lessons',
      },
      responses: {
        200: {
          description: 'Lessons retrieved successfully',
        },
      },
    },

    findOne: {
      operation: {
        summary: 'Get lesson by ID',
        description: 'Retrieve a specific lesson by its ID',
      },
      param: {
        name: 'id',
        description: 'Lesson ID',
        type: 'number',
      },
      responses: {
        200: {
          description: 'Lesson retrieved successfully',
        },
        404: {
          description: 'Lesson not found',
        },
      },
    },

    create: {
      operation: {
        summary: 'Create a new lesson',
        description: 'Create a new lesson',
      },
      body: { type: CreateLessonDto },
      responses: {
        201: {
          description: 'Lesson created successfully',
        },
      },
    },

    update: {
      operation: {
        summary: 'Update lesson by ID',
        description: 'Update an existing lesson',
      },
      body: { type: UpdateLessonDto },
      responses: {
        200: {
          description: 'Lesson updated successfully',
        },
        404: {
          description: 'Lesson not found',
        },
      },
    },

    remove: {
      operation: {
        summary: 'Delete lesson by ID',
        description: 'Delete an existing lesson',
      },
      body: { type: DeleteLessonDto },
      responses: {
        200: {
          description: 'Lesson deleted successfully',
        },
        404: {
          description: 'Lesson not found',
        },
      },
    },

    getDocuments: {
      operation: {
        summary: 'Get documents for a lesson',
        description: 'Retrieve all documents associated with a specific lesson',
      },
      param: {
        name: 'id',
        description: 'Lesson ID',
        type: 'number',
      },
      responses: {
        200: {
          description: 'List of documents for the lesson',
          schema: {
            example: {
              status: 200,
              data: [
                {
                  id: 1,
                  title: 'Course Material',
                  description: 'PDF document',
                  id_lesson: 1,
                  piece_jointe: 'https://drive.google.com/file/d/...',
                  type: 'pdf',
                  createdAt: '2025-01-15T10:30:00.000Z',
                  updatedAt: '2025-01-15T10:30:00.000Z',
                },
              ],
            },
          },
        },
        404: {
          description: 'Lesson not found',
        },
      },
    },

    addDocument: {
      operation: {
        summary: 'Add document to lesson',
        description: 'Add a document to a specific lesson',
      },
      param: {
        name: 'id',
        description: 'Lesson ID',
        type: 'number',
      },
      body: {
        schema: {
          type: 'object',
          properties: {
            nom: { type: 'string', example: 'document.pdf' },
            url: {
              type: 'string',
              example: 'https://example.com/document.pdf',
            },
            type: { type: 'string', example: 'PDF' },
          },
        },
      },
      responses: {
        201: {
          description: 'Document added to lesson successfully',
        },
        404: {
          description: 'Lesson not found',
        },
      },
    },
  },
};

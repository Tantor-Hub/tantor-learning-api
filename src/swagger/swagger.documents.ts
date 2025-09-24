import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { DocumentResponse } from './swagger.responses';

// Document DTOs with Swagger decorators
export class CreateDocumentDto {
  @ApiProperty({
    example: 'document.pdf',
    description: 'Document file name',
  })
  nom: string;

  @ApiProperty({
    example: 'https://example.com/document.pdf',
    description: 'Document URL or file path',
  })
  url: string;

  @ApiProperty({
    example: 'PDF',
    description: 'Document type',
  })
  type: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the lesson this document belongs to',
  })
  id_lesson: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the user who created it',
    required: false,
  })
  createdBy?: number;
}

export class UpdateDocumentDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the document to update',
  })
  id: number;

  @ApiProperty({
    example: 'updated-document.pdf',
    description: 'Document file name',
    required: false,
  })
  nom?: string;

  @ApiProperty({
    example: 'https://example.com/updated-document.pdf',
    description: 'Document URL or file path',
    required: false,
  })
  url?: string;

  @ApiProperty({
    example: 'PDF',
    description: 'Document type',
    required: false,
  })
  type?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the lesson this document belongs to',
    required: false,
  })
  id_lesson?: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the user who created it',
    required: false,
  })
  createdBy?: number;
}

export class DeleteDocumentDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the document to delete',
  })
  id: number;
}

// Documents Controller Swagger Configuration
export const DocumentsSwagger = {
  controller: {
    tag: 'Documents',
    bearerAuth: true,
  },

  methods: {
    create: {
      operation: {
        summary: 'Create a new document',
        description: 'Create a new document associated with a lesson',
      },
      body: { type: CreateDocumentDto },
      responses: {
        201: {
          description: 'Document created successfully',
        },
      },
    },

    findAll: {
      operation: {
        summary: 'Get all documents',
        description: 'Retrieve all documents',
      },
      responses: {
        200: {
          description: 'Documents retrieved successfully',
        },
      },
    },

    findOne: {
      operation: {
        summary: 'Get a document by ID',
        description: 'Retrieve a specific document by its ID',
      },
      param: {
        name: 'id',
        description: 'Document ID',
        type: 'string',
      },
      responses: {
        200: {
          description: 'Document retrieved successfully',
        },
        404: {
          description: 'Document not found',
        },
      },
    },

    update: {
      operation: {
        summary: 'Update a document by ID',
        description: 'Update an existing document',
      },
      param: {
        name: 'id',
        description: 'Document ID',
        type: 'string',
      },
      body: { type: UpdateDocumentDto },
      responses: {
        200: {
          description: 'Document updated successfully',
        },
        404: {
          description: 'Document not found',
        },
      },
    },

    remove: {
      operation: {
        summary: 'Delete a document by ID',
        description: 'Delete an existing document',
      },
      param: {
        name: 'id',
        description: 'Document ID',
        type: 'string',
      },
      responses: {
        200: {
          description: 'Document deleted successfully',
        },
        404: {
          description: 'Document not found',
        },
      },
    },
  },
};

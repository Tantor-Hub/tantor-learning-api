import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

// Session Document DTOs with Swagger decorators
export class CreateSessiondocumentDto {
  @ApiProperty({
    example: 'Session Document Title',
    description: 'Title of the session document',
  })
  title: string;

  @ApiProperty({
    example: 'Description of the session document',
    description: 'Description of the session document',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'https://example.com/document.pdf',
    description: 'Piece jointe (attachment) URL or file path',
  })
  piece_jointe: string;

  @ApiProperty({
    example: 'PDF',
    description: 'Type of the document',
    required: false,
  })
  type?: string;

  @ApiProperty({
    example: 'pendant',
    description: 'Category of the document',
    enum: ['pendant', 'durant', 'apres'],
  })
  category: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the session',
  })
  id_session: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the user who created it',
    required: false,
  })
  createdBy?: number;
}

export class UpdateSessiondocumentDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the session document to update',
  })
  id: number;

  @ApiProperty({
    example: 'Updated Session Document Title',
    description: 'Title of the session document',
    required: false,
  })
  title?: string;

  @ApiProperty({
    example: 'Updated description of the session document',
    description: 'Description of the session document',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'https://example.com/updated-document.pdf',
    description: 'Piece jointe (attachment) URL or file path',
    required: false,
  })
  piece_jointe?: string;

  @ApiProperty({
    example: 'PDF',
    description: 'Type of the document',
    required: false,
  })
  type?: string;

  @ApiProperty({
    example: 'pendant',
    description: 'Category of the document',
    enum: ['pendant', 'durant', 'apres'],
    required: false,
  })
  category?: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the session',
    required: false,
  })
  id_session?: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the user who created it',
    required: false,
  })
  createdBy?: number;
}

export class DeleteSessiondocumentDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the session document to delete',
  })
  id: number;
}

// Session Documents Controller Swagger Configuration
export const SessionDocumentSwagger = {
  controller: {
    tag: 'sessiondocument',
    bearerAuth: true,
  },

  methods: {
    create: {
      operation: {
        summary: 'Create a new session document',
        description: 'Create a new document associated with a session',
      },
      body: { type: CreateSessiondocumentDto },
      responses: {
        201: {
          description: 'Session document created successfully',
        },
      },
    },

    findAll: {
      operation: {
        summary: 'Get all session documents',
        description: 'Retrieve all session documents',
      },
      responses: {
        200: {
          description: 'Session documents retrieved successfully',
        },
      },
    },

    findOne: {
      operation: {
        summary: 'Get a session document by ID',
        description: 'Retrieve a specific session document by its ID',
      },
      param: {
        name: 'id',
        description: 'Session document ID',
        type: 'string',
      },
      responses: {
        200: {
          description: 'Session document retrieved successfully',
        },
        404: {
          description: 'Session document not found',
        },
      },
    },

    update: {
      operation: {
        summary: 'Update a session document by ID from body',
        description:
          'Update an existing session document using ID from request body',
      },
      body: { type: UpdateSessiondocumentDto },
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
        summary: 'Delete a session document by ID from body',
        description:
          'Delete an existing session document using ID from request body',
      },
      body: { type: DeleteSessiondocumentDto },
      responses: {
        200: {
          description: 'Session document deleted successfully',
        },
        404: {
          description: 'Session document not found',
        },
      },
    },
  },
};

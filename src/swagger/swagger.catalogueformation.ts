import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { CatalogueFormation } from 'src/models/model.catalogueformation';
import { CatalogueType } from 'src/interface/interface.catalogueformation';

// DTOs with Swagger decorators
export class CreateCatalogueFormationDto {
  @ApiProperty({
    description: 'Type of the catalogue formation',
    enum: CatalogueType,
    example: CatalogueType.ADMIN,
  })
  type: CatalogueType;

  @ApiProperty({
    description: 'Title of the catalogue formation',
    example: 'Advanced JavaScript Training',
  })
  title: string;

  @ApiProperty({
    description: 'Description of the catalogue formation',
    example: 'Comprehensive training on advanced JavaScript concepts',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Cloudinary URL for the attached document',
    example:
      'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/document.pdf',
    required: false,
  })
  piece_jointe?: string;
}

export class UpdateCatalogueFormationDto {
  @ApiProperty({
    description: 'UUID of the catalogue formation to update',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Type of the catalogue formation',
    enum: CatalogueType,
    example: CatalogueType.ADMIN,
    required: false,
  })
  type?: CatalogueType;

  @ApiProperty({
    description: 'Title of the catalogue formation',
    example: 'Advanced JavaScript Training',
    required: false,
  })
  title?: string;

  @ApiProperty({
    description: 'Description of the catalogue formation',
    example: 'Comprehensive training on advanced JavaScript concepts',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Cloudinary URL for the attached document',
    example:
      'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/document.pdf',
    required: false,
  })
  piece_jointe?: string;
}

export const CatalogueFormationApiTags = ApiTags(
  'Catalogue Formation with Cloudinary Storage',
);

export const CatalogueFormationCreateApiOperation = ApiOperation({
  summary: 'Create a new catalogue formation (Admin only)',
  description:
    'Create a new catalogue formation entry with Cloudinary document storage',
});

export const CatalogueFormationCreateApiResponse = ApiResponse({
  status: 201,
  description: 'Catalogue formation created successfully.',
  schema: {
    type: 'object',
    properties: {
      status: { type: 'number', example: 201 },
      message: {
        type: 'string',
        example: 'Catalogue formation created successfully',
      },
      data: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: Object.values(CatalogueType) },
          title: { type: 'string' },
          description: { type: 'string' },
          piece_jointe: { type: 'string' },
          created_by: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
});

export const CatalogueFormationFindAllApiOperation = ApiOperation({
  summary: 'Get all catalogue formations (Secretary access)',
  description:
    'Retrieve all catalogue formations. This is the main endpoint for getting all catalogue formations.',
});

export const CatalogueFormationFindAllApiResponse = ApiResponse({
  status: 200,
  description: 'Catalogue formations retrieved successfully.',
  schema: {
    type: 'object',
    properties: {
      status: { type: 'number', example: 200 },
      message: {
        type: 'string',
        example: 'Catalogue formations retrieved successfully',
      },
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: Object.values(CatalogueType) },
            title: { type: 'string' },
            description: { type: 'string' },
            piece_jointe: { type: 'string' },
            created_by: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
});

export const CatalogueFormationFindOneApiOperation = ApiOperation({
  summary: 'Get a specific catalogue formation by ID',
});

export const CatalogueFormationFindOneApiResponse = ApiResponse({
  status: 200,
  description: 'Catalogue formation found.',
  type: CatalogueFormation,
});

export const CatalogueFormationUpdateApiOperation = ApiOperation({
  summary: 'Update a catalogue formation (Admin only)',
});

export const CatalogueFormationUpdateApiResponse = ApiResponse({
  status: 200,
  description: 'Catalogue formation updated successfully.',
  type: CatalogueFormation,
});

export const CatalogueFormationDeleteApiOperation = ApiOperation({
  summary: 'Delete a catalogue formation (Admin only)',
});

export const CatalogueFormationDeleteApiResponse = ApiResponse({
  status: 200,
  description: 'Catalogue formation deleted successfully.',
});

export const CatalogueFormationUnauthorizedApiResponse = ApiResponse({
  status: 401,
  description: 'Unauthorized.',
});

export const CatalogueFormationNotFoundApiResponse = ApiResponse({
  status: 404,
  description: 'Catalogue formation not found.',
});

export const CatalogueFormationForbiddenApiResponse = ApiResponse({
  status: 403,
  description: 'Access denied.',
});

export const CatalogueFormationOnlyAdminUpdateApiResponse = ApiResponse({
  status: 403,
  description: 'Only admin can update.',
});

export const CatalogueFormationOnlyAdminDeleteApiResponse = ApiResponse({
  status: 403,
  description: 'Only admin can delete.',
});

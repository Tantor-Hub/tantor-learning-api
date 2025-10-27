import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { CreateModuleDeFormationDto } from '../dto/create-moduledeformation.dto';
import {
  ModuleDeFormationResponseDto,
  ModuleDeFormationListResponseDto,
  ModuleDeFormationCreateResponseDto,
  ModuleDeFormationUpdateResponseDto,
} from '../dto/moduledeformation-response.dto';
import { UpdateModuleDeFormationDto } from '../dto/update-moduledeformation.dto';

// Swagger decorators for ModuleDeFormation endpoints

export function ModuleDeFormationCreateApiResponse() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new training module',
      description:
        'Create a new training module with optional description and required attachment file. Only admins can perform this action.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      type: CreateModuleDeFormationDto,
      description:
        'Training module data with optional description and required attachment file',
      examples: {
        example1: {
          summary: 'Basic training module',
          value: {
            description: 'Introduction to Web Development',
            piece_jointe: '[File Upload]',
          },
        },
        example2: {
          summary: 'Advanced training module',
          value: {
            description:
              'Advanced React Development with TypeScript and Testing',
            piece_jointe: '[File Upload]',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Training module created successfully',
      type: ModuleDeFormationCreateResponseDto,
      schema: {
        example: {
          status: 201,
          message: 'Training module created successfully',
          data: {
            description: 'Introduction to Web Development',
            piece_jointe: 'https://drive.google.com/file/d/example/view',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data',
      schema: {
        example: {
          status: 400,
          message: 'Validation failed',
          data: {
            message: ['description must be a string'],
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Admin access required',
      schema: {
        example: {
          status: 401,
          message:
            "La clé d'authentification fournie n'a pas les droits requis pour accéder à ces ressources",
        },
      },
    }),
    ApiResponse({
      status: 413,
      description: 'File too large - Maximum file size is 10MB',
      schema: {
        example: {
          status: 413,
          message: 'File too large',
          data: 'Maximum file size allowed is 10MB',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      schema: {
        example: {
          status: 500,
          message: 'Internal server error while creating training module',
          data: {
            errorType: 'SequelizeDatabaseError',
            errorMessage: 'Error message',
            timestamp: '2025-01-25T10:00:00.000Z',
          },
        },
      },
    }),
  );
}

export function ModuleDeFormationGetAllApiResponse() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all training modules',
      description:
        'Retrieve all training modules with their descriptions and attachment links. This endpoint is publicly accessible.',
    }),
    ApiResponse({
      status: 200,
      description: 'Training modules retrieved successfully',
      type: ModuleDeFormationListResponseDto,
      schema: {
        example: {
          status: 200,
          message: 'Training modules retrieved successfully',
          data: {
            length: 3,
            rows: [
              {
                id: '550e8400-e29b-41d4-a716-446655440001',
                description: 'Introduction to Web Development',
                piece_jointe: 'https://drive.google.com/file/d/example1/view',
              },
              {
                id: '550e8400-e29b-41d4-a716-446655440003',
                description: 'Advanced React Development',
                piece_jointe: 'https://drive.google.com/file/d/example2/view',
              },
              {
                id: '550e8400-e29b-41d4-a716-446655440005',
                description: 'Database Design and Management',
                piece_jointe: 'https://drive.google.com/file/d/example3/view',
              },
            ],
          },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      schema: {
        example: {
          status: 500,
          message: 'Internal server error while fetching training modules',
          data: {
            errorType: 'SequelizeDatabaseError',
            errorMessage: 'Error message',
            timestamp: '2025-01-25T10:00:00.000Z',
          },
        },
      },
    }),
  );
}

export function ModuleDeFormationUpdateApiResponse() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a training module',
      description:
        'Update the description and/or attachment file of an existing training module. Only admins can perform this action.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiParam({
      name: 'id',
      description: 'Training module UUID',
      type: 'string',
      format: 'uuid',
      example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    ApiBody({
      type: UpdateModuleDeFormationDto,
      description:
        'Training module update data with optional description and attachment file',
      examples: {
        example1: {
          summary: 'Update description only',
          value: {
            description:
              'Updated Introduction to Web Development with Advanced Topics',
          },
        },
        example2: {
          summary: 'Update description and file',
          value: {
            description: 'Updated Advanced React Development',
            piece_jointe: '[File Upload]',
          },
        },
        example3: {
          summary: 'Update file only',
          value: {
            piece_jointe: '[File Upload]',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Training module updated successfully',
      type: ModuleDeFormationUpdateResponseDto,
      schema: {
        example: {
          status: 200,
          message: 'Training module updated successfully',
          data: {
            description: 'Updated Introduction to Web Development',
            piece_jointe:
              'https://drive.google.com/file/d/updated-example/view',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data',
      schema: {
        example: {
          status: 400,
          message: 'Validation failed',
          data: {
            message: ['description must be a string'],
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Admin access required',
      schema: {
        example: {
          status: 401,
          message:
            "La clé d'authentification fournie n'a pas les droits requis pour accéder à ces ressources",
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Training module not found',
      schema: {
        example: {
          status: 404,
          message: 'Training module not found',
          data: 'ModuleDeFormation not found',
        },
      },
    }),
    ApiResponse({
      status: 413,
      description: 'File too large - Maximum file size is 10MB',
      schema: {
        example: {
          status: 413,
          message: 'File too large',
          data: 'Maximum file size allowed is 10MB',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      schema: {
        example: {
          status: 500,
          message: 'Internal server error while updating training module',
          data: {
            errorType: 'SequelizeDatabaseError',
            errorMessage: 'Error message',
            timestamp: '2025-01-25T10:00:00.000Z',
          },
        },
      },
    }),
  );
}
